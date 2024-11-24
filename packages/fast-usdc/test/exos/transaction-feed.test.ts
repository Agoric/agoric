// Must be first to set up globals
import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { deeplyFulfilledObject } from '@agoric/internal';
import { makeHeapZone } from '@agoric/zone';
import {
  prepareTransactionFeedKit,
  type TransactionFeedKit,
} from '../../src/exos/transaction-feed.ts';
import { MockCctpTxEvidences } from '../fixtures.js';

const nullZcf = null as any;

const makeFeedKit = () => {
  const zone = makeHeapZone();
  const makeKit = prepareTransactionFeedKit(zone, nullZcf);
  return makeKit();
};

const makeOperators = (feedKit: TransactionFeedKit) => {
  const operators = Object.fromEntries(
    ['op1', 'op2', 'op3'].map(name => [
      name,
      feedKit.creator.initOperator(name),
    ]),
  );
  return deeplyFulfilledObject(harden(operators));
};

test('facets', t => {
  const kit = makeFeedKit();
  t.deepEqual(Object.keys(kit).sort(), ['creator', 'operatorPowers', 'public']);
});

test('status shape', async t => {
  const { op1 } = await makeOperators(makeFeedKit());

  // status shape
  t.deepEqual(op1.operator.getStatus(), {
    disabled: false,
    operatorId: 'op1',
  });
});

test('happy aggregation', async t => {
  const feedKit = makeFeedKit();
  const evidenceSubscriber = feedKit.public.getEvidenceSubscriber();

  const { op1, op2, op3 } = await makeOperators(feedKit);
  const evidence = MockCctpTxEvidences.AGORIC_PLUS_OSMO();
  const results = await Promise.all([
    op1.operator.submitEvidence(evidence),
    op2.operator.submitEvidence(evidence),
    op3.operator.submitEvidence(evidence),
  ]);
  t.deepEqual(results, [undefined, undefined, undefined]);

  const accepted = await evidenceSubscriber.getUpdateSince(0);
  t.deepEqual(accepted, {
    value: evidence,
    updateCount: 1n,
  });

  // verify that it doesn't publish until three match
  await Promise.all([
    // once it publishes, it doesn't remember that it already saw these
    op1.operator.submitEvidence(evidence),
    op2.operator.submitEvidence(evidence),
    // but this time the third is different
    op3.operator.submitEvidence(MockCctpTxEvidences.AGORIC_PLUS_DYDX()),
  ]);
  t.like(await evidenceSubscriber.getUpdateSince(0), {
    // Update count is still 1
    updateCount: 1n,
  });
  await op3.operator.submitEvidence(evidence);
  t.like(await evidenceSubscriber.getUpdateSince(0), {
    updateCount: 2n,
  });
});

// TODO: find a way to get this working
test.skip('forged source', async t => {
  const feedKit = makeFeedKit();
  const { op1 } = await makeOperators(feedKit);
  const evidence = MockCctpTxEvidences.AGORIC_PLUS_OSMO();

  // op1 is different than the facets object the evidence must come from
  t.throws(() =>
    feedKit.operatorPowers.submitEvidence(
      evidence,
      // @ts-expect-error XXX Types of property '[GET_INTERFACE_GUARD]' are incompatible.
      op1,
    ),
  );
});
