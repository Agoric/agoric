// @ts-check
/* eslint-disable no-use-before-define */

import { assert, details as X, q } from '@agoric/assert';
import { Far } from '@endo/marshal';
import { parseVatSlot } from '../lib/parseVatSlots.js';

// import { kdebug } from './kdebug.js';

/**
 * Make a simple LRU cache of virtual object inner selves.
 *
 * @param {number} size Maximum number of entries to keep in the cache before
 *   starting to throw them away.
 * @param {(baseRef: string) => Object} fetch Function to retrieve an object's
 *   raw state from the store by its baseRef
 * @param {(baseRef: string, rawState: Object) => void} store Function to store
 *   raw object state by its baseRef
 * @returns {Object} An LRU cache of (up to) the given size
 *
 *   This cache is part of the virtual object manager and is not intended to be
 *   used independently; it is exported only for the benefit of test code.
 */
export function makeCache(size, fetch, store) {
  let lruHead;
  let lruTail;
  let dirtyCount = 0;
  const liveTable = new Map();

  const cache = {
    makeRoom() {
      while (liveTable.size > size && lruTail) {
        // kdebug(`### vo LRU evict ${lruTail.baseRef} (dirty=${lruTail.dirty})`);
        liveTable.delete(lruTail.baseRef);
        if (lruTail.dirty) {
          store(lruTail.baseRef, lruTail.rawState);
          lruTail.dirty = false;
          dirtyCount -= 1;
        }
        lruTail.rawState = null;
        if (lruTail.prev) {
          lruTail.prev.next = undefined;
        } else {
          lruHead = undefined;
        }
        const deadEntry = lruTail;
        lruTail = lruTail.prev;
        deadEntry.next = undefined;
        deadEntry.prev = undefined;
      }
    },
    markDirty(entry) {
      if (!entry.dirty) {
        entry.dirty = true;
        dirtyCount += 1;
      }
    },
    flush() {
      if (dirtyCount > 0) {
        let entry = lruTail;
        while (entry) {
          if (entry.dirty) {
            store(entry.baseRef, entry.rawState);
            entry.dirty = false;
          }
          entry = entry.prev;
        }
        dirtyCount = 0;
      }
    },
    remember(innerObj) {
      if (liveTable.has(innerObj.baseRef)) {
        return;
      }
      cache.makeRoom();
      liveTable.set(innerObj.baseRef, innerObj);
      innerObj.prev = undefined;
      innerObj.next = lruHead;
      if (lruHead) {
        lruHead.prev = innerObj;
      }
      lruHead = innerObj;
      if (!lruTail) {
        lruTail = innerObj;
      }
      // kdebug(`### vo LRU remember ${lruHead.baseRef}`);
    },
    refresh(innerObj) {
      if (innerObj !== lruHead) {
        const oldPrev = innerObj.prev;
        const oldNext = innerObj.next;
        if (oldPrev) {
          oldPrev.next = oldNext;
        } else {
          lruHead = oldNext;
        }
        if (oldNext) {
          oldNext.prev = oldPrev;
        } else {
          lruTail = oldPrev;
        }
        innerObj.prev = undefined;
        innerObj.next = lruHead;
        lruHead.prev = innerObj;
        lruHead = innerObj;
        // kdebug(`### vo LRU refresh ${lruHead.baseRef}`);
      }
    },
    lookup(baseRef, load) {
      let innerObj = liveTable.get(baseRef);
      if (innerObj) {
        cache.refresh(innerObj);
      } else {
        innerObj = { baseRef, rawState: null, repCount: 0 };
        cache.remember(innerObj);
      }
      if (load && !innerObj.rawState) {
        innerObj.rawState = fetch(baseRef);
      }
      return innerObj;
    },
  };
  return cache;
}

