import { Nat } from '@agoric/nat';
import { assert, details as X } from '@agoric/assert';
import { insistCapData } from '../../lib/capdata.js';
import {
  makeVatSlot,
  insistVatType,
  parseVatSlot,
} from '../../lib/parseVatSlots.js';
import { makeLocalSlot, parseLocalSlot } from './parseLocalSlots.js';
import { initializeRemoteState, makeRemote, insistRemoteID } from './remote.js';
import { cdebug } from './cdebug.js';

const COMMS = 'comms';
const KERNEL = 'kernel';

const enableLocalPromiseGC = true;

function makeEphemeralSyscallVatstore() {
  console.log('making fake vatstore');
  const map = new Map();
  return harden({
    vatstoreGet: key => map.get(key),
    vatstoreSet: (key, value) => map.set(key, value),
    vatstoreDelete: key => map.delete(key),
  });
}

function makeSyscallStore(syscall) {
  return harden({
    get(key) {
      assert.typeof(key, 'string');
      return syscall.vatstoreGet(key);
    },
    set(key, value) {
      assert.typeof(key, 'string');
      assert.typeof(value, 'string');
      syscall.vatstoreSet(key, value);
    },
    delete(key) {
      assert.typeof(key, 'string');
      return syscall.vatstoreDelete(key);
    },
    getRequired(key) {
      assert.typeof(key, 'string');
      const result = syscall.vatstoreGet(key);
      assert(result !== undefined, X`store lacks required key ${key}`);
      return result;
    },
  });
}

function commaSplit(s) {
  // 's' might be 'undefined' (because the DB key that feeds it was not
  // present, and undefined is the obvious return value from a
  // .get(missingKey), or null (because the DB lookup actually happened on
  // the other side of a JSON-encoded vat-worker-to-kernel-process pipe and
  // the JSON decoder produces null instead of undefined), or '' (because the
  // key is present but was populated with slots.join(',') and slots was
  // empty, so join() produces an empty string). In all three cases, and
  // empty list is the correct return value.
  if (!s) {
    return [];
  }
  return s.split(',');
}

// We maintain one clist for each remote.
// The remote clists map remote-side `ro+NN/ro-NN` identifiers to the `o+NN/o-NN`
// namespace used within the comms vat, and `rp+NN/rp-NN` to `p+NN/p-NN`.

// On the kernel side, we exchange `o+NN/o-NN` with the kernel, in the
// arguments of deliveries, resolutions, and notifications. We also exchange
// `p+NN/p-NN` values, but only for *unresolved* promises. The swingset
// kernel-vat interface contract says promise resolution causes the ID to be
// retired, forgotten immediately by both sides.

// If we ever have cause to send a retired vpid into the kernel, we must
// instead allocate a new `p+NN` value, send *that* into the kernel instead,
// immediately resolve it, and then forget about it again. We don't need to
// record the new `p+NN` value anywhere. The counter we use for allocation
// will continue on to the next higher NN.

