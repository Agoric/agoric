// @ts-check
// @jessie-check

import '@agoric/governance/src/exported.js';
import '@agoric/zoe/exported.js';
import '@agoric/zoe/src/contracts/exported.js';

// The vaultFactory owns a number of VaultManagers and a mint for RUN.
//
// addVaultType is a closely held method that adds a brand new collateral type.
// It specifies the initial exchange rate for that type. It depends on a
// separately specified AMM to provide the ability to liquidate loans that are
// in arrears. We could check that the AMM has sufficient liquidity, but for the
// moment leave that to those participating in the governance process for adding
// new collateral type to ascertain.

// This contract wants to be managed by a contractGovernor, but it isn't
// compatible with contractGovernor, since it has a separate paramManager for
// each Vault. This requires it to manually replicate the API of contractHelper
// to satisfy contractGovernor. It needs to return a creatorFacet with
// { getParamMgrRetriever, getInvitation, getLimitedCreatorFacet }.

import { assertElectorateMatches } from '@agoric/governance';
import { makeStoredPublisherKit } from '@agoric/notifier';
import {
  makeVaultDirectorParamManager,
  LIQUIDATION_INSTALL_KEY,
  LIQUIDATION_TERMS_KEY,
  MIN_INITIAL_DEBT_KEY,
} from './params.js';
import { makeVaultDirector } from './vaultDirector.js';

/**
 * @typedef {ZCF<GovernanceTerms<import('./params').VaultDirectorParams> & {
 *   ammPublicFacet: AutoswapPublicFacet,
 *   liquidationInstall: Installation<import('./liquidateMinimum.js').start>,
 *   loanTimingParams: {ChargingPeriod: ParamValueTyped<'nat'>, RecordingPeriod: ParamValueTyped<'nat'>},
 *   minInitialDebt: Amount,
 *   priceAuthority: ERef<PriceAuthority>,
 *   reservePublicFacet: AssetReservePublicFacet,
 *   timerService: TimerService,
 *   shortfallInvitation: 'invitation',
 * }>} VaultFactoryZCF
 */

/**
 * @param {VaultFactoryZCF} zcf
 * @param {{
 *   feeMintAccess: FeeMintAccess,
 *   initialPoserInvitation: Invitation,
 *   initialShortfallInvitation: Invitation,
 *   storageNode?: ERef<StorageNode>,
 *   marshaller?: ERef<Marshaller>,
 * }} privateArgs
 */
export const start = async (zcf, privateArgs) => {
  const { feeMintAccess, initialPoserInvitation, initialShortfallInvitation } =
    privateArgs;
  const debtMint = await zcf.registerFeeMint('RUN', feeMintAccess);
  zcf.setTestJig(() => ({
    runIssuerRecord: debtMint.getIssuerRecord(),
  }));

  const {
    [LIQUIDATION_INSTALL_KEY]: { value: liqInstall },
    [LIQUIDATION_TERMS_KEY]: { value: liqTerms },
    [MIN_INITIAL_DEBT_KEY]: { value: minInitialDebt },
  } = zcf.getTerms().governedParams;
  /** a powerful object; can modify the invitation */
  const vaultDirectorParamManager = await makeVaultDirectorParamManager(
    makeStoredPublisherKit(
      privateArgs.storageNode,
      privateArgs.marshaller,
      'governance',
    ),
    zcf.getZoeService(),
    initialPoserInvitation,
    liqInstall,
    liqTerms,
    minInitialDebt,
    initialShortfallInvitation,
  );

  assertElectorateMatches(
    vaultDirectorParamManager,
    zcf.getTerms().governedParams,
  );

  const factory = makeVaultDirector(
    zcf,
    vaultDirectorParamManager,
    debtMint,
    privateArgs.storageNode,
    privateArgs.marshaller,
  );

  return harden({
    creatorFacet: factory.creator,
    publicFacet: factory.public,
  });
};

/** @typedef {ContractOf<typeof start>} VaultFactoryContract */
