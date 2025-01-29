/* globals process globalThis */
import {
  BasicTracerProvider,
  BatchSpanProcessor,
} from '@opentelemetry/sdk-trace-base';

import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { makeShutdown } from '@agoric/internal/src/node/shutdown.js';

import { getResourceAttributes } from './index.js';
import { makeSlogToOtelKit } from './slog-to-otel.js';

// These numbers are chosen to attempt to export all spans.
export const SPAN_MAX_QUEUE_SIZE = 100_000;
export const SPAN_EXPORT_DELAY_MS = 1_000;

/**
 * @param {import('./index.js').MakeSlogSenderCommonOptions} opts
 */
export const makeOtelTracingProvider = opts => {
  const { env = process.env, console = globalThis.console } = opts || {};

  const { OTEL_EXPORTER_OTLP_ENDPOINT, OTEL_EXPORTER_OTLP_TRACES_ENDPOINT } =
    env;
  if (!OTEL_EXPORTER_OTLP_ENDPOINT && !OTEL_EXPORTER_OTLP_TRACES_ENDPOINT) {
    return undefined;
  }

  const resource = new Resource(getResourceAttributes(opts));

  const exporter = new OTLPTraceExporter();
  console.info('Enabling OTLP Traces Exporter to', exporter.getDefaultUrl({}));

  const provider = new BasicTracerProvider({ resource });
  provider.addSpanProcessor(
    // new SimpleSpanProcessor(exporter),
    new BatchSpanProcessor(exporter, {
      maxQueueSize: SPAN_MAX_QUEUE_SIZE,
      maxExportBatchSize: SPAN_MAX_QUEUE_SIZE,
      scheduledDelayMillis: SPAN_EXPORT_DELAY_MS,
    }),
  );
  return provider;
};

/**
 * @param {import('./index.js').MakeSlogSenderOptions & { version?: string }} opts
 */
export const makeSlogSender = async opts => {
  const tracingProvider =
    makeOtelTracingProvider(opts) || new BasicTracerProvider();

  tracingProvider.register();
  const tracer = tracingProvider.getTracer('slog-trace', opts.version);

  const { slogSender, finish } = makeSlogToOtelKit(tracer, undefined, opts);

  // Cleanly shutdown if possible.
  const { registerShutdown } = makeShutdown();
  const shutdown = async () => {
    finish();
    await tracingProvider.forceFlush();
    await tracingProvider.shutdown();
  };
  registerShutdown(shutdown);

  return Object.assign(slogSender, {
    forceFlush: async () => tracingProvider.forceFlush(),
    shutdown,
    usesJsonObject: false,
  });
};
