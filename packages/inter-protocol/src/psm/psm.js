// @jessie-check
/// <reference types="@agoric/governance/exported" />
/// <reference types="@agoric/zoe/exported" />

import { Fail } from '@endo/errors';
import { E } from '@endo/eventual-send';
import { AmountMath, AmountShape, BrandShape, RatioShape } from '@agoric/ertp';
import {
  CONTRACT_ELECTORATE,
  handleParamGovernance,
  ParamTypes,
  publicMixinAPI,
} from '@agoric/governance';
import { StorageNodeShape } from '@agoric/internal';
import { M, prepareExo, provide } from '@agoric/vat-data';
import {
  atomicTransfer,
  ceilMultiplyBy,
  floorDivideBy,
  floorMultiplyBy,
  makeRecorderTopic,
  prepareRecorderKitMakers,
  provideAll,
  provideEmptySeat,
  TopicsRecordShape,
} from '@agoric/zoe/src/contractSupport/index.js';
import {
  AmountKeywordRecordShape,
  FeeMintAccessShape,
  InstanceHandleShape,
  InvitationShape,
} from '@agoric/zoe/src/typeGuards.js';

import { mustMatch } from '@agoric/store';
import { makeCollectFeesInvitation } from '../collectFees.js';
import { makeNatAmountShape } from '../contractSupport.js';

/**
 * @file The Parity Stability Module supports efficiently minting/burning a
 *   stable token at a specified fixed ratio to a reference stable token, which
 *   thereby acts as an anchor to provide additional stability. For flexible
 *   economic policies, the fee percentage for trading into and out of the
 *   stable token are specified separately.
 */

/**
 * @typedef {object} MetricsNotification Metrics naming scheme is that nouns are
 *   present values and past-participles are accumulative.
 * @property {Amount<'nat'>} anchorPoolBalance amount of Anchor token available
 *   to be swapped
 * @property {Amount<'nat'>} mintedPoolBalance amount of Minted token
 *   outstanding (the amount minted minus the amount burned).
 * @property {Amount<'nat'>} feePoolBalance amount of Minted token fees
 *   available to be collected
 * @property {Amount<'nat'>} totalAnchorProvided running sum of Anchor ever
 *   given by this contract
 * @property {Amount<'nat'>} totalMintedProvided running sum of Minted ever
 *   given by this contract
 */

/**
 * @import {TypedPattern} from '@agoric/internal';
 * @import {Baggage} from '@agoric/vat-data'
 */

/** @type {ContractMeta} */
export const meta = {
  upgradability: 'canUpgrade',
  customTermsShape: {
    anchorBrand: BrandShape,
    anchorPerMinted: RatioShape,
    electionManager: InstanceHandleShape,
    governedParams: {
      [CONTRACT_ELECTORATE]: {
        type: ParamTypes.INVITATION,
        value: AmountShape,
      },
      WantMintedFee: {
        type: ParamTypes.RATIO,
        value: RatioShape,
      },
      GiveMintedFee: {
        type: ParamTypes.RATIO,
        value: RatioShape,
      },
      MintLimit: { type: ParamTypes.AMOUNT, value: AmountShape },
    },
  },
  privateArgsShape: M.splitRecord(
    {
      marshaller: M.remotable('Marshaller'),
      storageNode: StorageNodeShape,
    },
    {
      // only necessary on first invocation, not subsequent
      feeMintAccess: FeeMintAccessShape,
      initialPoserInvitation: InvitationShape,
    },
  ),
};
harden(meta);

/**
 * @param {ZCF<
 *   GovernanceTerms<{
 *     GiveMintedFee: 'ratio';
 *     WantMintedFee: 'ratio';
 *     MintLimit: 'amount';
 *   }> & {
 *     anchorBrand: Brand<'nat'>;
 *     anchorPerMinted: Ratio;
 *   }
 * >} zcf
 * @param {{
 *   feeMintAccess: FeeMintAccess;
 *   initialPoserInvitation: Invitation;
 *   storageNode: StorageNode;
 *   marshaller: Marshaller;
 * }} privateArgs
 * @param {Baggage} baggage
 */
