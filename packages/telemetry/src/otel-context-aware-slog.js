/* eslint-env node */
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { Resource } from '@opentelemetry/resources';
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import { readFileSync, writeFileSync } from 'fs';
import { makeContextualSlogProcessor } from './context-aware-slog.js';
import { getResourceAttributes } from './index.js';
import { serializeSlogObj } from './serialize-slog-obj.js';

const DEFAULT_CONTEXT_FILE = 'slog-context.json';
const FILE_ENCODING = 'utf8';

/**
 * @param {string} filePath
 */
export const getContextFilePersistenceUtils = filePath => {
  console.warn(`Using file ${filePath} for slogger context`);

  return {
    /**
     * @param {import('./context-aware-slog.js').Context} context
     */
    persistContext: context => {
      try {
        writeFileSync(filePath, serializeSlogObj(context), FILE_ENCODING);
      } catch (err) {
        console.error('Error writing context to file: ', err);
      }
    },

    /**
     * @returns {import('./context-aware-slog.js').Context | null}
     */
    restoreContext: () => {
      try {
        return JSON.parse(readFileSync(filePath, FILE_ENCODING));
      } catch (parseErr) {
        console.error('Error reading context from file: ', parseErr);
        return null;
      }
    },
  };
};

/**
 * @param {import('./index.js').MakeSlogSenderOptions} options
 */
export const makeSlogSender = async options => {
  const { CHAIN_ID, OTEL_EXPORTER_OTLP_ENDPOINT } = options.env || {};
  if (!(OTEL_EXPORTER_OTLP_ENDPOINT && options.stateDir))
    return console.error(
      'Ignoring invocation of slogger "context-aware-slog" without the presence of "OTEL_EXPORTER_OTLP_ENDPOINT" and "stateDir"',
    );

  const loggerProvider = new LoggerProvider({
    resource: new Resource(getResourceAttributes(options)),
  });

  const otelLogExporter = new OTLPLogExporter({ keepAlive: true });
  const logRecordProcessor = new SimpleLogRecordProcessor(otelLogExporter);

  loggerProvider.addLogRecordProcessor(logRecordProcessor);

  logs.setGlobalLoggerProvider(loggerProvider);
  const logger = logs.getLogger('default');

  const persistenceUtils = getContextFilePersistenceUtils(
    process.env.SLOG_CONTEXT_FILE_PATH ||
      `${options.stateDir}/${DEFAULT_CONTEXT_FILE}`,
  );

  const contextualSlogProcessor = makeContextualSlogProcessor(
    { 'chain-id': CHAIN_ID },
    persistenceUtils,
  );

  /**
   * @param {import('./context-aware-slog.js').Slog} slog
   */
  const slogSender = slog => {
    const { time, ...logRecord } = contextualSlogProcessor(slog);

    const [secondsStr, fractionStr] = String(time).split('.');
    const seconds = parseInt(secondsStr, 10);
    const nanoSeconds = parseInt(
      (fractionStr || String(0)).padEnd(9, String(0)).slice(0, 9),
      10,
    );

    logger.emit({
      ...JSON.parse(serializeSlogObj(logRecord)),
      severityNumber: SeverityNumber.INFO,
      timestamp: [seconds, nanoSeconds],
    });
  };

  const shutdown = async () => {
    await Promise.resolve();
    const errors = [];

    try {
      await logRecordProcessor.shutdown();
    } catch (err) {
      errors.push(err);
    }

    try {
      await otelLogExporter.forceFlush();
    } catch (err) {
      errors.push(err);
    }

    switch (errors.length) {
      case 0:
        return;
      case 1:
        throw errors[0];
      default:
        throw AggregateError(errors);
    }
  };

  return Object.assign(slogSender, {
    forceFlush: async () => otelLogExporter.forceFlush(),
    shutdown,
  });
};
