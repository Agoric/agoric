// @ts-check

import './types.js';

import {
  CONTRACT_ELECTORATE,
  makeParamManagerSync,
  makeParamManager,
  ParamTypes,
} from '@agoric/governance';

export const CHARGING_PERIOD_KEY = 'ChargingPeriod';
export const RECORDING_PERIOD_KEY = 'RecordingPeriod';

export const LIQUIDATION_MARGIN_KEY = 'LiquidationMargin';
export const INTEREST_RATE_KEY = 'InterestRate';
export const LOAN_FEE_KEY = 'LoanFee';

/** @param {Amount} electorateInvitationAmount */
const makeElectorateParams = electorateInvitationAmount => {
  return harden({
    [CONTRACT_ELECTORATE]: {
      type: ParamTypes.INVITATION,
      value: electorateInvitationAmount,
    },
  });
};

/** @param {Rates} rates */
const makeVaultParamManager = rates =>
  makeParamManagerSync({
    [LIQUIDATION_MARGIN_KEY]: [ParamTypes.RATIO, rates.liquidationMargin],
    [INTEREST_RATE_KEY]: [ParamTypes.RATIO, rates.interestRate],
    [LOAN_FEE_KEY]: [ParamTypes.RATIO, rates.loanFee],
  });
/** @typedef {ReturnType<typeof makeVaultParamManager>} VaultParamManager */

/**
 * @param {ERef<ZoeService>} zoe
 * @param {Invitation} electorateInvitation
 */
const makeElectorateParamManager = async (zoe, electorateInvitation) => {
  return makeParamManager(
    {
      [CONTRACT_ELECTORATE]: ['invitation', electorateInvitation],
    },
    zoe,
  );
};

/**
 * @param {ERef<PriceAuthority>} priceAuthority
 * @param {LoanTiming} loanTiming
 * @param {Installation} liquidationInstall
 * @param {ERef<TimerService>} timerService
 * @param {Amount} invitationAmount
 * @param {Rates} rates
 * @param {XYKAMMPublicFacet} ammPublicFacet
 * @param {bigint} [bootstrapPaymentValue]
 */
const makeGovernedTerms = (
  priceAuthority,
  loanTiming,
  liquidationInstall,
  timerService,
  invitationAmount,
  rates,
  ammPublicFacet,
  bootstrapPaymentValue = 0n,
) => {
  const timingParamMgr = makeParamManagerSync({
    [CHARGING_PERIOD_KEY]: ['nat', loanTiming.chargingPeriod],
    [RECORDING_PERIOD_KEY]: ['nat', loanTiming.recordingPeriod],
  });

  const rateParamMgr = makeVaultParamManager(rates);

  return harden({
    ammPublicFacet,
    priceAuthority,
    loanParams: rateParamMgr.getParams(),
    loanTimingParams: timingParamMgr.getParams(),
    timerService,
    liquidationInstall,
    main: makeElectorateParams(invitationAmount),
    bootstrapPaymentValue,
  });
};

harden(makeVaultParamManager);
harden(makeElectorateParamManager);
harden(makeGovernedTerms);

export { makeElectorateParamManager, makeVaultParamManager, makeGovernedTerms };
