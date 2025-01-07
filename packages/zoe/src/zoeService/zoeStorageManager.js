import { E } from '@endo/far';
import {
  AssetKind,
  makeDurableIssuerKit,
  AmountMath,
  upgradeIssuerKit,
} from '@agoric/ertp';
import {
  makeScalarBigMapStore,
  provideDurableWeakMapStore,
  prepareExoClassKit,
  prepareExoClass,
  provideDurableSetStore,
} from '@agoric/vat-data';

import { provideIssuerStorage } from '../issuerStorage.js';
import { makeInstanceRecordStorage } from '../instanceRecordStorage.js';
import { makeIssuerRecord } from '../issuerRecord.js';
import { provideEscrowStorage } from './escrowStorage.js';
import { prepareInvitationKit } from './makeInvitation.js';
import { makeInstanceAdminStorage } from './instanceAdminStorage.js';
import { makeInstallationStorage } from './installationStorage.js';

/// <reference path="./types.js" />
import './internal-types.js';
import {
  InstanceStorageManagerIKit,
  ZoeMintI,
  ZoeStorageManagerIKit,
} from '../typeGuards.js';

/** @import {Baggage} from '@agoric/vat-data' */

const { ownKeys } = Reflect;

/**
 * The Zoe Storage Manager encapsulates and composes important
 * capabilities, such as the ability to create a new purse and deposit
 * and withdraw into a purse, according to the Principle of Least
 * Authority. The code for these capabilities is imported from smaller
 * files which should have unit tests. After composing, Zoe Storage
 * Manager divides up the resulting capabilities between those needed
 * by a new contract instance (returned as the result of
 * `makeZoeInstanceStorageManager`) and those needed for other purposes.
 *
 * @param {CreateZCFVat} createZCFVat - the ability to create a new
 * ZCF Vat
 * @param {GetBundleCapForID} getBundleCapForID
 * @param {import('@agoric/swingset-vat').ShutdownWithFailure} shutdownZoeVat
 * @param {{
 *    getFeeIssuerKit: GetFeeIssuerKit,
 *    getFeeIssuer: () => Issuer,
 *    getFeeBrand: () => Brand,
 * }} feeMint
 * @param {Baggage} zoeBaggage
 */
