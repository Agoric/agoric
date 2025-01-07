import { E } from '@endo/eventual-send';
import { passStyleOf } from '@endo/marshal';
import {
  M,
  provideDurableWeakMapStore,
  prepareExoClass,
  prepareExo,
  watchPromise,
} from '@agoric/vat-data';
import { initEmpty } from '@agoric/store';
import { isUpgradeDisconnection } from '@agoric/internal/src/upgrade-api.js';

import { Fail, q } from '@endo/errors';
import { defineDurableHandle } from '../makeHandle.js';
import { makeInstanceAdminMaker } from './instanceAdminStorage.js';
import {
  AdminFacetI,
  InstanceAdminI,
  InstanceAdminShape,
} from '../typeGuards.js';

// import '../internal-types.js';

/** @import {Baggage} from '@agoric/vat-data' */
/** @typedef { import('@agoric/swingset-vat').BundleCap} BundleCap */

/**
 * @param {Pick<ZoeStorageManager, 'makeZoeInstanceStorageManager' | 'unwrapInstallation'>} startInstanceAccess
 * @param {() => ERef<BundleCap>} getZcfBundleCapP
 * @param {(id: string) => BundleCap} getBundleCapByIdNow
 * @param {Baggage} zoeBaggage
 * @returns {import('./utils.js').StartInstance}
 */
