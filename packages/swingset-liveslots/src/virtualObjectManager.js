/* global globalThis */
/* eslint-disable jsdoc/require-returns-type */

import { environmentOptionsListHas } from '@endo/env-options';
import { assert, Fail, q, b } from '@endo/errors';
import { assertPattern, mustMatch } from '@agoric/store';
import { defendPrototype, defendPrototypeKit } from '@endo/exo/tools.js';
import { Far, passStyleOf } from '@endo/marshal';
import { Nat } from '@endo/nat';
import { parseVatSlot, makeBaseRef } from './parseVatSlots.js';
import { enumerateKeysWithPrefix } from './vatstore-iterators.js';
import { makeCache } from './cache.js';
import {
  assessFacetiousness,
  checkAndUpdateFacetiousness,
} from './facetiousness.js';

/**
 * @import {DurableKindHandle} from '@agoric/swingset-liveslots'
 * @import {DefineKindOptions} from '@agoric/swingset-liveslots'
 * @import {ClassContextProvider, KitContextProvider} from '@endo/exo'
 * @import {ToCapData, FromCapData} from '@endo/marshal';
 */

const {
  hasOwn,
  defineProperty,
  getOwnPropertyNames,
  values,
  entries,
  fromEntries,
} = Object;
const { ownKeys } = Reflect;

// Turn on to give each exo instance its own toStringTag value which exposes
// the SwingSet vref.
//
// CONFIDENTIALITY HAZARD NOTE: exposing vrefs to userspace reveals
// confidential object-creation activity, so this must not be something
// that unprivileged vat code (including unprivileged contracts) can do
// for themselves.
const LABEL_INSTANCES = environmentOptionsListHas('DEBUG', 'label-instances');

// This file implements the "Virtual Objects" system, currently documented in
// {@link https://github.com/Agoric/agoric-sdk/blob/master/packages/SwingSet/docs/virtual-objects.md})
//
// All virtual-object state is keyed by baseRef, like o+v11/5 . For single-facet
// Kinds (created with `defineKind`), this is the entire vref. For
// multiple-facet Kinds (created with `defineKindMulti`), the cohort of facets
// (which all share the same state, but offer different methods, generally
// representing different authorities) will each have a vref that extends the
// baseRef with a facet identifier, e.g. o+v11/5:0 for the first facet, and
// o+v11/5:1 for the second.
//
// To manage context and state and data correctly (not sensitive to GC), we need
// two Caches. The first is "dataCache", and maps baseRef to state data. This
// data includes the serialized capdata for all properties, and the unserialized
// value for properties that have been read or written by an accessor on the
// `state` object.
//
// The second cache is "contextCache", and maps baseRef to a context object,
// which is either { state, self } or { state, facets } depending on the
// facetiousness of the VO. "state" is an object with one accessor pair
// (getter+setter) per state property name. The "state" getters/setters know
// which baseRef they should use. When invoked, they pull the state data from
// `dataCache.get(baseRef).valueMap`. The setter will modify valueMap in place
// and mark the entry as dirty, so it can be serialized and written back at
// end-of-crank.
//
// Each Representative is built as an Exo with defendPrototype (cohorts of
// facets are built with defendPrototypeKit). These are given a
// "contextProvider" for later use. For each facet, they build a prototype
// object with wrappers for all the methods of that particular facet. When those
// wrappers are invoked, the first thing they do is to call
// `contextProvider(this)` (where `this` is the representative) to get a
// "context" object: { state, self } or { state, facets }, which is passed to
// the behavior functions. The contextProvider function uses valToSlot() to
// figure out the representative's vref, then derives the baseRef, then consults
// contextCache to get (or create) the context.
//
// Our GC sensitivity contraints are:
// * userspace must not be able to sense garbage collection
// * Representatives are created on-demand when userspace deserializes a vref
//   * they disappear when UNREACHABLE and GC collects them
//     {@link https://github.com/Agoric/agoric-sdk/blob/master/packages/SwingSet/docs/garbage-collection.md})
// * syscalls must be a deterministic function of userspace behavior
//   * that includes method invocation and "state" property read/writes
//   * they should not be influenced by GC until a bringOutYourDead delivery
//
// See the discussion below (near `makeRepresentative`) for more details on how
// we meet these constraints.

/*
 * Make a cache which maps baseRef to a (mutable) record of {
 * capdatas, valueMap }.
 *
 * 'capdatas' is a mutable Object (record) with state property names
 * as keys, and their capdata { body, slots } as values, and
 * 'valueMap' is a Map with state property names as keys, and their
 * unmarshalled values as values. We need the 'capdatas' record to be
 * mutable because we will modify its contents in place during
 * setters, to retain the insertion order later (during flush). We
 * need capdata at all so we can compare the slots before and after
 * the update, to adjust the refcounts. Only the values of 'valueMap'
 * are exposed to userspace.
 */

const makeDataCache = syscall => {
  /** @type {(baseRef: string) => { capdatas: any, valueMap: Map<string, any> }} */
  const readBacking = baseRef => {
    const rawState = syscall.vatstoreGet(`vom.${baseRef}`);
    assert(rawState);
    const capdatas = JSON.parse(rawState);
    const valueMap = new Map(); // populated lazily by each state getter
    return { capdatas, valueMap }; // both mutable
  };
  /** @type {(baseRef: string, value: { capdatas: any, valueMap: Map<string, any> }) => void} */
  const writeBacking = (baseRef, value) => {
    const rawState = JSON.stringify(value.capdatas);
    syscall.vatstoreSet(`vom.${baseRef}`, rawState);
  };
  /** @type {(collectionID: string) => void} */
  const deleteBacking = baseRef => syscall.vatstoreDelete(`vom.${baseRef}`);
  return makeCache(readBacking, writeBacking, deleteBacking);
};

