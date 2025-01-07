import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { makeIssuerKit, AmountMath } from '@agoric/ertp';
import buildManualTimer from '../../../tools/manualTimer.js';

const setupBasicMints = () => {
  const all = [
    makeIssuerKit('moola'),
    makeIssuerKit('simoleans'),
    makeIssuerKit('bucks'),
  ];
  const mints = all.map(objs => objs.mint);
  const issuers = all.map(objs => objs.issuer);
  const brands = all.map(objs => objs.brand);

  return harden({
    mints,
    issuers,
    brands,
  });
};

const makeVats = (log, vats, zoe, installations, startingValues) => {
  const timer = buildManualTimer(log);
  const { mints, issuers, brands } = setupBasicMints();
  const makePayments = values =>
    mints.map((mint, i) =>
      mint.mintPayment(AmountMath.make(brands[i], BigInt(values[i]))),
    );
  const [aliceValues, bobValues, carolValues, daveValues] = startingValues;

  // Setup Alice
  const aliceP = E(vats.alice).build(
    zoe,
    issuers,
    makePayments(aliceValues),
    installations,
    timer,
  );

  // Setup Bob
  const bobP = E(vats.bob).build(
    zoe,
    issuers,
    makePayments(bobValues),
    installations,
    timer,
  );

  const result = {
    aliceP,
    bobP,
  };
  let logMessage = 'alice and bob';

  if (carolValues) {
    const carolP = E(vats.carol).build(
      zoe,
      issuers,
      makePayments(carolValues),
      installations,
      timer,
    );
    result.carolP = carolP;
    logMessage = 'alice, bob, and carol';
  }

  if (daveValues) {
    const daveP = E(vats.dave).build(
      zoe,
      issuers,
      makePayments(daveValues),
      installations,
      timer,
    );
    result.daveP = daveP;
    logMessage = 'alice, bob, carol and dave';
  }

  log(`=> ${logMessage} are set up`);
  return harden(result);
};

export function buildRootObject(vatPowers, vatParameters) {
  const { D } = vatPowers;
  const { argv } = vatParameters;
  return Far('root', {
    async bootstrap(vats, devices) {
      const vatAdminSvc = await E(vats.vatAdmin).createVatAdminService(
        devices.vatAdmin,
      );
      /** @type {{zoeService: ERef<ZoeService>}} */
      const { zoeService: zoe } = await E(vats.zoe).buildZoe(
        vatAdminSvc,
        undefined,
        'zcf',
      );
      const installations = {};
      const installedPs = vatParameters.contractNames.map(name =>
        E(vatAdminSvc)
          .getNamedBundleCap(name)
          .then(async bcap => E(zoe).installBundleID(D(bcap).getBundleID()))
          .then(installation => {
            installations[name] = installation;
          }),
      );
      await Promise.all(installedPs);

      const [testName, startingValues] = argv;

      const { aliceP, bobP, carolP, daveP } = makeVats(
        vatPowers.testLog,
        vats,
        zoe,
        installations,
        startingValues,
      );
      await E(aliceP).startTest(testName, bobP, carolP, daveP);
    },
  });
}
