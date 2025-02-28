// @ts-check

import { Fail } from '@endo/errors';
import { AmountMath, makeIssuerKit } from '@agoric/ertp';
import { CONTRACT_ELECTORATE, ParamTypes } from '@agoric/governance';
import {
  deeplyFulfilledObject,
  makeTracer,
  NonNullish,
} from '@agoric/internal';
import { makeFakeStorageKit } from '@agoric/internal/src/storage-test-utils.js';
import { makeNameHubKit } from '@agoric/vats';
import { makeFakeBoard } from '@agoric/vats/tools/board-utils.js';
import { buildZoeManualTimer } from '@agoric/zoe/tools/manualTimer.js';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { makePromiseKit } from '@endo/promise-kit';

const trace = makeTracer('BootFAUpg');

export const arV1BundleName = 'assetReserveV1';

const moola = makeIssuerKit('moola');
const { make } = AmountMath;

export const buildRootObject = async () => {
  const storageKit = makeFakeStorageKit('assetReserveUpgradeTest');
  const { nameAdmin: namesByAddressAdmin } = makeNameHubKit();
  const timer = buildZoeManualTimer();
  const marshaller = makeFakeBoard().getReadonlyMarshaller();

  const { promise: committeeCreator, ...ccPK } = makePromiseKit();

  /** @type {ZoeService} */
  let zoeService;

  /** @type {FeeMintAccess} */
  let feeMintAccess;

  /**
   * @type {Subscriber<
   *   import('../../../src/reserve/assetReserveKit.js').MetricsNotification
   * >}
   */
  let metrics;
  /**
   * @type {UpdateRecord<
   *   import('../../../src/reserve/assetReserveKit.js').MetricsNotification
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
   *   assetReserveV1?: Installation<
   *     import('../../../src/reserve/assetReserve.js')['start']
   *   >;
   *   puppetContractGovernor?: Installation<
   *     import('@agoric/governance/tools/puppetContractGovernor.js')['start']
   *   >;
   * }}
   */
  const installations = {};

  /**
   * @type {import('@agoric/governance/tools/puppetContractGovernor.js').PuppetContractGovernorKit<
   *     import('../../../src/reserve/assetReserve.js').start
   *   >}
   */
  let governorFacets;
  /**
   * @type {ReturnType<
   *   Awaited<
   *     ReturnType<import('../../../src/reserve/assetReserve.js').start>
   *   >['creatorFacet']['getLimitedCreatorFacet']
   * >}
   */
  let arLimitedFacet;

  /**
   * @type {Omit<
   *   import('@agoric/zoe/src/zoeService/utils.js').StartParams<
   *     import('../../../src/reserve/assetReserve.js').start
   *   >['terms'],
   *   'issuers' | 'brands'
   * >}
   */
  const arTerms = {
    governedParams: {
      // @ts-expect-error missing value
      [CONTRACT_ELECTORATE]: {
        type: ParamTypes.INVITATION,
      },
    },
  };
  const staticPrivateArgs = {
    storageNode: storageKit.rootNode,
    marshaller,
    namesByAddressAdmin,
  };

  /** @param {Amount<'nat'>} amt */
  const addCollateral = async amt => {
    const arPublicFacet = await E(governorFacets.creatorFacet).getPublicFacet();
    const seat = E(zoeService).offer(
      E(arPublicFacet).makeAddCollateralInvitation(),
      harden({
        give: { Collateral: amt },
      }),
      harden({ Collateral: moola.mint.mintPayment(amt) }),
    );
    return seat;
  };

  return Far('root', {
    bootstrap: async (vats, devices) => {
      vatAdmin = await E(vats.vatAdmin).createVatAdminService(devices.vatAdmin);
      ({ feeMintAccess, zoeService } = await E(vats.zoe).buildZoe(
        vatAdmin,
        undefined,
        'zcf',
      ));

      const v1BundleId = await E(vatAdmin).getBundleIDByName(arV1BundleName);
      v1BundleId || Fail`bundleId must not be empty`;
      installations.assetReserveV1 =
        await E(zoeService).installBundleID(v1BundleId);

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
    },

    buildV1: async () => {
      trace(`BOOT buildV1 start`);
      // build the contract vat from ZCF and the contract bundlecap

      arTerms.governedParams[CONTRACT_ELECTORATE].value = poserInvitationAmount;

      const governorTerms = await deeplyFulfilledObject(
        harden({
          timer,
          governedContractInstallation: NonNullish(
            installations.assetReserveV1,
          ),
          governed: {
            terms: arTerms,
            label: 'assetReserveV1',
          },
        }),
      );
      trace('got governorTerms', governorTerms);

      // Complete round-trip without upgrade
      trace(`BOOT buildV1 startInstance`);
      // @ts-expect-error
      governorFacets = await E(zoeService).startInstance(
        NonNullish(installations.puppetContractGovernor),
        undefined,
        // @ts-expect-error XXX timer
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

      // @ts-expect-error XXX governance types https://github.com/Agoric/agoric-sdk/issues/7178
      arLimitedFacet = await E(governorFacets.creatorFacet).getCreatorFacet();

      return true;
    },

    testFunctionality1: async () => {
      const arPublicFacet = await E(
        governorFacets.creatorFacet,
      ).getPublicFacet();

      const publicTopics = await E(arPublicFacet).getPublicTopics();
      assert.equal(publicTopics.metrics.description, 'Asset Reserve metrics');
      metrics = publicTopics.metrics.subscriber;
      metricsRecord = await E(metrics).getUpdateSince();
      assert.equal(metricsRecord.updateCount, 1n);
      assert.equal(metricsRecord.value.shortfallBalance.value, 0n);
      assert.equal(metricsRecord.value.totalFeeBurned.value, 0n);
      assert.equal(metricsRecord.value.totalFeeMinted.value, 0n);

      await E(arLimitedFacet).addIssuer(moola.issuer, 'Moola');

      const amt = make(moola.brand, 100_000n);
      const collateralSeat = addCollateral(amt);

      assert.equal(
        await E(collateralSeat).getOfferResult(),
        'added Collateral to the Reserve',
      );
      // new record
      metricsRecord = await E(metrics).getUpdateSince(
        metricsRecord.updateCount,
      );
      // added collateral is recorded
      assert.equal(metricsRecord.value.allocations.Moola.value, amt.value);
    },

    nullUpgradeV1: async () => {
      trace(`BOOT nullUpgradeV1 start`);

      const bundleId = await E(vatAdmin).getBundleIDByName(arV1BundleName);

      trace(`BOOT nullUpgradeV1 upgradeContract`);
      const arAdminFacet = await E(governorFacets.creatorFacet).getAdminFacet();
      const upgradeResult = await E(arAdminFacet).upgradeContract(bundleId, {
        ...staticPrivateArgs,
        // @ts-expect-error mock
        feeMintAccess: undefined,
        initialPoserInvitation,
      });
      assert.equal(upgradeResult.incarnationNumber, 1);
      trace(`BOOT nullUpgradeV1 upgradeContract completed`);

      await timer.tickN(1);
      return true;
    },

    testFunctionality2: async () => {
      const arPublicFacet = await E(
        governorFacets.creatorFacet,
      ).getPublicFacet();

      const publicTopics = await E(arPublicFacet).getPublicTopics();
      assert.equal(metrics, publicTopics.metrics.subscriber);

      metricsRecord = await E(metrics).getUpdateSince();

      // verify allocations
      const allocations = await E(arLimitedFacet).getAllocations();
      assert.equal(allocations.Moola.value, 100_000n);
      assert.equal(allocations.Moola.brand, moola.brand);

      // same as last
      assert.equal(metricsRecord.updateCount, 2n);

      // add more collateral
      const amt = make(moola.brand, 20_000n);
      const collateralSeat = addCollateral(amt);

      assert.equal(
        await E(collateralSeat).getOfferResult(),
        'added Collateral to the Reserve',
      );
      // new record
      metricsRecord = await E(metrics).getUpdateSince(
        metricsRecord.updateCount,
      );
      // collateral continued up from last state
      assert.equal(
        metricsRecord.value.allocations.Moola.value,
        100_000n + amt.value,
      );
    },

    // this test doesn't upgrade to a new bundle because we have coverage elsewhere that
    // a new bundle will replace the behavior of the prior bundle
  });
};