const makeContextCache = (makeState, makeContext) => {
  // non-writeback cache for "context" objects, { state, self/facets }
  const readBacking = baseRef => {
    const state = makeState(baseRef);
    const context = makeContext(baseRef, state);
    return context;
  };
  const writeBacking = _baseRef => Fail`never called`;
  const deleteBacking = _baseRef => Fail`never called`;
  return makeCache(readBacking, writeBacking, deleteBacking);
};

// The management of single Representatives (i.e. defineKind) is very similar
// to that of a cohort of facets (i.e. defineKindMulti). In this description,
// we use "self/facets" to refer to either 'self' or 'facets', as appropriate
// for the particular Kind. From userspace's perspective, the main difference
// is that single-facet Kinds present self/facets as 'context.self', whereas
// multi-facet Kinds present it as 'context.facets'.

// makeRepresentative/makeFacets returns the self/facets . This serves several
// purposes:
//
// * it is returned to userspace when making a new VO instance
// * it appears as 'context.self/facets' when VO methods are invoked
// * it is stored in the slotToVal table, specifically:
//   * slotToVal.get(baseref).deref() === self/facets
//   * (for facets, convertSlotToVal will then extract a single facet)
// * it is registered with our FinalizationRegistry
//   * (for facets, the FR must not fire until all cohort members have been
//      collected)
//
// Any facet can be passed to valToSlot to learn its vref, from which we learn
// the baseRef, which we pass to contextCache.get to retrieve or create a
// 'context', which will include self/facets and a 'state' object. So either:
// * context = { state, self }
// * context = { state, facets }
//
// Userspace might hold on to a Representative, the `facets` record, the context
// object, or the state object, for an unbounded length of time: beyond a single
// crank/delivery. They might hold on to "context" but drop the Representative,
// etc. They may compare these held objects against newer versions they receive
// in future interactions. They might attempt to put any of these in a
// WeakMap/WeakSet (remembering that they only get the
// VirtualObjectAwareWeakMap/Set form that we give them). None of these actions
// may allow userspace to sense GC.
//
// Userspace could build a GC sensor out of any object with the following
// properties:
// * it has a GC-sensitive lifetime (i.e. created by these two functions)
// * it is reachable from userspace
// * it lacks a vref (else it'd be handled specially by VOAwareWeakMap)
//

// We must mark such objects as "unweakable" to prevent their use in
// VOAwareWeakMap -based sensors (unweakable keys are held strongly by those
// collections), and we must tie their lifetime to the facets to prevent their
// use in a stash-and-compare-later sensor. We achieve the latter by adding a
// linkToCohort WeakMap entry from every facet to the cohort record. This also
// ensures that the FinalizationRegistry won't see the cohort record go away
// until all the individual facets have been collected.
//
// We only need to do this for multi-facet Kinds; single-facet kinds don't
// have any extra objects for userspace to work with.

const makeRepresentative = (proto, baseRef) => {
  const self = { __proto__: proto };
  if (LABEL_INSTANCES) {
    // This exposes the vref to userspace, which is a confidentiality hazard
    // as noted in the CONFIDENTIALITY HAZARD NOTE above.
    //
    // Aside from that hazard, the frozen string-valued data property is
    // safe to expose to userspace without enabling a GC sensor.
    // Strings lack identity and cannot be used as keys in WeakMaps.
    // If the property were a accessor property, we'd need to
    // ```js
    //   linkToCohort.set(self, getterFunc);
    //    unweakable.add(getterFunc);
    // ```
    defineProperty(self, Symbol.toStringTag, {
      value: `${proto[Symbol.toStringTag]}#${baseRef}`,
      writable: false,
      enumerable: false,
      configurable: false,
    });
  }
  return harden(self);
};

const makeFacets = (
  facetNames,
  protoKit,
  linkToCohort,
  unweakable,
  baseRef,
) => {
  const facets = {}; // aka context.facets
  for (const name of facetNames) {
    const facet = makeRepresentative(protoKit[name], baseRef);
    facets[name] = facet;
    linkToCohort.set(facet, facets);
  }
  unweakable.add(facets);
  return harden(facets);
};

const insistDurableCapdata = (vrm, what, capdata, valueFor) => {
  for (const [idx, vref] of entries(capdata.slots)) {
    if (!vrm.isDurable(vref)) {
      if (valueFor) {
        Fail`value for ${what} is not durable: slot ${b(idx)} of ${capdata}`;
      } else {
        Fail`${what} is not durable: slot ${b(idx)} of ${capdata}`;
      }
    }
  }
};

const insistSameCapData = (oldCD, newCD) => {
  // NOTE: this assumes both were marshalled with the same format
  // (e.g. smallcaps vs pre-smallcaps). To somewhat tolerate new
  // formats, we'd need to `serialize(unserialize(oldCD))`.
  if (oldCD.body !== newCD.body) {
    Fail`durable Kind stateShape mismatch (body)`;
  }
  if (oldCD.slots.length !== newCD.slots.length) {
    Fail`durable Kind stateShape mismatch (slots.length)`;
  }
  for (const [idx, oldVref] of entries(oldCD.slots)) {
    if (newCD.slots[idx] !== oldVref) {
      Fail`durable Kind stateShape mismatch (slot[${idx}])`;
    }
  }
};