export const makeStartInstance = (
  startInstanceAccess,
  getZcfBundleCapP,
  getBundleCapByIdNow,
  zoeBaggage,
) => {
  const makeInstanceHandle = defineDurableHandle(zoeBaggage, 'Instance');

  /** @type {WeakMapStore<SeatHandle, ZoeSeatAdmin>} */
  const seatHandleToZoeSeatAdmin = provideDurableWeakMapStore(
    zoeBaggage,
    'seatHandleToZoeSeatAdmin',
  );

  const instanceAdminMaker = makeInstanceAdminMaker(
    zoeBaggage,
    seatHandleToZoeSeatAdmin,
  );

  const getFreshZcfBundleCap = async () => {
    const settledBundleCap = await getZcfBundleCapP();
    settledBundleCap !== undefined || Fail`the ZCF bundle cap was broken`;
    return settledBundleCap;
  };

  const InstanceAdminStateShape = harden({
    instanceStorage: M.remotable('ZoeInstanceStorageManager'),
    instanceAdmin: M.remotable('InstanceAdmin'),
    seatHandleToSeatAdmin: M.remotable(), // seatHandleToSeatAdmin, but putting that string here is backwards-incompatible
    adminNode: M.remotable('adminNode'),
  });

  /** @type {import('@agoric/swingset-liveslots').PromiseWatcher<Completion, [InstanceAdmin, Handle<'adminNode'>]>} */
  const watcher = prepareExo(
    zoeBaggage,
    'InstanceCompletionWatcher',
    M.interface('InstanceCompletionWatcher', {
      onFulfilled: M.call(
        M.any(),
        InstanceAdminShape,
        M.remotable('adminNode'),
      ).returns(),
      onRejected: M.call(
        M.any(),
        InstanceAdminShape,
        M.remotable('adminNode'),
      ).returns(),
    }),
    {
      onFulfilled: (completion, instanceAdmin) =>
        instanceAdmin.exitAllSeats(completion),
      onRejected: (/** @type {Error} */ reason, instanceAdmin, adminNode) => {
        if (isUpgradeDisconnection(reason)) {
          console.log(`resetting promise watcher after upgrade`, reason);
          watchForAdminNodeDone(adminNode, instanceAdmin);
        } else {
          instanceAdmin.failAllSeats(reason);
        }
      },
    },
  );

  const watchForAdminNodeDone = (adminNode, instAdmin) => {
    watchPromise(E(adminNode).done(), watcher, instAdmin, adminNode);
  };

  const makeZoeInstanceAdmin = prepareExoClass(
    zoeBaggage,
    'zoeInstanceAdmin',
    InstanceAdminI,
    /**
     *
     * @param {ZoeInstanceStorageManager} instanceStorage
     * @param {InstanceAdmin} instanceAdmin
     * @param {WeakMapStore<SeatHandle, ZoeSeatAdmin>} seatHandleToSeatAdmin
     * @param {import('@agoric/swingset-vat').VatAdminFacet} adminNode
     */
    (instanceStorage, instanceAdmin, seatHandleToSeatAdmin, adminNode) => ({
      instanceStorage,
      instanceAdmin,
      seatHandleToSeatAdmin,
      adminNode,
    }),
    {
      makeInvitation(handle, desc, customDetails, proposalShape) {
        const { state } = this;
        return state.instanceStorage.makeInvitation(
          handle,
          desc,
          customDetails,
          proposalShape,
        );
      },
      // checks of keyword done on zcf side
      saveIssuer(issuer, keyword) {
        const { state } = this;
        return state.instanceStorage.saveIssuer(issuer, keyword);
      },
      // A Seat requested by the contract without any payments to escrow
      makeNoEscrowSeat(initialAllocations, proposal, exitObj, seatHandle) {
        const { state } = this;
        return state.instanceAdmin.makeNoEscrowSeat(
          initialAllocations,
          proposal,
          exitObj,
          seatHandle,
        );
      },
      exitAllSeats(completion) {
        const { state } = this;
        state.instanceAdmin.exitAllSeats(completion);
      },
      failAllSeats(reason) {
        const { state } = this;
        return state.instanceAdmin.failAllSeats(reason);
      },
      exitSeat(seatHandle, completion) {
        const { state } = this;
        state.seatHandleToSeatAdmin.get(seatHandle).exit(completion);
      },
      failSeat(seatHandle, reason) {
        const { state } = this;
        state.seatHandleToSeatAdmin.get(seatHandle).fail(reason);
      },
      makeZoeMint(keyword, assetKind, displayInfo, options) {
        const { state } = this;
        return state.instanceStorage.makeZoeMint(
          keyword,
          assetKind,
          displayInfo,
          options,
        );
      },
      registerFeeMint(keyword, feeMintAccess) {
        const { state } = this;
        return state.instanceStorage.registerFeeMint(keyword, feeMintAccess);
      },
      replaceAllocations(seatHandleAllocations) {
        const { state } = this;
        try {
          for (const { seatHandle, allocation } of seatHandleAllocations) {
            const zoeSeatAdmin = state.seatHandleToSeatAdmin.get(seatHandle);
            zoeSeatAdmin.replaceAllocation(allocation);
          }
        } catch (err) {
          // nothing for Zoe to do if the termination fails
          void E(state.adminNode).terminateWithFailure(err);
          throw err;
        }
      },
      stopAcceptingOffers() {
        const { state } = this;
        return state.instanceAdmin.stopAcceptingOffers();
      },
      setOfferFilter(strings) {
        const { state } = this;
        state.instanceAdmin.setOfferFilter(strings);
      },
      getOfferFilter() {
        const { state } = this;
        return state.instanceAdmin.getOfferFilter();
      },
      getExitSubscriber(seatHandle) {
        const { state } = this;
        return state.seatHandleToSeatAdmin.get(seatHandle).getExitSubscriber();
      },
      isBlocked(string) {
        const { state } = this;
        return state.instanceAdmin.isBlocked(string);
      },
      repairContractCompletionWatcher() {
        const { state, self } = this;
        void watchForAdminNodeDone(state.adminNode, self);
      },
    },
    {
      stateShape: InstanceAdminStateShape,
    },
  );

  const prepareEmptyFacet = facetName =>
    prepareExoClass(
      zoeBaggage,
      facetName,
      M.interface(facetName, {}),
      initEmpty,
      {},
    );
  const makeEmptyCreatorFacet = prepareEmptyFacet('emptyCreatorFacet');
  const makeEmptyPublicFacet = prepareEmptyFacet('emptyPublicFacet');

  const makeAdminFacet = prepareExoClass(
    zoeBaggage,
    'adminFacet',
    AdminFacetI,
    /**
     *
     * @param {import('@agoric/swingset-vat').VatAdminFacet} adminNode
     * @param {*} contractBundleCap
     */
    (adminNode, contractBundleCap) => ({
      adminNode,
      contractBundleCap,
    }),
    {
      getVatShutdownPromise() {
        const { state } = this;

        return E(state.adminNode).done();
      },
      restartContract(newPrivateArgs = undefined) {
        const { state } = this;

        const vatParameters = {
          contractBundleCap: state.contractBundleCap,
          privateArgs: newPrivateArgs,
        };

        return E.when(getFreshZcfBundleCap(), async bCap =>
          E(state.adminNode).upgrade(bCap, { vatParameters }),
        );
      },
      async upgradeContract(contractBundleId, newPrivateArgs = undefined) {
        const { state } = this;

        const newContractBundleCap =
          await getBundleCapByIdNow(contractBundleId);
        const vatParameters = {
          contractBundleCap: newContractBundleCap,
          privateArgs: newPrivateArgs,
        };
        state.contractBundleCap = newContractBundleCap;
        return E.when(getFreshZcfBundleCap(), async bCap =>
          E(state.adminNode).upgrade(bCap, { vatParameters }),
        );
      },
      terminateContract(reason) {
        const { state } = this;

        return E(state.adminNode).terminateWithFailure(reason);
      },
    },
  );

  /**
   * @type {import('./utils.js').StartInstance}
   */
  const startInstance = async (
    installationP,
    uncleanIssuerKeywordRecord = harden({}),
    // @ts-expect-error FIXME may not match the expected terms of SF
    customTerms = harden({}),
    privateArgs = undefined,
    instanceLabel = '',
  ) => {
    const { installation, bundle, bundleCap } =
      await E(startInstanceAccess).unwrapInstallation(installationP);
    // AWAIT ///

    const contractBundleCap = bundle || bundleCap;
    assert(contractBundleCap);

    if (privateArgs !== undefined) {
      const passStyle = passStyleOf(privateArgs);
      passStyle === 'copyRecord' ||
        Fail`privateArgs must be a pass-by-copy record, but instead was a ${q(
          passStyle,
        )}: ${privateArgs}`;
    }

    const instanceHandle = makeInstanceHandle();

    const zoeInstanceStorageManager = await E(
      startInstanceAccess,
    ).makeZoeInstanceStorageManager(
      installation,
      customTerms,
      uncleanIssuerKeywordRecord,
      instanceHandle,
      contractBundleCap,
      instanceLabel,
    );
    // AWAIT ///

    const adminNode = zoeInstanceStorageManager.getAdminNode();
    /** @type {ZCFRoot} */
    const zcfRoot = zoeInstanceStorageManager.getRoot();

    /** @type {InstanceAdmin} */
    const instanceAdmin = instanceAdminMaker(
      instanceHandle,
      zoeInstanceStorageManager,
      adminNode,
    );
    zoeInstanceStorageManager.initInstanceAdmin(instanceHandle, instanceAdmin);

    void watchForAdminNodeDone(adminNode, instanceAdmin);

    /** @type {ZoeInstanceAdmin} */
    // @ts-expect-error XXX saveIssuer
    const zoeInstanceAdminForZcf = makeZoeInstanceAdmin(
      zoeInstanceStorageManager,
      instanceAdmin,
      seatHandleToZoeSeatAdmin,
      adminNode,
    );

    // At this point, the contract will start executing. All must be ready

    const {
      creatorFacet = makeEmptyCreatorFacet(),
      publicFacet = makeEmptyPublicFacet(),
      creatorInvitation: creatorInvitationP,
      handleOfferObj,
    } = await E(zcfRoot).startZcf(
      zoeInstanceAdminForZcf,
      zoeInstanceStorageManager.getInstanceRecord(),
      zoeInstanceStorageManager.getIssuerRecords(),
      privateArgs,
    );

    instanceAdmin.initDelayedState(handleOfferObj, publicFacet);

    // creatorInvitation can be undefined, but if it is defined,
    // let's make sure it is an invitation.
    // @ts-expect-error cast
    return E.when(
      Promise.all([
        creatorInvitationP,
        creatorInvitationP !== undefined &&
          zoeInstanceStorageManager
            .getInvitationIssuer()
            .isLive(creatorInvitationP),
      ]),
      ([creatorInvitation, isLiveResult]) => {
        creatorInvitation === undefined ||
          isLiveResult ||
          Fail`The contract did not correctly return a creatorInvitation`;

        const adminFacet = makeAdminFacet(adminNode, contractBundleCap);

        // Actually returned to the user.
        return harden({
          creatorFacet,

          // TODO (#5775) deprecate this return value from contracts.
          creatorInvitation,
          instance: instanceHandle,
          publicFacet,
          adminFacet,
        });
      },
    );
  };
  return harden(startInstance);
};