export function makeState(syscall) {
  // Comms vat state is kept in the vatstore, which is managed by the kernel and
  // accessed as part of the syscall interface.  The schema used here is very
  // similar to (in fact, modelled upon) the schema the kernel uses for its own
  // store (since the message routing and object/promise identifier translation
  // functions the comms vat does are very parallel to what the kernel does).
  //
  // The schema is:
  //
  // initialized = true // present if this comms vat has had its storage intialized
  //
  // o.nextID = $NN  // kernel-facing object identifier allocation counter (o+NN)
  // p.nextID = $NN  // kernel-facing promise identifier allocation counter (p+NN)
  // c.$kfref = $lref // inbound kernel-facing c-list (o+NN/o-NN/p+NN/p-NN -> loNN/lpNN)
  // c.$lref = $kfref // outbound kernel-facing c-list (loNN/lpNN -> o+NN/o-NN/p+NN/p-NN)
  // cr.$lref = 1 | <missing> // isReachable flag
  // //imps.$lref.$remoteID = 1 // one key per importer of $lref (FUTURE)
  // imps.$lref = JSON([remoteIDs]) // importers of $lref
  // imps.$lref.$remoteID = 1 // one key per importer of $lref
  // meta.$kfref = true // flag that $kfref (o+NN/o-NN) is a directly addressable control object
  //
  // lo.nextID = $NN // local object identifier allocation counter (loNN)
  // lo$NN.owner = r$NN | kernel // owners of local objects (loNN -> rNN)
  // lo$NN.reachable = $NN // refcount
  // lo$NN.recognizable = $NN // refcount
  //
  // lp.nextID = $NN // local promise identifier allocation counter (lpNN)
  // lp$NN.status = unresolved | fulfilled | rejected
  // lp$NN.refCount = $NN
  // // if unresolved:
  // lp$NN.decider = r$NN | comms | kernel
  // lp$NN.kernelSubscribed = true // present if kernel is subscribed
  // lp$NN.subscribers = '' | r$NN,$rNN...
  // // if fulfilled or rejected:
  // lp$NN.data.body = missing | JSON
  // lp$NN.data.slots = '' | $lref,$lref...
  //
  // r.nextID = $NN  // remote connection identifier allocation counter (rNN)
  // r.$loid = r$NN  // mapping receiver objects to remotes they receive from
  // rname.$name = r$NN // mapping from remote names to remote IDs
  //   (remote name strings are limited to sequences of [A-Za-z0-9.+-] )
  // r$NN.initialized = true // present if this remote has had its storage initialized
  // r$NN.name = name // name for this remote
  // r$NN.transmitterID = $kfref // transmitter object for sending to remote
  // r$NN.c.$rref = $lref // r$NN inbound c-list (ro+NN/ro-NN/rp+NN/rp-NN -> loNN/lpNN)
  // r$NN.c.$lref = $rref // r$NN outbound c-list (loNN/lpNN -> ro+NN/ro-NN/rp+NN/rp-NN)
  // r$NN.cr.$lref = 1 | <missing> // isReachable flag
  // r$NN.lastSent.$lref = $NN // outbound seqnum of last object export
  // r$NN.sendSeq = $NN // counter for outbound message sequence numbers to r$NN
  // r$NN.recvSeq = $NN // counter for inbound message sequence numbers from r$NN
  // r$NN.o.nextID = $NN // r$NN object identifier allocation counter (ro-NN)
  // r$NN.p.nextID = $NN // r$NN promise identifier allocation counter (rp-NN)
  // r$NN.rq = [[$seqnum,$rpid],[$seqnum,$rpid]...] // r$NN promise retirement queue

  if (!syscall) {
    syscall = makeEphemeralSyscallVatstore();
  }
  const store = makeSyscallStore(syscall);

  function initialize(controller, identifierBase) {
    if (!store.get('initialized')) {
      store.set('identifierBase', `${identifierBase}`);
      store.set('sendExplicitSeqNums', '1');
      store.set('lo.nextID', `${identifierBase + 10}`);
      store.set('lp.nextID', `${identifierBase + 20}`);
      store.set('o.nextID', `${identifierBase + 30}`);
      store.set('p.nextID', `${identifierBase + 40}`);
      store.set('r.nextID', '1');
      store.set('initialized', 'true');
      if (controller) {
        // eslint-disable-next-line no-use-before-define
        addMetaObject(controller);
        cdebug(`comms controller is ${controller}`);
      }
    }
  }

  function setSendExplicitSeqNums(sendExplicitSeqNums) {
    const digit = Number(Boolean(sendExplicitSeqNums));
    store.set('sendExplicitSeqNums', `${digit}`);
  }

  function getSendExplicitSeqNums() {
    const digit = Number(store.getRequired('sendExplicitSeqNums'));
    return Boolean(digit);
  }

  function deleteLocalPromiseState(lpid) {
    store.delete(`${lpid}.status`);
    store.delete(`${lpid}.decider`);
    store.delete(`${lpid}.kernelSubscribed`);
    store.delete(`${lpid}.subscribers`);
    store.delete(`${lpid}.data.body`);
    store.delete(`${lpid}.data.slots`);
    store.delete(`${lpid}.refCount`);
  }

  function deleteLocalPromise(lpid) {
    const status = store.getRequired(`${lpid}.status`);
    switch (status) {
      case 'unresolved':
        break;
      case 'fulfilled':
        break;
      case 'rejected':
        break;
      default:
        assert.fail(X`unknown status for ${lpid}: ${status}`);
    }
    deleteLocalPromiseState(lpid);
  }

  /* we need syscall.vatstoreGetKeys to do it this way
  function addImporter(lref, remoteID) {
    assert(!lref.includes('.'), lref);
    const key = `imps.${lref}.${remoteID}`;
    store.set(key, '1');
  }
  function removeImporter(lref, remoteID) {
    assert(!lref.includes('.'), lref);
    const key = `imps.${lref}.${remoteID}`;
    store.delete(key);
  }
  function getImporters(lref) {
    const remoteIDs = [];
    const prefix = `imps.${lref}`;
    const startKey = `${prefix}.`;
    const endKey = `${prefix}/`; // '.' and '/' are adjacent
    for (const k of store.getKeys(startKey, endKey)) {
      const remoteID = k.slice(0, prefix.length);
      if (remoteID !== 'kernel') {
        insistRemoteID(remoteID);
      }
      remoteIDs.push(remoteID);
    }
    return harden(remoteIDs);
  }
  */

  function addImporter(lref, remoteID) {
    const key = `imps.${lref}`;
    const value = JSON.parse(store.get(key) || '[]');
    value.push(remoteID);
    value.sort();
    store.set(key, JSON.stringify(value));
  }
  function removeImporter(lref, remoteID) {
    assert(!lref.includes('.'), lref);
    const key = `imps.${lref}`;
    let value = JSON.parse(store.get(key) || '[]');
    value = value.filter(r => r !== remoteID);
    store.set(key, JSON.stringify(value));
  }
  function getImporters(lref) {
    const key = `imps.${lref}`;
    const remoteIDs = JSON.parse(store.get(key) || '[]');
    return harden(remoteIDs);
  }

  /* A mode of 'clist-import' means we increment recognizable, but not
   * reachable, because the translation function will call setReachable in a
   * moment, and the count should only be changed if it wasn't already
   * reachable. 'clist-export' means we don't touch the count at all. 'other'
   * is used by resolved promise data and auxdata, and means we increment
   * both.
   */
  const referenceModes = harden(['data', 'clist-export', 'clist-import']);

  function changeRecognizable(lref, delta) {
    const key = `${lref}.recognizable`;
    const recognizable = Nat(BigInt(store.getRequired(key))) + delta;
    store.set(key, `${Nat(recognizable)}`);
    return recognizable;
  }

  function changeReachable(lref, delta) {
    const key = `${lref}.reachable`;
    const reachable = Nat(BigInt(store.getRequired(key))) + delta;
    store.set(key, `${Nat(reachable)}`);
    return reachable;
  }

  const maybeFree = new Set(); // lrefs

  function lrefMightBeFree(lref) {
    maybeFree.add(lref);
  }

  /**
   * Increment the reference count associated with some local object.
   *
   * Note that currently we are only reference counting promises, but ultimately
   * we intend to keep track of all local objects.
   *
   * @param {string} lref Ref of the local object whose refcount is to be incremented.
   * @param {string} _tag Descriptive label for use in diagnostics
   * @param {string} mode Reference type
   */
  function incrementRefCount(lref, _tag, mode = 'data') {
    assert(referenceModes.includes(mode), `unknown reference mode ${mode}`);
    const { type } = parseLocalSlot(lref);
    if (type === 'promise') {
      const refCount = parseInt(store.get(`${lref}.refCount`), 10) + 1;
      // cdebug(`++ ${lref}  ${tag} ${refCount}`);
      store.set(`${lref}.refCount`, `${Nat(refCount)}`);
    }
    if (type === 'object') {
      if (mode === 'clist-import' || mode === 'data') {
        changeRecognizable(lref, 1n);
      }
      if (mode === 'data') {
        changeReachable(lref, 1n);
      }
    }
  }

  /**
   * Decrement the reference counts associated with some local object/promise.
   *
   * @param {string} lref Ref of the local object whose refcount is to be decremented.
   * @param {string} tag Descriptive label for use in diagnostics
   * @param {string} mode Reference type
   * @throws If this tries to decrement a reference count below zero.
   */
  function decrementRefCount(lref, tag, mode = 'data') {
    assert(referenceModes.includes(mode), `unknown reference mode ${mode}`);
    const { type } = parseLocalSlot(lref);
    if (type === 'promise') {
      let refCount = parseInt(store.get(`${lref}.refCount`), 10);
      assert(refCount > 0n, X`refCount underflow {lref} ${tag}`);
      refCount -= 1;
      // cdebug(`-- ${lref}  ${tag} ${refCount}`);
      store.set(`${lref}.refCount`, `${Nat(refCount)}`);
      if (refCount === 0) {
        // If we are still in the middle of a resolve operation, and this lref
        // is an ancillary promise that was briefly added to the decider's
        // clist, we'll reach here when we retire that short-lived
        // identifier. However the lref is still in play: the resolution
        // function hasn't finished running, and we'll add the lref to the
        // subscriber's clist momentarily, where it will live until we get an
        // ack and can retire it from that clist too. We add the lref to the
        // maybe-dead set, but we do not trigger GC until the entire comms
        // dispatch is complete and any ancillary promises are safely referenced
        // by their subscribers clists.
        maybeFree.add(lref);
      }
    }
    if (type === 'object') {
      if (mode === 'clist-import' || mode === 'data') {
        const recognizable = changeRecognizable(lref, -1n);
        if (!recognizable) {
          maybeFree.add(lref);
        }
      }
      if (mode === 'data') {
        const reachable = changeReachable(lref, -1n);
        if (!reachable) {
          maybeFree.add(lref);
        }
      }
    }
  }

  function getRefCounts(lref) {
    const reaKey = `${lref}.reachable`;
    const reachable = Nat(BigInt(store.getRequired(reaKey)));
    const recKey = `${lref}.recognizable`;
    const recognizable = Nat(BigInt(store.getRequired(recKey)));
    return { reachable, recognizable };
  }

  /**
   * Delete any local promises that have zero references. Return a list of work
   * for unreachable/unrecognizable objects.
   *
   * Note that this should only be called _after_ all work for a crank is done,
   * because transient zero refCounts are possible during the middle of a crank.
   */
  function processMaybeFree() {
    const actions = new Set();
    // We make a copy of the set, iterate over that, then try again, until
    // the set is empty. TC39 went to a lot of trouble to make sure you can
    // add things to a Set while iterating over it, but I think our
    // `!refCount` check could still be fooled, so it seems safer to use this
    // approach.
    while (maybeFree.size) {
      const lrefs = Array.from(maybeFree.values());
      lrefs.sort();
      maybeFree.clear();
      for (const lref of lrefs) {
        const { type } = parseLocalSlot(lref);
        if (type === 'promise' && enableLocalPromiseGC) {
          const s = store.get(`${lref}.refCount`);
          if (s) {
            const refCount = parseInt(s, 10);
            // refCount>0 means they were saved from near-certain death
            if (!refCount) {
              let idx = 0;
              const slots = commaSplit(store.get(`${lref}.data.slots`));
              for (const slot of slots) {
                decrementRefCount(slot, `gc|${lref}|s${idx}`);
                idx += 1;
              }
              deleteLocalPromise(lref);
            }
          }
        }
        if (type === 'object') {
          // don't do anything if importers can still reach it
          const reaKey = `${lref}.reachable`;
          const reachable = Nat(BigInt(store.getRequired(reaKey)));
          if (!reachable) {
            // the object is unreachable

            const { owner, isReachable, isRecognizable } =
              // eslint-disable-next-line no-use-before-define
              getOwnerAndStatus(lref);
            if (isReachable) {
              // but the exporter doesn't realize it yet, so schedule a
              // dropExport to them, which will clear the isReachable flag at
              // the end of the turn
              actions.add(`${owner} dropExport ${lref}`);
            }

            const recKey = `${lref}.recognizable`;
            const recognizable = Nat(BigInt(store.getRequired(recKey)));
            if (!recognizable && isRecognizable) {
              // all importers have given up, but the exporter is still
              // exporting, so schedule a retireExport to them, which will
              // delete the clist entry after it's translated.
              actions.add(`${owner} retireExport ${lref}`);
            }
            if (!isRecognizable) {
              // the exporter has given up, so tell all importers to give up
              for (const importer of getImporters(lref)) {
                actions.add(`${importer} retireImport ${lref}`);
              }
            }
          }
        }
      }
    }

    return actions;
  }

  function mapFromKernel(kfref) {
    // o+NN/o-NN/p+NN/p-NN -> loNN/lpNN
    return store.get(`c.${kfref}`);
  }

  function mapToKernel(lref) {
    // loNN/lpNN -> o+NN/o-NN/p+NN/p-NN
    return store.get(`c.${lref}`);
  }

  // is/set/clear are used on both imports and exports, but set/clear needs
  // to be told which one it is

  function isReachableByKernel(lref) {
    assert.equal(parseLocalSlot(lref).type, 'object');
    return !!store.get(`cr.${lref}`);
  }
  function setReachableByKernel(lref, isImportFromComms) {
    const wasReachable = isReachableByKernel(lref);
    if (!wasReachable) {
      store.set(`cr.${lref}`, `1`);
      if (isImportFromComms) {
        changeReachable(lref, 1n);
      }
    }
  }
  function clearReachableByKernel(lref, isImportFromComms) {
    const wasReachable = isReachableByKernel(lref);
    if (wasReachable) {
      store.delete(`cr.${lref}`);
      if (isImportFromComms) {
        const reachable = changeReachable(lref, -1n);
        if (!reachable) {
          maybeFree.add(lref);
        }
      }
    }
  }

  // translators should addKernelMapping for new imports/exports, then
  // setReachableByKernel
  function addKernelMapping(kfref, lref) {
    const { type, allocatedByVat } = parseVatSlot(kfref);
    // isImportFromComms===true means kernel is downstream importer
    const isImportFromComms = allocatedByVat;
    store.set(`c.${kfref}`, lref);
    store.set(`c.${lref}`, kfref);
    const mode = isImportFromComms ? 'clist-import' : 'clist-export';
    incrementRefCount(lref, `{kfref}|k|clist`, mode);
    if (type === 'object') {
      if (isImportFromComms) {
        addImporter(lref, 'kernel');
      }
    }
  }

  // GC or delete-remote should just call deleteKernelMapping without any
  // extra clearReachableByKernel
  function deleteKernelMapping(lref) {
    const kfref = store.get(`c.${lref}`);
    let mode = 'data'; // close enough
    const { type, allocatedByVat } = parseVatSlot(kfref);
    const isImportFromComms = allocatedByVat;
    if (type === 'object') {
      clearReachableByKernel(lref, isImportFromComms);
      mode = isImportFromComms ? 'clist-import' : 'clist-export';
    }
    store.delete(`c.${kfref}`);
    store.delete(`c.${lref}`);
    decrementRefCount(lref, `{kfref}|k|clist`, mode);
    if (type === 'object') {
      if (isImportFromComms) {
        removeImporter(lref, 'kernel');
      } else {
        // deleting the upstream/export-side mapping should trigger
        // processMaybeFree
        lrefMightBeFree(lref);
      }
    }
  }

  function hasMetaObject(kfref) {
    return !!store.get(`meta.${kfref}`);
  }

  function addMetaObject(kfref) {
    store.set(`meta.${kfref}`, 'true');
  }

  function allocateKernelObjectID() {
    const index = Nat(BigInt(store.getRequired('o.nextID')));
    store.set('o.nextID', `${index + 1n}`);
    return makeVatSlot('object', true, index);
  }

  function allocateKernelPromiseID() {
    const index = Nat(BigInt(store.getRequired('p.nextID')));
    store.set('p.nextID', `${index + 1n}`);
    return makeVatSlot('promise', true, index);
  }

  function getObject(loid) {
    return store.get(`${loid}.owner`);
  }

  function allocateObject(owner) {
    const index = Nat(BigInt(store.getRequired('lo.nextID')));
    store.set('lo.nextID', `${index + 1n}`);
    const loid = makeLocalSlot('object', index);
    store.set(`${loid}.owner`, owner);
    store.set(`${loid}.reachable`, `0`);
    store.set(`${loid}.recognizable`, `0`);
    return loid;
  }

  function allocatePromise() {
    const index = Nat(BigInt(store.getRequired('lp.nextID')));
    store.set('lp.nextID', `${index + 1n}`);
    const lpid = makeLocalSlot('promise', index);
    store.set(`${lpid}.status`, 'unresolved');
    store.set(`${lpid}.decider`, COMMS);
    store.set(`${lpid}.subscribers`, '');
    store.set(`${lpid}.refCount`, '0');
    return lpid;
  }

  function getOwnerAndStatus(lref) {
    const owner = getObject(lref);
    let isReachable;
    let isRecognizable;
    if (owner === 'kernel') {
      isReachable = isReachableByKernel(lref);
      isRecognizable = !!mapToKernel(lref);
    } else {
      // eslint-disable-next-line no-use-before-define
      const remote = getRemote(owner);
      isReachable = remote.isReachable(lref);
      isRecognizable = !!remote.mapToRemote(lref);
    }
    return { owner, isReachable, isRecognizable };
  }

  function deciderIsKernel(lpid) {
    const decider = store.getRequired(`${lpid}.decider`);
    return decider === KERNEL;
  }

  function deciderIsRemote(lpid) {
    const decider = store.getRequired(`${lpid}.decider`);
    if (decider === KERNEL || decider === COMMS) {
      return undefined;
    }
    insistRemoteID(decider);
    return decider;
  }

  function insistDeciderIsRemote(lpid, remoteID) {
    const decider = store.getRequired(`${lpid}.decider`);
    assert.equal(
      decider,
      remoteID,
      `${lpid} is decided by ${decider}, not ${remoteID}`,
    );
  }

  function insistDeciderIsComms(lpid) {
    const decider = store.getRequired(`${lpid}.decider`);
    assert.equal(
      decider,
      COMMS,
      `${decider} is the decider for ${lpid}, not me`,
    );
  }

  function insistDeciderIsKernel(lpid) {
    const decider = store.getRequired(`${lpid}.decider`);
    assert.equal(
      decider,
      KERNEL,
      `${decider} is the decider for ${lpid}, not kernel`,
    );
  }

  // Decision authority always transfers through the comms vat, so the only
  // legal transitions are remote <-> comms <-> kernel.

  function changeDeciderToRemote(lpid, newDecider) {
    // cdebug(`changeDecider ${lpid}: COMMS->${newDecider}`);
    insistRemoteID(newDecider);
    const decider = store.getRequired(`${lpid}.decider`);
    assert.equal(decider, COMMS);
    store.set(`${lpid}.decider`, newDecider);
  }

  function changeDeciderFromRemoteToComms(lpid, oldDecider) {
    // cdebug(`changeDecider ${lpid}: ${oldDecider}->COMMS`);
    insistRemoteID(oldDecider);
    const decider = store.getRequired(`${lpid}.decider`);
    assert.equal(decider, oldDecider);
    store.set(`${lpid}.decider`, COMMS);
  }

  function changeDeciderToKernel(lpid) {
    // cdebug(`changeDecider ${lpid}: COMMS->KERNEL`);
    const decider = store.getRequired(`${lpid}.decider`);
    assert.equal(decider, COMMS);
    store.set(`${lpid}.decider`, KERNEL);
  }

  function changeDeciderFromKernelToComms(lpid) {
    // cdebug(`changeDecider ${lpid}: KERNEL->COMMS`);
    const decider = store.getRequired(`${lpid}.decider`);
    assert.equal(decider, KERNEL);
    store.set(`${lpid}.decider`, COMMS);
  }

  function getPromiseStatus(lpid) {
    return store.get(`${lpid}.status`);
  }

  function getPromiseData(lpid) {
    const body = store.get(`${lpid}.data.body`);
    const slots = commaSplit(store.get(`${lpid}.data.slots`));
    return { body, slots };
  }

  function getPromiseSubscribers(lpid) {
    const rawSubscribers = store.get(`${lpid}.subscribers`);
    const subscribers = commaSplit(rawSubscribers);
    const kernelIsSubscribed = !!store.get(`${lpid}.kernelSubscribed`);
    return { subscribers, kernelIsSubscribed };
  }

  function insistPromiseIsUnresolved(lpid) {
    const status = store.getRequired(`${lpid}.status`);
    assert(status === 'unresolved', X`${lpid} already resolved`);
  }

  function subscribeRemoteToPromise(lpid, subscriber) {
    insistPromiseIsUnresolved(lpid);
    const key = `${lpid}.subscribers`;
    const rawSubscribers = store.get(key);
    const subscribers = commaSplit(rawSubscribers);
    subscribers.push(subscriber);
    store.set(key, subscribers.sort().join(','));
  }

  function unsubscribeRemoteFromPromise(lpid, subscriber) {
    insistPromiseIsUnresolved(lpid);
    const key = `${lpid}.subscribers`;
    const rawSubscribers = store.getRequired(key);
    const subscribers = commaSplit(rawSubscribers);
    const newSubscribers = subscribers.filter(s => s !== subscriber);
    store.set(key, newSubscribers.join(','));
  }

  function subscribeKernelToPromise(lpid) {
    insistPromiseIsUnresolved(lpid);
    const decider = store.getRequired(`${lpid}.decider`);
    assert(decider !== KERNEL, X`kernel is decider for ${lpid}, hush`);
    // cdebug(`subscribeKernelToPromise ${lpid} d=${decider}`);
    store.set(`${lpid}.kernelSubscribed`, 'true');
  }

  function unsubscribeKernelFromPromise(lpid) {
    insistPromiseIsUnresolved(lpid);
    // cdebug(`unsubscribeKernelFromPromise ${lpid} d=${decider}`);
    store.delete(`${lpid}.kernelSubscribed`);
  }

  function markPromiseAsResolved(lpid, rejected, data) {
    insistPromiseIsUnresolved(lpid);
    insistCapData(data);
    store.set(`${lpid}.status`, rejected ? 'rejected' : 'fulfilled');
    store.set(`${lpid}.data.body`, data.body);
    store.set(`${lpid}.data.slots`, data.slots.join(','));
    let idx = 0;
    for (const slot of data.slots) {
      incrementRefCount(slot, `resolve|s${idx}`);
      idx += 1;
    }
    store.delete(`${lpid}.decider`);
    store.delete(`${lpid}.subscribers`);
    store.delete(`${lpid}.kernelSubscribed`);
  }

  function addRemote(name, transmitterID) {
    assert(/^[-\w.+]+$/.test(name), `not a valid remote name: ${name}`);
    const nameKey = `rname.${name}`;
    assert(!store.get(nameKey), X`remote name ${name} already in use`);

    insistVatType('object', transmitterID);
    addMetaObject(transmitterID);

    const index = parseInt(store.getRequired('r.nextID'), 10);
    store.set('r.nextID', `${index + 1}`);
    const remoteID = `r${index}`;
    const idBase = parseInt(store.get('identifierBase'), 10);
    store.set('identifierBase', `${idBase + 1000}`);
    initializeRemoteState(store, remoteID, idBase, name, transmitterID);
    store.set(nameKey, remoteID);

    // inbound messages will be directed at this exported object
    const receiverID = allocateKernelObjectID();
    addMetaObject(receiverID);
    // receivers are vat objects to which the transport layer will send incoming
    // messages. Each remote machine is assigned a separate receiver object.
    store.set(`r.${receiverID}`, remoteID);
    // prettier-ignore
    cdebug(`comms add remote ${remoteID}/${name} xmit:${transmitterID} recv:${receiverID}`);
    return { remoteID, receiverID };
  }

  function getRemoteIDForName(remoteName) {
    return store.get(`rname.${remoteName}`);
  }

  function getRemoteReceiver(receiverID) {
    return store.get(`r.${receiverID}`);
  }

  const state = harden({
    initialize,

    setSendExplicitSeqNums,
    getSendExplicitSeqNums,

    mapFromKernel,
    mapToKernel,
    isReachableByKernel,
    setReachableByKernel,
    clearReachableByKernel,
    addKernelMapping,
    deleteKernelMapping,

    hasMetaObject,
    addMetaObject,

    allocateKernelObjectID,
    allocateKernelPromiseID,

    getObject,
    allocateObject,

    getPromiseStatus,
    getPromiseData,
    allocatePromise,

    addImporter,
    removeImporter,
    getImporters,

    changeReachable,
    lrefMightBeFree,
    incrementRefCount,
    decrementRefCount,
    getRefCounts,
    processMaybeFree,

    deciderIsKernel,
    deciderIsRemote,

    insistDeciderIsRemote,
    insistDeciderIsComms,
    insistDeciderIsKernel,

    changeDeciderToRemote,
    changeDeciderFromRemoteToComms,
    changeDeciderToKernel,
    changeDeciderFromKernelToComms,

    getPromiseSubscribers,
    subscribeRemoteToPromise,
    unsubscribeRemoteFromPromise,
    subscribeKernelToPromise,
    unsubscribeKernelFromPromise,

    insistPromiseIsUnresolved,
    markPromiseAsResolved,

    // eslint-disable-next-line no-use-before-define
    getRemote,
    addRemote,
    getRemoteIDForName,
    getRemoteReceiver,
  });

  function getRemote(remoteID) {
    return makeRemote(state, store, remoteID);
  }

  return state;
}
