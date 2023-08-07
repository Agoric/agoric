import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { subscribeEach, makePublishKit } from '@agoric/notifier';
import { buildManualTimer } from '@agoric/swingset-vat/tools/manual-timer.js';
import { TimeMath } from '@agoric/time';
import { setupZCFTest } from '@agoric/zoe/test/unitTests/zcf/setupZcfTest.js';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import { objectMap } from '@agoric/internal';
import { makeScalarBigMapStore } from '@agoric/vat-data';
import { prepareRecorderKitMakers } from '@agoric/zoe/src/contractSupport/index.js';
import { makeFakeBoard } from '@agoric/vats/tools/board-utils.js';

import {
  makeAuctioneerParamManager,
  makeAuctioneerParams,
} from '../../src/auction/params.js';
import { makeScheduler } from '../../src/auction/scheduler.js';
import { subscriptionTracker } from '../metrics.js';
import {
  getInvitation,
  makeDefaultParams,
  makeFakeAuctioneer,
  setUpInstallations,
} from './tools.js';
import { makeMockChainStorageRoot } from '../supports.js';

const setupScheduleTest = async (
  t,
  customParams,
  startTime = 0n,
  child = '',
) => {
  const { zcf, zoe } = await setupZCFTest();

  const installations = await setUpInstallations(zoe);
  // @ts-expect-error This  used to work. What's wrong now?
  /** @type {TimerService & { advanceTo: (when: Timestamp) => bigint }} */
  const timer = buildManualTimer();
  const timerBrand = await timer.getTimerBrand();

  const fakeAuctioneer = makeFakeAuctioneer();
  const { fakeInvitationPayment } = await getInvitation(zoe, installations);

  const marshaller = makeFakeBoard().getReadonlyMarshaller();
  const baggage = makeScalarBigMapStore('baggage');
  const { makeRecorderKit } = prepareRecorderKitMakers(baggage, marshaller);
  const storageNode = makeMockChainStorageRoot();

  let recorderKit;
  if (child) {
    recorderKit = makeRecorderKit(storageNode.makeChildNode(child));
  } else {
    recorderKit = makeRecorderKit(storageNode);
  }

  const scheduleTracker = await subscriptionTracker(
    t,
    subscribeEach(recorderKit.subscriber),
  );

  const defaultParams = makeDefaultParams(fakeInvitationPayment, timerBrand);
  /** @type {import('../../src/auction/params.js').AuctionParams} */
  // @ts-expect-error ignore missing values for test
  const paramValues = objectMap(
    makeAuctioneerParams({ ...defaultParams, ...customParams }),
    r => r.value,
  );

  if (startTime) {
    await timer.advanceTo(startTime);
  }

  const paramManager = await makeAuctioneerParamManager(
    recorderKit,
    zcf,
    makeScalarBigMapStore('baggage'),
    paramValues,
  );

  const { subscriber } = makePublishKit();
  const { behavior: params } = await paramManager.accessors();
  const scheduler = await makeScheduler(
    fakeAuctioneer,
    timer,
    params,
    timer.getTimerBrand(),
    recorderKit.recorder,
    subscriber,
  );
  return {
    zoe,
    zcf,
    timer,
    fakeAuctioneer,
    scheduleTracker,
    scheduler,
    paramManager,
    installations,
    storageNode,
    makeRecorderKit,
  };
};

