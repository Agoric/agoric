import * as encodingStar from '@cosmjs/encoding';
import { E, getInterfaceOf } from '@endo/far';

const { toAscii } = encodingStar;

/**
 * @import {ERef} from '@endo/far';
 * @import {VStorageKey} from '@agoric/notifier';
 */

/**
 * @param {string} storagePath
 * @returns {import('./types.js').CastingSpec}
 */
const swingsetPathToCastingSpec = storagePath =>
  harden({
    storeName: 'swingset',
    storeSubkey: toAscii(`swingset/data:${storagePath}`),
  });

// See details of encoding in golang/cosmos/x/vstorage/types/path_keys.go
const KEY_SEPARATOR_BYTE = 0;
const PATH_SEPARATOR_BYTE = '.'.charCodeAt(0);
const DATA_PREFIX_BYTES = new Uint8Array([0]);
const NO_DATA_VALUE = new Uint8Array([255]);

/**
 * @param {string} storagePath
 * @param {string} [storeName]
 * @returns {import('./types.js').CastingSpec}
 */
const vstoragePathToCastingSpec = (storagePath, storeName = 'vstorage') => {
  const elems = storagePath ? storagePath.split('.') : [];
  const buf = toAscii(`${elems.length}.${storagePath}`);
  return harden({
    storeName,
    storeSubkey: buf.map(b =>
      b === PATH_SEPARATOR_BYTE ? KEY_SEPARATOR_BYTE : b,
    ),
    dataPrefixBytes: DATA_PREFIX_BYTES,
    noDataValue: NO_DATA_VALUE,
  });
};

// TODO make a similar castingSpecToPath.
// This one uses VStorageKey which has storeSubkey:string, not UInt8Array
/**
 * @param {VStorageKey} vstorageKey
 * @returns {string}
 */
export const vstorageKeySpecToPath = ({ storeName, storeSubkey }) => {
  assert.equal(storeName, 'vstorage');
  const firstSeperator = storeSubkey.indexOf(
    String.fromCharCode(KEY_SEPARATOR_BYTE),
  );
  const published = storeSubkey.slice(firstSeperator);
  const elements = published.split(String.fromCharCode(KEY_SEPARATOR_BYTE));
  // drop the empty
  elements.shift();
  return `vstorage:${elements.join('.')}`;
};

export const DEFAULT_PATH_CONVERTER = vstoragePathToCastingSpec;

/**
 * @type {Record<string, (path: string) => import('./types.js').CastingSpec>}
 */
export const pathPrefixToConverters = harden({
  'swingset:': swingsetPathToCastingSpec,
  'vstorage:': vstoragePathToCastingSpec,
  ':': DEFAULT_PATH_CONVERTER,
});

/**
 * @param {string} specString
 * @returns {import('./types.js').CastingSpec}
 */
export const makeCastingSpecFromString = specString => {
  assert.typeof(specString, 'string');
  const match = specString.match(/^([^:.]*:)(.*)/);
  assert(
    match,
    `spec string ${specString} does not match 'PREFIX:PATH' or ':PATH'`,
  );
  const kind = match[1];
  const storePath = match[2];
  const converter = pathPrefixToConverters[kind];
  assert(converter, `Unknown pathKind ${kind}`);
  return converter(storePath);
};

const te = new TextEncoder();

/**
 * @param {any} specObj
 * @returns {import('./types.js').CastingSpec}
 */
export const makeCastingSpecFromObject = specObj => {
  const {
    storeName,
    storeSubkey,
    dataPrefixBytes,
    noDataValue,
    subscription,
    notifier,
  } = specObj;
  if (subscription || notifier) {
    return harden({
      subscription,
      notifier,
    });
  }
  let subkey = storeSubkey;
  if (typeof storeSubkey === 'string') {
    subkey = te.encode(storeSubkey);
  }
  let dataPrefix = dataPrefixBytes;
  if (typeof dataPrefixBytes === 'string') {
    dataPrefix = te.encode(dataPrefixBytes);
  }
  let noData = noDataValue;
  if (typeof noDataValue === 'string') {
    noData = te.encode(noDataValue);
  }
  return harden({
    storeName,
    storeSubkey: subkey,
    dataPrefixBytes: dataPrefix,
    noDataValue: noData,
  });
};

/**
 * @param {ERef<any>} specCap
 * @returns {Promise<import('./types.js').CastingSpec>}
 */
export const makeCastingSpecFromRef = async specCap => {
  const specObj = await E(specCap).getStoreKey();
  return makeCastingSpecFromObject(specObj);
};

/**
 * Create an abstract type from a given source representation
 *
 * @param {ERef<unknown>} sourceP
 * @returns {Promise<import('./types.js').CastingSpec>}
 */
export const makeCastingSpec = async sourceP => {
  const spec = await sourceP;
  if (typeof spec === 'string') {
    return makeCastingSpecFromString(spec);
  }
  // @ts-expect-error type detection
  const { storeName, subscription, notifier } = spec;
  if (storeName || subscription || notifier) {
    return makeCastingSpecFromObject(spec);
  }
  if (getInterfaceOf(spec)) {
    return makeCastingSpecFromRef(spec);
  }
  assert.fail(`CastingSpec ${spec} is not a string, object, or ref`);
};
