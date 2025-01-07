// @jessie-check

import { handleParamGovernance } from '@agoric/governance';
import { makeTracer } from '@agoric/internal';
import {
  prepareRecorderKitMakers,
  provideAll,
} from '@agoric/zoe/src/contractSupport/index.js';
import { prepareAssetReserveKit } from './assetReserveKit.js';

const trace = makeTracer('AR', true);

/** @type {ContractMeta<typeof start>} */
export const meta = {
  upgradability: 'canUpgrade',
};
harden(meta);

/**
 * @typedef {{
 *   increaseLiquidationShortfall: (increase: Amount) => void;
 *   reduceLiquidationShortfall: (reduction: Amount) => void;
 * }} ShortfallReportingFacet
 */

/** @import {Baggage} from '@agoric/vat-data' */

/**
 * Asset Reserve holds onto assets for the Inter Protocol, and can dispense it
 * for various purposes under governance control.
 *
 * This contract has the ability to mint Fee tokens, granted through its private
 * arguments.
 *
 * @param {ZCF<
 *   GovernanceTerms<{}> & {
 *     governedApis: ['burnFeesToReduceShortfall'];
 *   }
 * >} zcf
 * @param {{
 *   feeMintAccess: FeeMintAccess;
 *   initialPoserInvitation: Invitation;
 *   marshaller: ERef<Marshaller>;
 *   storageNode: ERef<StorageNode>;
 * }} privateArgs
 * @param {Baggage} baggage
 */
export const start = async (zcf, privateArgs, baggage) => {
  trace('prepare', Object.keys(privateArgs), [...baggage.keys()]);
  // This contract mixes two styles of access to durable state. durableStores
  // are declared at the top level and referenced lexically. local state is
  // accessed via the `state` object. The latter means updates are made directly
  // to state and don't require reference to baggage.

  const { makeRecorderKit } = prepareRecorderKitMakers(
    baggage,
    privateArgs.marshaller,
  );

  const storageNode = await privateArgs.storageNode;

  trace('awaiting feeMint');
  const { feeMint } = await provideAll(baggage, {
    feeMint: async () => zcf.registerFeeMint('Fee', privateArgs.feeMintAccess),
  });

  const makeAssetReserveKit = await prepareAssetReserveKit(baggage, {
    feeMint,
    makeRecorderKit,
    storageNode,
    zcf,
  });

  const { assetReserveKit } = await provideAll(baggage, {
    assetReserveKit: makeAssetReserveKit,
  });

  trace('awaiting handleParamGovernance');
  const { makeDurableGovernorFacet } = await handleParamGovernance(
    zcf,
    privateArgs.initialPoserInvitation,
    {},
    privateArgs.storageNode,
    privateArgs.marshaller,
  );

  const { governorFacet } = makeDurableGovernorFacet(
    baggage,
    assetReserveKit.machine,
    // reconstruct facet so that the keys are enumerable and that the client can't depend on object identity
    {
      burnFeesToReduceShortfall: reduction =>
        assetReserveKit.governedApis.burnFeesToReduceShortfall(reduction),
    },
  );

  return {
    /** @type {GovernedCreatorFacet<typeof assetReserveKit.machine>} */
    creatorFacet: governorFacet,
    /** @type {GovernedPublicFacet<typeof assetReserveKit.public>} */
    // cast due to missing governance mixins
    // XXX https://github.com/Agoric/agoric-sdk/issues/5200
    publicFacet: /** @type {any} */ (assetReserveKit.public),
  };
};
harden(start);

/**
 * @typedef {object} ShortfallReporter
 * @property {(shortfall: Amount) => void} increaseLiquidationShortfall
 * @property {(shortfall: Amount) => void} reduceLiquidationShortfall
 */

/**
 * @typedef {object} AssetReserveLimitedCreatorFacet
 * @property {(issuer: Issuer, kwd: string) => void} addIssuer
 * @property {() => Allocation} getAllocations
 * @property {() => Promise<Invitation<ShortfallReporter>>} makeShortfallReportingInvitation
 */

/** @typedef {Awaited<ReturnType<typeof start>>['publicFacet']} AssetReservePublicFacet */
/**
 * @typedef {Awaited<ReturnType<typeof start>>['creatorFacet']} AssetReserveCreatorFacet
 *   the creator facet for the governor
 */
