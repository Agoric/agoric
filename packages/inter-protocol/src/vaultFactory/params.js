// @jessie-check

import './types-ambient.js';

import {
  CONTRACT_ELECTORATE,
  makeParamManagerSync,
  ParamTypes,
} from '@agoric/governance';
import { makeStoredPublisherKit } from '@agoric/notifier';
import { M, makeScalarMapStore } from '@agoric/store';
import { TimeMath } from '@agoric/time';
import { provideDurableMapStore } from '@agoric/vat-data';
import { subtractRatios } from '@agoric/zoe/src/contractSupport/ratio.js';
import { amountPattern, ratioPattern } from '../contractSupport.js';

export const CHARGING_PERIOD_KEY = 'ChargingPeriod';
export const RECORDING_PERIOD_KEY = 'RecordingPeriod';

export const DEBT_LIMIT_KEY = 'DebtLimit';
export const LIQUIDATION_MARGIN_KEY = 'LiquidationMargin';
export const LIQUIDATION_PADDING_KEY = 'LiquidationPadding';
export const LIQUIDATION_PENALTY_KEY = 'LiquidationPenalty';
export const INTEREST_RATE_KEY = 'InterestRate';
export const MINT_FEE_KEY = 'MintFee';
export const MIN_INITIAL_DEBT_KEY = 'MinInitialDebt';
export const SHORTFALL_INVITATION_KEY = 'ShortfallInvitation';
export const REFERENCED_UI_KEY = 'ReferencedUI';

export const vaultDirectorParamTypes = {
  [MIN_INITIAL_DEBT_KEY]: ParamTypes.AMOUNT,
  [CHARGING_PERIOD_KEY]: ParamTypes.NAT,
  [RECORDING_PERIOD_KEY]: ParamTypes.NAT,
  [REFERENCED_UI_KEY]: ParamTypes.STRING,
};
harden(vaultDirectorParamTypes);

/**
 * @param {Amount<'set'>} electorateInvitationAmount
 * @param {Amount<'nat'>} minInitialDebt
 * @param {Amount<'set'>} shortfallInvitationAmount
 * @param {string} referencedUi
 * @param {InterestTiming} interestTiming
 */
const makeVaultDirectorParams = (
  electorateInvitationAmount,
  minInitialDebt,
  shortfallInvitationAmount,
  referencedUi,
  interestTiming,
) => {
  return harden({
    [CONTRACT_ELECTORATE]: {
      type: ParamTypes.INVITATION,
      value: electorateInvitationAmount,
    },
    [MIN_INITIAL_DEBT_KEY]: {
      type: ParamTypes.AMOUNT,
      value: minInitialDebt,
    },
    [SHORTFALL_INVITATION_KEY]: {
      type: ParamTypes.INVITATION,
      value: shortfallInvitationAmount,
    },
    [REFERENCED_UI_KEY]: { type: ParamTypes.STRING, value: referencedUi },
    [CHARGING_PERIOD_KEY]: {
      type: ParamTypes.NAT,
      value: TimeMath.relValue(interestTiming.chargingPeriod),
    },
    [RECORDING_PERIOD_KEY]: {
      type: ParamTypes.NAT,
      value: TimeMath.relValue(interestTiming.recordingPeriod),
    },
  });
};
harden(makeVaultDirectorParams);

/**
 * @typedef {import('@agoric/governance/src/contractGovernance/typedParamManager').ParamTypesMapFromRecord<
 *     ReturnType<typeof makeVaultDirectorParams>
 *   >} VaultDirectorParams
 */

/** @type {(liquidationMargin: Ratio) => Ratio} */
const zeroRatio = liquidationMargin =>
  subtractRatios(liquidationMargin, liquidationMargin);

/**
 * @param {import('@agoric/notifier').StoredPublisherKit<GovernanceSubscriptionState>} publisherKit
 * @param {VaultManagerParamValues} initial
 */
