// @ts-check

import './types.js';
import { encodeBase64, decodeBase64 } from '@endo/base64';

/* eslint-disable no-bitwise */
/**
 * Convert some data to bytes.
 *
 * @param {Data} data
 * @returns {Bytes}
 */
export function toBytes(data) {
  /** @type {Data | number[]} */
  let bytes = data;
  // TODO: We really need marshallable TypedArrays.
  if (typeof bytes === 'string') {
    bytes = bytes.split('').map(c => c.charCodeAt(0));
  }

  // We return the raw characters in the lower half of
  // the String's representation.
  const buf = new Uint8Array(bytes);
  return String.fromCharCode.apply(null, buf);
}

/**
 * Convert bytes to a String.
 *
 * @param {Bytes} bytes
 * @returns {string}
 */
export function bytesToString(bytes) {
  return bytes;
}

/**
 * Base64, as specified in https://tools.ietf.org/html/rfc4648#section-4
 *
 * @param {Data} data
 * @returns {string} Base64 encoding
 */
export function dataToBase64(data) {
  /** @type {Uint8Array | null} */
  let bytes;
  if (typeof data === 'string') {
    bytes = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i += 1) {
      bytes[i] = data.charCodeAt(i);
    }
  } else {
    bytes = new Uint8Array(data);
  }
  return encodeBase64(bytes);
}

/**
 * Decodes a string into base64.
 *
 * @param {string} string Base64-encoded string
 * @returns {Bytes} Decoded bytes
 */
export function base64ToBytes(string) {
  return toBytes(decodeBase64(string));
}