test('schedule start to finish', async t => {
  // at 0: capturePrice, at 1: 1st step, at 3: 2nd step,
  // at 5: 3rd step, reset price, set final
  const customParams = {
    AuctionStartDelay: 1n,
    StartFrequency: 10n,
    PriceLockPeriod: 5n,
  };
  const { timer, fakeAuctioneer, scheduleTracker, scheduler } =
    await setupScheduleTest(t, customParams, 127n);
  const timerBrand = await timer.getTimerBrand();
  const schedule = scheduler.getSchedule();
  let now = timer.getCurrentTimestamp();

  t.deepEqual(schedule.liveAuctionSchedule, null);
  const firstSchedule = {
    startTime: TimeMath.coerceTimestampRecord(131n, timerBrand),
    endTime: TimeMath.coerceTimestampRecord(135n, timerBrand),
    steps: 2n,
    endRate: 6500n,
    startDelay: TimeMath.coerceRelativeTimeRecord(1n, timerBrand),
    clockStep: TimeMath.coerceRelativeTimeRecord(2n, timerBrand),
    lockTime: TimeMath.coerceTimestampRecord(126n, timerBrand),
  };
  t.deepEqual(schedule.nextAuctionSchedule, firstSchedule);

  const relative = time => TimeMath.coerceRelativeTimeRecord(time, timerBrand);

  t.false(fakeAuctioneer.getState().final);
  t.is(fakeAuctioneer.getState().step, 0);
  t.false(fakeAuctioneer.getState().capturedPrices);

  // :08
  now = await timer.advanceTo(TimeMath.addAbsRel(now, 1n));

  t.is(fakeAuctioneer.getState().step, 0);
  t.false(fakeAuctioneer.getState().final);
  t.false(fakeAuctioneer.getState().capturedPrices);

  await scheduleTracker.assertLike({
    current: {
      AuctionStartDelay: {
        type: 'relativeTime',
        value: relative(customParams.AuctionStartDelay),
      },
      PriceLockPeriod: {
        type: 'relativeTime',
        value: relative(customParams.PriceLockPeriod),
      },
      StartFrequency: {
        type: 'relativeTime',
        value: relative(customParams.StartFrequency),
      },
    },
  });
  await scheduleTracker.assertChange({
    activeStartTime: null,
    current: undefined,
    nextDescendingStepTime: TimeMath.coerceTimestampRecord(131n, timerBrand),
    nextStartTime: TimeMath.coerceTimestampRecord(131n, timerBrand),
  });

  // XX:00
  now = await timer.advanceTo(130n);
  await eventLoopIteration();
  t.is(fakeAuctioneer.getState().step, 0);
  t.false(fakeAuctioneer.getState().final);
  t.true(fakeAuctioneer.getState().capturedPrices);
  await scheduleTracker.assertChange({
    activeStartTime: TimeMath.coerceTimestampRecord(131n, timerBrand),
    nextStartTime: { absValue: 141n },
  });

  // XX:01
  now = await timer.advanceTo(TimeMath.addAbsRel(now, 1n));
  await scheduleTracker.assertChange({
    nextDescendingStepTime: { absValue: 133n },
  });

  const schedule2 = scheduler.getSchedule();
  t.deepEqual(schedule2.liveAuctionSchedule, firstSchedule);
  t.deepEqual(schedule2.nextAuctionSchedule, {
    startTime: TimeMath.coerceTimestampRecord(141n, timerBrand),
    endTime: TimeMath.coerceTimestampRecord(145n, timerBrand),
    steps: 2n,
    endRate: 6500n,
    startDelay: TimeMath.coerceRelativeTimeRecord(1n, timerBrand),
    clockStep: TimeMath.coerceRelativeTimeRecord(2n, timerBrand),
    lockTime: TimeMath.coerceTimestampRecord(136, timerBrand),
  });

  t.is(fakeAuctioneer.getState().step, 1);
  t.false(fakeAuctioneer.getState().final);
  t.true(fakeAuctioneer.getState().capturedPrices);

  // XX:03
  now = await timer.advanceTo(now + 2n);
  await scheduleTracker.assertChange({
    nextDescendingStepTime: { absValue: 135n },
  });

  t.is(fakeAuctioneer.getState().step, 2);
  t.false(fakeAuctioneer.getState().final);
  t.true(fakeAuctioneer.getState().capturedPrices);

  // XX:05  final step
  now = await timer.advanceTo(now + 2n);
  await scheduleTracker.assertChange({
    activeStartTime: null,
    nextDescendingStepTime: { absValue: 141n },
  });

  t.is(fakeAuctioneer.getState().step, 3);
  t.true(fakeAuctioneer.getState().final);
  t.false(fakeAuctioneer.getState().capturedPrices);

  // XX:07 Auction finished, nothing else happens
  now = await timer.advanceTo(now + 2n);
  t.is(fakeAuctioneer.getState().step, 3);
  t.true(fakeAuctioneer.getState().final);
  t.false(fakeAuctioneer.getState().capturedPrices);
  t.deepEqual(fakeAuctioneer.getStartRounds(), [0]);

  const finalSchedule = scheduler.getSchedule();
  t.deepEqual(finalSchedule.liveAuctionSchedule, null);
  const secondSchedule = {
    startTime: TimeMath.coerceTimestampRecord(141n, timerBrand),
    endTime: TimeMath.coerceTimestampRecord(145n, timerBrand),
    steps: 2n,
    endRate: 6500n,
    startDelay: TimeMath.coerceRelativeTimeRecord(1n, timerBrand),
    clockStep: TimeMath.coerceRelativeTimeRecord(2n, timerBrand),
    lockTime: TimeMath.coerceTimestampRecord(136n, timerBrand),
  };
  t.deepEqual(finalSchedule.nextAuctionSchedule, secondSchedule);

  now = await timer.advanceTo(140n);
  await scheduleTracker.assertChange({
    activeStartTime: TimeMath.coerceTimestampRecord(141n, timerBrand),
    nextStartTime: { absValue: 151n },
  });

  t.deepEqual(finalSchedule.liveAuctionSchedule, null);
  t.deepEqual(finalSchedule.nextAuctionSchedule, secondSchedule);
  t.true(fakeAuctioneer.getState().capturedPrices);

  t.is(fakeAuctioneer.getState().step, 3);
  t.true(fakeAuctioneer.getState().final);
  t.true(fakeAuctioneer.getState().capturedPrices);
  t.deepEqual(fakeAuctioneer.getStartRounds(), [0]);

  // XX:01
  now = await timer.advanceTo(now + 1n);

  const schedule3 = scheduler.getSchedule();
  t.deepEqual(schedule3.liveAuctionSchedule, secondSchedule);
  t.deepEqual(schedule3.nextAuctionSchedule, {
    startTime: TimeMath.coerceTimestampRecord(151n, timerBrand),
    endTime: TimeMath.coerceTimestampRecord(155n, timerBrand),
    steps: 2n,
    endRate: 6500n,
    startDelay: TimeMath.coerceRelativeTimeRecord(1n, timerBrand),
    clockStep: TimeMath.coerceRelativeTimeRecord(2n, timerBrand),
    lockTime: TimeMath.coerceTimestampRecord(146n, timerBrand),
  });

  await scheduleTracker.assertChange({
    nextDescendingStepTime: { absValue: 143n },
  });

  t.is(fakeAuctioneer.getState().step, 4);
  t.false(fakeAuctioneer.getState().final);
  t.true(fakeAuctioneer.getState().capturedPrices);
  t.deepEqual(fakeAuctioneer.getStartRounds(), [0, 3]);

  // XX:03
  now = await timer.advanceTo(now + 2n);
  await scheduleTracker.assertChange({
    nextDescendingStepTime: { absValue: 145n },
  });

  t.is(fakeAuctioneer.getState().step, 5);
  t.false(fakeAuctioneer.getState().final);
  t.true(fakeAuctioneer.getState().capturedPrices);

  // XX:05   final step
  now = await timer.advanceTo(now + 2n);

  t.is(fakeAuctioneer.getState().step, 6);
  t.true(fakeAuctioneer.getState().final);
  t.false(fakeAuctioneer.getState().capturedPrices);

  // XX:08  Auction finished, nothing else happens
  now = await timer.advanceTo(now + 1n);
  // XX:09  Auction finished, nothing else happens
  await timer.advanceTo(now + 1n);

  await scheduleTracker.assertChange({
    activeStartTime: null,
    nextDescendingStepTime: { absValue: 151n },
  });

  t.is(fakeAuctioneer.getState().step, 6);
  t.true(fakeAuctioneer.getState().final);
  t.false(fakeAuctioneer.getState().capturedPrices);

  t.deepEqual(fakeAuctioneer.getStartRounds(), [0, 3]);
});

