// @ts-check
import { Far } from '@endo/far';
import { makeMarshal } from '@endo/marshal';
import { assertCapData } from '@agoric/internal/src/lib-chainStorage.js';
import {
  BrandShape,
  DisplayInfoShape,
  IssuerShape,
} from '@agoric/ertp/src/typeGuards.js';
import { M, mustMatch } from '@endo/patterns';
import { zip } from '@agoric/internal';
import { extractStreamCellValue } from './vstorage.js';

const { Fail } = assert;

export const makeBoardContext = () => {
  /** @type {Map<string, {}>} */
  const idToValue = new Map();
  /** @type {Map<unknown, string>} */
  const valueToId = new Map();

  /**
   * Provide a remotable for each slot.
   *
   * @param {string} slot
   * @param {string} [iface] non-empty if present
   */
  const provide = (slot, iface) => {
    if (idToValue.has(slot)) {
      return idToValue.get(slot) || Fail`cannot happen`; // XXX check this statically?
    }
    if (!iface) throw Fail`1st occurrence must provide iface`;
    const json = { _: iface };
    // XXX ok to leave iface alone?
    /** @type {{}} */
    const value = Far(iface, { toJSON: () => json });
    idToValue.set(slot, value);
    valueToId.set(value, slot);
    return value;
  };

  /** Read-only board */
  const board = {
    /** @param {unknown} value */
    getId: value => {
      valueToId.has(value) || Fail`unknown value: ${value}`;
      return valueToId.get(value) || Fail`cannot happen`; // XXX check this statically?
    },

    /** @param {string} id */
    getValue: id => {
      assert.typeof(id, 'string');
      idToValue.has(id) || Fail`unknown id: ${id}`;
      return idToValue.get(id) || Fail`cannot happen`; // XXX check this statically?
    },
  };

  const marshaller = makeMarshal(board.getId, provide, {
    serializeBodyFormat: 'smallcaps',
  });

  return harden({
    board,
    register: provide,
    marshaller,
    /**
     * Unmarshall capData, creating a Remotable for each boardID slot.
     *
     * @type {(cd: import("@endo/marshal").CapData<string>) => unknown }
     */
    ingest: marshaller.fromCapData,
  });
};

/** @param {QueryDataResponseT} queryDataResponse */
export const extractCapData = queryDataResponse => {
  const cellValue = extractStreamCellValue(queryDataResponse);
  const capData = harden(JSON.parse(cellValue));
  assertCapData(capData);
  return capData;
};

// XXX where is this originally defined? vat-bank?
/**
 * @typedef {{
 *   brand: Brand<'nat'>,
 *   denom: string,
 *   displayInfo: DisplayInfo,
 *   issuer: Issuer<'nat'>,
 *   issuerName: string,
 *   proposedName: string,
 * }} VBankAssetDetail
 */
const AssetDetailShape = harden({
  brand: BrandShape,
  denom: M.string(),
  displayInfo: DisplayInfoShape,
  issuer: IssuerShape,
  issuerName: M.string(),
  proposedName: M.string(),
});
const InstanceShape = M.remotable('Instance');
const kindInfo = /** @type {const} */ ({
  brand: {
    shape: BrandShape,
    coerce: x => /** @type {Brand} */ (x),
  },
  instance: {
    shape: InstanceShape,
    coerce: x => /** @type {Instance} */ (x),
  },
  vbankAsset: {
    shape: AssetDetailShape,
    coerce: x => /** @type {VBankAssetDetail} */ (x),
  },
});

/**
 * @param {ReturnType<typeof makeBoardContext>} boardCtx
 * @param {ReturnType<import('../lib/vstorage.js').makeBatchQuery>} batchQuery
 */
const makeAgoricNames = async (boardCtx, batchQuery) => {
  const kinds = Object.keys(kindInfo);
  const { values: responses, errors } = await batchQuery(
    kinds.map(kind => ({
      kind: 'data',
      path: `published.agoricNames.${kind}`,
    })),
  );
  for (const [kind, err] of zip(kinds, errors)) {
    if (!err) continue;
    console.warn(kind, err);
  }
  const kindData = Object.fromEntries(zip(kinds, responses));

  /**
   * @template T
   * @param {keyof typeof kindInfo} kind
   * @param {(x: any) => T} _coerce
   */
  const ingestKind = (kind, _coerce) => {
    const queryDataResponse = kindData[kind];
    const capData = extractCapData(queryDataResponse);
    const xs = boardCtx.ingest(capData);
    mustMatch(xs, M.arrayOf([M.string(), kindInfo[kind].shape]));
    /** @type {[string, ReturnType<typeof _coerce>][]} */
    // @ts-expect-error runtime checked
    const entries = xs;
    const record = harden(Object.fromEntries(entries));
    return record;
  };
  const agoricNames = harden({
    brand: ingestKind('brand', kindInfo.brand.coerce),
    instance: ingestKind('instance', kindInfo.instance.coerce),
    vbankAsset: ingestKind('vbankAsset', kindInfo.vbankAsset.coerce),
  });
  return agoricNames;
};

/**
 * from @agoric/cosmic-proto/vstorage
 *
 * XXX import('@agoric/cosmic-proto/vstorage/query').QueryDataResponse doesn't worksomehow
 *
 * @typedef {Awaited<ReturnType<import('@agoric/cosmic-proto/vstorage/query.js').QueryClientImpl['Data']>>} QueryDataResponseT
 */

/**
 * A boardClient unmarshals vstorage query responses preserving object identiy.
 *
 * @param {ReturnType<import('../lib/vstorage.js').makeBatchQuery>} batchQuery
 */
export const makeBoardClient = batchQuery => {
  const boardCtx = makeBoardContext();
  /** @type {Awaited<ReturnType<makeAgoricNames>>} */
  let agoricNames;

  /**
   * @param {string[]} paths
   * @param {(path: string, msg: string) => void} [warn]
   */
  const readBatch = async (paths, warn = console.warn) => {
    const { values, errors } = await batchQuery(
      paths.map(path => ({ kind: 'data', path })),
    );
    for (let ix = 0; ix < errors.length; ix += 1) {
      if (!errors[+ix]) {
        continue;
      }
      warn(paths[+ix], errors[+ix]);
    }
    return harden(values.map(v => boardCtx.ingest(extractCapData(v))));
  };

  const fatal = (path, err) => {
    throw Error(`cannot get Data of ${path}: ${err}`);
  };
  return harden({
    batchQuery,
    provideAgoricNames: async () => {
      if (agoricNames) return agoricNames;
      agoricNames = await makeAgoricNames(boardCtx, batchQuery);
      return agoricNames;
    },
    readBatch,
    /** @type {(path: string) => Promise<unknown>} */
    readLatestHead: path => readBatch([path], fatal),
  });
};
