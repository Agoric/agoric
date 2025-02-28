/* eslint-env node */

import { open } from 'node:fs/promises';
import { createGzip } from 'node:zlib';
import { SLOG_TYPES } from './context-aware-slog.js';
import { serializeSlogObj } from './serialize-slog-obj.js';

/**
 * @typedef {import('./context-aware-slog.js').Slog} Slog
 */

/**
 * @param {import('./index.js').MakeSlogSenderOptions} options
 */
export const makeSlogSender = async options => {
  const { CONTEXTUAL_BLOCK_SLOGS } = options.env || {};
  if (!(options.stateDir || CONTEXTUAL_BLOCK_SLOGS))
    return console.error(
      'Ignoring invocation of slogger "block-slog" without the presence of "stateDir" or "CONTEXTUAL_BLOCK_SLOGS"',
    );

  let chainedPromises = Promise.resolve();
  /**
   * @type {import('node:fs/promises').FileHandle | null}
   */
  let currentFileHandle = null;
  /**
   * @type {import('node:fs').WriteStream | null}
   */
  let currentFileStream = null;
  /**
   * @type {import('node:zlib').Gzip | null}
   */
  let currentStream = null;

  /**
   * @param {Array<() => Promise<void>>} promises
   */
  const chainPromises = (...promises) => {
    for (const promise of promises)
      chainedPromises = chainedPromises.then(promise);
  };

  const closeStream = () =>
    currentStream
      ? chainPromises(
          () =>
            new Promise(resolve =>
              // @ts-expect-error
              currentStream.end(() => currentStream.once('finish', resolve)),
            ),
          () =>
            // @ts-expect-error
            new Promise(resolve => currentFileStream.once('finish', resolve)),
          async () => {
            currentStream = null;
            currentFileStream = null;
            currentFileHandle = null;
          },
        )
      : console.error('No stream to close');

  /**
   * @param {string} fileName
   */
  const createStream = async fileName => {
    if (currentStream) throw Error('Stream already open');

    const filePath = `${options.stateDir || CONTEXTUAL_BLOCK_SLOGS}/slogfile_${fileName}.gz`;
    currentFileHandle = await open(filePath, 'w');
    currentFileStream = currentFileHandle.createWriteStream();
    currentStream = createGzip();
    currentStream.pipe(currentFileStream);
  };

  /**
   * @param {Slog} slog
   */
  const slogSender = slog => {
    const { blockHeight, type: slogType } = slog;

    switch (slogType) {
      case SLOG_TYPES.KERNEL.INIT.START: {
        chainPromises(() => createStream(`init_${new Date().getTime()}`));
        break;
      }
      case SLOG_TYPES.COSMIC_SWINGSET.BOOTSTRAP_BLOCK.START: {
        chainPromises(() => createStream(`bootstrap_${new Date().getTime()}`));
        break;
      }
      case SLOG_TYPES.COSMIC_SWINGSET.UPGRADE.START: {
        chainPromises(() => createStream(`upgrade_${new Date().getTime()}`));
        break;
      }
      case SLOG_TYPES.COSMIC_SWINGSET.BEGIN_BLOCK: {
        chainPromises(() =>
          createStream(`block_${blockHeight}_${new Date().getTime()}`),
        );
        break;
      }
      default: {
        break;
      }
    }

    chainPromises(() => writeSlogToStream(slog));

    switch (slogType) {
      case SLOG_TYPES.KERNEL.INIT.FINISH:
      case SLOG_TYPES.COSMIC_SWINGSET.BOOTSTRAP_BLOCK.FINISH:
      case SLOG_TYPES.COSMIC_SWINGSET.UPGRADE.FINISH:
      case SLOG_TYPES.COSMIC_SWINGSET.AFTER_COMMIT_STATS: {
        closeStream();
        break;
      }
      default: {
        break;
      }
    }
  };

  /**
   * @param {Slog} slog
   * @returns {Promise<void>}
   */
  const writeSlogToStream = slog =>
    new Promise(resolve => {
      if (!currentStream) {
        console.error(`No stream available for slog type "${slog.type}"`);
        resolve();
      } else {
        // eslint-disable-next-line prefer-template
        const message = serializeSlogObj(slog) + '\n';

        if (!currentStream.write(message)) currentStream.once('drain', resolve);
        else resolve();
      }
    });

  return Object.assign(slogSender, {
    forceFlush: () =>
      chainedPromises.then(
        () =>
          /** @type {Promise<void>} */ (
            new Promise(resolve => currentStream?.flush(resolve))
          ),
      ),
    shutdown: async () => {
      closeStream();
      await chainedPromises;
    },
  });
};
