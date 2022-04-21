// @ts-check
// @jessie-check
import { AmountMath } from '@agoric/ertp';
import { handleParamGovernance, ParamTypes } from '@agoric/governance';
import { E, Far } from '@endo/far';
import { makeAttestationFacets } from './attestation.js';
import { makeRunStakeKit, KW } from './runStakeKit.js';
import { makeRunStakeManager } from './runStakeManager.js';

const { details: X } = assert;
const { values } = Object;

/**
 * Provide loans on the basis of staked assets that earn rewards.
 *
 * In addition to brands and issuers for `Staked`, `RUN`, and attestation,
 * terms of the contract include a periodic `InterestRate`
 * plus a `LoanFee` proportional to the amount borrowed, as well as
 * a `MintingRatio` of funds to (mint and) loan per unit of staked asset.
 * These terms are subject to change by the `Electorate`
 * and `electionManager` terms.
 *
 * @typedef {{
 *   DebtLimit: ParamRecord<'amount'>,
 *   MintingRatio: ParamRecord<'ratio'>,
 *   InterestRate: ParamRecord<'ratio'>,
 *   LoanFee: ParamRecord<'ratio'>,
 * }} RunStakeParams
 *
 * As in vaultFactory, `timerService` provides the periodic signal to
 * charge interest according to `chargingPeriod` and `recordingPeriod`.
 *
 * @typedef { GovernanceTerms<RunStakeParams> & {
 *   timerService: TimerService,
 *   chargingPeriod: bigint,
 *   recordingPeriod: bigint,
 *   lienAttestationName?: string,
 * }} RunStakeTerms
 *
 * The public facet provides access to invitations to get a loan
 * or to return an attestation in order to release a lien on staked assets.
 *
 * @typedef {{
 *   makeLoanInvitation: () => Promise<Invitation>,
 *   makeReturnAttInvitation: () => Promise<Invitation>,
 * }} RunStakePublic
 *
 * To take out a loan, get an `AttestationMaker` for your address from
 * the creator of this contract, and use
 * `E(attMaker).makeAttestation(stakedAmount)` to take out a lien
 * and get a payment that attests to the lien. Provide the payment
 * in the `Attestation` keyword of an offer,
 * using `{ want: { Debt: amountWanted }}`.
 *
 * Then, using the invitationMakers pattern, use `AdjustBalances` to
 * pay down the loan or otherwise adjust the `Debt` and `Attestation`.
 *
 * Finally, `Close` the loan, providing `{ give: Debt: debtAmount }}`
 *
 * To start the contract, authorize minting assets by providing `feeMintAccess`
 * and provide access to the underlying staking infrastructure in `lienBridge`.
 *
 * @typedef {{
 *   feeMintAccess: FeeMintAccess,
 *   initialPoserInvitation: Invitation,
 *   lienBridge: ERef<StakingAuthority>,
 * }} RunStakePrivateArgs
 *
 * The creator facet can make an `AttestationMaker` for each account, which
 * authorizes placing a lien some of the staked assets in that account.
 * @typedef {{
 *   provideAttestationMaker: (addr: string) => AttestationMaker,
 *   getLiened: (address: string, brand: Brand<'nat'>) => Amount<'nat'>,
 * }} RunStakeCreator
 *
 * @type {ContractStartFn<RunStakePublic, RunStakeCreator,
 *                        RunStakeTerms, RunStakePrivateArgs>}
 */
