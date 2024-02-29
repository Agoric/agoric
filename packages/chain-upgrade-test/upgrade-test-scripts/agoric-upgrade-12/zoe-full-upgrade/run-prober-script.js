// @ts-no-check
/* global E */

// to turn on ts-check:
// Xmport { E } from '@endo/far';

const PROBER_BUNDLE_ID = '##PROBER_BUNDLE_ID##';

console.info('running zcf prober');

const sub = (a, v) => {
  return { brand: a.brand, value: a.value - v };
};

const probeReallocation = async (
  value,
  payment,
  creatorFacet,
  zoe,
  ducatIssuer,
) => {
  const stagingInv = await E(creatorFacet).makeProbeStagingInvitation();

  const stagingSeat = await E(zoe).offer(
    stagingInv,
    { give: { Ducats: value } },
    { Ducats: payment },
  );
  const helperPayments = await E(stagingSeat).getPayouts();

  const helperInv = await E(creatorFacet).makeProbeHelperInvitation();
  const helperSeat = await E(zoe).offer(
    helperInv,
    { give: { Ducats: sub(value, 1n) } },
    { Ducats: helperPayments.Ducats },
  );
  const internalPayments = await E(helperSeat).getPayouts();
  const ducatAmount = await E(ducatIssuer).getAmountOf(internalPayments.Ducats);

  const internalInv = await E(creatorFacet).makeProbeInternalInvitation();
  const internalSeat = await E(zoe).offer(
    internalInv,
    { give: { Ducats: ducatAmount } },
    { Ducats: internalPayments.Ducats },
  );
  const leftoverPayments = await E(internalSeat).getPayouts();

  return {
    stagingResult: await E(stagingSeat).getOfferResult(),
    helperResult: await E(helperSeat).getOfferResult(),
    internalResult: await E(internalSeat).getOfferResult(),
    leftoverPayments,
  };
};

/*
 * Test a full upgrade of Zoe and ZCF.
 * This will include a change to Zoe's code, and a call to Zoe to change the ZCF
 * code that will get used for new and upgraded contracts.
 */
const runProber = async powers => {
  console.info('install prober');
  const {
    consume: { zoe, chainStorage },
  } = powers;

  const installation = await E(zoe).installBundleID(PROBER_BUNDLE_ID);
  const storageNode = await E(chainStorage).makeChildNode('prober-asid9a');

  const { instance, creatorFacet } = await E(zoe).startInstance(
    installation,
    undefined,
    undefined,
    { storageNode },
    'probe',
  );

  const issuers = await E(zoe).getIssuers(instance);

  const faucetInv = await E(creatorFacet).makeFaucetInvitation();
  const seat = await E(zoe).offer(faucetInv);
  const payoutDucats = await E(seat).getPayout('Ducats');
  const faucetAmount = await E(issuers.Ducats).getAmountOf(payoutDucats);

  const result1 = await probeReallocation(
    faucetAmount,
    payoutDucats,
    creatorFacet,
    zoe,
    issuers.Ducats,
  );
  console.info('PROBE results', result1);
};

runProber;
