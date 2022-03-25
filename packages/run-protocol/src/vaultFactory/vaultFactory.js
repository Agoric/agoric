// @ts-check

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

import { E } from '@endo/eventual-send';
import '@agoric/governance/src/exported';

import { makeScalarMap } from '@agoric/store';
import {
  assertProposalShape,
  getAmountOut,
  getAmountIn,
} from '@agoric/zoe/src/contractSupport/index.js';
import { makeRatioFromAmounts } from '@agoric/zoe/src/contractSupport/ratio.js';
import { Far } from '@endo/marshal';
import { assertElectorateMatches } from '@agoric/governance';

import { makeVaultManager } from './vaultManager.js';
import { makeLiquidationStrategy } from './liquidateMinimum.js';
import { makeMakeCollectFeesInvitation } from './collectRewardFees.js';
import { makeVaultParamManager, makeElectorateParamManager } from './params.js';

const { details: X } = assert;

/**
 * @param {ZCF<
 *   Record<string, any> & {
 *     electionManager: Instance;
 *     main: { Electorate: ParamRecord<'invitation'> };
 *     timerService: TimerService;
 *     priceAuthority: ERef<PriceAuthority>;
 *   }
 * >} zcf
 * @param {{
 *   feeMintAccess: FeeMintAccess;
 *   initialPoserInvitation: Invitation;
 * }} privateArgs
 */
