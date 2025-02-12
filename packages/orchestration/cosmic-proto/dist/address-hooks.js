/**
 * This module provides functions for encoding and decoding address hooks
 * which are comprised of a bech32 base address with an HTTP query string, all
 * wrapped in a bech32 envelope.
 *
 * @module address-hooks.js
 * @example
 *
 *     import {
 *       encodeAddressHook,
 *       decodeAddressHook,
 *     } from '@agoric/cosmic-proto/address-hooks.js';
 *
 *     const baseAddress = 'agoric1qqp0e5ys';
 *     const query = { key: 'value', foo: ['bar', 'baz'] };
 *
 *     const addressHook = encodeAddressHook(baseAddress, query);
 *     // 'agoric10rchqqplvehk70tzv9ezven0du7kyct6ye4k27faweskcat9qqqstnf2eq'
 *
 *     addressHook.startsWith('agoric10rch');
 *     // true
 *
 *     const decoded = decodeAddressHook(addressHook);
 *     // {
 *     //   baseAddress: 'agoric1qqp0e5ys',
 *     //   query: { foo: [ 'bar', 'baz' ], key: 'value' }
 *     // }
 */
/* eslint-disable no-bitwise */
import { bech32 } from 'bech32';
import queryString from 'query-string';
/* global globalThis */
/** @type {<T>(x: T) => T} */
const harden = globalThis.harden || Object.freeze;
// ADDRESS_HOOK_VERSION is the version of the address hook format used in this
// module.
const ADDRESS_HOOK_VERSION = 0;
if ((ADDRESS_HOOK_VERSION & 0x0f) !== ADDRESS_HOOK_VERSION) {
    throw Error(`ADDRESS_HOOK_VERSION ${ADDRESS_HOOK_VERSION} exceeds 0x0f`);
}
// ADDRESS_HOOK_BYTE_PREFIX is a magic prefix that identifies a hooked address.
// Chosen to make bech32 address hooks that look like "agoric10rch..."
const ADDRESS_HOOK_BYTE_PREFIX = [
    0x78,
    0xf1,
    0x70, // | ADDRESS_HOOK_VERSION
];
harden(ADDRESS_HOOK_BYTE_PREFIX);
/**
 * The default maximum number of characters in a bech32-encoded hooked address.
 */
export const DEFAULT_HOOKED_ADDRESS_CHAR_LIMIT = 1024;
/**
 * @typedef {Record<string, string | (string | null)[] | null>} HookQuery A
 * record of query keys mapped to query values.  `null` values denote valueless
 * keys.  Array values denote multiple occurrences of a key:
 *
 *      { key: null } // '?key'
 *      { key: 'value' } // '?key=value'
 *      { key: ['value1', 'value2', 'value3'] } // '?key=value1&key=value2&key=value3'
 *      { key: ['value1', null, 'value3'] } // '?key=value1&key&key=value3'
 */
/**
 * How many bytes are used to store the length of the base address.
 */
export const BASE_ADDRESS_LENGTH_BYTES = 2;
/**
 * @param {string} specimen
 * @param {number} [charLimit]
 * @returns {{ prefix: string; bytes: Uint8Array }}
 */
export const decodeBech32 = (specimen, charLimit = DEFAULT_HOOKED_ADDRESS_CHAR_LIMIT) => {
    const { prefix, words } = bech32.decode(specimen, charLimit);
    const rawBytes = bech32.fromWords(words);
    const bytes = new Uint8Array(rawBytes);
    return harden({ prefix, bytes });
};
harden(decodeBech32);
/**
 * @param {string} humanReadablePart
 * @param {ArrayLike<number>} bytes
 * @param {number} [charLimit]
 * @returns {string}
 */
export const encodeBech32 = (humanReadablePart, bytes, charLimit = DEFAULT_HOOKED_ADDRESS_CHAR_LIMIT) => {
    const words = bech32.toWords(bytes);
    return bech32.encode(humanReadablePart, words, charLimit);
};
harden(encodeBech32);
/**
 * Join raw base address bytes and hook data into a bech32-encoded hooked
 * address. The bech32-payload is:
 *
 * | offset | 0     | 3           | 3+len(baseAddress) | len(payload)-2   |
 * | ------ | ----- | ----------- | ------------------ | ---------------- |
 * | data   | magic | baseAddress | hookData           | len(baseAddress) |
 *
 * `magic` is a 3-byte prefix that identifies a hooked address and its version
 * nibble, whose value is 4 bits (between 0 and 0xf (15)).  Currently, the only
 * supported version is 0.
 *
 *      0x78, 0xf1, (0x70 | ADDRESS_HOOK_VERSION),
 *
 * This magic prefix encodes as `0rch`, regardless of the version or HRP (e.g.
 * `agoric10rch<rest of payload as bech32><bech32 checksum>`).
 *
 * @param {string} baseAddress
 * @param {ArrayLike<number>} hookData
 * @param {number} [charLimit]
 * @returns {string}
 */