test('lowest >= starting', async t => {
  const customParams = {
    LowestRate: 110n,
    StartingRate: 105n,
  };
  const { scheduler } = await setupScheduleTest(t, customParams, 127n);

  t.is(scheduler.getSchedule().nextAuctionSchedule, null);
});

test('zero time for auction', async t => {
  const customParams = {
    StartFrequency: 2n,
    ClockStep: 3n,
    AuctionStartDelay: 1n,
    PriceLockPeriod: 1n,
  };
  const { scheduler } = await setupScheduleTest(t, customParams, 127n);

  t.is(scheduler.getSchedule().nextAuctionSchedule, null);
});

test('discountStep 0', async t => {
  const customParams = {
    DiscountStep: 0n,
  };
  const { scheduler } = await setupScheduleTest(t, customParams, 127n);

  t.is(scheduler.getSchedule().nextAuctionSchedule, null);
});

test('discountStep larger than starting rate', async t => {
  const customParams = {
    StartingRate: 10100n,
    DiscountStep: 10500n,
  };
  const { scheduler } = await setupScheduleTest(t, customParams, 127n);

  t.is(scheduler.getSchedule().nextAuctionSchedule, null);
});

test('start Freq 0', async t => {
  const customParams = {
    StartFrequency: 0n,
  };
  const { scheduler } = await setupScheduleTest(t, customParams, 127n);

  t.is(scheduler.getSchedule().nextAuctionSchedule, null);
});

test('delay > freq', async t => {
  const customParams = {
    AuctionStartDelay: 40n,
    StartFrequency: 20n,
  };
  const { scheduler } = await setupScheduleTest(t, customParams, 127n);

  t.is(scheduler.getSchedule().nextAuctionSchedule, null);
});

test('lockPeriod > freq', async t => {
  const customParams = {
    PriceLockPeriod: 7200n,
    StartFrequency: 3600n,
    AuctionStartDelay: 500n,
  };
  const { scheduler } = await setupScheduleTest(t, customParams, 127n);
  t.is(scheduler.getSchedule().nextAuctionSchedule, null);
});

// if duration = frequency, we'll cut the duration short to fit.
test('duration = freq', async t => {
  // start hourly, request 6 steps down every 10 minutes, so duration would be
  // 1 hour. Instead, cut the auction short.
  const customParams = {
    PriceLockPeriod: 20n,
    StartFrequency: 360n,
    AuctionStartDelay: 5n,
    ClockStep: 60n,
    StartingRate: 100n,
    LowestRate: 40n,
    DiscountStep: 10n,
  };
  const { timer, scheduler } = await setupScheduleTest(t, customParams, 127n);
  const timerBrand = await timer.getTimerBrand();
  let schedule = scheduler.getSchedule();

  t.deepEqual(schedule.liveAuctionSchedule, null);
  const firstSchedule = {
    startTime: TimeMath.coerceTimestampRecord(365n, timerBrand),
    endTime: TimeMath.coerceTimestampRecord(665n, timerBrand),
    steps: 5n,
    endRate: 50n,
    startDelay: TimeMath.coerceRelativeTimeRecord(5n, timerBrand),
    clockStep: TimeMath.coerceRelativeTimeRecord(60n, timerBrand),
    lockTime: TimeMath.coerceTimestampRecord(345n, timerBrand),
  };
  t.deepEqual(schedule.nextAuctionSchedule, firstSchedule);

  await timer.advanceTo(345n);
  await timer.advanceTo(365n);
  await timer.advanceTo(665n);
  schedule = scheduler.getSchedule();

  const secondSchedule = {
    startTime: TimeMath.coerceTimestampRecord(725n, timerBrand),
    endTime: TimeMath.coerceTimestampRecord(1025n, timerBrand),
    steps: 5n,
    endRate: 50n,
    startDelay: TimeMath.coerceRelativeTimeRecord(5n, timerBrand),
    clockStep: TimeMath.coerceRelativeTimeRecord(60n, timerBrand),
    lockTime: TimeMath.coerceTimestampRecord(705n, timerBrand),
  };
  t.deepEqual(schedule.nextAuctionSchedule, secondSchedule);
});

