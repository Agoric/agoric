import '@agoric/swingset-liveslots/tools/prepare-test-env.js';
import test from 'ava';

import bundleSource from '@endo/bundle-source';
import { buildVatController } from '@agoric/swingset-vat';
import { kunser } from '@agoric/kmarshal';

const bfile = name => new URL(name, import.meta.url).pathname;

test('zoe vat upgrade trauma', async t => {
  /** @type {SwingSetConfig} */
  const config = {
    includeDevDependencies: true, // for vat-data
    defaultManagerType: 'xs-worker',
    bootstrap: 'bootstrap',
    defaultReapInterval: 'never',
    vats: {
      bootstrap: {
        sourceSpec: bfile('../../../../SwingSet/tools/bootstrap-relay.js'),
      },
      // TODO: Move vat-ertp-service.js up a level.
      ertp: { sourceSpec: bfile('../upgradeCoveredCall/vat-ertp-service.js') },
    },
    bundles: {
      zoe: { sourceSpec: bfile('../../../../vats/src/vat-zoe.js') },
      zcf: { sourceSpec: bfile('../../../src/contractFacet/vatRoot.js') },
      coveredCall: {
        sourceSpec: bfile('../../../src/contracts/coveredCall-durable.js'),
      },
    },
  };
  const c = await buildVatController(config);
  t.teardown(c.shutdown);
  c.pinVatRoot('bootstrap');
  await c.run();

  const awaitRun = async kpid => {
    await c.run();
    const status = c.kpStatus(kpid);
    if (status === 'fulfilled') {
      const result = c.kpResolution(kpid);
      return kunser(result);
    }
    assert(status === 'rejected');
    const err = c.kpResolution(kpid);
    throw kunser(err);
  };

  const messageToVat = async (vatName, method, ...args) => {
    const kpid = c.queueToVatRoot(vatName, method, args);
    return awaitRun(kpid);
  };
  const messageToObject = async (presence, method, ...args) => {
    const kpid = c.queueToVatObject(presence, method, args);
    return awaitRun(kpid);
  };

  const restartVatAdminVat = async controller => {
    const vaBundle = await bundleSource(
      new URL(
        '../../../../SwingSet/src/vats/vat-admin/vat-vat-admin.js',
        import.meta.url,
      ).pathname,
    );
    const bundleID = await controller.validateAndInstallBundle(vaBundle);
    controller.upgradeStaticVat('vatAdmin', true, bundleID, {});
    await controller.run();
  };

  /**
   * @see {@link ../upgradeCoveredCall/bootstrap-coveredCall-service-upgrade.js}
   */

  // Setup non-Zoe objects.
  const timer = await messageToVat('bootstrap', 'getTimer');
  const AmountMath = await messageToVat('ertp', 'getAmountMath');
  const ertpService = await messageToVat('ertp', 'getErtpService');
  const moolaKit = await messageToObject(ertpService, 'makeIssuerKit', 'Moola');
  const bucksKit = await messageToObject(ertpService, 'makeIssuerKit', 'Bucks');
  const moolaPurse = await messageToObject(moolaKit.issuer, 'makeEmptyPurse');
  const bucksPurse = await messageToObject(bucksKit.issuer, 'makeEmptyPurse');
  const noMoola = await messageToObject(AmountMath, 'make', moolaKit.brand, 0n);
  const noBucks = await messageToObject(AmountMath, 'make', bucksKit.brand, 0n);

  // Instantiate a Zoe vat and covered call installation.
  const zoeVatConfig = {
    name: 'zoe',
    bundleCapName: 'zoe',
  };
  const zoeVat = await messageToVat('bootstrap', 'createVat', zoeVatConfig);
  const vatAdmin = await messageToVat('bootstrap', 'getVatAdmin');
  const { zoeService: zoe } = await messageToObject(
    zoeVat,
    'buildZoe',
    vatAdmin,
    undefined,
    'zcf',
  );
  const coveredCallBundleId = await messageToObject(
    vatAdmin,
    'getBundleIDByName',
    'coveredCall',
  );
  t.assert(coveredCallBundleId, 'contract bundleId must not be empty');
  const coveredCallInstallation = await messageToObject(
    zoe,
    'installBundleID',
    coveredCallBundleId,
  );

  // Characterize the flow of instantiating and executing a contract
  // to completion.
  // Each step will be fed the output from its predecessor.
  const issuerRecord = harden({
    Bucks: bucksKit.issuer,
    Moola: moolaKit.issuer,
  });
  const moolaAmount = await messageToObject(
    AmountMath,
    'make',
    moolaKit.brand,
    15n,
  );
  const bucksAmount = await messageToObject(
    AmountMath,
    'make',
    bucksKit.brand,
    30n,
  );
  const flow = Object.entries({
    makeCoveredCallInstance: async () =>
      messageToObject(
        zoe,
        'startInstance',
        coveredCallInstallation,
        issuerRecord,
      ),
    makeInvitation: async instance =>
      messageToObject(instance.creatorFacet, 'makeInvitation'),
    makeOfferArgs: async invitation => {
      const proposal = harden({
        give: { Moola: moolaAmount },
        want: { Bucks: bucksAmount },
        exit: {
          afterDeadline: {
            deadline: 10n,
            timer,
          },
        },
      });
      const payment = await messageToObject(
        moolaKit.mint,
        'mintPayment',
        moolaAmount,
      );
      return [invitation, proposal, { Moola: payment }];
    },
    offerCall: async offerArgs => {
      const offerSeat = await messageToObject(zoe, 'offer', ...offerArgs);
      return { offerSeat };
    },
    acceptCall: async seats => {
      const acceptInvitation = await messageToObject(
        seats.offerSeat,
        'getOfferResult',
      );
      const payment = await messageToObject(
        bucksKit.mint,
        'mintPayment',
        bucksAmount,
      );
      const acceptSeat = await messageToObject(
        zoe,
        'offer',
        acceptInvitation,
        harden({
          give: { Bucks: bucksAmount },
          want: { Moola: moolaAmount },
          exit: { onDemand: null },
        }),
        { Bucks: payment },
      );
      return { ...seats, acceptSeat };
    },
    finish: async seats => {
      const acceptResult = await messageToObject(
        seats.acceptSeat,
        'getOfferResult',
      );
      const expectedResult =
        'The option was exercised. Please collect the assets in your payout.';
      t.is(acceptResult, expectedResult);
      const depositPayout = async (
        seatLabel,
        brandName,
        purse,
        expectedAmount,
      ) => {
        const payout = await messageToObject(
          seats[seatLabel],
          'getPayout',
          brandName,
        );
        const depositAmount = await messageToObject(purse, 'deposit', payout);
        const match = await messageToObject(
          AmountMath,
          'isEqual',
          depositAmount,
          expectedAmount,
        );
        t.true(
          match,
          `${seatLabel} ${brandName} must be ${expectedAmount}, not ${depositAmount}`,
        );
      };
      await depositPayout('offerSeat', 'Bucks', bucksPurse, bucksAmount);
      await depositPayout('offerSeat', 'Moola', moolaPurse, noMoola);
      await depositPayout('acceptSeat', 'Bucks', bucksPurse, noBucks);
      await depositPayout('acceptSeat', 'Moola', moolaPurse, moolaAmount);
    },
  });
  const doSteps = async (label, steps, input = undefined) => {
    let result = input;
    for (const [stepName, fn] of steps) {
      await t.notThrowsAsync(async () => {
        result = await fn(result);
      }, `${label} ${stepName} must complete successfully`);
    }
    return result;
  };

  // Sanity check by running through the full flow with the initial Zoe.
  await doSteps('pre-upgrade', flow);

  // For each step, run to just before that point and pause for
  // continuation after upgrade.
  const pausedFlows = [];
  for (let i = 0; i < flow.length; i += 1) {
    const [beforeStepName] = flow[i];
    const result = await doSteps(`pre-${beforeStepName}`, flow.slice(0, i));
    pausedFlows.push({ result, remainingSteps: flow.slice(i) });
  }

  // Null-upgrade vatAdmin.
  await restartVatAdminVat(c);

  // Null-upgrade Zoe.
  const { incarnationNumber: zoeIncarnationNumber } = await messageToVat(
    'bootstrap',
    'upgradeVat',
    zoeVatConfig,
  );
  t.is(zoeIncarnationNumber, 1, 'Zoe vat must be upgraded');

  // Verify a complete run in the new Zoe.
  await doSteps('post-upgrade', flow);

  // Verify completion of each paused flow.
  for (const { result, remainingSteps } of pausedFlows) {
    const [beforeStepName] = remainingSteps[0];
    await doSteps(`resumed-${beforeStepName}`, remainingSteps, result);
  }
});