/**
 * Create a new virtual object manager.  There is one of these for each vat.
 *
 * @param {*} syscall  Vat's syscall object, used to access the vatstore operations.
 * @param {import('./virtualReferences.js').VirtualReferenceManager} vrm  Virtual reference manager, to handle reference counting and GC
 *   of virtual references.
 * @param {() => number} allocateExportID  Function to allocate the next object
 *   export ID for the enclosing vat.
 * @param {(val: object) => string | undefined} getSlotForVal  A function that returns the
 *   object ID (vref) for a given object, if any.  their corresponding export
 *   IDs
 * @param {(slot: string) => object} requiredValForSlot
 * @param {*} registerValue  Function to register a new slot+value in liveSlot's
 *   various tables
 * @param {ToCapData<string>} serialize  Serializer for this vat
 * @param {FromCapData<string>} unserialize  Unserializer for this vat
 * @param {*} assertAcceptableSyscallCapdataSize  Function to check for oversized
 *   syscall params
 * @param {import('./types.js').LiveSlotsOptions} [liveSlotsOptions]
 * @param {{ WeakMap: typeof WeakMap, WeakSet: typeof WeakSet }} [powers]
 * Specifying the underlying WeakMap/WeakSet objects to wrap with
 * VirtualObjectAwareWeakMap/Set.  By default, capture the ones currently
 * defined on `globalThis` when the maker is invoked, to avoid infinite
 * recursion if our returned WeakMap/WeakSet wrappers are subsequently installed
 * on globalThis.
 *
 * @returns a new virtual object manager.
 *
 * The virtual object manager allows the creation of persistent objects that do
 * not need to occupy memory when they are not in use.  It provides five
 * functions:
 *
 * - `defineKind`, `defineKindMulti`, `defineDurableKind`, and
 *    `defineDurableKindMulti` enable users to define new types of virtual
 *    object by providing an implementation of the new kind of object's
 *    behavior.  The result is a maker function that will produce new
 *    virtualized instances of the defined object type on demand.
 *
 * - `VirtualObjectAwareWeakMap` and `VirtualObjectAwareWeakSet` are drop-in
 *    replacements for JavaScript's builtin `WeakMap` and `WeakSet` classes
 *    which understand the magic internal voodoo used to implement virtual
 *    objects and will do the right thing when virtual objects are used as keys.
 *    The intent is that the hosting environment will inject these as
 *    substitutes for their regular JS analogs in way that should be transparent
 *    to ordinary users of those classes.
 *
 * - `flushStateCache` will empty the object manager's cache of in-memory object
 *    instances, writing any changed state to the persistent store. This should
 *    be called at the end of each crank, to ensure the syscall trace does not
 *    depend upon GC of Representatives.
 *
 * The `defineKind` functions are made available to user vat code in the
 * `VatData` global (along with various other storage functions defined
 * elsewhere).
 */