test('change Schedule', async t => {
  const startFreq = 360n;
  const lockPeriodT = 20n;
  const startDelayT = 5n;
  const clockStep = 60n;

  // start hourly, request 6 steps down every 10 minutes, so duration would be
  // 1 hour. Instead, cut the auction short.
  const customParams = {
    PriceLockPeriod: lockPeriodT,
    StartFrequency: startFreq,
    AuctionStartDelay: startDelayT,
    ClockStep: clockStep,
    StartingRate: 100n,
    LowestRate: 40n,
    DiscountStep: 10n,
  };
  const { timer, scheduler, paramManager } = await setupScheduleTest(
    t,
    customParams,
    127n,
  );
  const timerBrand = await timer.getTimerBrand();
  const lockPeriod = TimeMath.coerceRelativeTimeRecord(lockPeriodT, timerBrand);
  const startDelay = TimeMath.coerceRelativeTimeRecord(startDelayT, timerBrand);

  let schedule = scheduler.getSchedule();
  t.is(schedule.liveAuctionSchedule, null);

  const lockTime = 345n;
  const nominalStartTime = 360n;
  const startTime = 365n;
  const endTime = 665n;

  const firstSchedule = {
    startTime: TimeMath.coerceTimestampRecord(startTime, timerBrand),
    endTime: TimeMath.coerceTimestampRecord(endTime, timerBrand),
    steps: 5n,
    endRate: 50n,
    startDelay,
    clockStep: TimeMath.coerceRelativeTimeRecord(60n, timerBrand),
    lockTime: TimeMath.coerceTimestampRecord(lockTime, timerBrand),
  };
  t.deepEqual(schedule.nextAuctionSchedule, firstSchedule);

  await timer.advanceTo(lockTime);
  await timer.advanceTo(nominalStartTime);
  await timer.advanceTo(startTime);
  await timer.advanceTo(endTime);
  schedule = scheduler.getSchedule();

  const secondStart = startTime + startFreq;
  const secondNominalStart = startTime + startFreq - startDelayT;
  const secondEnd = endTime + startFreq;
  const expected2ndSchedule = {
    startTime: TimeMath.coerceTimestampRecord(secondStart, timerBrand),
    endTime: TimeMath.coerceTimestampRecord(secondEnd, timerBrand),
    steps: 5n,
    endRate: 50n,
    startDelay,
    clockStep: TimeMath.coerceRelativeTimeRecord(60n, timerBrand),
    lockTime: TimeMath.coerceTimestampRecord(
      secondStart - lockPeriodT,
      timerBrand,
    ),
  };
  t.deepEqual(schedule.nextAuctionSchedule, expected2ndSchedule);

  const newFreq = 100n;
  const newStep = 40n;
  await paramManager.updateParams({
    StartFrequency: TimeMath.coerceRelativeTimeRecord(newFreq, timerBrand),
    ClockStep: TimeMath.coerceRelativeTimeRecord(newStep, timerBrand),
  });

  await timer.advanceTo(expected2ndSchedule.lockTime);
  schedule = scheduler.getSchedule();
  t.deepEqual(schedule.nextAuctionSchedule, expected2ndSchedule);

  const remainder = (secondEnd + newFreq) % newFreq;
  const thirdStartT = secondEnd + newFreq - remainder + startDelayT;
  const thirdStart = TimeMath.coerceTimestampRecord(thirdStartT, timerBrand);

  await timer.advanceTo(secondNominalStart);
  await timer.advanceTo(secondStart);

  assert(schedule.nextAuctionSchedule);
  const thirdLock = TimeMath.subtractAbsRel(thirdStart, lockPeriod);
  const thirdStep = TimeMath.coerceRelativeTimeRecord(40n, timerBrand);
  const thirdNominalStart = TimeMath.subtractAbsRel(thirdStart, startDelay);
  const thirdEnd = TimeMath.addAbsRel(
    thirdStart,
    TimeMath.addRelRel(thirdStep, thirdStep),
  );
  const thirdEndT = thirdEnd.absValue;

  const expected3rdSchedule = {
    startTime: TimeMath.coerceTimestampRecord(thirdStart, timerBrand),
    endTime: TimeMath.coerceTimestampRecord(thirdEnd, timerBrand),
    steps: 2n,
    endRate: 80n,
    startDelay,
    clockStep: thirdStep,
    lockTime: thirdLock,
  };

  schedule = scheduler.getSchedule();
  t.deepEqual(schedule.nextAuctionSchedule, expected3rdSchedule);

  schedule = scheduler.getSchedule();
  t.deepEqual(schedule.liveAuctionSchedule, expected2ndSchedule);

  await timer.advanceTo(secondStart + newStep);
  await timer.advanceTo(secondStart + 2n * newStep);
  await timer.advanceTo(expected2ndSchedule.endTime);
  schedule = scheduler.getSchedule();
  t.deepEqual(schedule.nextAuctionSchedule, expected3rdSchedule);

  await timer.advanceTo(thirdLock);
  schedule = scheduler.getSchedule();
  t.deepEqual(schedule.nextAuctionSchedule, expected3rdSchedule);
  await timer.advanceTo(thirdNominalStart);

  const fourthRemainder = (thirdEndT + newFreq) % newFreq;
  const fourthStartT = thirdEndT + newFreq - fourthRemainder + startDelayT;
  const fourthStart = TimeMath.coerceTimestampRecord(fourthStartT, timerBrand);

  await timer.advanceTo(thirdStart);

  assert(schedule.nextAuctionSchedule);
  const fourthLock = TimeMath.subtractAbsRel(fourthStart, lockPeriod);
  const fourthStep = TimeMath.coerceRelativeTimeRecord(40n, timerBrand);
  const fourthEnd = TimeMath.addAbsRel(
    fourthStart,
    TimeMath.addRelRel(fourthStep, fourthStep),
  );

  const expected4thSchedule = {
    startTime: TimeMath.coerceTimestampRecord(fourthStart, timerBrand),
    endTime: TimeMath.coerceTimestampRecord(fourthEnd, timerBrand),
    steps: 2n,
    endRate: 80n,
    startDelay,
    clockStep: fourthStep,
    lockTime: fourthLock,
  };

  await timer.advanceTo(TimeMath.addAbsRel(thirdStart, newStep));
  await timer.advanceTo(expected3rdSchedule.endTime);
  schedule = scheduler.getSchedule();
  t.deepEqual(schedule.nextAuctionSchedule, expected4thSchedule);
});

