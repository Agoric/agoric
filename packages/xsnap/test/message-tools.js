// @ts-check

const { freeze } = Object;

// a TextDecoder has mutable state; only export the (pure) decode function
/** @type {TextDecoder['decode']} */
export const decode = (decoder => decoder.decode.bind(decoder))(
  new TextDecoder(),
);

/** @type {TextEncoder['encode']} */
export const encode = (encoder => encoder.encode.bind(encoder))(
  new TextEncoder(),
);

/**
 * @param {string} url
 * @param {typeof import('fs').promises.readFile} [readFile]
 */
export function loader(url, readFile = undefined) {
  /** @param {string} ref */
  const resolve = ref => new URL(ref, url).pathname;
  return freeze({
    resolve,
    /** @param {string} ref */
    asset: async ref => readFile(resolve(ref), 'utf-8'),
  });
}

/**
 * @param {{
 *   spawn: typeof import('child_process').spawn;
 *   os: string;
 * }} io
 * @returns {import('../src/xsnap.js').XSnapOptions & { messages: string[] }}
 */
export function options({ spawn, os }) {
  const messages = [];

  /** @param {Uint8Array} message */
  async function handleCommand(message) {
    messages.push(decode(message));
    return new Uint8Array();
  }

  return freeze({
    name: 'xsnap test worker',
    stderr: 'inherit',
    stdout: 'inherit',
    spawn,
    os,
    handleCommand,
    messages,
  });
}
