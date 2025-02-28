/* globals globalThis, process */
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export * from './make-slog-sender.js';

/**
 * @typedef {((obj: {}, jsonObj?: string | undefined) => void) & {
 *  usesJsonObject?: boolean;
 *  forceFlush?: () => Promise<void>;
 *  shutdown?: () => Promise<void>;
 * }} SlogSender
 */
/**
 * @typedef {(opts: import('./index.js').MakeSlogSenderOptions) => SlogSender | undefined} MakeSlogSender
 */
/**
 * @typedef {MakeSlogSenderCommonOptions & Record<string, unknown>} MakeSlogSenderOptions
 * @typedef {object} MakeSlogSenderCommonOptions
 * @property {Record<string, string | undefined>} [env]
 * @property {string} [stateDir]
 * @property {string} [serviceName]
 */

/**
 * @param {SlogSender} [slogSender]
 * @param {object} [options]
 * @param {Record<string, string | undefined>} [options.env]
 * @param {(...args: any[]) => void} [options.log]
 */
export const tryFlushSlogSender = async (
  slogSender,
  { env = {}, log } = {},
) => {
  await null;
  try {
    await slogSender?.forceFlush?.();
  } catch (err) {
    log?.('Failed to flush slog sender', err);
    if (err.errors) {
      for (const error of err.errors) {
        log?.('nested error:', error);
      }
    }
    if (env.SLOGSENDER_FAIL_ON_ERROR) {
      throw err;
    }
  }
};

export const getResourceAttributes = ({
  env = process.env,
  serviceName = '',
}) => {
  const { OTEL_RESOURCE_ATTRIBUTES, SDK_REVISION } = env;

  /** @type {import('@opentelemetry/resources').ResourceAttributes} */
  const resourceAttributes = {};
  if (SDK_REVISION) {
    // Detect testnet-load-generator target revision.
    resourceAttributes[SemanticResourceAttributes.SERVICE_VERSION] =
      SDK_REVISION;
  }
  if (!resourceAttributes[SemanticResourceAttributes.SERVICE_INSTANCE_ID]) {
    resourceAttributes[SemanticResourceAttributes.SERVICE_INSTANCE_ID] =
      `${Math.random()}`;
  }
  if (serviceName) {
    resourceAttributes[SemanticResourceAttributes.SERVICE_NAME] = serviceName;
  }
  if (OTEL_RESOURCE_ATTRIBUTES) {
    // Allow overriding resource attributes.
    for (const kv of OTEL_RESOURCE_ATTRIBUTES.split(',')) {
      const match = kv.match(/^([^=]*)=(.*)$/);
      if (match) {
        resourceAttributes[match[1]] = match[2];
      }
    }
  }
  return resourceAttributes;
};

/**
 * @typedef {object} Powers
 * @property {{ warn: Console['warn'] }} console
 * @property {NodeJS.ProcessEnv} env
 * @property {import('@opentelemetry/sdk-metrics').View[]} views
 * @property {string} [serviceName]
 */

/**
 * @param {Partial<Powers>} param0
 */
const getPrometheusMeterProvider = ({
  console = globalThis.console,
  env = process.env,
  views,
  ...rest
} = {}) => {
  const { OTEL_EXPORTER_PROMETHEUS_PORT } = env;
  if (!OTEL_EXPORTER_PROMETHEUS_PORT) {
    // No Prometheus config, so don't install.
    return undefined;
  }

  const resource = new Resource(getResourceAttributes({ env, ...rest }));

  const port =
    parseInt(OTEL_EXPORTER_PROMETHEUS_PORT || '', 10) ||
    PrometheusExporter.DEFAULT_OPTIONS.port;

  const exporter = new PrometheusExporter(
    {
      port,
      appendTimestamp: true,
    },
    () => {
      console.warn(
        `Prometheus scrape endpoint: http://0.0.0.0:${port}${PrometheusExporter.DEFAULT_OPTIONS.endpoint}`,
      );
    },
  );

  const provider = new MeterProvider({ resource, views });
  provider.addMetricReader(exporter);
  return provider;
};

/**
 * Obtain the telemetry providers used by the `@opentelemetry` packages.
 *
 * @param {Partial<Powers>} [powers]
 * @returns {{ metricsProvider?: MeterProvider }}
 */
export const getTelemetryProviders = powers => {
  const ret = {};
  const metricsProvider = getPrometheusMeterProvider(powers);
  if (metricsProvider) {
    ret.metricsProvider = metricsProvider;
  }
  return ret;
};
