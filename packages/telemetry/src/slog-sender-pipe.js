import { fork } from 'child_process';
import path from 'path';
import anylogger from 'anylogger';

import { makeQueue } from '@endo/stream';

import { makeShutdown } from '@agoric/internal/src/node/shutdown.js';

const dirname = path.dirname(new URL(import.meta.url).pathname);

const logger = anylogger('slog-sender-pipe');

/**
 * @template {any[]} T
 * @template R
 * @param {(...args: T) => Promise<R>} operation
 */
const withMutex = operation => {
  /** @type {import('@endo/stream').AsyncQueue<void>} */
  const mutex = makeQueue();
  mutex.put(Promise.resolve());
  /** @param {T} args */
  return async (...args) => {
    await mutex.get();
    const result = operation(...args);
    mutex.put(
      result.then(
        () => {},
        () => {},
      ),
    );
    return result;
  };
};

/**
 * @typedef {object} SlogSenderInitReply
 * @property {'initReply'} type
 * @property {boolean} hasSender
 * @property {Error} [error]
 */
/**
 * @typedef {object} SlogSenderFlushReply
 * @property {'flushReply'} type
 * @property {Error} [error]
 */
/** @typedef {SlogSenderInitReply | SlogSenderFlushReply} SlogSenderPipeWaitReplies */

/** @param {import('.').MakeSlogSenderOptions} opts */
export const makeSlogSender = async opts => {
  const { registerShutdown } = makeShutdown();
  const cp = fork(path.join(dirname, 'slog-sender-pipe-entrypoint.js'), [], {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
    serialization: 'advanced',
  });
  // logger.log('done fork');

  const pipeSend = withMutex(
    /**
     * @template {{type: string}} T
     * @param {T} msg
     */
    async msg =>
      /** @type {Promise<void>} */ (
        new Promise((resolve, reject) => {
          cp.send(msg, err => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        })
      ),
  );

  /**
   * @typedef {{
   *   init: {
   *     message: import('./slog-sender-pipe-entrypoint.js').InitMessage;
   *     reply: SlogSenderInitReply;
   *   };
   *   flush: {
   *     message: import('./slog-sender-pipe-entrypoint.js').FlushMessage;
   *     reply: SlogSenderFlushReply;
   *   };
   * }} SlogSenderWaitMessagesAndReplies
   */

  /** @typedef {keyof SlogSenderWaitMessagesAndReplies} SendWaitCommands */
  /**
   * @template {SlogSenderPipeWaitReplies} T
   * @typedef {Omit<T, 'type' | 'error'>} ReplyPayload
   */

  /** @type {import('@endo/stream').AsyncQueue<SlogSenderPipeWaitReplies>} */
  const sendWaitQueue = makeQueue();
  /** @type {SendWaitCommands | undefined} */
  let sendWaitType;

  const sendWaitReply = withMutex(
    /**
     * @template {SendWaitCommands} T
     * @param {T} type
     * @param {Omit<SlogSenderWaitMessagesAndReplies[T]["message"], 'type'>} payload
     * @returns {Promise<ReplyPayload<SlogSenderWaitMessagesAndReplies[T]["reply"]>>}
     */
    async (type, payload) => {
      !sendWaitType || assert.fail('Invalid mutex state');

      const msg = { ...payload, type };

      sendWaitType = type;
      return pipeSend(msg)
        .then(async () => sendWaitQueue.get())
        .then(
          /** @param {SlogSenderWaitMessagesAndReplies[T]["reply"]} reply */ ({
            type: replyType,
            error,
            ...rest
          }) => {
            replyType === `${type}Reply` ||
              assert.fail(`Unexpected reply ${replyType}`);
            if (error) {
              throw error;
            }
            return rest;
          },
        )
        .finally(() => {
          sendWaitType = undefined;
        });
    },
  );

  cp.on(
    'message',
    /** @param { SlogSenderPipeWaitReplies } msg */
    msg => {
      // logger.log('received', msg);
      if (
        !msg ||
        typeof msg !== 'object' ||
        msg.type !== `${sendWaitType}Reply`
      ) {
        logger.warn('Received unexpected message', msg);
        return;
      }

      sendWaitQueue.put(msg);
    },
  );

  const flush = async () => sendWaitReply('flush', {});
  /** @param {import('./index.js').MakeSlogSenderOptions} options */
  const init = async options => sendWaitReply('init', { options });

  const send = obj => {
    void pipeSend({ type: 'send', obj }).catch(() => {});
  };

  const shutdown = async () => {
    // logger.log('shutdown');
    if (!cp.connected) {
      return;
    }

    await flush();
    cp.disconnect();
  };
  registerShutdown(shutdown);

  const { hasSender } = await init(opts).catch(err => {
    cp.disconnect();
    throw err;
  });

  if (!hasSender) {
    cp.disconnect();
    return undefined;
  }

  const slogSender = send;
  return Object.assign(slogSender, {
    forceFlush: async () => {
      await flush();
    },
    shutdown,
    usesJsonObject: false,
  });
};
