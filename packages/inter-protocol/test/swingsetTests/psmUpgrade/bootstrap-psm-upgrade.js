// @ts-check

import { Fail, NonNullish } from '@agoric/assert';
import { AmountMath, makeIssuerKit } from '@agoric/ertp';
import { CONTRACT_ELECTORATE, ParamTypes } from '@agoric/governance';
import { deeplyFulfilledObject, makeTracer } from '@agoric/internal';
import { makeFakeStorageKit } from '@agoric/internal/src/storage-test-utils.js';
import { mustMatch } from '@agoric/store';
import { makeFakeBoard } from '@agoric/vats/tools/board-utils.js';
import { makeRatio } from '@agoric/zoe/src/contractSupport/ratio.js';
import { PaymentPKeywordRecordShape } from '@agoric/zoe/src/typeGuards.js';
import buildManualTimer from '@agoric/zoe/tools/manualTimer.js';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { makePromiseKit } from '@endo/promise-kit';
import { scale6, withAmountUtils } from '../../supports.js';

const trace = makeTracer('BootPSMUpg');

export const psmV1BundleName = 'psmV1';

const anchor = withAmountUtils(makeIssuerKit('bucks'));

const firstGive = anchor.units(21);
const secondGive = anchor.units(3);

/** @typedef {import('../../../src/psm/psm.js').start} PsmSF */

