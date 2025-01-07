import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import path from 'path';
import { E, Far } from '@endo/far';
import {
  prepareNetworkProtocol,
  prepareLoopbackProtocolHandler,
  prepareNetworkPowers,
} from '@agoric/network';

import bundleSource from '@endo/bundle-source';
import { AmountMath } from '@agoric/ertp';
import { makeZoeForTest } from '@agoric/zoe/tools/setup-zoe.js';
import { makeSubscription } from '@agoric/notifier';
import { prepareVowTools } from '@agoric/vow/vat.js';

import { makePromiseKit } from '@endo/promise-kit';
import { makeScalarMapStore } from '@agoric/vat-data';
import { makeDurableZone } from '@agoric/zone/durable.js';

const dirname = path.dirname(new URL(import.meta.url).pathname);

const contractPath = `${dirname}/../src/contract.js`;

/**
 * @template T
 * @param {ERef<Subscription<T>>} sub
 * @returns {AsyncIterator<T, T>}
 */
const makeAsyncIteratorFromSubscription = sub =>
  makeSubscription(E(sub).getSharableSubscriptionInternals())[
    Symbol.asyncIterator
  ]();

const provideBaggage = key => {
  const zone = makeDurableZone(makeScalarMapStore());
  return zone.mapStore(`${key} baggage`);
};

/**
 * @param {import('ava').Assertions} t
 */
