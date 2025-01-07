/* global setTimeout */
import { test } from './prepare-test-env-ava.js';

import { getTelemetryProviders } from '../src/index.js';

const sleep = async timeoutMs =>
  new Promise(resolve => setTimeout(resolve, timeoutMs));

test('get telemetry providers', async t => {
  const logged = [];
  const mockConsole = {
    warn: (...args) => {
      logged.push(args);
    },
  };
  const providers = getTelemetryProviders({ console: mockConsole, env: {} });
  t.is(providers.metricsProvider, undefined);

  t.deepEqual(logged, []);
  await sleep(250);
  t.deepEqual(logged, []);

  const providers2 = getTelemetryProviders({
    console: mockConsole,
    env: { OTEL_EXPORTER_PROMETHEUS_PORT: '9393' },
  });

  t.is(Object(providers2.metricsProvider), providers2.metricsProvider);
  t.is(typeof providers2.metricsProvider, 'object');

  t.deepEqual(logged, []);
  await sleep(250);
  t.deepEqual(logged, [
    ['Prometheus scrape endpoint: http://0.0.0.0:9393/metrics'],
  ]);
});