export const buildRootObject = async () => {
  const storageKit = makeFakeStorageKit('psmUpgradeTest');
  const timer = buildManualTimer();
  const marshaller = makeFakeBoard().getReadonlyMarshaller();

  const { promise: committeeCreator, ...ccPK } = makePromiseKit();

  /** @type {ZoeService} */
  let zoeService;

  /** @type {FeeMintAccess} */
  let feeMintAccess;

  let minted;

  /** @type {import('../../../src/psm/psm.js').PsmPublicFacet} */
  let psmPublicFacet;

  /**
   * @type {Subscriber<
   *   import('../../../src/psm/psm.js').MetricsNotification
   * >}
   */
  let metrics;
  /**
   * @type {UpdateRecord<
   *   import('../../../src/psm/psm.js').MetricsNotification
   * >}
   */
  let metricsRecord;

  /** @type {VatAdminSvc} */
  let vatAdmin;

  let initialPoserInvitation;
  let poserInvitationAmount;

  // for startInstance
  /**
   * @type {{
   *   committee?: Installation<
   *     import('@agoric/governance/src/committee.js')['start']
   *   >;
   *   psmV1?: Installation<PsmSF>;
   *   puppetContractGovernor?: Installation<
   *     import('@agoric/governance/tools/puppetContractGovernor').start
   *   >;
   * }}
   */
  const installations = {};

  /** @type {import('@agoric/governance/tools/puppetContractGovernor').PuppetContractGovernorKit<PsmSF>} */
  let governorFacets;

  /**
   * @type {Omit<
   *   import('@agoric/zoe/src/zoeService/utils.js').StartParams<PsmSF>['terms'],
   *   'issuers' | 'brands'
   * >}
   */
  const psmTerms = {
    anchorBrand: anchor.brand,

    electionManager: Far('mock instance handle'),
    governedParams: {
      // @ts-expect-error missing value, to be filled in
      [CONTRACT_ELECTORATE]: {
        type: ParamTypes.INVITATION,
      },
    },
  };
  const staticPrivateArgs = {
    storageNode: storageKit.rootNode,
    marshaller,
  };

  /**
   * @param {Amount<'nat'>} giveAnchor
   * @param {Amount<'nat'>} [wantMinted]
   */
  const swapAnchorForMintedSeat = async (giveAnchor, wantMinted) => {
    const seat = E(zoeService).offer(
      E(psmPublicFacet).makeWantMintedInvitation(),
      harden({
        give: { In: giveAnchor },
        ...(wantMinted ? { want: { Out: wantMinted } } : {}),
      }),
      harden({ In: anchor.mint.mintPayment(giveAnchor) }),
    );
    return seat;
  };

  return Far('root', {
    /**
     * @param {{
     *   vatAdmin: ReturnType<
     *     import('@agoric/swingset-vat/src/vats/vat-admin/vat-vat-admin')['buildRootObject']
     *   >;
     *   zoe: ReturnType<import('@agoric/vats/src/vat-zoe')['buildRootObject']>;
     * }} vats
     * @param {any} devices
     */
    bootstrap: async (vats, devices) => {
      vatAdmin = await E(vats.vatAdmin).createVatAdminService(devices.vatAdmin);
      ({ feeMintAccess, zoeService } = await E(vats.zoe).buildZoe(
        vatAdmin,
        undefined,
        'zcf',
      ));

      minted = {
        brand: await E(E(zoeService).getFeeIssuer()).getBrand(),
        make: n => AmountMath.make(minted.brand, n),
      };
      psmTerms.anchorPerMinted = makeRatio(1n, anchor.brand, 1n, minted.brand);
      psmTerms.governedParams.WantMintedFee = {
        type: ParamTypes.RATIO,
        value: makeRatio(1n, minted.brand, 1n),
      };
      psmTerms.governedParams.GiveMintedFee = {
        type: ParamTypes.RATIO,
        value: makeRatio(1n, minted.brand, 1n),
      };
      psmTerms.governedParams.MintLimit = {
        type: ParamTypes.AMOUNT,
        value: minted.make(scale6(1_000_000)),
      };

      const v1BundleId = await E(vatAdmin).getBundleIDByName(psmV1BundleName);
      v1BundleId || Fail`bundleId must not be empty`;
      installations.psmV1 = await E(zoeService).installBundleID(v1BundleId);

      installations.puppetContractGovernor = await E(
        zoeService,
      ).installBundleID(
        await E(vatAdmin).getBundleIDByName('puppetContractGovernor'),
      );

      installations.committee = await E(zoeService).installBundleID(
        await E(vatAdmin).getBundleIDByName('committee'),
      );
      const ccStartResult = await E(zoeService).startInstance(
        installations.committee,
        harden({}),
        {
          committeeName: 'Demos',
          committeeSize: 1,
        },
        {
          storageNode: storageKit.rootNode.makeChildNode('thisCommittee'),
          marshaller,
        },
      );
      ccPK.resolve(ccStartResult.creatorFacet);

      const poserInvitationP = E(committeeCreator).getPoserInvitation();
      [initialPoserInvitation, poserInvitationAmount] = await Promise.all([
        poserInvitationP,
        E(E(zoeService).getInvitationIssuer()).getAmountOf(poserInvitationP),
      ]);
      // fill in missing value
      psmTerms.governedParams[CONTRACT_ELECTORATE].value =
        poserInvitationAmount;
    },

    buildV1: async () => {
      trace(`BOOT buildV1 start`);
      // build the contract vat from ZCF and the contract bundlecap

      const governorTerms = await deeplyFulfilledObject(
        harden({
          timer,
          governedContractInstallation: NonNullish(installations.psmV1),
          governed: {
            terms: psmTerms,
            issuerKeywordRecord: { AUSD: anchor.issuer },
            label: 'psmV1',
          },
        }),
      );
      trace('got governorTerms', governorTerms);

      trace(`BOOT buildV1 startInstance`);
      // @ts-expect-error
      governorFacets = await E(zoeService).startInstance(
        NonNullish(installations.puppetContractGovernor),
        undefined,
        governorTerms,
        {
          governed: {
            ...staticPrivateArgs,
            feeMintAccess,
            initialPoserInvitation,
          },
        },
      );
      trace('BOOT buildV1 started instance');

      psmPublicFacet = await E(governorFacets.creatorFacet).getPublicFacet();

      return true;
    },

    testFunctionality1: async () => {
      trace('testFunctionality1');

      metrics = await E(psmPublicFacet).getMetrics();

      metricsRecord = await E(metrics).getUpdateSince();
      mustMatch(
        metricsRecord.value,
        harden({
          anchorPoolBalance: anchor.make(0n),
          feePoolBalance: minted.make(0n),
          mintedPoolBalance: minted.make(0n),
          totalAnchorProvided: anchor.make(0n),
          totalMintedProvided: minted.make(0n),
        }),
      );

      const seat = swapAnchorForMintedSeat(firstGive);
      const payouts = await E(seat).getPayouts();
      mustMatch(payouts, PaymentPKeywordRecordShape);

      metricsRecord = await E(metrics).getUpdateSince(
        metricsRecord.updateCount,
      );
      mustMatch(
        metricsRecord.value,
        harden({
          anchorPoolBalance: firstGive,
          feePoolBalance: minted.make(firstGive.value),
          mintedPoolBalance: minted.make(firstGive.value),
          totalAnchorProvided: anchor.make(0n),
          totalMintedProvided: minted.make(firstGive.value),
        }),
      );
    },

    nullUpgradeV1: async () => {
      trace(`BOOT nullUpgradeV1 start`);

      const bundleId = await E(vatAdmin).getBundleIDByName(psmV1BundleName);

      trace(`BOOT nullUpgradeV1 upgradeContract`);
      const psmAdminFacet = await E(
        governorFacets.creatorFacet,
      ).getAdminFacet();
      const upgradeResult = await E(psmAdminFacet).upgradeContract(bundleId, {
        ...staticPrivateArgs,
        initialPoserInvitation,
      });
      // incremented from zero
      assert.equal(upgradeResult.incarnationNumber, 1);
      trace(`BOOT nullUpgradeV1 upgradeContract completed`);

      await timer.tickN(1);
      return true;
    },

    testFunctionality2: async () => {
      trace('testFunctionality2');

      // contract publishes metrics in prepare()
      // verify that they match what we ended with before restart
      metricsRecord = await E(metrics).getUpdateSince(
        metricsRecord.updateCount,
      );
      mustMatch(
        metricsRecord.value,
        harden({
          anchorPoolBalance: firstGive,
          feePoolBalance: minted.make(firstGive.value),
          mintedPoolBalance: minted.make(firstGive.value),
          totalAnchorProvided: anchor.make(0n),
          totalMintedProvided: minted.make(firstGive.value),
        }),
      );

      // verify we can still trade
      const seat = swapAnchorForMintedSeat(secondGive);
      const payouts = await E(seat).getPayouts();
      mustMatch(payouts, PaymentPKeywordRecordShape);

      // verify that the subscriber's index is maintained
      metricsRecord = await E(metrics).getUpdateSince(
        metricsRecord.updateCount,
      );

      // verify that the metrics still update (from the trade above)
      const totalGive = AmountMath.add(firstGive, secondGive);
      mustMatch(
        metricsRecord.value,
        harden({
          anchorPoolBalance: totalGive,
          feePoolBalance: minted.make(totalGive.value),
          mintedPoolBalance: minted.make(totalGive.value),
          totalAnchorProvided: anchor.make(0n),
          totalMintedProvided: minted.make(totalGive.value),
        }),
      );
    },

    // this test doesn't upgrade to a new bundle because we have coverage elsewhere that
    // a new bundle will replace the behavior of the prior bundle
  });
};