test('change Schedule late', async t => {
  // start hourly, request 6 steps down every 10 minutes, so duration would be
  // 1 hour. Instead, cut the auction short.
  const startFreq = 360n;
  const lockPeriodT = 20n;
  const startDelayT = 5n;
  const clockStep = 60n;
  const customParams = {
    PriceLockPeriod: lockPeriodT,
    StartFrequency: startFreq,
    AuctionStartDelay: startDelayT,
    ClockStep: clockStep,
    StartingRate: 100n,
    LowestRate: 40n,
    DiscountStep: 10n,
  };
  const { timer, paramManager, scheduler } = await setupScheduleTest(
    t,
    customParams,
    127n,
  );
  const timerBrand = await timer.getTimerBrand();
  let schedule = scheduler.getSchedule();

  const lockPeriod = TimeMath.coerceRelativeTimeRecord(lockPeriodT, timerBrand);
  const startDelay = TimeMath.coerceRelativeTimeRecord(startDelayT, timerBrand);

  await eventLoopIteration();

  t.is(schedule.liveAuctionSchedule, null);

  const lockTime = 345n;
  const nominalStartTime = 360n;
  const startTime = 365n;
  const endTime = 665n;

  const firstSchedule = {
    startTime: TimeMath.coerceTimestampRecord(startTime, timerBrand),
    endTime: TimeMath.coerceTimestampRecord(endTime, timerBrand),
    steps: 5n,
    endRate: 50n,
    startDelay,
    clockStep: TimeMath.coerceRelativeTimeRecord(60n, timerBrand),
    lockTime: TimeMath.coerceTimestampRecord(lockTime, timerBrand),
  };
  t.deepEqual(schedule.nextAuctionSchedule, firstSchedule);

  await timer.advanceTo(lockTime);
  await eventLoopIteration();
  await timer.advanceTo(nominalStartTime);
  await eventLoopIteration();
  await timer.advanceTo(startTime);
  await eventLoopIteration();
  schedule = scheduler.getSchedule();
  t.deepEqual(schedule.liveAuctionSchedule, firstSchedule);
  await timer.advanceTo(endTime);
  await eventLoopIteration();
  schedule = scheduler.getSchedule();
  t.deepEqual(schedule.liveAuctionSchedule, null);

  const secondStart = startTime + startFreq; // 725
  const secondNominalStart = startTime + startFreq - startDelayT;
  const secondEnd = endTime + startFreq;
  const expected2ndSchedule = {
    startTime: TimeMath.coerceTimestampRecord(secondStart, timerBrand),
    endTime: TimeMath.coerceTimestampRecord(secondEnd, timerBrand),
    steps: 5n,
    endRate: 50n,
    startDelay,
    clockStep: TimeMath.coerceRelativeTimeRecord(60n, timerBrand),
    lockTime: TimeMath.coerceTimestampRecord(
      secondStart - lockPeriodT,
      timerBrand,
    ),
  };
  t.deepEqual(schedule.nextAuctionSchedule, expected2ndSchedule);

  await timer.advanceTo(expected2ndSchedule.lockTime.absValue);
  await eventLoopIteration();
  schedule = scheduler.getSchedule();
  t.deepEqual(schedule.liveAuctionSchedule, null);
  t.deepEqual(schedule.nextAuctionSchedule, expected2ndSchedule);

  const thirdStartT = secondStart + startFreq; // 1085
  const thirdStart = TimeMath.coerceTimestampRecord(thirdStartT, timerBrand);

  await timer.advanceTo(secondNominalStart);
  await eventLoopIteration();
  schedule = scheduler.getSchedule();
  t.deepEqual(schedule.liveAuctionSchedule, expected2ndSchedule);

  const thirdLock = TimeMath.subtractAbsRel(thirdStart, lockPeriod);
  const thirdStep = TimeMath.coerceRelativeTimeRecord(60n, timerBrand);
  const thirdNominalStart = TimeMath.subtractAbsRel(thirdStart, startDelay);
  const thirdEnd = TimeMath.addAbsRel(
    thirdStart,
    TimeMath.coerceRelativeTimeRecord(5n * clockStep, timerBrand),
  );
  const thirdEndT = thirdEnd.absValue;

  const expected3rdSchedule = {
    clockStep: thirdStep,
    endRate: 50n,
    endTime: TimeMath.coerceTimestampRecord(thirdEnd, timerBrand),
    lockTime: thirdLock,
    startDelay,
    startTime: TimeMath.coerceTimestampRecord(thirdStart, timerBrand),
    steps: 5n,
  };

  await timer.advanceTo(secondStart);
  await eventLoopIteration();
  schedule = scheduler.getSchedule();
  t.deepEqual(schedule.liveAuctionSchedule, expected2ndSchedule);
  t.deepEqual(schedule.nextAuctionSchedule, expected3rdSchedule);

  // Update parameters when the 2nd auction has started. ///////////////
  // This means the 3rd auction should proceed as scheduled, //////////
  // followed by the fourth //////////////////////////////////////////
  const newFreq = 100n;
  const newStep = 40n;
  await paramManager.updateParams({
    StartFrequency: TimeMath.coerceRelativeTimeRecord(newFreq, timerBrand),
    ClockStep: TimeMath.coerceRelativeTimeRecord(newStep, timerBrand),
  });

  schedule = scheduler.getSchedule();
  t.deepEqual(schedule.nextAuctionSchedule, expected3rdSchedule);

  schedule = scheduler.getSchedule();
  t.deepEqual(schedule.liveAuctionSchedule, expected2ndSchedule);

  await timer.advanceTo(secondStart + clockStep);
  await eventLoopIteration();
  await timer.advanceTo(secondStart + 2n * clockStep);
  await eventLoopIteration();

  await timer.advanceTo(expected2ndSchedule.endTime);
  await eventLoopIteration();
  schedule = scheduler.getSchedule();
  t.deepEqual(schedule.nextAuctionSchedule, expected3rdSchedule);
  t.deepEqual(schedule.liveAuctionSchedule, null);

  await timer.advanceTo(thirdLock);
  await eventLoopIteration();
  schedule = scheduler.getSchedule();
  t.deepEqual(schedule.nextAuctionSchedule, expected3rdSchedule);
  await timer.advanceTo(thirdNominalStart);
  await eventLoopIteration();

  const fourthRemainder = (thirdEndT + newFreq) % newFreq;
  const fourthStartT = thirdEndT + newFreq - fourthRemainder + startDelayT;
  const fourthStart = TimeMath.coerceTimestampRecord(fourthStartT, timerBrand);

  await timer.advanceTo(thirdStart);
  await eventLoopIteration();

  assert(schedule.nextAuctionSchedule);
  const fourthLock = TimeMath.subtractAbsRel(fourthStart, lockPeriod);
  const fourthStep = TimeMath.coerceRelativeTimeRecord(40n, timerBrand);
  const fourthEnd = TimeMath.addAbsRel(
    fourthStart,
    TimeMath.addRelRel(fourthStep, fourthStep),
  );

  const expected4thSchedule = {
    startTime: TimeMath.coerceTimestampRecord(fourthStart, timerBrand),
    endTime: TimeMath.coerceTimestampRecord(fourthEnd, timerBrand),
    steps: 2n,
    endRate: 80n,
    startDelay,
    clockStep: fourthStep,
    lockTime: fourthLock,
  };

  await timer.advanceTo(TimeMath.addAbsRel(thirdStart, newStep));
  await eventLoopIteration();
  await timer.advanceTo(expected3rdSchedule.endTime);
  await eventLoopIteration();
  schedule = scheduler.getSchedule();
  t.deepEqual(schedule.nextAuctionSchedule, expected4thSchedule);
  t.deepEqual(schedule.liveAuctionSchedule, null);
});

