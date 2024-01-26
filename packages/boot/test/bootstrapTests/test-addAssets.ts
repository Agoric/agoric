import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import type { TestFn } from 'ava';

import { TimeMath } from '@agoric/time';
import {
  LiquidationTestContext,
  makeLiquidationTestContext,
} from '../../tools/liquidation.js';
import { makeProposalExtractor } from '../../tools/supports.js';

const test = anyTest as TestFn<
  LiquidationTestContext & {
    getCollateralProposal: (
      name: string,
      id: string,
    ) => Awaited<ReturnType<ReturnType<typeof makeProposalExtractor>>>;
  }
>;

const auctioneerPath = 'published.auction';

test.before(async t => {
  const context = await makeLiquidationTestContext(t);
  const proposal = await context.buildProposal(
    '@agoric/builders/scripts/inter-protocol/add-STARS.js',
  );

  t.log('installing proposal');
  // share a single proposal so tests don't stomp on each other's files; It has
  // to be edited by each so as not to re-use keywords.
  for await (const bundle of proposal.bundles) {
    await context.controller.validateAndInstallBundle(bundle);
  }
  t.log('installed', proposal.bundles.length, 'bundles');

  const getCollateralProposal = (name, id) => {
    // stringify, modify and parse because modifying a deep copy was fragile.
    const proposalJSON = JSON.stringify(proposal);
    const proposalMod = proposalJSON
      .replaceAll('STARS', name)
      .replaceAll('ibc/987C17B1', `ibc/987C17B1${id}`);
    return JSON.parse(proposalMod);
  };
  t.context = {
    ...context,
    getCollateralProposal,
  };
  t.log('installed', proposal.bundles.length, 'bundles');
});

test.after.always(t => {
  // This will fail if a subset of tests are run. It detects that three
  // collaterals were added to the auction after ATOM.
  t.like(t.context.readLatest(`${auctioneerPath}.book3`), {
    currentPriceLevel: null,
  });
  return t.context.shutdown && t.context.shutdown();
});

test('addAsset to quiescent auction', async t => {
  const { advanceTimeTo, readLatest } = t.context;

  const proposal = t.context.getCollateralProposal('COMETS', 'A');
  const bridgeMessage = {
    type: 'CORE_EVAL',
    evals: proposal.evals,
  };

  const { EV } = t.context.runUtils;

  const auctioneerKit = await EV.vat('bootstrap').consumeItem('auctioneerKit');
  const schedules = await EV(auctioneerKit.creatorFacet).getSchedule();
  const { liveAuctionSchedule, nextAuctionSchedule } = schedules;
  const nextEndTime = liveAuctionSchedule
    ? liveAuctionSchedule.endTime
    : nextAuctionSchedule.endTime;
  const fiveMinutes = harden({
    relValue: 5n * 60n,
    timerBrand: nextEndTime.timerBrand,
  });
  const nextQuiescentTime = TimeMath.addAbsRel(nextEndTime, fiveMinutes);
  await advanceTimeTo(nextQuiescentTime);

  const coreEvalBridgeHandler = await EV.vat('bootstrap').consumeItem(
    'coreEvalBridgeHandler',
  );
  await EV(coreEvalBridgeHandler).fromBridge(bridgeMessage);
  t.log('proposal executed');

  t.like(readLatest(`${auctioneerPath}.book1`), {
    currentPriceLevel: null,
  });
});

test('addAsset to active auction', async t => {
  const { advanceTimeTo, readLatest } = t.context;
  const { EV } = t.context.runUtils;

  t.like(readLatest(`${auctioneerPath}.book0`), { startPrice: null });

  const auctioneerKit = await EV.vat('bootstrap').consumeItem('auctioneerKit');
  const schedules = await EV(auctioneerKit.creatorFacet).getSchedule();
  const { nextAuctionSchedule } = schedules;
  t.truthy(nextAuctionSchedule);
  const nextStartTime = nextAuctionSchedule.startTime;
  const fiveMinutes = harden({
    relValue: 5n * 60n,
    timerBrand: nextStartTime.timerBrand,
  });
  const futureBusyTime = TimeMath.addAbsRel(nextStartTime, fiveMinutes);

  await advanceTimeTo(futureBusyTime);

  t.log('launching proposal');

  const proposal = t.context.getCollateralProposal('PLANETS', 'B');
  const bridgeMessage = {
    type: 'CORE_EVAL',
    evals: proposal.evals,
  };
  t.log({ bridgeMessage });

  const coreEvalBridgeHandler = await EV.vat('bootstrap').consumeItem(
    'coreEvalBridgeHandler',
  );
  EV(coreEvalBridgeHandler).fromBridge(bridgeMessage);

  const nextEndTime = nextAuctionSchedule.endTime;
  const afterEndTime = TimeMath.addAbsRel(nextEndTime, fiveMinutes);
  await advanceTimeTo(afterEndTime);
  t.log('proposal executed');

  const schedulesAfter = await EV(auctioneerKit.creatorFacet).getSchedule();
  // TimeMath.compareAbs() can't handle brands processed by kmarshall
  t.truthy(
    schedules.nextAuctionSchedule.endTime.absValue <
      schedulesAfter.nextAuctionSchedule.endTime.absValue,
  );

  t.like(readLatest(`${auctioneerPath}.book1`), { currentPriceLevel: null });
});

test('addAsset to auction starting soon', async t => {
  const { advanceTimeTo, readLatest } = t.context;
  const { EV } = t.context.runUtils;

  const auctioneerKit = await EV.vat('bootstrap').consumeItem('auctioneerKit');
  const schedules = await EV(auctioneerKit.creatorFacet).getSchedule();
  const { nextAuctionSchedule } = schedules;
  t.truthy(nextAuctionSchedule);
  const nextStartTime = nextAuctionSchedule.startTime;
  const fiveMinutes = harden({
    relValue: 5n * 60n,
    timerBrand: nextStartTime.timerBrand,
  });
  const tooCloseTime = TimeMath.subtractAbsRel(nextStartTime, fiveMinutes);

  await advanceTimeTo(tooCloseTime);

  const proposal = t.context.getCollateralProposal('MOONS', 'C');
  t.log('launching proposal');
  const bridgeMessage = {
    type: 'CORE_EVAL',
    evals: proposal.evals,
  };
  t.log({ bridgeMessage });

  const coreEvalBridgeHandler = await EV.vat('bootstrap').consumeItem(
    'coreEvalBridgeHandler',
  );
  EV(coreEvalBridgeHandler).fromBridge(bridgeMessage);

  const nextEndTime = nextAuctionSchedule.endTime;
  const afterEndTime = TimeMath.addAbsRel(nextEndTime, fiveMinutes);
  await advanceTimeTo(afterEndTime);

  t.log('proposal executed');

  const schedulesAfter = await EV(auctioneerKit.creatorFacet).getSchedule();
  t.truthy(
    schedules.nextAuctionSchedule.endTime.absValue <
      schedulesAfter.nextAuctionSchedule.endTime.absValue,
  );
  t.like(readLatest(`${auctioneerPath}.book1`), { currentPriceLevel: null });
});
