// The purpose of this test file is to demonstrate
// https://github.com/Agoric/agoric-sdk/issues/9377
// as the `test.serial.failing` test at the end.

// eslint-disable-next-line import/order
import {
  test,
  getBaggage,
  annihilate,
  nextLife,
} from './prepare-test-env-ava.js';

import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import { prepareVowTools } from '@agoric/vow';
import { makeDurableZone } from '@agoric/zone/durable.js';

import { prepareTestAsyncFlowTools } from './_utils.js';

/**
 * @import {Zone} from '@agoric/base-zone'
 */

const neverSettlesP = new Promise(() => {});

/**
 * @param {any} t
 * @param {Zone} zone
 */
const testPlay1 = async (t, zone) => {
  const vowTools = prepareVowTools(zone);
  const { asyncFlow } = prepareTestAsyncFlowTools(t, zone, {
    vowTools,
  });

  const guestFunc = async () => neverSettlesP;

  const wrapperFunc = asyncFlow(zone, 'guestFunc', guestFunc);

  wrapperFunc();
  t.pass();
};

/**
 * @param {any} t
 * @param {Zone} zone
 */
const testPlay2 = async (t, zone) => {
  const vowTools = prepareVowTools(zone);
  const { asyncFlow } = prepareTestAsyncFlowTools(t, zone, {
    vowTools,
  });

  const guestFunc = async () => neverSettlesP;

  t.notThrows(() => asyncFlow(zone, 'guestFunc', guestFunc));
};

/**
 * @param {any} t
 * @param {Zone} zone
 */
const testPlay3 = async (t, zone) => {
  const vowTools = prepareVowTools(zone);
  const { asyncFlow, allWokenP } = prepareTestAsyncFlowTools(t, zone, {
    vowTools,
  });

  await null;

  const guestFunc = async () => neverSettlesP;
  t.notThrows(() => asyncFlow(zone, 'guestFunc', guestFunc));
  t.notThrowsAsync(
    async () => allWokenP,
    'will actually throw due to crank bug #9377',
  );
};

test.serial('test durable first-crank hazard 1', async t => {
  annihilate();
  const zone1 = makeDurableZone(getBaggage(), 'durableRoot');
  await testPlay1(t, zone1);

  await eventLoopIteration();
});

test.serial('test durable first-crank hazard 2', async t => {
  nextLife();
  const zone2 = makeDurableZone(getBaggage(), 'durableRoot');
  await testPlay2(t, zone2);

  await eventLoopIteration();
});

test.serial.failing('test durable first-crank hazard 3', async t => {
  nextLife();
  const zone3 = makeDurableZone(getBaggage(), 'durableRoot');
  await testPlay3(t, zone3);

  return eventLoopIteration();
});