export const start = async (zcf, privateArgs, baggage) => {
  const { anchorBrand, anchorPerMinted } = zcf.getTerms();
  console.log('PSM Starting', anchorBrand, anchorPerMinted);

  const { makeRecorderKit } = prepareRecorderKitMakers(
    baggage,
    privateArgs.marshaller,
  );

  const { stableMint } = await provideAll(baggage, {
    stableMint: async () =>
      zcf.registerFeeMint('Minted', privateArgs.feeMintAccess),
  });
  const { brand: stableBrand } = stableMint.getIssuerRecord();
  (anchorPerMinted.numerator.brand === anchorBrand &&
    anchorPerMinted.denominator.brand === stableBrand) ||
    Fail`Ratio ${anchorPerMinted} is not consistent with brands ${anchorBrand} and ${stableBrand}`;

  zcf.setTestJig(() => ({
    stableIssuerRecord: stableMint.getIssuerRecord(),
  }));
  const emptyStable = AmountMath.makeEmpty(stableBrand);
  const emptyAnchor = AmountMath.makeEmpty(anchorBrand);

  const { publicMixin, makeDurableGovernorFacet, params } =
    await handleParamGovernance(
      zcf,
      privateArgs.initialPoserInvitation,
      {
        GiveMintedFee: ParamTypes.RATIO,
        MintLimit: ParamTypes.AMOUNT,
        WantMintedFee: ParamTypes.RATIO,
      },
      privateArgs.storageNode,
      privateArgs.marshaller,
    );

  const anchorPool = provideEmptySeat(zcf, baggage, 'anchorPoolSeat');
  const feePool = provideEmptySeat(zcf, baggage, 'feePoolSeat');
  const stage = provideEmptySeat(zcf, baggage, 'stageSeat');

  // XXX access these through baggage directly so changes are saved
  // Normally these would be in Exo class state but that's too big a change atm
  provide(baggage, 'mintedPoolBalance', () =>
    AmountMath.makeEmpty(stableBrand),
  );
  provide(baggage, 'totalAnchorProvided', () =>
    AmountMath.makeEmpty(anchorBrand),
  );
  provide(baggage, 'totalMintedProvided', () =>
    AmountMath.makeEmpty(stableBrand),
  );

  const { metricsKit } = await provideAll(baggage, {
    metricsKit: async () =>
      E.when(E(privateArgs.storageNode).makeChildNode('metrics'), node =>
        makeRecorderKit(
          node,
          /** @type {TypedPattern<MetricsNotification>} */ (M.any()),
        ),
      ),
  });
  const topics = harden({
    metrics: makeRecorderTopic('PSM metrics', metricsKit),
  });

  const updateMetrics = () => {
    void E(metricsKit.recorder).write(
      harden({
        anchorPoolBalance: anchorPool.getAmountAllocated('Anchor', anchorBrand),
        feePoolBalance: feePool.getAmountAllocated('Minted', stableBrand),
        mintedPoolBalance: baggage.get('mintedPoolBalance'),
        totalAnchorProvided: baggage.get('totalAnchorProvided'),
        totalMintedProvided: baggage.get('totalMintedProvided'),
      }),
    );
  };
  updateMetrics();

  const AnchorAmountShape = makeNatAmountShape(anchorBrand);
  const StableAmountShape = makeNatAmountShape(stableBrand);

  /**
   * @param {ZCFSeat} seat
   * @param {Omit<MetricsNotification, 'anchorPoolBalance'>} target
   */
  const restoreMetricsHook = (seat, target) => {
    assert(
      AmountMath.isEmpty(anchorPool.getAmountAllocated('Anchor', anchorBrand)),
      'cannot restoreMetrics: anchorPool is not empty',
    );
    assert(
      AmountMath.isEmpty(feePool.getAmountAllocated('Minted', stableBrand)),
      'cannot restoreMetrics: feePool is not empty',
    );
    mustMatch(
      target,
      harden({
        feePoolBalance: StableAmountShape,
        mintedPoolBalance: StableAmountShape,
        totalAnchorProvided: AnchorAmountShape,
        totalMintedProvided: StableAmountShape,
      }),
    );
    const {
      give: { Anchor },
    } = seat.getProposal();
    stableMint.mintGains({ Minted: target.feePoolBalance }, feePool);
    atomicTransfer(zcf, seat, anchorPool, { Anchor });
    baggage.set('mintedPoolBalance', target.mintedPoolBalance);
    baggage.set('totalAnchorProvided', target.totalAnchorProvided);
    baggage.set('totalMintedProvided', target.totalMintedProvided);
    seat.exit();
    updateMetrics();
  };

  /** @param {Amount<'nat'>} toMint */
  const assertUnderLimit = toMint => {
    const mintedAfter = AmountMath.add(
      baggage.get('mintedPoolBalance'),
      toMint,
    );
    AmountMath.isGTE(params.getMintLimit(), mintedAfter) ||
      Fail`Request would exceed mint limit`;
  };

  const burnMinted = toBurn => {
    stableMint.burnLosses({ Minted: toBurn }, stage);
    baggage.set(
      'mintedPoolBalance',
      AmountMath.subtract(baggage.get('mintedPoolBalance'), toBurn),
    );
  };

  const mintMinted = toMint => {
    stableMint.mintGains({ Minted: toMint }, stage);
    baggage.set(
      'mintedPoolBalance',
      AmountMath.add(baggage.get('mintedPoolBalance'), toMint),
    );
  };

  /**
   * @param {ZCFSeat} seat
   * @param {Amount<'nat'>} given
   * @param {Amount<'nat'>} [wanted] defaults to maximum anchor (given exchange
   *   rate minus fees)
   */
  const giveMinted = (seat, given, wanted = emptyAnchor) => {
    const fee = ceilMultiplyBy(given, params.getGiveMintedFee());
    const afterFee = AmountMath.subtract(given, fee);
    const maxAnchor = floorMultiplyBy(afterFee, anchorPerMinted);
    AmountMath.isGTE(maxAnchor, wanted) ||
      Fail`wanted ${wanted} is more than ${given} minus fees ${fee}`;
    zcf.atomicRearrange(
      harden([
        [seat, stage, { In: afterFee }, { Minted: afterFee }],
        [seat, feePool, { In: fee }, { Minted: fee }],
        [anchorPool, seat, { Anchor: maxAnchor }, { Out: maxAnchor }],
      ]),
    );
    // The treatment of `burnMinted` here is different than the
    // one immediately below. This `burnMinted`
    // happen only if the `atomicRearrange` does *not* throw.
    burnMinted(afterFee);
    baggage.set(
      'totalAnchorProvided',
      AmountMath.add(baggage.get('totalAnchorProvided'), maxAnchor),
    );
  };

  /**
   * @param {ZCFSeat} seat
   * @param {Amount<'nat'>} given
   * @param {Amount<'nat'>} [wanted]
   */
  const wantMinted = (seat, given, wanted = emptyStable) => {
    const asStable = floorDivideBy(given, anchorPerMinted);
    assertUnderLimit(asStable);
    const fee = ceilMultiplyBy(asStable, params.getWantMintedFee());
    const afterFee = AmountMath.subtract(asStable, fee);
    AmountMath.isGTE(afterFee, wanted) ||
      Fail`wanted ${wanted} is more than ${given} minus fees ${fee}`;
    mintMinted(asStable);
    try {
      zcf.atomicRearrange(
        harden([
          [seat, anchorPool, { In: given }, { Anchor: given }],
          [stage, seat, { Minted: afterFee }, { Out: afterFee }],
          [stage, feePool, { Minted: fee }],
        ]),
      );
    } catch (e) {
      // The treatment of `burnMinted` here is different than the
      // one immediately above. This `burnMinted`
      // happens only if the `atomicRearrange` *does* throw.
      burnMinted(asStable);
      throw e;
    }
    baggage.set(
      'totalMintedProvided',
      AmountMath.add(baggage.get('totalMintedProvided'), asStable),
    );
  };

  /** @param {ZCFSeat} seat */
  const giveMintedHook = seat => {
    const {
      give: { In: given },
      want: { Out: wanted } = { Out: undefined },
    } = seat.getProposal();
    giveMinted(seat, given, wanted);
    seat.exit();
    updateMetrics();
  };

  /** @param {ZCFSeat} seat */
  const wantMintedHook = seat => {
    const {
      give: { In: given },
      want: { Out: wanted } = { Out: undefined },
    } = seat.getProposal();
    wantMinted(seat, given, wanted);
    seat.exit();
    updateMetrics();
  };

  const { anchorAmountShape, stableAmountShape } = await provideAll(baggage, {
    anchorAmountShape: async () => E(anchorBrand).getAmountShape(),
    stableAmountShape: async () => E(stableBrand).getAmountShape(),
  });

  const publicFacet = prepareExo(
    baggage,
    'Parity Stability Module',
    M.interface('PSM', {
      getMetrics: M.call().returns(M.remotable('MetricsSubscriber')),
      getPoolBalance: M.call().returns(anchorAmountShape),
      getPublicTopics: M.call().returns(TopicsRecordShape),
      makeWantMintedInvitation: M.call().returns(M.promise()),
      makeGiveMintedInvitation: M.call().returns(M.promise()),
      ...publicMixinAPI,
    }),
    {
      getMetrics() {
        return metricsKit.subscriber;
      },
      getPoolBalance() {
        return anchorPool.getAmountAllocated('Anchor', anchorBrand);
      },
      getPublicTopics() {
        return topics;
      },
      makeWantMintedInvitation() {
        return zcf.makeInvitation(
          wantMintedHook,
          'wantMinted',
          undefined,
          M.splitRecord({
            give: { In: anchorAmountShape },
            want: M.or({ Out: stableAmountShape }, {}),
          }),
        );
      },
      makeGiveMintedInvitation() {
        return zcf.makeInvitation(
          giveMintedHook,
          'giveMinted',
          undefined,
          M.splitRecord({
            give: { In: stableAmountShape },
            want: M.or({ Out: anchorAmountShape }, {}),
          }),
        );
      },
      ...publicMixin,
    },
  );

  const limitedCreatorFacet = prepareExo(
    baggage,
    'PSM machine',
    M.interface('PSM machine', {
      getRewardAllocation: M.call().returns(AmountKeywordRecordShape),
      makeCollectFeesInvitation: M.call().returns(
        M.promise(/* InvitationShape */),
      ),
      makeRestoreMetricsInvitation: M.call().returns(
        M.promise(/* InvitationShape */),
      ),
    }),
    {
      getRewardAllocation() {
        return feePool.getCurrentAllocation();
      },
      makeCollectFeesInvitation() {
        return makeCollectFeesInvitation(zcf, feePool, stableBrand, 'Minted');
      },
      makeRestoreMetricsInvitation() {
        return zcf.makeInvitation(
          restoreMetricsHook,
          'restoreMetrics',
          undefined,
          M.splitRecord({
            give: {
              Anchor: AnchorAmountShape,
            },
          }),
        );
      },
    },
  );

  const { governorFacet } = makeDurableGovernorFacet(
    baggage,
    limitedCreatorFacet,
  );
  return harden({
    creatorFacet: governorFacet,
    publicFacet,
  });
};
harden(start);

/** @typedef {Awaited<ReturnType<typeof start>>['publicFacet']} PsmPublicFacet */
