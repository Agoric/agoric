/* global setTimeout */
import { Far } from '@endo/far';
import { makeMarshal } from '@endo/marshal';

/**
 * Default to the local chain.
 */
export const DEFAULT_BOOTSTRAP = 'http://localhost:26657';

export const DEFAULT_JITTER_SECONDS = 5;

export const DEFAULT_POLL_WITH_EVENTS_SECONDS = 600;

export const DEFAULT_KEEP_POLLING_SECONDS = 5;

/**
 * Resolve a Promise after a given number of milliseconds.
 *
 * SECURITY: closes over setTimeout global
 *
 * @param {number} ms
 * @returns {Promise<void>}
 */
export const delay = async ms =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * @param {number} range
 * @param {number} [cap]
 */
export const randomBackoff = (range, cap = range) => {
  return Math.random() * Math.min(cap, range);
};

/**
 * @param {number} [attempt]
 * @param {number} [base]
 * @param {number} [cap]
 */
export const exponentialBackoff = (attempt = 0, base = 1_000, cap = 30_000) => {
  return randomBackoff(2 ** attempt * base, cap);
};

/**
 * Add a little to the retry delay to avoid a thundering herd.
 *
 * @param {string} where
 * @returns {Promise<void>}
 */
export const DEFAULT_JITTER = async where => {
  const jitter = randomBackoff(DEFAULT_JITTER_SECONDS * 1_000);
  console.debug(`jittering ${where} by ${Math.ceil(jitter)}ms`);
  return delay(jitter);
};

/**
 * Report an error, then retry the leader operation after a second or two.
 *
 * @param {string} where
 * @param {any} err
 * @param {number} [attempt]
 * @returns {Promise<void>}
 */
export const DEFAULT_RETRY_CALLBACK = async (where, err, attempt = 0) => {
  const backoff = exponentialBackoff(attempt);
  console.log(
    `retrying ${where} in ${Math.ceil(backoff)}ms after attempt #${attempt}`,
    err,
  );
  return delay(backoff);
};

/**
 * Return true after we want to be sure we received latest state something.
 *
 * @returns {Promise<boolean>}
 */
export const DEFAULT_KEEP_POLLING = async () =>
  delay(randomBackoff(DEFAULT_KEEP_POLLING_SECONDS * 1_000)).then(() => true);

export const MAKE_DEFAULT_DECODER = () => {
  /**
   * Parse JSON.
   *
   * @param {string} str
   */
  return harden(str => {
    try {
      return harden(JSON.parse(str));
    } catch (error) {
      throw Error(`Cannot decode alleged JSON (${error.message}): ${str}`);
    }
  });
};

/**
 * Unserialize the JSONable data.
 *
 * @type {() => import('./types.js').Unserializer}
 */
export const MAKE_DEFAULT_UNSERIALIZER = () => {
  const ifaceAllegedPrefix = 'Alleged: ';
  const ifaceInaccessiblePrefix = 'SEVERED: ';
  const seen = new Map();
  const slotToVal = (slot, iface) => {
    // Private object.
    if (seen.has(slot)) {
      return seen.get(slot);
    }
    if (typeof iface === 'string' && iface.startsWith(ifaceAllegedPrefix)) {
      iface = iface.slice(ifaceAllegedPrefix.length);
    }
    const obj = Far(`${ifaceInaccessiblePrefix}${iface}`, {});
    seen.set(slot, obj);
    return obj;
  };
  return Far('marshal unserializer', {
    fromCapData: makeMarshal(undefined, slotToVal, {
      serializeBodyFormat: 'smallcaps',
    }).fromCapData,
    /** @deprecated use fromCapData */
    unserialize: makeMarshal(undefined, slotToVal, {
      serializeBodyFormat: 'smallcaps',
    }).fromCapData,
  });
};