async function testRemotePeg(t) {
  t.plan(24);

  // const zone = makeHeapZone();
  const zone = makeDurableZone(provideBaggage('pegasus'));
  const vowTools = prepareVowTools(zone);
  const powers = prepareNetworkPowers(zone, vowTools);
  const { makeVowKit, when } = powers;

  /**
   * @type {PromiseRecord<import('@agoric/ertp').DepositFacet>}
   */
  const { promise: localDepositFacet, resolve: resolveLocalDepositFacet } =
    makePromiseKit();
  const fakeBoard = Far('fakeBoard', {
    getValue(id) {
      if (id === '0x1234') {
        return localDepositFacet;
      }
      t.is(id, 'agoric1234567', 'tried bech32 first in board');
      throw Error(`unrecognized board id ${id}`);
    },
  });
  const fakeNamesByAddress = Far('fakeNamesByAddress', {
    lookup(...keys) {
      t.is(keys[0], 'agoric1234567', 'unrecognized fakeNamesByAddress');
      t.is(keys[1], 'depositFacet', 'lookup not for the depositFacet');
      t.is(keys.length, 2);
      return localDepositFacet;
    },
  });

  const zoe = makeZoeForTest();

  // Pack the contract.
  const contractBundle = await bundleSource(contractPath);
  const installationHandle = await E(zoe).install(contractBundle);

  const { publicFacet: publicAPI } = await E(zoe).startInstance(
    installationHandle,
    {},
    {},
    { board: fakeBoard, namesByAddress: fakeNamesByAddress },
  );

  /**
   * @type {import('../src/pegasus.js').Pegasus}
   */
  const pegasus = publicAPI;

  const makeLoopbackHandler = prepareLoopbackProtocolHandler(zone, powers);
  const makeNetworkProtocol = prepareNetworkProtocol(zone, powers);
  const network = makeNetworkProtocol(makeLoopbackHandler());

  const portP = when(
    E(network).bindPort('/ibc-channel/chanabc/ibc-port/portdef'),
  );
  const portName = await E(portP).getLocalAddress();

  /**
   * Pretend we're Gaia.
   *
   * @type {Connection}
   */
  let gaiaConnection;
  E(portP)
    .addListener(
      Far('acceptor', {
        async onAccept(_p, _localAddr, _remoteAddr) {
          return Far('handler', {
            async onOpen(c) {
              gaiaConnection = c;
            },
            async onReceive(_c, packetBytes) {
              const { resolver, vow } = makeVowKit();
              const packet = JSON.parse(packetBytes);
              if (packet.memo) {
                t.deepEqual(
                  packet,
                  {
                    amount: '100000000000000000001',
                    denom: 'portdef/chanabc/uatom',
                    memo: 'I am a memo!',
                    receiver: 'markaccount',
                    sender: 'agoric1jmd7lwdyykrxm5h83nlhg74fctwnky04ufpqtc',
                  },
                  'expected transfer packet',
                );
                resolver.resolve(JSON.stringify({ result: 'AQ==' }));
              } else {
                t.deepEqual(
                  packet,
                  {
                    amount: '100000000000000000001',
                    denom: 'portdef/chanabc/uatom',
                    memo: '',
                    receiver: 'markaccount',
                    sender: 'pegasus',
                  },
                  'expected transfer packet',
                );
                resolver.resolve(JSON.stringify({ result: 'AQ==' }));
              }
              return vow;
            },
          });
        },
      }),
    )
    .catch(e => t.fail(e));

  // Pretend we're Agoric.
  const { handler: chandler, subscription: connectionSubscription } =
    await E(pegasus).makePegasusConnectionKit();
  const connP = when(E(portP).connect(portName, chandler));

  // Get some local Atoms.
  const sendPacket = {
    amount: '200000000000000000002',
    denom: 'uatom',
    receiver: '0x1234',
    sender: 'FIXME:sender',
  };
  t.assert(await connP);
  const sendAckDataP = E(gaiaConnection).send(JSON.stringify(sendPacket));

  // Note that we can create the peg after the fact.
  const connectionAit = makeAsyncIteratorFromSubscription(
    connectionSubscription,
  );
  const {
    value: {
      actions: pegConnActions,
      localAddr,
      remoteAddr,
      remoteDenomSubscription,
    },
  } = await connectionAit.next();

  // Check the connection metadata.
  t.is(localAddr, '/ibc-channel/chanabc/ibc-port/portdef/nonce/1', 'localAddr');
  t.is(
    remoteAddr,
    '/ibc-channel/chanabc/ibc-port/portdef/nonce/2',
    'remoteAddr',
  );

  // Find the first remoteDenom.
  const remoteDenomAit = makeAsyncIteratorFromSubscription(
    remoteDenomSubscription,
  );
  t.deepEqual(await remoteDenomAit.next(), { done: false, value: 'uatom' });

  const pegP = E(pegConnActions).pegRemote('Gaia', 'uatom');
  const localBrand = await E(pegP).getLocalBrand();
  const localIssuerP = E(pegasus).getLocalIssuer(localBrand);

  const localPurseP = E(localIssuerP).makeEmptyPurse();
  resolveLocalDepositFacet(E(localPurseP).getDepositFacet());

  const sendAckData = await when(sendAckDataP);
  const sendAck = JSON.parse(sendAckData);
  t.deepEqual(sendAck, { result: 'AQ==' }, 'Gaia sent the atoms');
  if (!sendAck.result) {
    console.log(sendAckData, sendAck.error);
  }

  const localAtomsAmount = await E(localPurseP).getCurrentAmount();
  t.deepEqual(
    localAtomsAmount,
    { brand: localBrand, value: 200000000000000000002n },
    'we received the shadow atoms',
  );

  const sendPacket2 = {
    amount: '170',
    denom: 'uatom',
    receiver: 'agoric1234567',
    sender: 'FIXME:sender2',
  };

  const sendAckData2 = await when(
    E(gaiaConnection).send(JSON.stringify(sendPacket2)),
  );
  const sendAck2 = JSON.parse(sendAckData2);
  t.deepEqual(sendAck2, { result: 'AQ==' }, 'Gaia sent more atoms');
  if (!sendAck2.result) {
    console.log(sendAckData2, sendAck2.error);
  }

  const localAtomsAmount2 = await E(localPurseP).getCurrentAmount();
  t.deepEqual(
    localAtomsAmount2,
    { brand: localBrand, value: 200000000000000000172n },
    'we received more shadow atoms',
  );

  const sendPacket3 = {
    amount: '13',
    denom: 'umuon',
    receiver: 'agoric1234567',
    sender: 'FIXME:sender4',
  };
  const sendAckData3P = E(gaiaConnection).send(JSON.stringify(sendPacket3));

  // Wait for the packet to go through.
  t.deepEqual(await remoteDenomAit.next(), { done: false, value: 'umuon' });
  E(pegConnActions)
    .rejectTransfersWaitingForPegRemote('umuon')
    .catch(e => t.fail(e));

  const sendAckData3 = await when(sendAckData3P);
  const sendAck3 = JSON.parse(sendAckData3);
  t.deepEqual(
    sendAck3,
    { error: 'Error: "umuon" is temporarily unavailable' },
    'rejecting transfers works',
  );

  // test sending with memo
  const localAtoms = await E(localPurseP).withdraw({
    brand: localBrand,
    value: 100000000000000000001n,
  });

  const allegedName = await E(pegP).getAllegedName();
  t.is(allegedName, 'Gaia', 'alleged peg name is equal');
  const transferInvitation = await E(pegasus).makeInvitationToTransfer(
    pegP,
    'markaccount',
    'I am a memo!',
    { sender: 'agoric1jmd7lwdyykrxm5h83nlhg74fctwnky04ufpqtc' },
  );
  const seat = await E(zoe).offer(
    transferInvitation,
    {
      give: { Transfer: { brand: localBrand, value: 100000000000000000001n } },
    },
    { Transfer: localAtoms },
  );
  const outcome = await seat.getOfferResult();
  t.is(outcome, undefined, 'transfer is successful');

  const paymentPs = await seat.getPayouts();
  const refundAmount = await E(localIssuerP).getAmountOf(paymentPs.Transfer);

  const isEmptyRefund = AmountMath.isEmpty(refundAmount, localBrand);
  t.assert(isEmptyRefund, 'no refund from success');

  const stillIsLive = await E(localIssuerP).isLive(localAtoms);
  t.assert(!stillIsLive, 'payment is consumed');

  // test sending without memo
  const localAtoms2 = await E(localPurseP).withdraw({
    brand: localBrand,
    value: 100000000000000000001n,
  });

  const transferInvitation2 = await E(pegasus).makeInvitationToTransfer(
    pegP,
    'markaccount',
  );
  const seat2 = await E(zoe).offer(
    transferInvitation2,
    {
      give: { Transfer: { brand: localBrand, value: 100000000000000000001n } },
    },
    { Transfer: localAtoms2 },
  );
  const outcome2 = await seat2.getOfferResult();
  t.is(outcome2, undefined, 'transfer is successful');

  const paymentPs2 = await seat2.getPayouts();
  const refundAmount2 = await E(localIssuerP).getAmountOf(paymentPs2.Transfer);

  const isEmptyRefund2 = AmountMath.isEmpty(refundAmount2, localBrand);
  t.assert(isEmptyRefund2, 'no refund from success');

  const stillIsLive2 = await E(localIssuerP).isLive(localAtoms2);
  t.assert(!stillIsLive2, 'payment is consumed');

  await E(connP).close();
  await t.throwsAsync(async () => remoteDenomAit.next(), {
    message: 'pegasusConnectionHandler closed',
  });
}

test('remote peg', async t => testRemotePeg(t));