/**
 * Create a new virtual object manager. There is one of these for each vat.
 *
 * @param {any} syscall Vat's syscall object, used to access the vatstore operations.
 * @param {any} vrm Virtual reference manager, to handle reference counting and
 *   GC of virtual references.
 * @param {() => number} allocateExportID Function to allocate the next object
 *   export ID for the enclosing vat.
 * @param {(val: Object) => string} getSlotForVal A function that returns the
 *   object ID (vref) for a given object, if any. their corresponding export IDs
 * @param {any} registerValue Function to register a new slot+value in
 *   liveSlot's various tables
 * @param {any} serialize Serializer for this vat
 * @param {any} unserialize Unserializer for this vat
 * @param {number} cacheSize How many virtual objects this manager should cache in memory.
 * @returns {Object} A new virtual object manager.
 *
 *   The virtual object manager allows the creation of persistent objects that do
 *   not need to occupy memory when they are not in use. It provides five functions:
 *
 *   - `defineKind` and `defineDurableKind` enable users to define new types of
 *       virtual object by providing an implementation of the new kind of
 *       object's behavior. The result is a maker function that will produce new
 *       virtualized instances of the defined object type on demand.
 *   - `VirtualObjectAwareWeakMap` and `VirtualObjectAwareWeakSet` are drop-in
 *       replacements for JavaScript's builtin `WeakMap` and `WeakSet` classes
 *       which understand the magic internal voodoo used to implement virtual
 *       objects and will do the right thing when virtual objects are used as
 *       keys. The intent is that the hosting environment will inject these as
 *       substitutes for their regular JS analogs in way that should be
 *       transparent to ordinary users of those classes.
 *   - `flushCache` will empty the object manager's cache of in-memory object
 *       instances, writing any changed state to the persistent store. This is
 *       provided for testing and to ensure that state that should be persisted
 *       actually is prior to a controlled shutdown; normal code should not use this.
 *
 *   `defineKind` and `defineDurableKind` are made available to user vat code in
 *   the `VatData` global (along with various other storage functions defined elsewhere).
 */