test('schedule anomalies', async t => {
  const oneCycle = 3600n;
  const delay = 30n;
  const lock = 300n;
  const step = 240n;
  const duration = 480n + delay;
  const customParams = {
    StartFrequency: oneCycle,
    ClockStep: step,
    AuctionStartDelay: delay,
    PriceLockPeriod: lock,
  };

  const baseTime = 1700002800n;
  const { timer, fakeAuctioneer, scheduler, scheduleTracker } =
    await setupScheduleTest(t, customParams, baseTime - (lock + 1n), 'current');
  const timerBrand = await timer.getTimerBrand();
  // ////////////// BEFORE LOCKING ///////////
  let now = await timer.getCurrentTimestamp();

  const timestamp = time => TimeMath.coerceTimestampRecord(time, timerBrand);
  const relative = time => TimeMath.coerceRelativeTimeRecord(time, timerBrand);

  const firstStart = baseTime + delay;
  await scheduleTracker.assertLike({
    current: {
      AuctionStartDelay: {
        type: 'relativeTime',
        value: relative(customParams.AuctionStartDelay),
      },
      PriceLockPeriod: {
        type: 'relativeTime',
        value: relative(customParams.PriceLockPeriod),
      },
      StartFrequency: {
        type: 'relativeTime',
        value: relative(customParams.StartFrequency),
      },
      ClockStep: {
        type: 'relativeTime',
        value: relative(customParams.ClockStep),
      },
    },
  });
  await scheduleTracker.assertChange({
    activeStartTime: null,
    current: undefined,
    nextDescendingStepTime: timestamp(firstStart),
    nextStartTime: TimeMath.coerceTimestampRecord(baseTime + delay, timerBrand),
  });
  const schedule = scheduler.getSchedule();
  t.deepEqual(schedule.liveAuctionSchedule, null);

  t.false(fakeAuctioneer.getState().capturedPrices);
  // ////////////// PRICE LOCK TIME /////////// not price capture
  now = await timer.advanceTo(baseTime + delay - lock);
  t.false(fakeAuctioneer.getState().capturedPrices);

  const firstSchedule = {
    startTime: timestamp(firstStart),
    endTime: timestamp(firstStart + 2n * step),
    steps: 2n,
    endRate: 6500n,
    startDelay: relative(delay),
    clockStep: relative(step),
    lockTime: timestamp(firstStart - lock),
  };
  t.deepEqual(schedule.nextAuctionSchedule, firstSchedule);

  t.false(fakeAuctioneer.getState().final);
  t.is(fakeAuctioneer.getState().step, 0);

  // ////////////// NOMINAL START ///////////
  now = await timer.advanceTo(baseTime);

  await scheduleTracker.assertChange({
    activeStartTime: timestamp(firstStart),
    nextStartTime: { absValue: firstStart + oneCycle },
  });

  t.is(fakeAuctioneer.getState().step, 0);
  t.false(fakeAuctioneer.getState().final);
  t.true(fakeAuctioneer.getState().capturedPrices);

  // ////////////// FIRST START ///////////
  now = await timer.advanceTo(firstStart);
  await eventLoopIteration();
  await timer.advanceTo(now + 1n);
  await scheduleTracker.assertChange({
    nextDescendingStepTime: { absValue: firstStart + step },
  });

  const schedule2 = scheduler.getSchedule();
  t.deepEqual(schedule2.liveAuctionSchedule, firstSchedule);
  t.deepEqual(schedule2.nextAuctionSchedule, {
    startTime: timestamp(baseTime + oneCycle + delay),
    endTime: timestamp(baseTime + oneCycle + duration),
    steps: 2n,
    endRate: 6500n,
    startDelay: relative(delay),
    clockStep: relative(step),
    lockTime: timestamp(baseTime + oneCycle - lock + delay),
  });

  t.is(fakeAuctioneer.getState().step, 1);
  t.false(fakeAuctioneer.getState().final);
  t.true(fakeAuctioneer.getState().capturedPrices);

  // ////////////// DESCENDING STEP ///////////
  await timer.advanceTo(firstStart + step);
  await scheduleTracker.assertChange({
    nextDescendingStepTime: { absValue: firstStart + 2n * step },
  });

  t.is(fakeAuctioneer.getState().step, 2);
  t.false(fakeAuctioneer.getState().final);
  t.true(fakeAuctioneer.getState().capturedPrices);

  // ////////////// DESCENDING STEP ///////////
  await timer.advanceTo(firstStart + 2n * step);
  await eventLoopIteration();
  await scheduleTracker.assertChange({
    activeStartTime: null,
    nextDescendingStepTime: { absValue: firstStart + oneCycle },
  });

  t.is(fakeAuctioneer.getState().step, 3);
  t.true(fakeAuctioneer.getState().final);
  t.false(fakeAuctioneer.getState().capturedPrices);

  const secondStart = baseTime + oneCycle + delay;
  // ////////////// JUMP SLIGHTLY PAST NEXT START ///////////
  await timer.advanceTo(secondStart + 60n);
  await scheduleTracker.assertChange({
    activeStartTime: timestamp(secondStart),
    nextDescendingStepTime: { absValue: secondStart + step },
    nextStartTime: { absValue: secondStart + oneCycle },
  });

  t.is(fakeAuctioneer.getState().step, 4);
  t.false(fakeAuctioneer.getState().final);
  t.true(fakeAuctioneer.getState().capturedPrices);

  t.deepEqual(fakeAuctioneer.getStartRounds(), [0, 3]);

  const schedule3 = scheduler.getSchedule();
  const thirdSchedule = {
    startTime: timestamp(secondStart),
    endTime: timestamp(secondStart + duration - delay),
    steps: 2n,
    endRate: 6500n,
    startDelay: relative(delay),
    clockStep: relative(step),
    lockTime: timestamp(secondStart - lock),
  };
  t.deepEqual(schedule3.liveAuctionSchedule, thirdSchedule);

  const thirdStart = baseTime + 2n * oneCycle + delay;
  const fourthSchedule = {
    startTime: timestamp(thirdStart),
    endTime: timestamp(thirdStart + duration - delay),
    steps: 2n,
    endRate: 6500n,
    startDelay: relative(delay),
    clockStep: relative(step),
    lockTime: timestamp(thirdStart - lock),
  };
  t.deepEqual(schedule3.nextAuctionSchedule, fourthSchedule);

  // ////////////// DESCENDING STEP ///////////
  await timer.advanceTo(secondStart + step);

  await scheduleTracker.assertChange({});

  t.is(fakeAuctioneer.getState().step, 4);
  t.false(fakeAuctioneer.getState().final);
  t.true(fakeAuctioneer.getState().capturedPrices);

  // ////////////// DESCENDING STEP ///////////
  now = await timer.advanceTo(secondStart + 2n * step);
  await scheduleTracker.assertChange({
    activeStartTime: null,
    nextDescendingStepTime: { absValue: thirdStart },
  });

  t.is(fakeAuctioneer.getState().step, 5);
  t.true(fakeAuctioneer.getState().final);
  t.false(fakeAuctioneer.getState().capturedPrices);

  // ////////////// JUMP TO THE END OF NEXT AUCTION ///////////
  const lateStart = baseTime + 2n * oneCycle + delay;
  await timer.advanceTo(lateStart + 300n);
  await scheduleTracker.assertChange({
    // a cycle later
    activeStartTime: timestamp(lateStart + oneCycle),
    nextDescendingStepTime: { absValue: lateStart + oneCycle },
    nextStartTime: { absValue: lateStart + 2n * oneCycle },
  });

  t.is(fakeAuctioneer.getState().step, 5);
  t.true(fakeAuctioneer.getState().final);
  t.true(fakeAuctioneer.getState().capturedPrices);
  t.deepEqual(fakeAuctioneer.getStartRounds(), [0, 3]);

  // ////////////// DESCENDING STEP ///////////
  await timer.advanceTo(lateStart + 2n * step);
  // no change to schedule

  t.is(fakeAuctioneer.getState().step, 5);
  t.true(fakeAuctioneer.getState().final);
  t.true(fakeAuctioneer.getState().capturedPrices);

  const schedule4 = scheduler.getSchedule();
  const fifthSchedule = {
    startTime: timestamp(lateStart + oneCycle),
    endTime: timestamp(lateStart + oneCycle + duration - delay),
    steps: 2n,
    endRate: 6500n,
    startDelay: relative(delay),
    clockStep: relative(step),
    lockTime: timestamp(lateStart + oneCycle - lock),
  };
  t.deepEqual(schedule4.liveAuctionSchedule, fifthSchedule);
  const sixthSchedule = {
    startTime: timestamp(lateStart + 2n * oneCycle),
    endTime: timestamp(lateStart + 2n * oneCycle + duration - delay),
    steps: 2n,
    endRate: 6500n,
    startDelay: relative(delay),
    clockStep: relative(step),
    lockTime: timestamp(lateStart + 2n * oneCycle - lock),
  };
  t.deepEqual(schedule4.nextAuctionSchedule, sixthSchedule);

  await scheduleTracker.assertNoUpdate();

  // ////////////// JUMP PAST THE END OF NEXT AUCTION ///////////
  const veryLateStart = baseTime + 5n * oneCycle;
  await timer.advanceTo(veryLateStart);

  await scheduleTracker.assertChange({
    activeStartTime: null,
    nextDescendingStepTime: { absValue: veryLateStart - oneCycle + delay },
  });

  const veryLateActual = veryLateStart + oneCycle + delay;
  await scheduleTracker.assertChange({
    activeStartTime: timestamp(veryLateActual),
    nextDescendingStepTime: { absValue: veryLateActual },
    nextStartTime: { absValue: veryLateActual + oneCycle },
  });

  t.true(fakeAuctioneer.getState().final);
  t.true(fakeAuctioneer.getState().capturedPrices);

  t.deepEqual(fakeAuctioneer.getStartRounds(), [0, 3]);

  const schedule5 = scheduler.getSchedule();
  const seventhSchedule = {
    startTime: timestamp(veryLateActual),
    endTime: timestamp(veryLateActual + duration - delay),
    steps: 2n,
    endRate: 6500n,
    startDelay: relative(delay),
    clockStep: relative(step),
    lockTime: timestamp(veryLateActual - lock),
  };
  t.deepEqual(schedule5.liveAuctionSchedule, seventhSchedule);
});
