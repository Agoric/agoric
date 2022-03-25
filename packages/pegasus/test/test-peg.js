import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import path from 'path';
import { E } from '@endo/eventual-send';
import {
  makeNetworkProtocol,
  makeLoopbackProtocolHandler,
} from '@agoric/swingset-vat/src/vats/network/index.js';

import bundleSource from '@endo/bundle-source';
import { AmountMath } from '@agoric/ertp';
import { makeZoeKit } from '@agoric/zoe';

import fakeVatAdmin from '@agoric/zoe/tools/fakeVatAdmin.js';
import { Far } from '@endo/marshal';
import { makeSubscription } from '@agoric/notifier';

import '@agoric/ertp/exported.js';
import { makePromiseKit } from '@endo/promise-kit';

const filename = new URL(import.meta.url).pathname;
const dirname = path.dirname(filename);

const contractPath = `${dirname}/../src/pegasus.js`;

/**
 * @template T
 * @param {ERef<Subscription<T>>} sub
 * @returns {AsyncIterator<T, T>}
 */
const makeAsyncIteratorFromSubscription = sub =>
  makeSubscription(E(sub).getSharableSubscriptionInternals())[
    Symbol.asyncIterator
  ]();

/** @param {import('ava').Assertions} t */
async function testRemotePeg(t) {
  t.plan(20);

  /** @type {PromiseRecord<import('@agoric/ertp').DepositFacet>} */
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

  const { zoeService: zoe } = makeZoeKit(fakeVatAdmin);

  // Pack the contract.
  const contractBundle = await bundleSource(contractPath);
  const installationHandle = await E(zoe).install(contractBundle);

  const { publicFacet: publicAPI } = await E(zoe).startInstance(
    installationHandle,
    {},
    { board: fakeBoard, namesByAddress: fakeNamesByAddress },
  );

  /** @type {import('../src/pegasus').Pegasus} */
  const pegasus = publicAPI;
  const network = makeNetworkProtocol(makeLoopbackProtocolHandler());

  const portP = E(network).bind('/ibc-channel/chanabc/ibc-port/portdef');
  const portName = await E(portP).getLocalAddress();

  /**
   * Pretend we're Gaia.
   *
   * @type {?import('@agoric/swingset-vat/src/vats/network').Connection}
   */
  let gaiaConnection;
  E(portP).addListener(
    Far('acceptor', {
      async onAccept(_p, _localAddr, _remoteAddr) {
        return Far('handler', {
          async onOpen(c) {
            gaiaConnection = c;
          },
          async onReceive(_c, packetBytes) {
            const packet = JSON.parse(packetBytes);
            t.deepEqual(
              packet,
              {
                amount: '100000000000000000001',
                denom: 'portdef/chanabc/uatom',
                receiver: 'markaccount',
                sender: 'pegasus',
              },
              'expected transfer packet',
            );
            return JSON.stringify({ result: 'AQ==' });
          },
        });
      },
    }),
  );

  // Pretend we're Agoric.
  const { handler: chandler, subscription: connectionSubscription } = await E(
    pegasus,
  ).makePegasusConnectionKit();
  const connP = E(portP).connect(portName, chandler);

  // Get some local Atoms.
  const sendPacket = {
    amount: '100000000000000000001',
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

  const sendAckData = await sendAckDataP;
  const sendAck = JSON.parse(sendAckData);
  t.deepEqual(sendAck, { result: 'AQ==' }, 'Gaia sent the atoms');
  if (!sendAck.result) {
    console.log(sendAckData, sendAck.error);
  }

  const localAtomsAmount = await E(localPurseP).getCurrentAmount();
  t.deepEqual(
    localAtomsAmount,
    { brand: localBrand, value: 100000000000000000001n },
    'we received the shadow atoms',
  );

  const sendPacket2 = {
    amount: '170',
    denom: 'uatom',
    receiver: 'agoric1234567',
    sender: 'FIXME:sender2',
  };

  const sendAckData2 = await E(gaiaConnection).send(
    JSON.stringify(sendPacket2),
  );
  const sendAck2 = JSON.parse(sendAckData2);
  t.deepEqual(sendAck2, { result: 'AQ==' }, 'Gaia sent more atoms');
  if (!sendAck2.result) {
    console.log(sendAckData2, sendAck2.error);
  }

  const localAtomsAmount2 = await E(localPurseP).getCurrentAmount();
  t.deepEqual(
    localAtomsAmount2,
    { brand: localBrand, value: 100000000000000000171n },
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
  E(pegConnActions).rejectTransfersWaitingForPegRemote('umuon');

  const sendAckData3 = await sendAckData3P;
  const sendAck3 = JSON.parse(sendAckData3);
  t.deepEqual(
    sendAck3,
    { error: 'Error: "umuon" is temporarily unavailable' },
    'rejecting transfers works',
  );

  const localAtoms = await E(localPurseP).withdraw(localAtomsAmount);

  const allegedName = await E(pegP).getAllegedName();
  t.is(allegedName, 'Gaia', 'alleged peg name is equal');
  const transferInvitation = await E(pegasus).makeInvitationToTransfer(
    pegP,
    'markaccount',
  );
  const seat = await E(zoe).offer(
    transferInvitation,
    {
      give: { Transfer: localAtomsAmount },
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

  await E(connP).close();
  await t.throwsAsync(() => remoteDenomAit.next(), {
    message: 'pegasusConnectionHandler closed',
  });
}

test('remote peg', t => testRemotePeg(t));