export function makeVirtualObjectManager(
  syscall,
  vrm,
  allocateExportID,
  getSlotForVal,
  registerValue,
  serialize,
  unserialize,
  cacheSize,
) {
  const cache = makeCache(cacheSize, fetch, store);

  // WeakMap from VO states to VO representatives, to prevent anyone who retains
  // a state object from being able to observe the comings and goings of
  // representatives.
  const stateToRepresentative = new WeakMap();
  const facetToCohort = new WeakMap();

  /**
   * Fetch an object's state from secondary storage.
   *
   * @param {string} baseRef The baseRef of the object whose state is being fetched.
   * @returns {any} An object representing the object's stored state.
   */
  function fetch(baseRef) {
    const rawState = syscall.vatstoreGet(`vom.${baseRef}`);
    if (rawState) {
      return JSON.parse(rawState);
    } else {
      return undefined;
    }
  }

  /**
   * Write an object's state to secondary storage.
   *
   * @param {string} baseRef The baseRef of the object whose state is being stored.
   * @param {any} rawState A data object representing the state to be written.
   */
  function store(baseRef, rawState) {
    syscall.vatstoreSet(`vom.${baseRef}`, JSON.stringify(rawState));
  }

  /* eslint max-classes-per-file: ["error", 2] */

  const actualWeakMaps = new WeakMap();
  const virtualObjectMaps = new WeakMap();

  function voAwareWeakMapDeleter(descriptor) {
    for (const vref of descriptor.vmap.keys()) {
      vrm.removeRecognizableVref(vref, descriptor.vmap);
    }
  }

  class VirtualObjectAwareWeakMap {
    constructor() {
      actualWeakMaps.set(this, new WeakMap());
      const vmap = new Map();
      virtualObjectMaps.set(this, vmap);
      vrm.droppedCollectionRegistry.register(this, {
        collectionDeleter: voAwareWeakMapDeleter,
        vmap,
      });
    }

    has(key) {
      const vkey = vrm.vrefKey(key);
      if (vkey) {
        return virtualObjectMaps.get(this).has(vkey);
      } else {
        return actualWeakMaps.get(this).has(key);
      }
    }

    get(key) {
      const vkey = vrm.vrefKey(key);
      if (vkey) {
        return virtualObjectMaps.get(this).get(vkey);
      } else {
        return actualWeakMaps.get(this).get(key);
      }
    }

    set(key, value) {
      const vkey = vrm.vrefKey(key);
      if (vkey) {
        const vmap = virtualObjectMaps.get(this);
        if (!vmap.has(vkey)) {
          vrm.addRecognizableValue(key, vmap);
        }
        vmap.set(vkey, value);
      } else {
        actualWeakMaps.get(this).set(key, value);
      }
      return this;
    }

    delete(key) {
      const vkey = vrm.vrefKey(key);
      if (vkey) {
        const vmap = virtualObjectMaps.get(this);
        if (vmap.has(vkey)) {
          vrm.removeRecognizableValue(key, vmap);
          return vmap.delete(vkey);
        } else {
          return false;
        }
      } else {
        return actualWeakMaps.get(this).delete(key);
      }
    }
  }

  Object.defineProperty(VirtualObjectAwareWeakMap, Symbol.toStringTag, {
    value: 'WeakMap',
    writable: false,
    enumerable: false,
    configurable: true,
  });

  const actualWeakSets = new WeakMap();
  const virtualObjectSets = new WeakMap();

  function voAwareWeakSetDeleter(descriptor) {
    for (const vref of descriptor.vset.values()) {
      vrm.removeRecognizableVref(vref, descriptor.vset);
    }
  }

  class VirtualObjectAwareWeakSet {
    constructor() {
      actualWeakSets.set(this, new WeakSet());
      const vset = new Set();
      virtualObjectSets.set(this, vset);

      vrm.droppedCollectionRegistry.register(this, {
        collectionDeleter: voAwareWeakSetDeleter,
        vset,
      });
    }

    has(value) {
      const vkey = vrm.vrefKey(value);
      if (vkey) {
        return virtualObjectSets.get(this).has(vkey);
      } else {
        return actualWeakSets.get(this).has(value);
      }
    }

    add(value) {
      const vkey = vrm.vrefKey(value);
      if (vkey) {
        const vset = virtualObjectSets.get(this);
        if (!vset.has(value)) {
          vrm.addRecognizableValue(value, vset);
          vset.add(vkey);
        }
      } else {
        actualWeakSets.get(this).add(value);
      }
      return this;
    }

    delete(value) {
      const vkey = vrm.vrefKey(value);
      if (vkey) {
        const vset = virtualObjectSets.get(this);
        if (vset.has(vkey)) {
          vrm.removeRecognizableValue(value, vset);
          return vset.delete(vkey);
        } else {
          return false;
        }
      } else {
        return actualWeakSets.get(this).delete(value);
      }
    }
  }

  Object.defineProperty(VirtualObjectAwareWeakSet, Symbol.toStringTag, {
    value: 'WeakSet',
    writable: false,
    enumerable: false,
    configurable: true,
  });

  /**
   * Assess the facetiousness of a value. If the value is an object containing
   * only named properties and each such property's value is a function, `obj`
   * represents a single facet and 'one' is returned. If each property's value
   * is instead an object of facetiousness 'one', `obj` represents multiple
   * facets and 'many' is returned. In all other cases `obj` does not represent
   * any kind of facet abstraction and 'not' is returned.
   *
   * @typedef {'one' | 'many' | 'not'} Facetiousness
   * @param {any} obj The (alleged) object to be assessed
   * @param {boolean} [inner] True if this is being called recursively; no more
   *   than one level of recursion is allowed.
   * @returns {Facetiousness} An assessment of the facetiousness of `obj`
   */
  function assessFacetiousness(obj, inner) {
    if (typeof obj !== 'object') {
      return 'not';
    }
    if (Object.getOwnPropertySymbols(obj).length !== 0) {
      return 'not';
    }
    let established;
    for (const [_name, value] of Object.entries(obj)) {
      let current;
      if (typeof value === 'function') {
        current = 'one';
      } else if (
        !inner &&
        typeof value === 'object' &&
        assessFacetiousness(value, true) === 'one'
      ) {
        current = 'many';
      } else {
        return 'not';
      }
      if (!established) {
        established = current;
      } else if (established !== current) {
        return 'not';
      }
    }
    if (!established) {
      // empty objects are methodless Far objects
      return 'one';
    } else {
      return /** @type {Facetiousness} */ (established);
    }
  }

  /**
   * Define a new kind of virtual object.
   *
   * @param {string} kindID The kind ID to associate with the new kind.
   * @param {string} tag A descriptive tag string as used in calls to `Far`
   * @param {any} init An initialization function that will return the initial
   *   state of a new instance of the kind of virtual object being defined.
   * @param {any} actualize An actualization function that will provide the
   *   in-memory representative object that wraps behavior around the
   *   virtualized state of an instance of the object kind being defined.
   * @param {any} finish An optional finisher function that can perform
   *   post-creation initialization operations, such as inserting the new object
   *   in a cyclical object graph.
   * @param {boolean} durable A flag indicating whether or not the newly defined
   *   kind should be a durable kind.
   * @returns {any} A maker function that can be called to manufacture new
   *   instances of this kind of object. The parameters of the maker function
   *   are those of the `init` function.
   *
   *   Notes on theory of operation:
   *
   *   Virtual objects are structured in three layers: representatives, inner
   *   selves, and state data.
   *
   *   A representative is the manifestation of a virtual object that vat code has
   *   direct access to. A given virtual object can have at most one
   *   representative, which will be created as needed. This will happen when
   *   the instance is initially made, and can also happen (if it does not
   *   already exist) when the instance's virtual object ID is deserialized,
   *   either when delivered as part of an incoming message or read as part of
   *   another virtual object's state. A representative will be kept alive in
   *   memory as long as there is a variable somewhere that references it
   *   directly or indirectly. However, if a representative becomes unreferenced
   *   in memory it is subject to garbage collection, leaving the representation
   *   that is kept in the vat store as the record of its state from which a mew
   *   representative can be reconsituted at need. Since only one representative
   *   exists at a time, references to them may be compared with the equality
   *   operator (===). Although the identity of a representative can change over
   *   time, this is never visible to code running in the vat. Methods invoked
   *   on a representative always operate on the underyling virtual object state.
   *
   *   The inner self represents the in-memory information about an object, aside
   *   from its state. There is an inner self for each virtual object that is
   *   currently resident in memory; that is, there is an inner self for each
   *   virtual object for which there is currently a representative present
   *   somewhere in the vat. The inner self maintains two pieces of information:
   *   its corresponding virtual object's virtual object ID, and a pointer to
   *   the virtual object's state in memory if the virtual object's state is, in
   *   fact, currently resident in memory. If the state is not in memory, the
   *   inner self's pointer to the state is null. In addition, the virtual
   *   object manager maintains an LRU cache of inner selves. Inner selves that
   *   are in the cache are not necessarily referenced by any existing
   *   representative, but are available to be used should such a representative
   *   be needed. How this all works will be explained in a moment.
   *
   *   The state of a virtual object is a collection of mutable properties, each
   *   of whose values is itself immutable and serializable. The methods of a
   *   virtual object have access to this state by closing over a state object.
   *   However, the state object they close over is not the actual state object,
   *   but a wrapper with accessor methods that both ensure that a
   *   representation of the state is in memory when needed and perform
   *   deserialization on read and serialization on write; this wrapper is held
   *   by the representative, so that method invocations always see the wrapper
   *   belonging to the invoking representative. The actual state object holds
   *   marshaled serializations of each of the state properties. When written to
   *   persistent storage, this is representated as a JSON-stringified object
   *   each of whose properties is one of the marshaled property values.
   *
   *   When a method of a virtual object attempts to access one of the properties
   *   of the object's state, the accessor first checks to see if the state is
   *   in memory. If it is not, it is loaded from persistent storage, the
   *   corresponding inner self is made to point at it, and then the inner self
   *   is placed at the head of the LRU cache (causing the least recently used
   *   inner self to fall off the end of the cache). If it _is_ in memory, it is
   *   promoted to the head of the LRU cache but the overall contents of the
   *   cache remain unchanged. When an inner self falls off the end of the LRU,
   *   its reference to the state is nulled out and the object holding the state
   *   becomes garbage collectable.
   */
  function defineKindInternal(kindID, tag, init, actualize, finish, durable) {
    let nextInstanceID = 1;
    const propertyNames = new Set();

    function makeRepresentative(innerSelf, initializing, proForma) {
      if (!proForma) {
        assert(
          innerSelf.repCount === 0,
          X`${innerSelf.baseRef} already has a representative`,
        );
        innerSelf.repCount += 1;
      }

      function ensureState() {
        if (innerSelf.rawState) {
          cache.refresh(innerSelf);
        } else {
          innerSelf = cache.lookup(innerSelf.baseRef, true);
        }
      }

      const wrappedState = {};
      for (const prop of propertyNames) {
        Object.defineProperty(wrappedState, prop, {
          get: () => {
            ensureState();
            return unserialize(innerSelf.rawState[prop]);
          },
          set: value => {
            ensureState();
            const before = innerSelf.rawState[prop];
            const after = serialize(value);
            if (durable) {
              after.slots.map(vref =>
                assert(
                  vrm.isDurable(vref),
                  X`value for ${prop} is not durable`,
                ),
              );
            }
            vrm.updateReferenceCounts(before.slots, after.slots);
            innerSelf.rawState[prop] = after;
            cache.markDirty(innerSelf);
          },
        });
      }
      harden(wrappedState);

      if (initializing) {
        cache.remember(innerSelf);
      }
      const self = actualize(wrappedState);
      let toHold;
      let toExpose;
      const facetiousness = assessFacetiousness(self);
      switch (facetiousness) {
        case 'one': {
          toHold = Far(tag, self);
          vrm.checkOrAcquireFacetNames(kindID, null);
          toExpose = toHold;
          break;
        }
        case 'many': {
          toExpose = {};
          toHold = [];
          const facetNames = Object.getOwnPropertyNames(self).sort();
          assert(
            facetNames.length > 1,
            'a multi-facet object must have multiple facets',
          );
          vrm.checkOrAcquireFacetNames(kindID, facetNames);
          for (const facetName of facetNames) {
            const facet = Far(`${tag} ${facetName}`, self[facetName]);
            toExpose[facetName] = facet;
            toHold.push(facet);
            facetToCohort.set(facet, toHold);
          }
          harden(toExpose);
          break;
        }
        case 'not':
          assert.fail(X`invalid self actualization for ${q(tag)}`);
        default:
          assert.fail(X`unexepected facetiousness: ${q(facetiousness)}`);
      }
      if (!proForma) {
        innerSelf.representative = toHold;
        stateToRepresentative.set(wrappedState, toHold);
      }
      return [toHold, toExpose, wrappedState];
    }

    function reanimate(baseRef, proForma) {
      // kdebug(`vo reanimate ${baseRef}`);
      const innerSelf = cache.lookup(baseRef, false);
      const [toHold] = makeRepresentative(innerSelf, false, proForma);
      if (proForma) {
        return null;
      } else {
        return toHold;
      }
    }

    function deleteStoredVO(baseRef) {
      let doMoreGC = false;
      const rawState = fetch(baseRef);
      if (rawState) {
        for (const propValue of Object.values(rawState)) {
          propValue.slots.map(
            vref => (doMoreGC = doMoreGC || vrm.removeReachableVref(vref)),
          );
        }
      }
      syscall.vatstoreDelete(`vom.${baseRef}`);
      return doMoreGC;
    }

    vrm.registerKind(kindID, reanimate, deleteStoredVO, durable);

    function makeNewInstance(...args) {
      const baseRef = `o+${kindID}/${nextInstanceID}`;
      nextInstanceID += 1;
      // kdebug(`vo make ${baseRef}`);

      const initialData = init ? init(...args) : {};
      const rawState = {};
      for (const prop of Object.getOwnPropertyNames(initialData)) {
        const data = serialize(initialData[prop]);
        if (durable) {
          data.slots.map(vref =>
            assert(vrm.isDurable(vref), X`value for ${prop} is not durable`),
          );
        }
        data.slots.map(vrm.addReachableVref);
        rawState[prop] = data;
        propertyNames.add(prop);
      }
      const innerSelf = { baseRef, rawState, repCount: 0 };
      const [toHold, toExpose, state] = makeRepresentative(
        innerSelf,
        true,
        false,
      );
      registerValue(baseRef, toHold, Array.isArray(toHold));
      if (finish) {
        finish(state, toExpose);
      }
      cache.markDirty(innerSelf);
      return toExpose;
    }

    return makeNewInstance;
  }

  function defineKind(tag, init, actualize, finish) {
    const kindID = `${allocateExportID()}`;
    return defineKindInternal(kindID, tag, init, actualize, finish, false);
  }

  let kindIDID;
  const kindDescriptors = new WeakMap();

  function reanimateDurableKindID(vobjID, _proforma) {
    const { subid: kindID } = parseVatSlot(vobjID);
    const raw = syscall.vatstoreGet(`vom.kind.${kindID}`);
    assert(raw, X`unknown kind ID ${kindID}`);
    const durableKindDescriptor = harden(JSON.parse(raw));
    const kindHandle = Far('kind', {});
    kindDescriptors.set(kindHandle, durableKindDescriptor);
    return kindHandle;
  }

  const makeKindHandle = tag => {
    if (!kindIDID) {
      kindIDID = `${allocateExportID()}`;
      syscall.vatstoreSet('kindIDID', kindIDID);
      vrm.registerKind(kindIDID, reanimateDurableKindID, () => null, true);
    }
    const kindID = `${allocateExportID()}`;
    const kindIDvref = `o+${kindIDID}/${kindID}`;
    const durableKindDescriptor = harden({ kindID, tag });
    const kindHandle = Far('kind', {});
    kindDescriptors.set(kindHandle, durableKindDescriptor);
    registerValue(kindIDvref, kindHandle, false);
    syscall.vatstoreSet(
      `vom.kind.${kindID}`,
      JSON.stringify(durableKindDescriptor),
    );
    return kindHandle;
  };

  function defineDurableKind(kindHandle, init, actualize, finish) {
    const durableKindDescriptor = kindDescriptors.get(kindHandle);
    assert(durableKindDescriptor);
    const { kindID, tag } = durableKindDescriptor;
    return defineKindInternal(kindID, tag, init, actualize, finish, true);
  }

  function countWeakKeysForCollection(collection) {
    const virtualObjectMap = virtualObjectMaps.get(collection);
    if (virtualObjectMap) {
      return virtualObjectMap.size;
    }
    const virtualObjectSet = virtualObjectSets.get(collection);
    if (virtualObjectSet) {
      return virtualObjectSet.size;
    }
    return 0;
  }

  const testHooks = {
    countWeakKeysForCollection,
  };

  return harden({
    defineKind,
    defineDurableKind,
    makeKindHandle,
    VirtualObjectAwareWeakMap,
    VirtualObjectAwareWeakSet,
    flushCache: cache.flush,
    testHooks,
  });
}
