import {
  boardSlottingMarshaller,
  makeBoardRemote,
} from '@agoric/vats/tools/board-utils.js';
import { assertAllDefined } from '@agoric/internal';
import { makeVStorage } from './vstorage.js';

export { boardSlottingMarshaller };

/**
 * @import {MinimalNetworkConfig} from './network-config.js';
 * @import {TypedPublished} from './types.js';
 * @import {VStorage} from './vstorage.js';
 */

/** @deprecated */
export const makeFromBoard = () => {
  const cache = new Map();
  const convertSlotToVal = (boardId, iface) => {
    if (cache.has(boardId)) {
      return cache.get(boardId);
    }
    const val = makeBoardRemote({ boardId, iface });
    cache.set(boardId, val);
    return val;
  };
  return harden({ convertSlotToVal });
};
/** @typedef {ReturnType<typeof makeFromBoard>} IdMap */

/** @deprecated */
export const storageHelper = {
  /** @param { string } txt */
  parseCapData: txt => {
    assert(typeof txt === 'string', typeof txt);
    /** @type {{ value: string }} */
    const { value } = JSON.parse(txt);
    const specimen = JSON.parse(value);
    const { blockHeight, values } = specimen;
    assert(values, `empty values in specimen ${value}`);
    const capDatas = storageHelper.parseMany(values);
    return { blockHeight, capDatas };
  },
  /**
   * @param {string} txt
   * @param {IdMap} ctx
   */
  unserializeTxt: (txt, ctx) => {
    const { capDatas } = storageHelper.parseCapData(txt);
    return capDatas.map(capData =>
      boardSlottingMarshaller(ctx.convertSlotToVal).fromCapData(capData),
    );
  },
  /** @param {string[]} capDataStrings array of stringified capData */
  parseMany: capDataStrings => {
    assert(capDataStrings && capDataStrings.length);
    /** @type {{ body: string, slots: string[] }[]} */
    const capDatas = capDataStrings.map(s => JSON.parse(s));
    for (const capData of capDatas) {
      assert(typeof capData === 'object' && capData !== null);
      assert('body' in capData && 'slots' in capData);
      assert(typeof capData.body === 'string');
      assert(Array.isArray(capData.slots));
    }
    return capDatas;
  },
};
harden(storageHelper);

/**
 * @deprecated
 * @param {IdMap} ctx
 * @param {VStorage} vstorage
 * @returns {Promise<import('@agoric/vats/tools/board-utils.js').AgoricNamesRemotes>}
 */
export const makeAgoricNames = async (ctx, vstorage) => {
  assertAllDefined({ ctx, vstorage });
  const reverse = {};
  const entries = await Promise.all(
    ['brand', 'instance', 'vbankAsset'].map(async kind => {
      const content = await vstorage.readLatest(
        `published.agoricNames.${kind}`,
      );
      /** @type {Array<[string, import('@agoric/vats/tools/board-utils.js').BoardRemote]>} */
      const parts = storageHelper.unserializeTxt(content, ctx).at(-1);
      for (const [name, remote] of parts) {
        if ('getBoardId' in remote) {
          reverse[remote.getBoardId()] = name;
        }
      }
      return [kind, Object.fromEntries(parts)];
    }),
  );
  return { ...Object.fromEntries(entries), reverse };
};

/**
 * @param {{ fetch: typeof window.fetch }} io
 * @param {MinimalNetworkConfig} config
 */
export const makeVstorageKit = ({ fetch }, config) => {
  try {
    const vstorage = makeVStorage({ fetch }, config);
    const fromBoard = makeFromBoard();

    const marshaller = boardSlottingMarshaller(fromBoard.convertSlotToVal);

    /** @type {(txt: string) => unknown} */
    const unserializeHead = txt =>
      storageHelper.unserializeTxt(txt, fromBoard).at(-1);

    /**
     * Read latest at path and unmarshal it
     * @type {(path: string) => Promise<unknown>}
     */
    const readLatestHead = async path =>
      vstorage.readLatest(path).then(unserializeHead);

    /**
     * Read latest at published path and unmarshal it.
     *
     * Note this does not perform a runtime check to verify the shape. The
     * static types come from the spec of what is supposed to be written to
     * vstorage, which is validated in testing of the chain code that is run
     * in consensus.
     *
     * @type {<T extends string>(subpath: T) => Promise<TypedPublished<T>>}
     */
    const readPublished = async subpath =>
      // @ts-expect-error cast
      readLatestHead(`published.${subpath}`);

    return {
      fromBoard,
      marshaller,
      readLatestHead,
      readPublished,
      unserializeHead,
      vstorage,
    };
  } catch (err) {
    throw Error(`RPC failure (${config.rpcAddrs}): ${err.message}`);
  }
};
/** @typedef {ReturnType<typeof makeVstorageKit>} VstorageKit */