export const joinHookedAddress = (baseAddress, hookData, charLimit = DEFAULT_HOOKED_ADDRESS_CHAR_LIMIT) => {
    const { prefix, bytes } = decodeBech32(baseAddress, charLimit);
    const baseAddressLength = bytes.length;
    const b = baseAddressLength;
    const hd = hookData.length;
    const maxBaseAddressLength = 2 ** (BASE_ADDRESS_LENGTH_BYTES * 8);
    if (b >= maxBaseAddressLength) {
        throw RangeError(`Base address length 0x${b.toString(16)} exceeds maximum 0x${maxBaseAddressLength.toString(16)}`);
    }
    if (!Number.isSafeInteger(hd) || hd < 0) {
        throw RangeError(`Hook data length ${hd} is not a non-negative integer`);
    }
    const prefixLength = ADDRESS_HOOK_BYTE_PREFIX.length;
    const hookBuf = new Uint8Array(prefixLength + b + hd + BASE_ADDRESS_LENGTH_BYTES);
    hookBuf.set(ADDRESS_HOOK_BYTE_PREFIX, 0);
    hookBuf[prefixLength - 1] |= ADDRESS_HOOK_VERSION;
    hookBuf.set(bytes, prefixLength);
    hookBuf.set(hookData, prefixLength + b);
    // Append the address length bytes, since we've already ensured these do not
    // exceed maxBaseAddressLength above.  These are big-endian because the length
    // is at the end of the payload, so if we want to support more bytes for the
    // length, we just need encroach further into the payload.  We can do that
    // without changing the meaning of the bytes at the end of existing payloads.
    let len = b;
    for (let i = 0; i < BASE_ADDRESS_LENGTH_BYTES; i += 1) {
        hookBuf[hookBuf.length - 1 - i] = len & 0xff;
        len >>>= 8;
    }
    return encodeBech32(prefix, hookBuf, charLimit);
};
harden(joinHookedAddress);
/**
 * @param {string} baseAddress
 * @param {HookQuery} query
 * @param {number} [charLimit]
 */
export const encodeAddressHook = (baseAddress, query, charLimit) => {
    const queryStr = queryString.stringify(query);
    const te = new TextEncoder();
    const hookData = te.encode(`?${queryStr}`);
    return joinHookedAddress(baseAddress, hookData, charLimit);
};
harden(encodeAddressHook);
/**
 * @param {string} addressHook
 * @param {number} [charLimit]
 * @returns {{ baseAddress: string; query: HookQuery }}
 * @throws {Error} if no hook string or hook string does not start with `?`
 */
export const decodeAddressHook = (addressHook, charLimit) => {
    const { baseAddress, hookData } = splitHookedAddress(addressHook, charLimit);
    const hookStr = new TextDecoder().decode(hookData);
    if (hookStr && !hookStr.startsWith('?')) {
        throw Error(`Hook data does not start with '?': ${hookStr}`);
    }
    const parsedQuery = queryString.parse(hookStr);
    /**
     * @type {HookQuery}
     */
    const query = harden({ ...parsedQuery });
    return harden({ baseAddress, query });
};
harden(decodeAddressHook);
/**
 * @param {string} specimen
 * @param {number} [charLimit]
 * @returns {{ baseAddress: string; hookData: Uint8Array }}
 */
export const splitHookedAddress = (specimen, charLimit = DEFAULT_HOOKED_ADDRESS_CHAR_LIMIT) => {
    const { prefix, bytes } = decodeBech32(specimen, charLimit);
    const prefixLength = ADDRESS_HOOK_BYTE_PREFIX.length;
    let version = 0xff;
    for (let i = 0; i < prefixLength; i += 1) {
        let maybeMagicByte = bytes[i];
        if (i === prefixLength - 1) {
            // Final byte has a low version nibble and a high magic nibble.
            version = maybeMagicByte & 0x0f;
            maybeMagicByte &= 0xf0;
        }
        if (maybeMagicByte !== ADDRESS_HOOK_BYTE_PREFIX[i]) {
            return harden({ baseAddress: specimen, hookData: new Uint8Array() });
        }
    }
    if (version !== ADDRESS_HOOK_VERSION) {
        throw TypeError(`Unsupported address hook version ${version}`);
    }
    let len = 0;
    for (let i = BASE_ADDRESS_LENGTH_BYTES - 1; i >= 0; i -= 1) {
        const byte = bytes.at(-i - 1);
        if (byte === undefined) {
            throw TypeError(`Cannot get base address length from byte ${-i - 1} of ${bytes.length}`);
        }
        len <<= 8;
        len |= byte;
    }
    const b = len;
    if (b > bytes.length - BASE_ADDRESS_LENGTH_BYTES - prefixLength) {
        throw TypeError(`Base address length 0x${b.toString(16)} is longer than specimen length ${bytes.length - BASE_ADDRESS_LENGTH_BYTES - prefixLength}`);
    }
    const baseAddressBuf = bytes.subarray(prefixLength, prefixLength + b);
    const baseAddress = encodeBech32(prefix, baseAddressBuf, charLimit);
    const hookData = bytes.subarray(prefixLength + b, -BASE_ADDRESS_LENGTH_BYTES);
    return harden({ baseAddress, hookData });
};
harden(splitHookedAddress);
//# sourceMappingURL=address-hooks.js.map