export const makeZoeStorageManager = (
  createZCFVat,
  getBundleCapForID,
  shutdownZoeVat,
  feeMint,
  zoeBaggage,
) => {
  // issuerStorage contains the issuers that the ZoeService knows
  // about, as well as information about them such as their brand,
  // assetKind, and displayInfo
  const issuerStorage = provideIssuerStorage(zoeBaggage);
  issuerStorage.instantiate();

  // EscrowStorage holds the purses that Zoe uses for escrow. This
  // object should be closely held and tracked: all of the digital
  // assets that users escrow are contained within these purses.
  const escrowStorage = provideEscrowStorage(zoeBaggage);

  // Add a purse for escrowing user funds (not for fees). Create the
  // local, non-remote escrow purse for the fee mint immediately.
  // Without this step, registration of the feeIssuer in a contract
  // would treat the feeIssuer as if it is remote, creating a promise
  // for a purse with E(issuer).makeEmptyPurse(). We need a local
  // purse, so we cannot allow that to happen.

  escrowStorage.provideLocalPurse(
    feeMint.getFeeIssuer(),
    feeMint.getFeeBrand(),
  );

  const proposalShapes = provideDurableWeakMapStore(
    zoeBaggage,
    'proposal shapes',
  );

  // In order to participate in a contract, users must have invitations, which
  // are ERTP payments made by Zoe. This invitationKit must be closely held and
  // used only by the makeInvitation() method.
  const { invitationIssuer, invitationKit } = prepareInvitationKit(
    zoeBaggage,
    shutdownZoeVat,
  );

  // Every new instance of a contract creates a corresponding
  // "zoeInstanceAdmin" - an admin facet within the Zoe Service for
  // that particular instance. This code manages the storage of those
  // instanceAdmins
  const instanceAdminStorage = makeInstanceAdminStorage(zoeBaggage);

  // Zoe stores "installations" - identifiable bundles of contract
  // code that can be reused to create new contract instances
  const installationStorage = makeInstallationStorage(
    getBundleCapForID,
    zoeBaggage,
  );

  const getProposalShapeForInvitation = invitationHandle => {
    if (proposalShapes.has(invitationHandle)) {
      return proposalShapes.get(invitationHandle);
    }
    return undefined;
  };

  const zoeMintBaggageSet = provideDurableSetStore(
    zoeBaggage,
    'zoeMintBaggageSet',
  );
  for (const issuerBaggage of zoeMintBaggageSet.values()) {
    upgradeIssuerKit(issuerBaggage);
  }

  const makeZoeMint = prepareExoClass(
    zoeBaggage,
    'ZoeMint',
    ZoeMintI,
    (localMint, localPooledPurse, adminNode, localIssuerRecord) => ({
      localMint,
      localPooledPurse,
      adminNode,
      localIssuerRecord,
    }),
    {
      getIssuerRecord() {
        const { state } = this;
        return state.localIssuerRecord;
      },
      mintAndEscrow(totalToMint) {
        const { state } = this;
        const payment = state.localMint.mintPayment(totalToMint);
        // Note COMMIT POINT within deposit.
        state.localPooledPurse.deposit(payment, totalToMint);
      },
      withdrawAndBurn(totalToBurn) {
        const { state } = this;
        try {
          // COMMIT POINT
          const payment = state.localPooledPurse.withdraw(totalToBurn);
          // Note redundant COMMIT POINT within burn.
          state.localIssuerRecord.issuer.burn(payment, totalToBurn);
        } catch (err) {
          // nothing for Zoe to do if the termination fails
          void E(state.adminNode).terminateWithFailure(err);
          throw err;
        }
      },
    },
  );

  const makeInstanceStorageManager = prepareExoClassKit(
    zoeBaggage,
    'InstanceStorageManager',
    InstanceStorageManagerIKit,
    (instanceRecord, adminNode, root, functions) =>
      harden({
        instanceState: instanceRecord,
        adminNode,
        root,
        functions,
      }),
    {
      instanceStorageManager: {
        getTerms() {
          const { state } = this;
          return state.instanceState.getTerms();
        },
        getIssuers() {
          const { state } = this;
          return state.instanceState.getIssuers();
        },
        getBrands() {
          const { state } = this;
          return state.instanceState.getBrands();
        },
        getInstallation() {
          const { state } = this;
          return state.instanceState.getInstallation();
        },
        async saveIssuer(issuerP, keyword) {
          const { state } = this;
          const issuerRecord = await issuerStorage.storeIssuer(issuerP);
          await escrowStorage.createPurse(
            issuerRecord.issuer,
            issuerRecord.brand,
          );
          state.instanceState.addIssuer(keyword, issuerRecord);
          return issuerRecord;
        },
        makeZoeMint(
          keyword,
          assetKind = AssetKind.NAT,
          displayInfo,
          { elementShape = undefined } = {},
        ) {
          const { state, facets } = this;
          // Local indicates one that zoe itself makes from vetted code,
          // and so can be assumed correct and fresh by zoe.
          const issuerBaggage = makeScalarBigMapStore('IssuerBaggage', {
            durable: true,
          });
          const localIssuerKit = makeDurableIssuerKit(
            issuerBaggage,
            keyword,
            assetKind,
            displayInfo,
            reason => E(state.adminNode).terminateWithFailure(reason),
            { elementShape },
          );
          zoeMintBaggageSet.add(issuerBaggage);
          return facets.helpers.wrapIssuerKitWithZoeMint(
            keyword,
            localIssuerKit,
            state.adminNode,
          );
        },
        registerFeeMint(keyword, allegedFeeMintAccess) {
          const { state, facets } = this;
          const feeIssuerKit = feeMint.getFeeIssuerKit(allegedFeeMintAccess);
          return facets.helpers.wrapIssuerKitWithZoeMint(
            keyword,
            feeIssuerKit,
            state.adminNode,
          );
        },
        getInstanceRecord() {
          const { state } = this;
          return state.instanceState.getInstanceRecord();
        },
        getIssuerRecords() {
          const { state } = this;
          return issuerStorage.getIssuerRecords(
            // the issuerStorage is a weakStore, so we cannot iterate over
            // it directly. Additionally, we only want to export the
            // issuers used in this contract instance specifically, not
            // all issuers.
            Object.values(
              state.instanceState.getInstanceRecord().terms.issuers,
            ),
          );
        },
        initInstanceAdmin(instanceHandle, instanceAdmin) {
          return instanceAdminStorage.updater.initInstanceAdmin(
            instanceHandle,
            instanceAdmin,
          );
        },
        deleteInstanceAdmin(i) {
          instanceAdminStorage.updater.deleteInstanceAdmin(i);
        },
        makeInvitation(
          handle,
          desc,
          customDetails = undefined,
          proposalShape = undefined,
        ) {
          const { state } = this;

          const extraProperties =
            typeof customDetails === 'object' &&
            ownKeys(customDetails).length >= 1
              ? harden({ customDetails })
              : harden({});
          /** @type {InvitationAmount} */
          const invitationAmount = AmountMath.make(
            /** @type {Brand<'set'>} */ (invitationKit.brand),
            harden([
              {
                ...extraProperties,
                description: desc,
                handle,
                instance: state.instanceState.getInstanceRecord().instance,
                installation:
                  state.instanceState.getInstanceRecord().installation,
              },
            ]),
          );
          if (proposalShape !== undefined) {
            proposalShapes.init(handle, proposalShape);
          }
          return invitationKit.mint.mintPayment(invitationAmount);
        },
        getInvitationIssuer() {
          return invitationIssuer;
        },
        getRoot() {
          const { state } = this;
          return state.root;
        },
        getWithdrawFacet() {
          const { facets } = this;
          return facets.withdrawFacet;
        },
        getAdminNode() {
          const { state } = this;
          return state.adminNode;
        },
      },
      // Goes to the Zoe seat, which isn't restricted in how much to withdraw
      withdrawFacet: {
        withdrawPayments(amounts) {
          return escrowStorage.withdrawPayments(amounts);
        },
      },
      helpers: {
        wrapIssuerKitWithZoeMint(keyword, localIssuerKit, adminNode) {
          const { state } = this;
          const {
            mint: localMint,
            issuer: localIssuer,
            brand: localBrand,
            displayInfo: localDisplayInfo,
          } = localIssuerKit;

          const localIssuerRecord = makeIssuerRecord(
            localBrand,
            localIssuer,
            localDisplayInfo,
          );
          issuerStorage.storeIssuerRecord(localIssuerRecord);
          const localPooledPurse = escrowStorage.provideLocalPurse(
            localIssuerRecord.issuer,
            localIssuerRecord.brand,
          );
          state.instanceState.addIssuer(keyword, localIssuerRecord);
          /** @type {ZoeMint} */
          return makeZoeMint(
            localMint,
            localPooledPurse,
            adminNode,
            localIssuerRecord,
          );
        },
      },
    },
  );
  const makeInstanceRecord = makeInstanceRecordStorage(zoeBaggage);

  /** @type {MakeZoeInstanceStorageManager} */
  const makeZoeInstanceStorageManager = async (
    installation,
    customTerms,
    uncleanIssuerKeywordRecord,
    instance,
    contractBundleCap,
    instanceLabel,
  ) => {
    // Clean the issuerKeywordRecord we receive in `startInstance`
    // from the user, and save the issuers in Zoe if they are not
    // already stored there
    const { issuers, brands } = await issuerStorage.storeIssuerKeywordRecord(
      uncleanIssuerKeywordRecord,
    );

    // Create purses for the issuers if they do not already exist
    await Promise.all(
      Object.entries(issuers).map(([keyword, issuer]) =>
        escrowStorage.createPurse(issuer, brands[keyword]),
      ),
    );

    // The instanceRecord is what the contract code is parameterized
    // with: the particular terms, issuers, and brands used in a
    // contract instance based on the installation. A user can query
    // Zoe to find out the installation, terms, issuers, and brands
    // for a contract instance. Contract code has similar query
    // capabilities from the ZCF side.

    const instanceRecord = makeInstanceRecord(
      harden({
        installation,
        instance,
        terms: {
          ...customTerms,
          issuers,
          brands,
        },
      }),
    );

    const bundleLabel = installation.getBundleLabel();
    const contractLabel = instanceLabel
      ? `${bundleLabel}-${instanceLabel}`
      : bundleLabel;

    const { root, adminNode } = await createZCFVat(
      contractBundleCap,
      contractLabel,
    );
    // @ts-expect-error checked cast
    return makeInstanceStorageManager(instanceRecord, adminNode, root)
      .instanceStorageManager;
  };

  const getInvitationIssuer = () => invitationIssuer;

  const makeStorageManager = prepareExoClassKit(
    zoeBaggage,
    'ZoeStorageManager',
    ZoeStorageManagerIKit,
    instanceAdmins => ({ instanceAdmins }),
    {
      zoeServiceDataAccess: {
        getInvitationIssuer,
        getBundleIDFromInstallation(allegedInstallation) {
          return installationStorage.getBundleIDFromInstallation(
            allegedInstallation,
          );
        },
        getPublicFacet(instance) {
          const { state } = this;
          return state.instanceAdmins.getPublicFacet(instance);
        },
        getBrands(instance) {
          const { state } = this;
          return state.instanceAdmins.getBrands(instance);
        },
        getIssuers(instance) {
          const { state } = this;
          return state.instanceAdmins.getIssuers(instance);
        },
        getOfferFilter(instance) {
          const { state } = this;
          return state.instanceAdmins.getOfferFilter(instance);
        },
        getTerms(instance) {
          const { state } = this;
          return state.instanceAdmins.getTerms(instance);
        },
        getInstallation(instance) {
          const { state } = this;
          return state.instanceAdmins.getInstallation(instance);
        },
        getProposalShapeForInvitation,
        installBundle: async (allegedBundle, bundleLabel) => {
          return installationStorage.installBundle(allegedBundle, bundleLabel);
        },
        installBundleID(bundleID, bundleLabel) {
          return installationStorage.installBundleID(bundleID, bundleLabel);
        },
      },
      makeOfferAccess: {
        getAssetKindByBrand: issuerStorage.getAssetKindByBrand,
        getInstanceAdmin(instance) {
          const { state } = this;
          return state.instanceAdmins.getInstanceAdmin(instance);
        },
        getProposalShapeForInvitation,
        getInvitationIssuer,
        depositPayments(proposal, payments) {
          return escrowStorage.depositPayments(proposal, payments);
        },
      },
      startInstanceAccess: {
        makeZoeInstanceStorageManager,
        /** @type {UnwrapInstallation} */
        unwrapInstallation(installation) {
          return installationStorage.unwrapInstallation(installation);
        },
      },
      invitationIssuerAccess: {
        getInvitationIssuer,
      },
    },
  );

  return makeStorageManager(instanceAdminStorage.accessor);
};
