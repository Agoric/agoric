/* eslint-env node */

import { makeFsStreamWriter } from '@agoric/internal/src/node/fs-stream.js';
import { makeContextualSlogProcessor } from './context-aware-slog.js';
import { serializeSlogObj } from './serialize-slog-obj.js';

/**
 * @param {import('./index.js').MakeSlogSenderOptions} options
 */
export const makeSlogSender = async options => {
  const { CHAIN_ID, CONTEXTUAL_SLOGFILE } = options.env || {};
  if (!CONTEXTUAL_SLOGFILE)
    return console.warn(
      'Ignoring invocation of slogger "context-aware-slog-file" without the presence of "CONTEXTUAL_SLOGFILE"',
    );

  const stream = await makeFsStreamWriter(CONTEXTUAL_SLOGFILE);

  if (!stream)
    return console.error(
      `Couldn't create a write stream on file "${CONTEXTUAL_SLOGFILE}"`,
    );

  const contextualSlogProcessor = makeContextualSlogProcessor({
    'chain-id': CHAIN_ID,
  });

  /**
   * @param {import('./context-aware-slog.js').Slog} slog
   */
  const slogSender = slog => {
    const contextualizedSlog = contextualSlogProcessor(slog);

    // eslint-disable-next-line prefer-template
    stream.write(serializeSlogObj(contextualizedSlog) + '\n').catch(() => {});
  };

  return Object.assign(slogSender, {
    forceFlush: async () => stream.flush(),
    shutdown: async () => stream.close(),
  });
};