export const start = async (
  zcf,
  { feeMintAccess, initialPoserInvitation, lienBridge },
) => {
  const {
    brands: { Stake: stakeBrand },
    timerService,
    chargingPeriod,
    recordingPeriod,
  } = zcf.getTerms();
  assert.typeof(chargingPeriod, 'bigint', 'chargingPeriod must be a bigint');
  assert.typeof(recordingPeriod, 'bigint', 'recordingPeriod must be a bigint');

  /** @type {ZCFMint<'nat'>} */
  const debtMint = await zcf.registerFeeMint(KW.Debt, feeMintAccess);
  const { brand: debtBrand } = debtMint.getIssuerRecord();

  const att = await makeAttestationFacets(zcf, stakeBrand, lienBridge);
  const attestBrand = await E(att.publicFacet).getBrand();

  const { augmentPublicFacet, makeGovernorFacet, params } =
    await handleParamGovernance(zcf, initialPoserInvitation, {
      DebtLimit: ParamTypes.AMOUNT,
      InterestRate: ParamTypes.RATIO,
      LoanFee: ParamTypes.RATIO,
      MintingRatio: ParamTypes.RATIO,
    });

  /** For temporary staging of newly minted tokens */
  const { zcfSeat: mintSeat } = zcf.makeEmptySeatKit();
  const { zcfSeat: rewardPoolSeat } = zcf.makeEmptySeatKit();

  /**
   * Let the manager add rewards to the rewardPoolSeat
   * without directly exposing the rewardPoolSeat to them.
   *
   * @type {MintAndReallocate}
   */
  const mintAndReallocate = (toMint, fee, seat, ...otherSeats) => {
    const kept = AmountMath.subtract(toMint, fee);
    debtMint.mintGains(harden({ [KW.Debt]: toMint }), mintSeat);
    try {
      rewardPoolSeat.incrementBy(
        mintSeat.decrementBy(harden({ [KW.Debt]: fee })),
      );
      seat.incrementBy(mintSeat.decrementBy(harden({ [KW.Debt]: kept })));
      zcf.reallocate(
        rewardPoolSeat,
        mintSeat,
        seat,
        ...otherSeats.filter(s => s.hasStagedAllocation()),
      );
    } catch (e) {
      mintSeat.clear();
      rewardPoolSeat.clear();
      // Make best efforts to burn the newly minted tokens, for hygiene.
      // That only relies on the internal mint, so it cannot fail without
      // there being much larger problems. There's no risk of tokens being
      // stolen here because the staging for them was already cleared.
      debtMint.burnLosses(harden({ [KW.Debt]: toMint }), mintSeat);
      throw e;
    } finally {
      assert(
        values(mintSeat.getCurrentAllocation()).every(a =>
          AmountMath.isEmpty(a),
        ),
        X`Stage should be empty of Debt`,
      );
    }
    // TODO add aggregate debt tracking at the vaultFactory level #4482
    // totalDebt = AmountMath.add(totalDebt, toMint);
  };

  const burnDebt = (toBurn, seat) => {
    debtMint.burnLosses(harden({ [KW.Debt]: toBurn }), seat);
  };

  const mintPowers = Far('mintPowers', {
    burnDebt,
    getGovernedParams: () => params, // XXX until governance support is durable
    mintAndReallocate,
  });

  const startTimeStamp = await E(timerService).getCurrentTimestamp();
  const { manager } = makeRunStakeManager(
    zcf,
    debtMint,
    harden({ Attestation: attestBrand, debt: debtBrand, Stake: stakeBrand }),
    mintPowers,
    { timerService, chargingPeriod, recordingPeriod, startTimeStamp },
  );

  /**
   * @param {ZCFSeat} seat
   */
  const handleLoanOffer = seat => {
    const { helper, pot } = makeRunStakeKit(zcf, seat, manager);

    return harden({
      publicNotifiers: {
        asset: manager.getAssetNotifier(),
        vault: pot.getNotifier(),
      },
      invitationMakers: Far('invitation makers', {
        AdjustBalances: () =>
          zcf.makeInvitation(
            helper.handleAdjustBalancesOffer,
            'AdjustBalances',
          ),
        CloseVault: () =>
          zcf.makeInvitation(helper.handleCloseOffer, 'CloseVault'),
      }),
      vault: Far('RUNstake pot', pot),
    });
  };

  const publicFacet = augmentPublicFacet(
    Far('runStake public', {
      makeLoanInvitation: () =>
        zcf.makeInvitation(handleLoanOffer, 'make RUNstake'),
      makeReturnAttInvitation: att.publicFacet.makeReturnAttInvitation,
    }),
  );

  const creatorFacet = makeGovernorFacet(
    Far('runStake creator', {
      provideAttestationMaker: att.creatorFacet.provideAttestationTool,
    }),
  );

  // @ts-expect-error makeGovernorFacet loses type info
  return { publicFacet, creatorFacet };
};
harden(start);
