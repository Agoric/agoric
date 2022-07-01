// @ts-check
import { E } from '@endo/eventual-send';
import { diff } from 'deep-object-diff';

import { makeTracer } from '../src/makeTracer.js';

// While t.log has the advantage of omitting by default when tests pass,
// when debugging it's most valuable to have the messages in sequence with app
// code logging which doesn't have access to t.log.
const trace = makeTracer('TestMetrics', false);

/**
 * @param {import('ava').ExecutionContext} t
 * @param {Subscription<N>} subscription
 * @template {object} N
 */
export const subscriptionTracker = async (t, subscription) => {
  const metrics = await E(subscription)[Symbol.asyncIterator]();
  /** @type {IteratorResult<N, N>} */
  let notif;
  const getLastNotif = () => notif;

  /** @param {Record<keyof N, N[keyof N]>} expectedValue */
  const assertInitial = async expectedValue => {
    notif = await E(metrics).next();
    trace('assertInitial notif', notif);
    t.deepEqual(notif.value, expectedValue);
  };
  const assertChange = async expectedDelta => {
    const prevNotif = notif;
    notif = await E(metrics).next();
    trace('assertChange notif', notif);
    // @ts-expect-error diff() overly constrains
    const actualDelta = diff(prevNotif.value, notif.value);
    t.deepEqual(actualDelta, expectedDelta, 'Unexpected delta');
  };
  const assertState = async expectedState => {
    notif = await E(metrics).next();
    t.deepEqual(notif.value, expectedState, 'Unexpected state');
  };
  return { assertChange, assertInitial, assertState, getLastNotif };
};

/**
 * For public facets that have a `getMetrics` method.
 *
 * @param {import('ava').ExecutionContext} t
 * @param {{getMetrics?: () => Subscription<unknown>}} publicFacet
 * @template {object} N
 */
export const metricsTracker = async (t, publicFacet) => {
  const metricsSub = await E(publicFacet).getMetrics();
  return subscriptionTracker(t, metricsSub);
};

/**
 * @param {import('ava').ExecutionContext} t
 * @param {import('../src/vaultFactory/vaultManager').CollateralManager} publicFacet
 */
export const vaultManagerMetricsTracker = async (t, publicFacet) => {
  let totalDebtEver = 0n;
  /** @type {Awaited<ReturnType<typeof subscriptionTracker<import('../src/vaultFactory/vaultManager').MetricsNotification>>>} */
  // @ts-expect-error cast
  const m = await metricsTracker(t, publicFacet);

  /** @returns {bigint} Proceeds - overage + shortfall */
  const liquidatedYet = () => {
    // XXX re-use the state until subscriptions are lossy https://github.com/Agoric/agoric-sdk/issues/5413
    const { value: v } = m.getLastNotif();
    const [p, o, s] = [
      v.totalProceedsReceived,
      v.totalOverageReceived,
      v.totalShortfallReceived,
    ].map(a => a.value);
    trace('liquidatedYet', { p, o, s });
    return p - o + s;
  };

  /** @param {bigint} delta */
  const addDebt = delta => {
    totalDebtEver += delta;
    const liquidated = liquidatedYet();
    t.true(
      liquidated < totalDebtEver,
      `Liquidated ${liquidated} must be less than total debt ever ${totalDebtEver}`,
    );
  };

  const assertFullyLiquidated = () => {
    const liquidated = liquidatedYet();
    t.true(
      totalDebtEver - liquidated <= 1,
      `Liquidated ${liquidated} must approx equal total debt ever ${totalDebtEver}`,
    );
    const notif = m.getLastNotif();
    t.is(notif.value.totalDebt.value, 0n);
  };
  return harden({
    ...m,
    addDebt,
    assertFullyLiquidated,
  });
};