export const makeVirtualObjectManager = (
  syscall,
  vrm,
  allocateExportID,
  getSlotForVal,
  requiredValForSlot,
  registerValue,
  serialize,
  unserialize,
  assertAcceptableSyscallCapdataSize,
  liveSlotsOptions = {},
  { WeakMap, WeakSet } = globalThis,
) => {
  const { allowStateShapeChanges = false } = liveSlotsOptions;

  // array of Caches that need to be flushed at end-of-crank, two per Kind
  // (dataCache, contextCache)
  const allCaches = [];

  // WeakMap tieing VO components together, to prevent anyone who
  // retains one piece (e.g. the cohort record of facets) from being
  // able to observe the comings and goings of representatives by
  // hanging onto that piece while the other pieces are GC'd, then
  // comparing it to what gets generated when the VO is reconstructed
  // by a later import.
  const linkToCohort = new WeakMap();

  const canBeDurable = specimen => {
    const capData = serialize(specimen);
    return capData.slots.every(vrm.isDurable);
  };

  // Marker associated to flag objects that should be held onto strongly if
  // somebody attempts to use them as keys in a VirtualObjectAwareWeakSet or
  // VirtualObjectAwareWeakMap, despite the fact that keys in such collections
  // are nominally held onto weakly.  This to thwart attempts to observe GC by
  // squirreling away a piece of a VO while the rest of the VO gets GC'd and
  // then later regenerated.
  const unweakable = new WeakSet();

  // This is a WeakMap from VO aware weak collections to strong Sets that retain
  // keys used in the associated collection that should not actually be held
  // weakly.
  const unweakableKeySets = new WeakMap();

  const preserveUnweakableKey = (collection, key) => {
    if (unweakable.has(key)) {
      let uwkeys = unweakableKeySets.get(collection);
      if (!uwkeys) {
        uwkeys = new Set();
        unweakableKeySets.set(collection, uwkeys);
      }
      uwkeys.add(key);
    }
  };

  const releaseUnweakableKey = (collection, key) => {
    if (unweakable.has(key)) {
      const uwkeys = unweakableKeySets.get(collection);
      if (uwkeys) {
        uwkeys.delete(key);
      }
    }
  };

  /* eslint max-classes-per-file: ["error", 2] */

  const actualWeakMaps = new WeakMap();
  const virtualObjectMaps = new WeakMap();

  const voAwareWeakMapDeleter = descriptor => {
    for (const vref of descriptor.vmap.keys()) {
      vrm.removeRecognizableVref(vref, descriptor.vmap);
    }
  };

  class VirtualObjectAwareWeakMap {
    constructor() {
      actualWeakMaps.set(this, new WeakMap());
      const vmap = new Map();
      virtualObjectMaps.set(this, vmap);
      vrm.registerDroppedCollection(this, {
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
        preserveUnweakableKey(this, key);
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
        releaseUnweakableKey(this, key);
        return actualWeakMaps.get(this).delete(key);
      }
    }
  }

  defineProperty(VirtualObjectAwareWeakMap, Symbol.toStringTag, {
    value: 'WeakMap',
    writable: false,
    enumerable: false,
    configurable: true,
  });

  const actualWeakSets = new WeakMap();
  const virtualObjectSets = new WeakMap();

  const voAwareWeakSetDeleter = descriptor => {
    for (const vref of descriptor.vset.values()) {
      vrm.removeRecognizableVref(vref, descriptor.vset);
    }
  };

  class VirtualObjectAwareWeakSet {
    constructor() {
      actualWeakSets.set(this, new WeakSet());
      const vset = new Set();
      virtualObjectSets.set(this, vset);

      vrm.registerDroppedCollection(this, {
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
        preserveUnweakableKey(this, value);
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
        releaseUnweakableKey(this, value);
        return actualWeakSets.get(this).delete(value);
      }
    }
  }

  defineProperty(VirtualObjectAwareWeakSet, Symbol.toStringTag, {
    value: 'WeakSet',
    writable: false,
    enumerable: false,
    configurable: true,
  });

  /**
   * @typedef {{
   *  kindID: string,
   *  tag: string,
   *  unfaceted?: boolean,
   *  facets?: string[],
   *  stateShapeCapData?: import('./types.js').SwingSetCapData
   * }} DurableKindDescriptor
   */

  /**
   * @param {DurableKindDescriptor} durableKindDescriptor
   */
  const saveDurableKindDescriptor = durableKindDescriptor => {
    const { kindID } = durableKindDescriptor;
    const key = `vom.dkind.${kindID}.descriptor`;
    syscall.vatstoreSet(key, JSON.stringify(durableKindDescriptor));
  };

  /**
   * @param {string} kindID
   * @returns {DurableKindDescriptor} durableKindDescriptor
   */
  const loadDurableKindDescriptor = kindID => {
    const key = `vom.dkind.${kindID}.descriptor`;
    const raw = syscall.vatstoreGet(key);
    raw || Fail`unknown kind ID ${kindID}`;
    return JSON.parse(raw);
  };

  const saveNextInstanceID = kindID => {
    const key = `vom.dkind.${kindID}.nextID`;
    syscall.vatstoreSet(key, `${nextInstanceIDs.get(kindID)}`);
  };

  const loadNextInstanceID = kindID => {
    const key = `vom.dkind.${kindID}.nextID`;
    return Nat(Number(syscall.vatstoreGet(key)));
  };

  const saveVirtualKindDescriptor = (kindID, descriptor) => {
    // we never read these back: they're stored in the DB for the sake
    // of diagnostics, debugging, and potential external DB
    // cleanup/upgrade tools
    const key = `vom.vkind.${kindID}.descriptor`;
    syscall.vatstoreSet(key, JSON.stringify(descriptor));
  };

  /**
   * Define a new kind of virtual object.
   *
   * @param {string} kindID  The kind ID to associate with the new kind.
   *
   * @param {string} tag  A descriptive tag string as used in calls to `Far`
   *
   * @param {*} init  An initialization function that will return the initial
   *    state of a new instance of the kind of virtual object being defined.
   *
   * @param {boolean} multifaceted True if this should be a multi-faceted
   *    virtual object, false if it should be single-faceted.
   *
   * @param {*} behavior A bag of functions (in the case of a single-faceted
   *    object) or a bag of bags of functions (in the case of a multi-faceted
   *    object) that will become the methods of the object or its facets.
   *
   * @param {DefineKindOptions<*>} options
   *    Additional options to configure the virtual object kind
   *    being defined. See the documentation of DefineKindOptions
   *    for the meaning of each option.
   *
   * @param {boolean} isDurable  A flag indicating whether or not the newly defined
   *    kind should be a durable kind.
   *
   * @param {DurableKindDescriptor} [durableKindDescriptor]  Descriptor for the
   *    durable kind, if it is, in fact, durable
   *
   * @returns {*} a maker function that can be called to manufacture new
   *    instances of this kind of object.  The parameters of the maker function
   *    are those of the `init` function.
   *
   * Notes on theory of operation:
   *
   * Virtual objects are structured in three layers: representatives, inner
   * selves, and state data.
   *
   * A representative is the manifestation of a virtual object that vat code has
   * direct access to.  A given virtual object can have at most one
   * representative, which will be created as needed.  This will happen when the
   * instance is initially made, and can also happen (if it does not already
   * exist) when the instance's virtual object ID is deserialized, either when
   * delivered as part of an incoming message or read as part of another virtual
   * object's state.  A representative will be kept alive in memory as long as
   * there is a variable somewhere that references it directly or indirectly.
   * However, if a representative becomes unreferenced in memory it is subject
   * to garbage collection, leaving the representation that is kept in the vat
   * store as the record of its state from which a mew representative can be
   * reconstituted at need.  Since only one representative exists at a time,
   * references to them may be compared with the equality operator (===).
   * Although the identity of a representative can change over time, this is
   * never visible to code running in the vat.  Methods invoked on a
   * representative always operate on the underlying virtual object state.
   *
   * The inner self represents the in-memory information about an object, aside
   * from its state.  There is an inner self for each virtual object that is
   * currently resident in memory; that is, there is an inner self for each
   * virtual object for which there is currently a representative present
   * somewhere in the vat.  The inner self maintains two pieces of information:
   * its corresponding virtual object's virtual object ID, and a pointer to the
   * virtual object's state in memory if the virtual object's state is, in fact,
   * currently resident in memory.  If the state is not in memory, the inner
   * self's pointer to the state is null.  In addition, the virtual object
   * manager maintains an LRU cache of inner selves.  Inner selves that are in
   * the cache are not necessarily referenced by any existing representative,
   * but are available to be used should such a representative be needed.  How
   * this all works will be explained in a moment.
   *
   * The state of a virtual object is a collection of mutable properties, each
   * of whose values is itself immutable and serializable.  The methods of a
   * virtual object have access to this state by closing over a state object.
   * However, the state object they close over is not the actual state object,
   * but a wrapper with accessor methods that both ensure that a representation
   * of the state is in memory when needed and perform deserialization on read
   * and serialization on write; this wrapper is held by the representative, so
   * that method invocations always see the wrapper belonging to the invoking
   * representative.  The actual state object holds marshaled serializations of
   * each of the state properties.  When written to persistent storage, this is
   * represented as a JSON-stringified object each of whose properties is one
   * of the marshaled property values.
   *
   * When a method of a virtual object attempts to access one of the properties
   * of the object's state, the accessor first checks to see if the state is in
   * memory.  If it is not, it is loaded from persistent storage, the
   * corresponding inner self is made to point at it, and then the inner self is
   * placed at the head of the LRU cache (causing the least recently used inner
   * self to fall off the end of the cache).  If it *is* in memory, it is
   * promoted to the head of the LRU cache but the overall contents of the cache
   * remain unchanged.  When an inner self falls off the end of the LRU, its
   * reference to the state is nulled out and the object holding the state
   * becomes garbage collectable.
   */
  const defineKindInternal = (
    kindID,
    tag,
    init,
    multifaceted,
    behavior,
    options = {},
    isDurable,
    durableKindDescriptor = undefined, // only for durables
  ) => {
    const {
      finish = undefined,
      stateShape = undefined,
      receiveAmplifier = undefined,
      receiveInstanceTester = undefined,
      thisfulMethods = false,
    } = options;
    let {
      // These are "let" rather than "const" only to accommodate code
      // below that tolerates an old version of the vat-data package.
      // See there for more explanation.
      interfaceGuard = undefined,
      interfaceGuardKit = undefined,
      currentVersion = 0,
      upgradeState = undefined,
    } = options;

    assert.typeof(currentVersion, 'number');
    Nat(currentVersion);

    const statePrototype = {}; // Not frozen yet
    const stateToBaseRefMap = new WeakMap();

    const getBaseRef = state => {
      const baseRef = stateToBaseRefMap.get(state);
      baseRef !== undefined ||
        Fail`state accessors can only be applied to state`;
      return baseRef;
    };

    let proposedFacetNames; // undefined or a list of strings

    // 'multifaceted' tells us which API was used: define[Durable]Kind
    // vs define[Durable]KindMulti. This function checks whether
    // 'behavior' has one facet, or many, and must match.
    switch (assessFacetiousness(behavior)) {
      case 'one': {
        assert(!multifaceted);
        interfaceGuardKit === undefined ||
          Fail`Use an interfaceGuard, not interfaceGuardKit, to protect class ${q(
            tag,
          )}`;
        proposedFacetNames = undefined;
        break;
      }
      case 'many': {
        assert(multifaceted);

        if (interfaceGuard && interfaceGuardKit === undefined) {
          // This if clause is for the purpose of tolerating versions
          // of the vata-data package that precede
          // https://github.com/Agoric/agoric-sdk/pull/8220 .
          // Before that PR, the options name `interfaceGuard` would
          // actually carry the InterfaceGuardKit.
          //
          // Tolerating the old vat-data with the new types.
          // @ts-expect-error
          interfaceGuardKit = interfaceGuard;
          interfaceGuard = undefined;
          // The rest of the code from here makes no further compromise
          // for that old version of the vat-data package.
        }

        interfaceGuard === undefined ||
          Fail`Use an interfaceGuardKit, not an interfaceGuard, to protect class kit ${q(
            tag,
          )}`;
        proposedFacetNames = ownKeys(behavior).sort();
        break;
      }
      case 'not': {
        throw Fail`invalid behavior specifier for ${q(tag)}`;
      }
      default: {
        throw Fail`invalid facetiousness`;
      }
    }
    // beyond this point, we use 'multifaceted' to switch modes

    // The 'stateShape' pattern constrains the `state` of each
    // instance: which properties it may have, and what their values
    // are allowed to be. For durable Kinds, the stateShape is
    // serialized and recorded in the durableKindDescriptor, so future
    // incarnations (which redefine the kind when they call
    // defineDurableKind again) can both check for compatibility, and
    // to decrement refcounts on any slots referenced by the old
    // shape.

    harden(stateShape);
    stateShape === undefined ||
      passStyleOf(stateShape) === 'copyRecord' ||
      Fail`A stateShape must be a copyRecord: ${q(stateShape)}`;
    assertPattern(stateShape);

    if (!multifaceted) {
      receiveAmplifier === undefined ||
        Fail`Only facets of an exo class kit can be amplified, not ${q(tag)}`;
    }

    let facetNames;

    if (isDurable) {
      // durableKindDescriptor is created by makeKindHandle, with just
      // { kindID, tag, nextInstanceID }, then the first
      // defineDurableKind (maybe us!) will populate
      // .facets/.unfaceted and a .stateShape . We'll only see those
      // properties if we're in a non-initial incarnation.

      assert(durableKindDescriptor);

      // initial creation will update the descriptor with .facets or
      // .unfaceted, subsequent re-definitions will assert
      // compatibility, and reassign facet name->index
      facetNames = checkAndUpdateFacetiousness(
        tag,
        durableKindDescriptor,
        proposedFacetNames,
      );

      const newShapeCD = serialize(stateShape);

      // Durable kinds can only hold durable objects in their state,
      // so if the stateShape were to require a non-durable object,
      // nothing could ever match. So we require the shape have only
      // durable objects
      insistDurableCapdata(vrm, 'stateShape', newShapeCD, false);

      // compare against slots of previous definition, incref/decref
      const oldShapeCD = durableKindDescriptor.stateShapeCapData;

      const oldStateShapeSlots = oldShapeCD ? oldShapeCD.slots : [];
      if (oldShapeCD && !allowStateShapeChanges) {
        insistSameCapData(oldShapeCD, newShapeCD);
      }
      const newStateShapeSlots = newShapeCD.slots;
      vrm.updateReferenceCounts(oldStateShapeSlots, newStateShapeSlots);
      durableKindDescriptor.stateShapeCapData = newShapeCD; // replace

      saveDurableKindDescriptor(durableKindDescriptor);
    } else {
      facetNames = proposedFacetNames;
    }

    /** @type {(prop: string) => void} */
    let checkStateProperty = _prop => {};
    /** @type {(value: any, prop: string) => void} */
    let checkStatePropertyValue = (_value, _prop) => {};
    if (stateShape) {
      checkStateProperty = prop => {
        hasOwn(stateShape, prop) ||
          Fail`State must only have fields described by stateShape: ${q(
            ownKeys(stateShape),
          )}`;
      };
      checkStatePropertyValue = (value, prop) => {
        checkStateProperty(prop);
        mustMatch(value, stateShape[prop]);
      };
    }

    // The dataCache holds both unserialized and still-serialized
    // (capdata) contents of the virtual-object state record.
    // dataCache[baseRef] -> { capdatas, valueMap }
    // valueCD=capdatas[prop], value=valueMap.get(prop)
    /** @type { import('./cache.js').Cache<{ capdatas: any, valueMap: Map<string, any> }>} */
    const dataCache = makeDataCache(syscall);
    allCaches.push(dataCache);

    // Behavior functions will receive a 'state' object that provides
    // access to their virtualized data, with getters and setters
    // backed by the vatstore DB. When those functions are invoked and
    // we miss in contextCache, we'll call makeState() and
    // makeContext(). The makeState() call might read from the
    // vatstore DB if we miss in dataCache.

    // We sample dataCache.get() once each time:
    // * makeState() is called, which happens the first time in each crank that
    //   a method is invoked (and the prototype does getContext)
    // * when state.prop is read, invoking the getter
    // * when state.prop is written, invoking the setter
    // This will cause a syscall.vatstoreGet only once per crank.

    const makeFieldDescriptor = prop => {
      return harden({
        get() {
          const baseRef = getBaseRef(this);
          const record = dataCache.get(baseRef);
          assert(record !== undefined);
          const { valueMap, capdatas } = record;
          if (!valueMap.has(prop)) {
            const value = harden(unserialize(capdatas[prop]));
            checkStatePropertyValue(value, prop);
            valueMap.set(prop, value);
          }
          return valueMap.get(prop);
        },
        set(value) {
          const baseRef = getBaseRef(this);
          checkStatePropertyValue(value, prop);
          const capdata = serialize(value);
          assertAcceptableSyscallCapdataSize([capdata]);
          if (isDurable) {
            insistDurableCapdata(vrm, prop, capdata, true);
          }
          const record = dataCache.get(baseRef); // mutable
          assert(record !== undefined);
          const oldSlots = record.capdatas[prop].slots;
          const newSlots = capdata.slots;
          vrm.updateReferenceCounts(oldSlots, newSlots);
          record.capdatas[prop] = capdata; // modify in place ..
          record.valueMap.set(prop, value);
          dataCache.set(baseRef, record); // .. but mark as dirty
        },
        enumerable: true,
        configurable: false,
      });
    };

    if (stateShape !== undefined) {
      for (const prop of ownKeys(stateShape)) {
        defineProperty(statePrototype, prop, makeFieldDescriptor(prop));
      }
    }

    harden(statePrototype);

    const makeState = baseRef => {
      const state = { __proto__: statePrototype };
      if (stateShape === undefined) {
        const record = dataCache.get(baseRef);
        assert(record !== undefined);
        for (const prop of ownKeys(record.capdatas)) {
          assert(typeof prop === 'string');
          checkStateProperty(prop);
          defineProperty(state, prop, makeFieldDescriptor(prop));
        }
      }
      harden(state);
      stateToBaseRefMap.set(state, baseRef);
      return state;
    };

    // More specifically, behavior functions receive a "context"
    // object as their first argument, with { state, self } or {
    // state, facets }. This makeContext() creates one, and is called
    // if/when those functions are invoked and the "contextCache"
    // misses, in which case the makeContextCache/readBacking function
    // will sample dataCache.get, then call both "makeState()" and
    // "makeContext". The DB might be read by that dataCache.get.

    const makeContext = (baseRef, state) => {
      // baseRef came from valToSlot, so must be in slotToVal
      const val = requiredValForSlot(baseRef);
      // val is either 'self' or the facet record
      if (multifaceted) {
        return harden({ state, facets: val });
      } else {
        return harden({ state, self: val });
      }
    };

    // The contextCache holds the {state,self} or {state,facets} "context"
    // object, needed by behavior functions. We keep this in a (per-crank)
    // cache because creating one requires knowledge of the state property
    // names, which requires a DB read. The property names are fixed at
    // instance initialization time, so we never write changes to this cache.

    const contextCache = makeContextCache(makeState, makeContext);
    allCaches.push(contextCache);

    // defendPrototype/defendPrototypeKit accept a contextProvider function,
    // or a contextProviderKit record which maps facet name strings to
    // provider functions. It calls the function during invocation of each
    // method, and expects to get back the "context" record, either { state,
    // self } for single-facet VOs, or { state, facets } for multi-facet
    // ones. The provider we use fetches the state data (if not already in the
    // cache) at the last minute. This moves any syscalls needed by
    // stateCache.get() out of deserialization time (which is sensitive to GC)
    // and into method-invocation time (which is not).

    let proto;
    /** @type {ClassContextProvider | undefined} */
    let contextProviderVar;
    /** @type { Record<string, KitContextProvider> | undefined } */
    let contextProviderKitVar;

    if (multifaceted) {
      contextProviderKitVar = fromEntries(
        facetNames.map((name, index) => [
          name,
          rep => {
            const vref = getSlotForVal(rep);
            if (vref === undefined) {
              return undefined;
            }
            const { baseRef, facet } = parseVatSlot(vref);

            // Without this check, an attacker (with access to both
            // cohort1.facetA and cohort2.facetB)
            // could effectively forge access to
            // cohort1.facetB and cohort2.facetA.
            // They could not forge the identity of those two
            // objects, but they could invoke all their equivalent methods,
            // by using e.g.
            // cohort1.facetA.foo.apply(cohort2.facetB, [...args])
            if (Number(facet) !== index) {
              return undefined;
            }

            return harden(contextCache.get(baseRef));
          },
        ]),
      );

      proto = defendPrototypeKit(
        tag,
        harden(contextProviderKitVar),
        behavior,
        thisfulMethods,
        interfaceGuardKit,
      );
    } else {
      contextProviderVar = rep => {
        const slot = getSlotForVal(rep);
        if (slot === undefined) {
          return undefined;
        }
        return harden(contextCache.get(slot));
      };
      proto = defendPrototype(
        tag,
        harden(contextProviderVar),
        behavior,
        thisfulMethods,
        interfaceGuard,
      );
    }
    harden(proto);

    // All this to let typescript know that it won't vary during a closure
    const contextProvider = contextProviderVar;
    const contextProviderKit = contextProviderKitVar;

    // this builds new Representatives, both when creating a new instance and
    // for reanimating an existing one when the old rep gets GCed

    const reanimateVO = baseRef => {
      if (multifaceted) {
        return makeFacets(facetNames, proto, linkToCohort, unweakable, baseRef);
      } else {
        return makeRepresentative(proto, baseRef);
      }
    };

    const deleteStoredVO = baseRef => {
      let doMoreGC = false;
      const record = dataCache.get(baseRef);
      assert(record !== undefined);
      for (const valueCD of Object.values(record.capdatas)) {
        for (const vref of valueCD.slots) {
          doMoreGC = vrm.removeReachableVref(vref) || doMoreGC;
        }
      }
      dataCache.delete(baseRef);
      return doMoreGC;
    };

    // Tell the VRM about this Kind.
    vrm.registerKind(kindID, reanimateVO, deleteStoredVO, isDurable);
    vrm.rememberFacetNames(kindID, facetNames);

    const makeNewInstance = (...args) => {
      const id = getNextInstanceID(kindID, isDurable);
      const baseRef = makeBaseRef(kindID, id, isDurable);
      // kdebug(`vo make ${baseRef}`);

      const initialData = init ? init(...args) : {};

      // catch mistaken use of `() => { foo: 1 }` rather than `() => ({ foo: 1 })`
      // (the former being a function with a body having a no-op statement labeled
      // "foo" and returning undefined, the latter being a function with a concise
      // body that returns an object having a property named "foo").
      typeof initialData === 'object' ||
        Fail`initial data must be object, not ${initialData}`;

      // save (i.e. populate the cache) with the initial serialized record
      const capdatas = {};
      const valueMap = new Map();
      for (const prop of getOwnPropertyNames(initialData)) {
        const value = initialData[prop];
        checkStatePropertyValue(value, prop);
        const valueCD = serialize(value);
        // TODO: we're only checking the size of one property at a
        // time, but the real constraint is the vatstoreSet of the
        // aggregate record. We should apply this check to the full
        // list of capdatas, plus its likely JSON overhead.
        assertAcceptableSyscallCapdataSize([valueCD]);
        if (isDurable) {
          insistDurableCapdata(vrm, prop, valueCD, true);
        }
        // eslint-disable-next-line github/array-foreach
        valueCD.slots.forEach(vrm.addReachableVref);
        capdatas[prop] = valueCD;
        valueMap.set(prop, value);
      }
      // dataCache contents remain mutable: state setter modifies in-place
      dataCache.set(baseRef, { capdatas, valueMap });

      // make the initial representative or cohort
      let val;
      if (multifaceted) {
        val = makeFacets(facetNames, proto, linkToCohort, unweakable, baseRef);
      } else {
        val = makeRepresentative(proto, baseRef);
      }
      registerValue(baseRef, val, multifaceted);
      finish && finish(contextCache.get(baseRef));
      return val;
    };

    if (receiveAmplifier) {
      assert(contextProviderKit);

      // Amplify a facet to a cohort
      const amplify = exoFacet => {
        for (const cp of values(contextProviderKit)) {
          const context = cp(exoFacet);
          if (context !== undefined) {
            return context.facets;
          }
        }
        throw Fail`Must be a facet of ${q(tag)}: ${exoFacet}`;
      };
      harden(amplify);
      receiveAmplifier(amplify);
    }

    if (receiveInstanceTester) {
      if (multifaceted) {
        assert(contextProviderKit);

        const isInstance = (exoFacet, facetName = undefined) => {
          if (facetName === undefined) {
            // Is exoFacet and instance of any facet of this class kit?
            return values(contextProviderKit).some(
              cp => cp(exoFacet) !== undefined,
            );
          }
          // Is this exoFacet an instance of this specific facet column
          // of this class kit?
          assert.typeof(facetName, 'string');
          const cp = contextProviderKit[facetName];
          cp !== undefined ||
            Fail`exo class kit ${q(tag)} has no facet named ${q(facetName)}`;
          return cp(exoFacet) !== undefined;
        };
        harden(isInstance);
        receiveInstanceTester(isInstance);
      } else {
        assert(contextProvider);
        // Is this exo an instance of this class?
        const isInstance = (exo, facetName = undefined) => {
          facetName === undefined ||
            Fail`facetName can only be used with an exo class kit: ${q(
              tag,
            )} has no facet ${q(facetName)}`;
          return contextProvider(exo) !== undefined;
        };
        harden(isInstance);
        receiveInstanceTester(isInstance);
      }
    }

    return makeNewInstance;
  };

  let kindIDID;
  /** @type Map<string, DurableKindDescriptor> */
  const kindIDToDescriptor = new Map();
  const kindHandleToID = new Map();
  const definedDurableKinds = new Set(); // kindID
  const nextInstanceIDs = new Map(); // kindID -> nextInstanceID

  const reanimateDurableKindID = vobjID => {
    const kindID = `${parseVatSlot(vobjID).subid}`;
    const durableKindDescriptor = loadDurableKindDescriptor(kindID);
    const nextInstanceID = loadNextInstanceID(kindID);
    kindIDToDescriptor.set(kindID, durableKindDescriptor);
    nextInstanceIDs.set(kindID, nextInstanceID);
    const kindHandle = Far('kind', {});
    kindHandleToID.set(kindHandle, kindID);
    // KindHandles are held strongly for the remainder of the incarnation, so
    // their components do not provide GC sensors
    return kindHandle;
  };

  const initializeKindHandleKind = () => {
    kindIDID = syscall.vatstoreGet('kindIDID');
    if (!kindIDID) {
      kindIDID = `${allocateExportID()}`;
      syscall.vatstoreSet('kindIDID', kindIDID);
    }
    vrm.registerKind(kindIDID, reanimateDurableKindID, () => false, true);
  };

  const getNextInstanceID = (kindID, isDurable) => {
    assert.typeof(kindID, 'string');
    // nextInstanceID is initialized to 1 for brand new kinds, loaded
    // from DB when redefining existing kinds, held in RAM, and
    // written to DB after each increment as part of
    // kindDescriptors[kindID]
    const id = nextInstanceIDs.get(kindID);
    assert(id !== undefined);
    const next = id + 1n;
    nextInstanceIDs.set(kindID, next);
    if (isDurable) {
      saveNextInstanceID(kindID);
    }
    return id;
  };

  /** @type {import('./vatDataTypes').VatData['defineKind']} */
  const defineKind = (tag, init, behavior, options) => {
    const kindID = `${allocateExportID()}`;
    saveVirtualKindDescriptor(kindID, { kindID, tag });
    nextInstanceIDs.set(kindID, 1n);
    return defineKindInternal(
      kindID,
      tag,
      init,
      false,
      behavior,
      options,
      false,
    );
  };

  /** @type {import('./vatDataTypes').VatData['defineKindMulti']} */
  const defineKindMulti = (tag, init, behavior, options) => {
    const kindID = `${allocateExportID()}`;
    saveVirtualKindDescriptor(kindID, { kindID, tag });
    nextInstanceIDs.set(kindID, 1n);
    return defineKindInternal(
      kindID,
      tag,
      init,
      true,
      behavior,
      options,
      false,
    );
  };

  /**
   *
   * @param {string} tag
   * @returns {DurableKindHandle}
   */
  const makeKindHandle = tag => {
    assert(kindIDID, 'initializeKindHandleKind not called yet');
    const kindID = `${allocateExportID()}`;
    const durableKindDescriptor = { kindID, tag };
    const nextInstanceID = 1n;
    kindIDToDescriptor.set(kindID, durableKindDescriptor);
    nextInstanceIDs.set(kindID, nextInstanceID);
    saveDurableKindDescriptor(durableKindDescriptor);
    saveNextInstanceID(kindID);
    /** @type {DurableKindHandle} */

    // @ts-expect-error cast
    const kindHandle = Far('kind', {});
    kindHandleToID.set(kindHandle, kindID);
    const kindIDvref = makeBaseRef(kindIDID, kindID, true);
    registerValue(kindIDvref, kindHandle, false);
    return kindHandle;
  };

  /** @type {import('./vatDataTypes').VatData['defineDurableKind']} */
  const defineDurableKind = (kindHandle, init, behavior, options) => {
    kindHandleToID.has(kindHandle) || Fail`unknown handle ${kindHandle}`;
    const kindID = kindHandleToID.get(kindHandle);
    const durableKindDescriptor = kindIDToDescriptor.get(kindID);
    assert(durableKindDescriptor);
    const { tag } = durableKindDescriptor;
    !definedDurableKinds.has(kindID) ||
      Fail`redefinition of durable kind ${tag}`;
    const maker = defineKindInternal(
      kindID,
      tag,
      init,
      false,
      behavior,
      options,
      true,
      durableKindDescriptor,
    );
    definedDurableKinds.add(kindID);
    return maker;
  };

  /** @type {import('./vatDataTypes').VatData['defineDurableKindMulti']} */
  const defineDurableKindMulti = (kindHandle, init, behavior, options) => {
    kindHandleToID.has(kindHandle) || Fail`unknown handle ${kindHandle}`;
    const kindID = kindHandleToID.get(kindHandle);
    const durableKindDescriptor = kindIDToDescriptor.get(kindID);
    assert(durableKindDescriptor);
    const { tag } = durableKindDescriptor;
    !definedDurableKinds.has(kindID) ||
      Fail`redefinition of durable kind "${tag}"`;
    const maker = defineKindInternal(
      kindID,
      tag,
      init,
      true,
      behavior,
      options,
      true,
      durableKindDescriptor,
    );
    definedDurableKinds.add(kindID);
    return maker;
  };

  const insistAllDurableKindsReconnected = () => {
    // identify all user-defined durable kinds by iterating `vom.dkind.*`
    const missing = [];
    const prefix = 'vom.dkind.';
    for (const key of enumerateKeysWithPrefix(syscall, prefix)) {
      if (key.endsWith('.descriptor')) {
        const value = syscall.vatstoreGet(key);
        const durableKindDescriptor = JSON.parse(value);
        if (!definedDurableKinds.has(durableKindDescriptor.kindID)) {
          missing.push(durableKindDescriptor.tag);
        }
      }
    }
    if (missing.length) {
      const tags = missing.join(',');
      throw Error(`defineDurableKind not called for tags: [${tags}]`);
    }
  };

  const countWeakKeysForCollection = collection => {
    const virtualObjectMap = virtualObjectMaps.get(collection);
    if (virtualObjectMap) {
      return virtualObjectMap.size;
    }
    const virtualObjectSet = virtualObjectSets.get(collection);
    if (virtualObjectSet) {
      return virtualObjectSet.size;
    }
    return 0;
  };

  const testHooks = {
    countWeakKeysForCollection,

    definedDurableKinds,
    nextInstanceIDs,
  };

  const flushStateCache = () => {
    for (const cache of allCaches) {
      cache.flush();
    }
  };

  const getRetentionStats = () => {
    return {
      definedDurableKinds: definedDurableKinds.size,
      nextInstanceIDs: nextInstanceIDs.size,
    };
  };

  return harden({
    initializeKindHandleKind,
    defineKind,
    defineKindMulti,
    defineDurableKind,
    defineDurableKindMulti,
    makeKindHandle,
    insistAllDurableKindsReconnected,
    VirtualObjectAwareWeakMap,
    VirtualObjectAwareWeakSet,
    flushStateCache,
    getRetentionStats,
    testHooks,
    canBeDurable,
  });
};
/**
 * @typedef { ReturnType<typeof makeVirtualObjectManager> } VirtualObjectManager
 */
