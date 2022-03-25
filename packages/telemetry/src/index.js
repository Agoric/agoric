// @ts-check
/* globals globalThis, process */
import { MeterProvider } from '@opentelemetry/sdk-metrics-base';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export * from './make-slog-sender.js';

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
    resourceAttributes[
      SemanticResourceAttributes.SERVICE_INSTANCE_ID
    ] = `${Math.random()}`;
  }
  if (serviceName) {
    resourceAttributes[SemanticResourceAttributes.SERVICE_NAME] = serviceName;
  }
  if (OTEL_RESOURCE_ATTRIBUTES) {
    // Allow overriding resource attributes.
    OTEL_RESOURCE_ATTRIBUTES.split(',').forEach(kv => {
      const match = kv.match(/^([^=]*)=(.*)$/);
      if (match) {
        resourceAttributes[match[1]] = match[2];
      }
    });
  }
  return resourceAttributes;
};

/**
 * @typedef {Object} Powers
 * @property {{ warn: Console['warn'] }} console
 * @property {NodeJS.ProcessEnv} env
 * @property {string} [serviceName]
 */

/** @param {Partial<Powers>} param0 */
const getPrometheusMeterProvider = ({
  console = globalThis.console,
  env = process.env,
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
    },
    () => {
      console.warn(
        `Prometheus scrape endpoint: http://0.0.0.0:${port}${PrometheusExporter.DEFAULT_OPTIONS.endpoint}`,
      );
    },
  );

  return new MeterProvider({
    exporter,
    resource,
    interval: 1000,
  });
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
