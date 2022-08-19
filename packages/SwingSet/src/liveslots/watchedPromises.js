// @ts-check

// no-lonely-if is a stupid rule that really should be disabled globally
/* eslint-disable no-lonely-if */

import { assert } from '@agoric/assert';
import { M } from '@agoric/store';
import { parseVatSlot } from '../lib/parseVatSlots.js';

/**
 *
 * @param {*} syscall
 * @param {*} vrm
 * @param {import('./virtualObjectManager.js').VirtualObjectManager} vom
 * @param {*} cm
 * @param {*} convertValToSlot
 * @param {*} convertSlotToVal
 * @param {*} revivePromise
 * @param {*} unserialize
 */
export function makeWatchedPromiseManager(
  syscall,
  vrm,
  vom,
  cm,
  convertValToSlot,
  convertSlotToVal,
  revivePromise,
  unserialize,
) {
  const { makeScalarBigMapStore } = cm;
  const { defineDurableKind } = vom;

  // virtual Store (not durable) mapping vpid to Promise objects, to
  // maintain the slotToVal registration until resolution. Without
  // this, slotToVal would forget local Promises that aren't exported.
  let promiseRegistrations;

  // watched promises by vpid: each entry is an array of watches on the
  // corresponding vpid; each of these is in turn an array of a watcher object
  // and the arguments associated with it by `watchPromise`.
  let watchedPromiseTable;

  // defined promise watcher objects indexed by kindHandle
  let promiseWatcherByKindTable;

  function preparePromiseWatcherTables() {
    promiseRegistrations = makeScalarBigMapStore('promiseRegistrations');
    let watcherTableID = syscall.vatstoreGet('watcherTableID');
    if (watcherTableID) {
      promiseWatcherByKindTable = convertSlotToVal(watcherTableID);
    } else {
      promiseWatcherByKindTable = makeScalarBigMapStore(
        'promiseWatcherByKind',
        { durable: true },
      );
      watcherTableID = convertValToSlot(promiseWatcherByKindTable);
      syscall.vatstoreSet('watcherTableID', watcherTableID);
      // artificially increment the table's refcount so it never gets GC'd
      vrm.addReachableVref(watcherTableID);
    }

    let watchedPromiseTableID = syscall.vatstoreGet('watchedPromiseTableID');
    if (watchedPromiseTableID) {
      watchedPromiseTable = convertSlotToVal(watchedPromiseTableID);
    } else {
      watchedPromiseTable = makeScalarBigMapStore('watchedPromises', {
        keySchema: M.string(), // key is always a vpid
        durable: true,
      });
      watchedPromiseTableID = convertValToSlot(watchedPromiseTable);
      syscall.vatstoreSet('watchedPromiseTableID', watchedPromiseTableID);
      // artificially increment the table's refcount so it never gets GC'd
      vrm.addReachableVref(watchedPromiseTableID);
    }
  }

  function pseudoThen(p, vpid) {
    function settle(value, wasFulfilled) {
      const watches = watchedPromiseTable.get(vpid);
      watchedPromiseTable.delete(vpid);
      promiseRegistrations.delete(vpid);
      for (const watch of watches) {
        const [watcher, ...args] = watch;
        void Promise.resolve().then(() => {
          if (wasFulfilled) {
            if (watcher.onFulfilled) {
              watcher.onFulfilled(value, ...args);
            }
          } else {
            if (watcher.onRejected) {
              watcher.onRejected(value, ...args);
            } else {
              throw value; // for host's unhandled rejection handler to catch
            }
          }
        });
      }
    }

    p.then(
      res => settle(res, true),
      rej => settle(rej, false),
    );
  }

  function loadWatchedPromiseTable() {
    const deadPromisesRaw = syscall.vatstoreGet('deadPromises');
    if (!deadPromisesRaw) {
      return;
    }
    const disconnectObjectCapData = JSON.parse(
      syscall.vatstoreGet('deadPromiseDO'),
    );
    const disconnectObject = unserialize(disconnectObjectCapData);
    syscall.vatstoreDelete('deadPromises');
    syscall.vatstoreDelete('deadPromiseDO');
    const deadPromises = new Set(deadPromisesRaw.split(','));

    for (const [vpid, watches] of watchedPromiseTable.entries()) {
      if (deadPromises.has(vpid)) {
        watchedPromiseTable.delete(vpid);
        for (const watch of watches) {
          const [watcher, ...args] = watch;
          void Promise.resolve().then(() => {
            if (watcher.onRejected) {
              watcher.onRejected(disconnectObject, ...args);
            } else {
              throw disconnectObject;
            }
          });
        }
      } else {
        const p = revivePromise(vpid);
        promiseRegistrations.init(vpid, p);
        pseudoThen(p, vpid);
      }
    }
  }

  function providePromiseWatcher(
    kindHandle,
    fulfillHandler = x => x,
    rejectHandler = x => {
      throw x;
    },
  ) {
    assert.typeof(fulfillHandler, 'function');
    assert.typeof(rejectHandler, 'function');

    const makeWatcher = defineDurableKind(kindHandle, () => ({}), {
      // @ts-expect-error  TS is confused by the spread operator
      onFulfilled: (_context, res, ...args) => fulfillHandler(res, ...args),
      // @ts-expect-error
      onRejected: (_context, rej, ...args) => rejectHandler(rej, ...args),
    });

    if (promiseWatcherByKindTable.has(kindHandle)) {
      return promiseWatcherByKindTable.get(kindHandle);
    } else {
      const watcher = makeWatcher();
      promiseWatcherByKindTable.init(kindHandle, watcher);
      return watcher;
    }
  }

  function watchPromise(p, watcher, ...args) {
    // The following wrapping defers setting up the promise watcher itself to a
    // later turn so that if the promise to be watched was the return value from
    // a preceding eventual message send, then the assignment of a vpid to that
    // promise, which happens in a turn after the initiation of the send, will
    // have happened by the time the code below executes, and thus when we call
    // `convertValToSlot` on the promise here we'll get back the vpid that was
    // assigned rather than generating a new one that nobody knows about.

    // TODO: add vpid->p virtual table mapping, to keep registration alive
    // TODO: remove mapping upon resolution
    // TODO: track watched but non-exported promises, add during prepareShutdownRejections
    //  maybe check importedVPIDs here and add to table if !has
    void Promise.resolve().then(() => {
      const watcherVref = convertValToSlot(watcher);
      assert(watcherVref, 'invalid watcher');
      const { virtual } = parseVatSlot(watcherVref);
      assert(virtual, 'promise watcher must be a virtual object');
      if (watcher.onFulfilled) {
        assert.typeof(watcher.onFulfilled, 'function');
      }
      if (watcher.onRejected) {
        assert.typeof(watcher.onRejected, 'function');
      }
      assert(
        watcher.onFulfilled || watcher.onRejected,
        'promise watcher must implement at least one handler method',
      );

      const vpid = convertValToSlot(p);
      assert(vpid, 'invalid promise');
      const { type } = parseVatSlot(vpid);
      assert.equal(type, 'promise', 'watchPromise only watches promises');
      if (watchedPromiseTable.has(vpid)) {
        const watches = watchedPromiseTable.get(vpid);
        watchedPromiseTable.set(vpid, harden([...watches, [watcher, ...args]]));
      } else {
        watchedPromiseTable.init(vpid, harden([[watcher, ...args]]));
        promiseRegistrations.init(vpid, p);
        pseudoThen(p, vpid);
      }
    });
  }

  function prepareShutdownRejections(
    importedVPIDsSet,
    disconnectObjectCapData,
  ) {
    const deadPromises = [];
    for (const vpid of watchedPromiseTable.keys()) {
      if (!importedVPIDsSet.has(vpid)) {
        deadPromises.push(vpid); // "exported" plus "neither" vpids
      }
    }
    deadPromises.sort(); // just in case
    syscall.vatstoreSet('deadPromises', deadPromises.join(','));
    syscall.vatstoreSet(
      'deadPromiseDO',
      JSON.stringify(disconnectObjectCapData),
    );
  }

  return harden({
    preparePromiseWatcherTables,
    loadWatchedPromiseTable,
    providePromiseWatcher,
    watchPromise,
    prepareShutdownRejections,
  });
}