export const makeVaultParamManager = (
  publisherKit,
  {
    debtLimit,
    interestRate,
    liquidationMargin,
    liquidationPadding = zeroRatio(liquidationMargin),
    liquidationPenalty,
    mintFee,
  },
) =>
  makeParamManagerSync(publisherKit, {
    [DEBT_LIMIT_KEY]: [ParamTypes.AMOUNT, debtLimit],
    [INTEREST_RATE_KEY]: [ParamTypes.RATIO, interestRate],
    [LIQUIDATION_PADDING_KEY]: [ParamTypes.RATIO, liquidationPadding],
    [LIQUIDATION_MARGIN_KEY]: [ParamTypes.RATIO, liquidationMargin],
    [LIQUIDATION_PENALTY_KEY]: [ParamTypes.RATIO, liquidationPenalty],
    [MINT_FEE_KEY]: [ParamTypes.RATIO, mintFee],
  });
/** @typedef {ReturnType<typeof makeVaultParamManager>} VaultParamManager */

export const vaultParamPattern = M.splitRecord(
  {
    liquidationMargin: ratioPattern,
    liquidationPenalty: ratioPattern,
    interestRate: ratioPattern,
    mintFee: ratioPattern,
    debtLimit: amountPattern,
  },
  {
    // optional for backwards compatibility, e.g. with loadgen
    liquidationPadding: ratioPattern,
  },
);

/**
 * @param {{
 *   auctioneerPublicFacet: ERef<AuctioneerPublicFacet>;
 *   electorateInvitationAmount: Amount<'set'>;
 *   minInitialDebt: Amount<'nat'>;
 *   bootstrapPaymentValue: bigint;
 *   priceAuthority: ERef<PriceAuthority>;
 *   timer: ERef<import('@agoric/time/src/types').TimerService>;
 *   reservePublicFacet: AssetReservePublicFacet;
 *   interestTiming: InterestTiming;
 *   shortfallInvitationAmount: Amount<'set'>;
 *   referencedUi?: string;
 * }} opts
 */
export const makeGovernedTerms = ({
  auctioneerPublicFacet,
  bootstrapPaymentValue,
  electorateInvitationAmount,
  interestTiming,
  minInitialDebt,
  priceAuthority,
  reservePublicFacet,
  timer,
  shortfallInvitationAmount,
  referencedUi = 'NO REFERENCE',
}) => {
  return harden({
    auctioneerPublicFacet,
    priceAuthority,
    reservePublicFacet,
    timerService: timer,
    governedParams: makeVaultDirectorParams(
      electorateInvitationAmount,
      minInitialDebt,
      shortfallInvitationAmount,
      referencedUi,
      interestTiming,
    ),
    bootstrapPaymentValue,
  });
};
harden(makeGovernedTerms);
/**
 * Stop-gap which restores initial param values UNTIL
 * https://github.com/Agoric/agoric-sdk/issues/5200
 *
 * NB: changes from initial values will be lost upon restart
 *
 * @param {import('@agoric/vat-data').Baggage} baggage
 * @param {ERef<Marshaller>} marshaller
 */
export const provideVaultParamManagers = (baggage, marshaller) => {
  /** @type {MapStore<Brand, VaultParamManager>} */
  const managers = makeScalarMapStore();

  // the managers aren't durable but their arguments are
  /**
   * @type {MapStore<
   *   Brand,
   *   { storageNode: StorageNode; initialParamValues: VaultManagerParamValues }
   * >}
   */
  const managerArgs = provideDurableMapStore(
    baggage,
    'vault param manager parts',
  );

  const makeManager = (brand, { storageNode, initialParamValues }) => {
    const manager = makeVaultParamManager(
      makeStoredPublisherKit(storageNode, marshaller, 'governance'),
      initialParamValues,
    );
    managers.init(brand, manager);
    return manager;
  };

  // restore from baggage
  [...managerArgs.entries()].map(([brand, args]) => makeManager(brand, args));

  return {
    /**
     * @param {Brand} brand
     * @param {StorageNode} storageNode
     * @param {VaultManagerParamValues} initialParamValues
     */
    addParamManager(brand, storageNode, initialParamValues) {
      const args = harden({ storageNode, initialParamValues });
      managerArgs.init(brand, args);
      return makeManager(brand, args);
    },
    /** @param {Brand} brand */
    get(brand) {
      return managers.get(brand);
    },
  };
};
harden(provideVaultParamManagers);
