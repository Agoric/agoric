/**
 * The default maximum number of characters in a bech32-encoded hooked address.
 */
export const DEFAULT_HOOKED_ADDRESS_CHAR_LIMIT: 1024;
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
export const BASE_ADDRESS_LENGTH_BYTES: 2;
export function decodeBech32(specimen: string, charLimit?: number): {
    prefix: string;
    bytes: Uint8Array;
};
export function encodeBech32(humanReadablePart: string, bytes: ArrayLike<number>, charLimit?: number): string;
export function joinHookedAddress(baseAddress: string, hookData: ArrayLike<number>, charLimit?: number): string;
export function encodeAddressHook(baseAddress: string, query: HookQuery, charLimit?: number): string;
export function decodeAddressHook(addressHook: string, charLimit?: number): {
    baseAddress: string;
    query: HookQuery;
};
export function splitHookedAddress(specimen: string, charLimit?: number): {
    baseAddress: string;
    hookData: Uint8Array;
};
/**
 * A
 * record of query keys mapped to query values.  `null` values denote valueless
 * keys.  Array values denote multiple occurrences of a key:
 *
 *      { key: null } // '?key'
 *      { key: 'value' } // '?key=value'
 *      { key: ['value1', 'value2', 'value3'] } // '?key=value1&key=value2&key=value3'
 *      { key: ['value1', null, 'value3'] } // '?key=value1&key&key=value3'
 */
export type HookQuery = Record<string, string | (string | null)[] | null>;