export const start = async (zcf, privateArgs) => {
  const {
    ammPublicFacet,
    priceAuthority,
    timerService,
    liquidationInstall,
    electionManager,
    main: governedTerms,
    loanTimingParams,
  } = zcf.getTerms();

  /** @type {Promise<GovernorPublic>} */
  const governorPublic = E(zcf.getZoeService()).getPublicFacet(electionManager);

  const { feeMintAccess, initialPoserInvitation } = privateArgs;
  const runMint = await zcf.registerFeeMint('RUN', feeMintAccess);
  const { issuer: runIssuer, brand: runBrand } = runMint.getIssuerRecord();
  zcf.setTestJig(() => ({
    runIssuerRecord: runMint.getIssuerRecord(),
  }));

  /** A powerful object; can modify the invitation */
  const electorateParamManager = await makeElectorateParamManager(
    zcf.getZoeService(),
    initialPoserInvitation,
  );

  assertElectorateMatches(electorateParamManager, governedTerms);

  const { zcfSeat: rewardPoolSeat } = zcf.makeEmptySeatKit();

  /**
   * We provide an easy way for the vaultManager to add rewards to the
   * rewardPoolSeat, without directly exposing the rewardPoolSeat to them.
   *
   * @type {ReallocateWithFee}
   */
  const reallocateWithFee = (fee, fromSeat, otherSeat = undefined) => {
    rewardPoolSeat.incrementBy(
      fromSeat.decrementBy(
        harden({
          RUN: fee,
        }),
      ),
    );
    if (otherSeat !== undefined) {
      zcf.reallocate(rewardPoolSeat, fromSeat, otherSeat);
    } else {
      zcf.reallocate(rewardPoolSeat, fromSeat);
    }
  };

  /** @type {Store<Brand, VaultManager>} */
  const collateralTypes = makeScalarMap('brand');

  const zoe = zcf.getZoeService();

  /** @type {Store<Brand, import('./params.js').VaultParamManager>} */
  const vaultParamManagers = makeScalarMap('brand');

  /** @type {AddVaultType} */
  const addVaultType = async (collateralIssuer, collateralKeyword, rates) => {
    await zcf.saveIssuer(collateralIssuer, collateralKeyword);
    const collateralBrand = zcf.getBrandForIssuer(collateralIssuer);
    // We create only one vault per collateralType.
    assert(
      !collateralTypes.has(collateralBrand),
      `Collateral brand ${collateralBrand} has already been added`,
    );

    /** A powerful object; can modify parameters */
    const vaultParamManager = makeVaultParamManager(rates);
    vaultParamManagers.init(collateralBrand, vaultParamManager);

    const { creatorFacet: liquidationFacet } = await E(zoe).startInstance(
      liquidationInstall,
      harden({ RUN: runIssuer, Collateral: collateralIssuer }),
      harden({ amm: ammPublicFacet }),
    );
    const liquidationStrategy = makeLiquidationStrategy(liquidationFacet);

    const startTimeStamp = await E(timerService).getCurrentTimestamp();

    const vm = makeVaultManager(
      zcf,
      runMint,
      collateralBrand,
      priceAuthority,
      loanTimingParams,
      vaultParamManager.readonly(),
      reallocateWithFee,
      timerService,
      liquidationStrategy,
      startTimeStamp,
    );
    collateralTypes.init(collateralBrand, vm);
    return vm;
  };

  /** @param {ZCFSeat} seat */
  const makeVaultHook = async seat => {
    assertProposalShape(seat, {
      give: { Collateral: null },
      want: { RUN: null },
    });
    const {
      give: { Collateral: collateralAmount },
    } = seat.getProposal();
    const { brand: brandIn } = collateralAmount;
    assert(
      collateralTypes.has(brandIn),
      X`Not a supported collateral type ${brandIn}`,
    );
    /** @type {VaultManager} */
    const mgr = collateralTypes.get(brandIn);
    return mgr.makeVaultKit(seat);
  };

  // TODO add a `collateralBrand` argument to makeVaultInvitation`
  /** Make a loan in the vaultManager based on the collateral type. */
  const makeVaultInvitation = () => {
    return zcf.makeInvitation(makeVaultHook, 'MakeVault');
  };

  const getCollaterals = async () => {
    // should be collateralTypes.map((vm, brand) => ({
    return harden(
      Promise.all(
        [...collateralTypes.entries()].map(async ([brand, vm]) => {
          const priceQuote = await vm.getCollateralQuote();
          return {
            brand,
            interestRate: vm.getInterestRate(),
            liquidationMargin: vm.getLiquidationMargin(),
            stabilityFee: vm.getLoanFee(),
            marketPrice: makeRatioFromAmounts(
              getAmountOut(priceQuote),
              getAmountIn(priceQuote),
            ),
          };
        }),
      ),
    );
  };

  // Eventually the reward pool will live elsewhere. For now it's here for
  // bookkeeping. It's needed in tests.
  const getRewardAllocation = () => rewardPoolSeat.getCurrentAllocation();

  const getGovernedParams = paramDesc => {
    return vaultParamManagers.get(paramDesc.collateralBrand).getParams();
  };

  const publicFacet = Far('vaultFactory public facet', {
    /** @deprecated Use makeVaultInvitation instead */
    makeLoanInvitation: makeVaultInvitation,
    makeVaultInvitation,
    getCollaterals,
    getRunIssuer: () => runIssuer,
    getGovernedParams,
    getContractGovernor: () => governorPublic,
    getInvitationAmount: electorateParamManager.getInvitationAmount,
  });

  const { makeCollectFeesInvitation } = makeMakeCollectFeesInvitation(
    zcf,
    rewardPoolSeat,
    runBrand,
  );

  const getParamMgrRetriever = () =>
    Far('paramManagerRetriever', {
      get: paramDesc => {
        if (paramDesc.key === 'main') {
          return electorateParamManager;
        } else {
          return vaultParamManagers.get(paramDesc.collateralBrand);
        }
      },
    });

  /** @type {VaultFactory} */
  const vaultFactory = Far('vaultFactory machine', {
    addVaultType,
    getCollaterals,
    getRewardAllocation,
    makeCollectFeesInvitation,
    getContractGovernor: () => electionManager,
  });

  const vaultFactoryWrapper = Far('powerful vaultFactory wrapper', {
    getParamMgrRetriever,
    getInvitation: electorateParamManager.getInternalParamValue,
    getLimitedCreatorFacet: () => vaultFactory,
  });

  return harden({
    creatorFacet: vaultFactoryWrapper,
    publicFacet,
  });
};

/** @typedef {ContractOf<typeof start>} VaultFactoryContract */
