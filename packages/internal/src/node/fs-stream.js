import { open } from 'node:fs/promises';
import process from 'node:process';
import { promisify } from 'node:util';

/**
 * @param {import('fs').ReadStream
 *   | import('fs').WriteStream
 *   | import('net').Socket} stream
 * @returns {Promise<void>}
 */
export const fsStreamReady = stream =>
  new Promise((resolve, reject) => {
    if (stream.destroyed) {
      reject(Error('Stream already destroyed'));
      return;
    }

    if (!stream.pending) {
      resolve();
      return;
    }

    const onReady = () => {
      cleanup();
      resolve();
    };

    /** @param {Error} err */
    const onError = err => {
      cleanup();
      reject(err);
    };

    const cleanup = () => {
      stream.off('ready', onReady);
      stream.off('error', onError);
    };

    stream.on('ready', onReady);
    stream.on('error', onError);
  });

/** @typedef {NonNullable<Awaited<ReturnType<typeof makeFsStreamWriter>>>} FsStreamWriter */
/** @param {string | undefined | null} filePath */
export const makeFsStreamWriter = async filePath => {
  if (!filePath) {
    return undefined;
  }

  const { handle, stream } = await (async () => {
    if (filePath === '-') {
      return { handle: undefined, stream: process.stdout };
    }
    const fh = await open(filePath, 'a');
    return { handle: fh, stream: fh.createWriteStream({ flush: true }) };
  })();
  await fsStreamReady(stream);
  const writeAsync = promisify(stream.write.bind(stream));
  const endAsync = stream.end && promisify(stream.end.bind(stream));

  let flushed = Promise.resolve();
  let closed = false;

  const updateFlushed = p => {
    flushed = flushed.then(
      () => p,
      err =>
        p.then(
          () => Promise.reject(err),
          pError =>
            Promise.reject(
              pError !== err ? AggregateError([err, pError]) : err,
            ),
        ),
    );
    flushed.catch(() => {});
  };

  const write = async data => {
    const written = closed
      ? Promise.reject(Error('Stream closed'))
      : writeAsync(data);
    updateFlushed(written);
    const waitForDrain = await written;
    if (waitForDrain) {
      await new Promise(resolve => stream.once('drain', resolve));
    }
  };

  const flush = async () => {
    await flushed;
    await handle?.sync().catch(err => {
      if (err.code === 'EINVAL') {
        return;
      }
      throw err;
    });
  };

  const close = async () => {
    // TODO: Consider creating a single Error here to use a write rejection
    closed = true;
    await flush();
    await endAsync?.();
  };

  stream.on('error', err => updateFlushed(Promise.reject(err)));

  return harden({ write, flush, close });
};
