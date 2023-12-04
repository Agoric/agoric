/**
 * The VatAdmin wrapper vat.
 *
 * This is the only vat that has a direct pointer to the vatAdmin device, so it
 * must ensure that only data goes in and out. It's also responsible for turning
 * device affordances into objects that can be used by code in other vats.
 */
import { makePromiseKit } from '@endo/promise-kit';
// import { makeNotifierKit } from '@agoric/notifier'; // XXX RESTORE
import { Far, E, passStyleOf } from '@endo/far';
import { Nat, isNat } from '@endo/nat';
import {
  provide,
  makeScalarBigMapStore,
  makeScalarBigSetStore,
  prepareKind,
  prepareSingleton,
} from '@agoric/vat-data';

const { quote: q, Fail } = assert;

const managerTypes = ['local', 'node-subprocess', 'xsnap', 'xs-worker']; // xs-worker is alias

function producePRR() {
  const { promise, resolve, reject } = makePromiseKit();
  return /** @type {const} */ ([promise, { resolve, reject }]);
}

export function buildRootObject(vatPowers, _vatParameters, baggage) {
  const criticalVatKey = prepareSingleton(baggage, 'criticalVatKey', {});

  const { D } = vatPowers;
  const pendingVatCreations = new Map(); // vatID -> { resolve, reject } for promise
  const pendingBundles = new Map(); // bundleID -> Promise<BundleCap>
  /** @type {Map<string, Omit<import('@endo/promise-kit').PromiseKit<import('../../types-external.js').VatUpgradeResults>, 'promise'>>} */
  const pendingUpgrades = new Map(); // upgradeID -> Promise<UpgradeResults>

  /** @see device-vat-admin.js */
  let vatAdminDev;

  const runningVats = new Map(); // vatID -> [doneP, { resolve, reject }]
  const exitingVats = new Set();
  function noteRunningVat(vatID) {
    const prr = producePRR();
    const [doneP] = prr;
    doneP.catch(() => {}); // shut up false whine about unhandled rejection
    runningVats.set(vatID, prr);
  }

  const managedVats = provide(baggage, 'managedVats', () =>
    makeScalarBigSetStore('managedVats', { durable: true }),
  );
  for (const vatID of managedVats.keys()) {
    noteRunningVat(vatID);
  }

  // XXX The plan is for meters to hold their notifiers, but notifiers are not
  // yet durable, which blocks making meters themselves durable unless the
  // (currently) ephemeral notifiers are put someplace else.  So we're disabling
  // them for now.
  // The following has bits of code commented with either `XXX TEMP` or
  // `XXX RESTORE`.  The former flags temporary code that should be removed once
  // notifiers are durable.  The latter flags (commented out) code that should
  // be made active once notifiers are durable.
  // The same comments are also used in test files.

  const makeMeter = prepareKind(
    baggage,
    'meter',
    (remaining, threshold) => {
      Nat(remaining);
      Nat(threshold);
      const meterID = D(vatAdminDev).createMeter(remaining, threshold);
      // const { updater, notifier } = makeNotifierKit(); // XXX RESTORE
      // return { meterID, updater, notifier }; // XXX RESTORE
      return { meterID }; // XXX TEMP
    },
    {
      addRemaining({ state }, delta) {
        D(vatAdminDev).addMeterRemaining(state.meterID, Nat(delta));
      },
      setThreshold({ state }, newThreshold) {
        D(vatAdminDev).setMeterThreshold(state.meterID, Nat(newThreshold));
      },
      get: ({ state }) => D(vatAdminDev).getMeter(state.meterID), // returns BigInts
      // getNotifier: ({ state }) => state.notifier, // XXX RESTORE
      getNotifier: ({ _self }) => Fail`not implemented, see #7234`, // XXX TEMP
    },
    // eslint-disable-next-line no-use-before-define
    { finish: finishMeter },
  );

  const makeUnlimitedMeter = prepareKind(
    baggage,
    'unlimitedMeter',
    () => {
      const meterID = D(vatAdminDev).createUnlimitedMeter();
      // const { updater, notifier } = makeNotifierKit(); // XXX RESTORE
      // return { meterID, updater, notifier }; // XXX RESTORE
      return { meterID }; // XXX TEMP
    },
    {
      addRemaining(_context, _delta) {},
      setThreshold(_context, _newThreshold) {},
      get: () => harden({ remaining: 'unlimited', threshold: 0 }),
      // getNotifier: ({ state }) => state.notifier, // will never fire // XXX RESTORE
      getNotifier: ({ _self }) => Fail`not implemented, see #7234`, // XXX TEMP
    },
    // eslint-disable-next-line no-use-before-define
    { finish: finishMeter },
  );

  function finishMeter({ state, self }) {
    // eslint-disable-next-line no-use-before-define
    meterByID.init(
      state.meterID,
      // harden({ meter: self, updater: state.updater }), // XXX RESTORE
      harden({ meter: self }), // XXX TEMP
    );
    // eslint-disable-next-line no-use-before-define
    meterIDByMeter.set(self, state.meterID);
  }

  // meterID -> { meter, updater }
  // XXX currently actually meterID -> { meter } due to notifiers not yet being durable
  const meterByID = provide(baggage, 'meterByID', () =>
    makeScalarBigMapStore('meterByID', { durable: true }),
  );
  const meterIDByMeter = new WeakMap(); // meter -> meterID
  for (const [meterID, meterEntry] of meterByID.entries()) {
    meterIDByMeter.set(meterEntry.meter, meterID);
  }

  if (baggage.has('vatAdminDev')) {
    vatAdminDev = baggage.get('vatAdminDev');
  }

  // Some notes on the vat pause logic: The variable `quiescentP` is set to an
  // unresolved promise when service is paused (by sending the vat a
  // `pauseService` message, for which this promise is the result value); the
  // presence of a non-nullish value in this variable indicates that no service
  // requests should be accepted (unless they can be processed in the same turn
  // they were received, in which case the vat may, at its option, respond to
  // them normally). The variable is cleared when service is resumed, either
  // explicitly by sending the vat a `resumeService` message or implicitly by
  // the vat restarting (the vat is born in an available-for-service state).
  // The promise is fulfilled (to a boolean `true` value) when the vat quiesces,
  // meaning that all pending non-prompt service requests have completed; the
  // fulfillment signals to anyone watching the promise that the vat may be
  // safely shut down.  The promise is rejected (with a 'shutdown cancelled'
  // Error) if service is resumed prior to quiescence.  The
  // `hasReachedQuiescence` flag is used to keep track of quiescence has been
  // reached after pausing so that we don't try to reject a promise that has
  // already been fulfilled.
  let quiescentP;
  let quiescentRR;
  let hasReachedQuiesence = false;

  function insistVatAdminServiceNotPaused() {
    assert(!quiescentP, 'service not available, try again later');
  }

  function checkForQuiescence() {
    if (quiescentP) {
      if (
        pendingBundles.size === 0 &&
        pendingVatCreations.size === 0 &&
        pendingUpgrades.size === 0 &&
        exitingVats.size === 0
      ) {
        hasReachedQuiesence = true;
        quiescentRR.resolve(true);
      }
    }
  }

  function pauseService() {
    if (!quiescentP) {
      [quiescentP, quiescentRR] = producePRR();
    }
    checkForQuiescence();
    return quiescentP;
  }

  function resumeService() {
    if (quiescentP) {
      if (!hasReachedQuiesence) {
        quiescentRR.reject(Error('shutdown cancelled'));
      }
      hasReachedQuiesence = false;
      quiescentP = null;
      quiescentRR = null;
    }
  }

  // this message is queued to us by kernel.installBundle()
  function bundleInstalled(bundleID) {
    if (vatAdminDev && pendingBundles.has(bundleID)) {
      const bundlecap = D(vatAdminDev).getBundleCap(bundleID);
      if (!bundlecap) {
        // if the bundle got uninstalled by the time we got the message, keep
        // waiting, maybe it will get reinstalled some day
        console.log(`bundle ${bundleID} missing, hoping for reinstall`);
        return;
      }
      pendingBundles.get(bundleID).resolve(bundlecap);
      pendingBundles.delete(bundleID);
      checkForQuiescence();
    }
  }

  /**
   * @param {string} vatID
   * @param {string} bundleID
   * @param {{ vatParameters?: never, upgradeMessage?: string}} [options]
   */
  async function upgradeVat(vatID, bundleID, options = {}) {
    assert(vatAdminDev, 'vatAdmin device not configured');
    const { vatParameters, upgradeMessage = 'vat upgraded', ...rest } = options;
    const leftovers = Object.keys(rest);
    if (leftovers.length) {
      const bad = leftovers.join(',');
      Fail`upgrade() received unknown options: ${q(bad)}`;
    }
    assert.typeof(upgradeMessage, 'string', 'upgradeMessage not a string');
    const upgradeID = D(vatAdminDev).upgradeVat(
      vatID,
      bundleID,
      // XXX this is passed to upgradeVat in device-vat-admin but ignored
      vatParameters,
      upgradeMessage,
    );
    const [upgradeCompleteP, upgradeRR] = producePRR();
    pendingUpgrades.set(upgradeID, upgradeRR);
    return upgradeCompleteP;
  }

  /**
   * @param {string} vatID
   * @param {Pick<VatAdminVat, 'pauseService' | 'resumeService'>} pauseTarget
   * @param {string} bundleID
   * @param {{} | undefined} [options]
   */
  async function upgradeStaticVat(vatID, pauseTarget, bundleID, options) {
    await null;
    if (pauseTarget) {
      await E(pauseTarget)
        .pauseService()
        .catch(() => true);
    }
    let status;
    try {
      status = await upgradeVat(vatID, bundleID, options);
    } catch (e) {
      if (pauseTarget) {
        await E(pauseTarget)
          .resumeService()
          .catch(() => true);
      }
      throw e;
    }
    return status;
  }

  function assertRunningVat(vatID, operation, exitingOK) {
    // prettier-ignore
    runningVats.has(vatID) && (exitingOK || !exitingVats.has(vatID)) ||
      Fail`vatAdminService rejecting attempt to perform ${q(operation)}() on non-running vat ${q(vatID)}`;
  }

  const makeAdminNode = prepareKind(
    baggage,
    'adminNode',
    vatID => ({ vatID }),
    {
      terminateWithFailure({ state }, reason) {
        insistVatAdminServiceNotPaused();
        assertRunningVat(state.vatID, 'terminateWithFailure');
        exitingVats.add(state.vatID);
        D(vatAdminDev).terminateWithFailure(state.vatID, reason);
      },
      done({ state }) {
        // In some world it might make sense to allow this operation on
        // terminated vats (since they *do* have a 'done' status after all,
        // i.e., non-running) but we expect the promise that's returned here to
        // reject if the vat fails, and if the vat has already exited then its
        // exit status has been lost.  However, by rejecting the 'done'
        // operation itself we can signal the non-running condition without
        // promoting the illusion that we know whether it exited cleanly or not.
        assertRunningVat(state.vatID, 'done', true);
        const [doneP] = runningVats.get(state.vatID);
        return doneP;
      },
      upgrade({ state }, bundlecap, options) {
        insistVatAdminServiceNotPaused();
        assertRunningVat(state.vatID, 'upgrade');
        let bundleID;
        try {
          bundleID = D(bundlecap).getBundleID();
        } catch (e) {
          // 'bundlecap' probably wasn't a bundlecap
          Fail`vatAdmin.upgrade() requires a bundlecap: ${e}`;
        }
        return upgradeVat(state.vatID, bundleID, options);
      },
      changeOptions({ state }, options) {
        insistVatAdminServiceNotPaused();
        assertRunningVat(state.vatID, 'changeOptions');
        for (const option of Object.getOwnPropertyNames(options)) {
          const value = options[option];
          switch (option) {
            case 'reapInterval':
              assert(
                value === 'never' || isNat(value),
                'invalid reapInterval value',
              );
              break;
            default:
              Fail`invalid option ${q(option)}`;
          }
        }
        D(vatAdminDev).changeOptions(state.vatID, options);
      },
    },
  );

  function finishVatCreation(vatID) {
    const [pendingP, pendingRR] = producePRR();
    pendingVatCreations.set(vatID, pendingRR);

    managedVats.add(vatID);
    noteRunningVat(vatID);

    const adminNode = makeAdminNode(vatID);
    return E.when(pendingP, root => {
      return { adminNode, root };
    });
  }

  function getCriticalVatKey() {
    return criticalVatKey;
  }

  function assertType(name, obj, type) {
    if (obj) {
      const actualType = typeof obj;
      actualType === type || Fail`CreateVatOptions(${name})`;
    }
  }

  function convertOptions(origOptions) {
    const {
      name,
      meter, // stripped out and converted
      managerType, // TODO: not sure we want vats to be able to control this
      nodeOptions, // TODO: ditto
      vatParameters, // stripped out and re-added
      enableSetup,
      enablePipelining,
      useTranscript,
      reapInterval,
      critical, // converted from cap key to boolean
      ...rest
    } = origOptions;

    // these are all flat data: no slots (Presences/Promises/etc)
    assertType('name', name, 'string');
    if (name !== undefined) {
      // The name might be used to build a no-op `xsnap`
      // argument. xsnap.js guards against shell attacks, but limit
      // the length to something reasonable. The actual argv length
      // will be in bytes, not JS chars, so any OS limits will depend
      // upon encoding, but this ought to avoid any problems.
      name.length < 200 ||
        Fail`CreateVatOptions: oversized vat name ${q(name)}`;
      // more limits to help the 'ps' output be readable
      /^[A-Za-z0-9._-]+$/.test(name) ||
        Fail`CreateVatOptions: bad vat name ${q(name)}`;
    }
    assertType('managerType', managerType, 'string');
    if (managerType) {
      managerTypes.includes(managerType) ||
        Fail`CreateVatOptions: bad managerType ${managerType}`;
    }
    if (managerType !== 'node-subprocess' && nodeOptions) {
      Fail`CreateVatOptions: nodeOptions requires managerType='node-subprocess'`;
    }
    assertType('enableSetup', enableSetup, 'boolean');
    assertType('enablePipelining', enablePipelining, 'boolean');
    assertType('useTranscript', useTranscript, 'boolean');
    assertType('reapInterval', reapInterval, 'number');

    // reject unknown options
    const unknown = Object.keys(rest).join(',');
    if (unknown) {
      Fail`CreateVatOptions: unknown options ${q(unknown)}`;
    }

    // convert meter to meterID
    let meterID;
    if (meter) {
      meterID = meterIDByMeter.get(origOptions.meter);
    }

    let isCriticalVat = false;
    if (critical) {
      assert(critical === criticalVatKey, 'invalid criticalVatKey');
      isCriticalVat = true;
    }

    // TODO: assert vatParameters is Durable

    // now glue everything back together
    const options = {
      name,
      meterID, // replaces 'meter'
      managerType,
      vatParameters,
      enableSetup,
      enablePipelining,
      useTranscript,
      reapInterval,
      critical: isCriticalVat,
    };
    return harden(options);
  }

  const vatAdminService = prepareSingleton(baggage, 'vatAdminService', {
    waitForBundleCap(bundleID) {
      insistVatAdminServiceNotPaused();
      const bundlecap = D(vatAdminDev).getBundleCap(bundleID);
      if (bundlecap) {
        return bundlecap;
      }
      if (!pendingBundles.has(bundleID)) {
        pendingBundles.set(bundleID, makePromiseKit());
      }
      return pendingBundles.get(bundleID).promise;
    },
    getBundleCap(bundleID) {
      const bundlecap = D(vatAdminDev).getBundleCap(bundleID);
      if (bundlecap) {
        return bundlecap;
      }
      throw Error(`bundleID not yet installed: ${bundleID}`);
    },
    getNamedBundleCap(name) {
      return D(vatAdminDev).getNamedBundleCap(name);
    },
    getBundleIDByName(name) {
      return D(vatAdminDev).getBundleIDByName(name);
    },
    createMeter(remaining, threshold) {
      return makeMeter(remaining, threshold);
    },
    createUnlimitedMeter(_context) {
      return makeUnlimitedMeter();
    },
    createVat(bundleOrBundleCap, options = {}) {
      insistVatAdminServiceNotPaused();
      const co = convertOptions(options);
      let vatID;
      if (passStyleOf(bundleOrBundleCap) === 'remotable') {
        const bundlecap = bundleOrBundleCap;
        let bundleID;
        try {
          bundleID = D(bundlecap).getBundleID();
        } catch (e) {
          // 'bundlecap' probably wasn't a bundlecap
          throw Error('Vat Creation Error: createVat() requires a bundlecap');
        }
        typeof bundleID === 'string' || Fail`createVat() no bundleID`;
        vatID = D(vatAdminDev).createByBundleID(bundleID, co);
      } else {
        // eventually this option will go away: userspace will be obligated
        // to use an ID, not a full bundle
        const bundle = bundleOrBundleCap;
        assert(
          bundle.moduleFormat,
          'createVat(bundle) does not look like a bundle',
        );
        vatID = D(vatAdminDev).createByBundle(bundle, co);
      }
      return finishVatCreation(vatID);
    },
    createVatByName(bundleName, options = {}) {
      insistVatAdminServiceNotPaused();
      // eventually this option will go away: userspace will be obligated
      // to use getNamedBundleCap(), probably during bootstrap, to fetch
      // the named bundlecaps early, and then distribute specific
      // bundlecaps to any vat which wants to make a vat from them (e.g.
      // zoe with ZCF). That requires chain-side changes that I want to
      // coordinate separately, so I'll leave this in place until later.
      typeof bundleName === 'string' ||
        Fail`createVatByName() requires bundleName to be a string`;
      const co = convertOptions(options);
      const bundlecap = D(vatAdminDev).getNamedBundleCap(bundleName);
      const bundleID = D(bundlecap).getBundleID();
      const vatID = D(vatAdminDev).createByBundleID(bundleID, co);
      return finishVatCreation(vatID);
    },
  });

  function createVatAdminService(vaDevice) {
    if (baggage.has('vatAdminDev')) {
      baggage.set('vatAdminDev', vaDevice);
    } else {
      baggage.init('vatAdminDev', vaDevice);
    }
    vatAdminDev = vaDevice;
    return vatAdminService;
  }

  // this message is queued to us by createVatDynamically
  function newVatCallback(vatID, results) {
    const { resolve, reject } = pendingVatCreations.get(vatID);
    pendingVatCreations.delete(vatID);
    checkForQuiescence();
    if (results.rootObject) {
      resolve(results.rootObject);
    } else {
      reject(Error(`Vat Creation Error: ${results.error}`));
    }
  }

  /**
   * the kernel queues this to us when a vat upgrade completes or fails
   *
   * @param {import('../../devices/vat-admin/device-vat-admin.js').UpgradeID} upgradeID
   * @param {boolean} success
   * @param {Error | undefined} error
   * @param {number} incarnationNumber
   */
  function vatUpgradeCallback(upgradeID, success, error, incarnationNumber) {
    const pending = pendingUpgrades.get(upgradeID);
    if (pending === undefined) {
      // In the case of a vatAdmin self-upgrade, the vat restart will (among
      // other things) reinitialize the pendingUpgrades table, so it would be
      // normal in this case for pendingUpgrades not to contain an entry for the
      // upgradeID.  However, we don't actually know that a self-upgrade is
      // what's happening, so we'll log the missing entry anyway just in case
      // it's due to an error of some kind.
      // prettier-ignore
      console.log(
        `no pendingUpgrades entry for upgradeID ${upgradeID}; vatAdmin upgrade in progress?`,
      );
      return;
    }
    const { resolve, reject } = pending;
    pendingUpgrades.delete(upgradeID);
    checkForQuiescence();
    if (success) {
      resolve({ incarnationNumber }); // TODO maybe provide the root object again?
    } else {
      reject(error);
    }
    // TODO: if we get `newVatCallback(error)` or `vatTerminated()`, should
    // we reject all pendingUpgrades. That will require indexing
    // pendingUpgrades by vatID.
  }

  // XXX TEMP
  // eslint-disable-next-line no-unused-vars
  function meterCrossedThreshold(meterID, remaining) {
    // const { updater } = meterByID.get(meterID); // XXX RESTORE
    // updater.updateState(remaining); // XXX RESTORE
  }

  // the kernel sends this when the vat halts
  function vatTerminated(vatID, shouldReject, info) {
    if (pendingVatCreations.has(vatID)) {
      // This happens when a dynamic vat survives `createDynamicVat` but fails
      // during `startVat`.  In that case, the `newVatCallback` success message
      // that got sent was unwound by the failed delivery crank abort and will
      // never be seen.  However, as a consolation prize the crank abort queued
      // a `vatTerminated` message for the vat.  So if we see a `vatTerminated`
      // for a vat before seeing a `newVatCallback` for that same vat, it means
      // the vat setup failed.  In this case we should simulate an errorful
      // `newVatCallback` so the caller will be notified about their misfortune.
      newVatCallback(vatID, { error: info });
    }
    if (!runningVats.has(vatID)) {
      // a static vat terminated, so we have nobody to notify
      console.log(`DANGER: static or non-running vat ${vatID} terminated`);
      // TODO: consider halting the kernel if this happens, static vats
      // aren't supposed to just keel over and die
      // TODO: we will also get here if somebody tries to terminate a vat that's already dead
      return;
    }
    const [_doneP, { resolve, reject }] = runningVats.get(vatID);
    runningVats.delete(vatID);
    exitingVats.delete(vatID);
    checkForQuiescence();
    if (shouldReject) {
      reject(info);
    } else {
      resolve(info);
    }
  }

  return Far('root', {
    createVatAdminService,
    getCriticalVatKey,
    bundleInstalled,
    newVatCallback,
    vatUpgradeCallback,
    vatTerminated,
    meterCrossedThreshold,
    pauseService,
    resumeService,
    upgradeStaticVat,
  });
}

/** @typedef {ReturnType<typeof buildRootObject>} VatAdminVat */
