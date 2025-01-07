// @ts-check
import { Fail, q } from '@endo/errors';
import { HandledPromise } from '@endo/eventual-send'; // TODO: convince tsc this isn't needed

import { makeScalarMapStore } from '@agoric/store';
import { Far, makeMarshal, Remotable } from '@endo/marshal';
import { DEFAULT_PREFIX } from '@agoric/vats/src/lib-board.js';

/**
 * @import {PassableCap, RemotableObject} from '@endo/marshal';
 * @import {Key} from '@endo/patterns';
 * @import {BoardId} from '@agoric/vats/src/lib-board.js';
 */

/**
 * ID from a board made with { prefix: DEFAULT_PREFIX }
 *
 * @param {unknown} specimen
 * @returns {specimen is BoardId}
 */
const isDefaultBoardId = specimen => {
  return typeof specimen === 'string' && specimen.startsWith(DEFAULT_PREFIX);
};

/**
 * When marshaling a purse, payment, etc. we partition the slots using prefixes.
 *
 * @template {Record<string, IdTable<any, any>>} T
 * @typedef {`${string & keyof T}:${Digits}`} WalletSlot
 */
/**
 * @template {string} K
 * @typedef {`${K}:${Digits}`} KindSlot<K>
 */

/**
 * @template {Record<string, IdTable<any, any>>} T
 * @param {T} _tables
 * @param {string & keyof T} kind
 * @param {number} id
 * @returns {WalletSlot<T>}
 */
const makeWalletSlot = (_tables, kind, id) => {
  const digits = /** @type {Digits} */ (`${id}`);
  return `${kind}:${digits}`;
};

/**
 * @template {Record<string, IdTable<any, any>>} T
 * @param {T} record
 * @param {(value: string, index: number, obj: string[]) => boolean} predicate
 * @returns {(string & keyof T) | undefined}
 */
const findKey = (record, predicate) => {
  const key = Object.keys(record).find(predicate);
  return key;
};

/**
 * @template {Record<string, IdTable<any, any>>} T
 * @param {T} tables
 * @param {string} slot
 * @returns {{ kind: undefined | (string & keyof T); id: number }}
 */
const parseWalletSlot = (tables, slot) => {
  const kind = findKey(tables, k => slot.startsWith(`${k}:`));
  const id = kind ? Number(slot.slice(kind.length + 1)) : NaN;
  return { kind, id };
};

/**
 * Since KindSlots always include a colon and BoardIds never do, we an mix them
 * without confusion.
 *
 * @template {Record<string, IdTable<any, any>>} T
 * @typedef {WalletSlot<T> | BoardId} MixedSlot
 */
/**
 * @typedef {`1` | `12` | `123`} Digits - 1 or more digits. NOTE: the typescript
 *   definition here is more restrictive than actual usage.
 */

/**
 * @template {Key} Slot
 * @template {PassableCap} Val
 * @typedef {{
 *   bySlot: MapStore<Slot, Val>;
 *   byVal: MapStore<Val, Slot>;
 * }} IdTable<Value>
 */

/**
 * @template {Key} Slot
 * @template {PassableCap} Val
 * @param {IdTable<Slot, PassableCap>} table
 * @param {Slot} slot
 * @param {Val} val
 */
const initSlotVal = (table, slot, val) => {
  table.bySlot.init(slot, val);
  table.byVal.init(val, slot);
};

/**
 * Make context for exporting wallet data where brands etc. can be recognized by
 * boardId. Export for use outside the smart wallet.
 *
 * When serializing wallet state for, there's a tension between
 *
 * - keeping purses etc. closely held
 * - recognizing identity of brands also referenced in the state of contracts such
 *   as the AMM
 *
 * `makeMarshal()` is parameterized by the type of slots. Here we use a disjoint
 * union of
 *
 * - board ids for widely shared objects
 * - kind:seq ids for closely held objects; for example purse:123
 */
export const makeExportContext = () => {
  const walletObjects = {
    /** @type {IdTable<number, Purse>} */
    purse: {
      bySlot: makeScalarMapStore(),
      byVal: makeScalarMapStore(),
    },
    /** @type {IdTable<number, Payment>} */
    payment: {
      bySlot: makeScalarMapStore(),
      byVal: makeScalarMapStore(),
    },
    // TODO: offer, contact, dapp
    /** @type {IdTable<number, PassableCap>} */
    unknown: {
      bySlot: makeScalarMapStore(),
      byVal: makeScalarMapStore(),
    },
  };
  /** @type {IdTable<BoardId, PassableCap>} */
  const boardObjects = {
    bySlot: makeScalarMapStore(),
    byVal: makeScalarMapStore(),
  };

  /**
   * Look up the slot in mappings from published data else try walletObjects
   * that we have seen.
   *
   * @param {MixedSlot<typeof walletObjects>} slot
   * @param {string} _iface
   * @throws if not found (a slotToVal function typically conjures a new
   *   identity)
   */
  const slotToVal = (slot, _iface) => {
    if (isDefaultBoardId(slot) && boardObjects.bySlot.has(slot)) {
      return boardObjects.bySlot.get(slot);
    }
    const { kind, id } = parseWalletSlot(walletObjects, slot);
    kind || Fail`bad slot kind: ${slot}`;
    const val = walletObjects[kind].bySlot.get(id); // or throw
    return val;
  };

  let unknownNonce = 0;

  /**
   * @param {PassableCap} val
   * @returns {MixedSlot<typeof walletObjects>}
   */
  const valToSlot = val => {
    if (boardObjects.byVal.has(val)) {
      return boardObjects.byVal.get(val);
    }
    const kind = findKey(walletObjects, k => walletObjects[k].byVal.has(val));
    if (kind) {
      // @ts-expect-error has(val) above ensures val has the right type
      const id = walletObjects[kind].byVal.get(val);
      return makeWalletSlot(walletObjects, kind, id);
    }
    unknownNonce += 1;
    const slot = makeWalletSlot(walletObjects, 'unknown', unknownNonce);
    initSlotVal(walletObjects.unknown, unknownNonce, val);
    return slot;
  };

  /**
   * @template {PassableCap} V
   * @param {string & keyof typeof walletObjects} kind
   * @param {IdTable<number, V>} table
   */
  const makeSaver = (kind, table) => {
    let nonce = 0;
    /** @param {V} val */
    const saver = val => {
      nonce += 1;
      initSlotVal(table, nonce, val);
    };
    return saver;
  };

  return harden({
    savePurseActions: makeSaver('purse', walletObjects.purse),
    savePaymentActions: makeSaver('payment', walletObjects.payment),
    /**
     * @param {number} id
     * @param {Purse} purse
     */
    initPurseId: (id, purse) => {
      initSlotVal(walletObjects.purse, id, purse);
    },
    purseEntries: walletObjects.purse.bySlot.entries,
    /**
     * @param {BoardId} id
     * @param {RemotableObject} val
     */
    initBoardId: (id, val) => {
      initSlotVal(boardObjects, id, val);
    },
    /**
     * @param {BoardId} id
     * @param {RemotableObject} val
     */
    ensureBoardId: (id, val) => {
      if (boardObjects.byVal.has(val)) {
        assert.equal(boardObjects.byVal.get(val), id);
        return;
      }
      initSlotVal(boardObjects, id, val);
    },
    ...makeMarshal(valToSlot, slotToVal, { serializeBodyFormat: 'smallcaps' }),
  });
};
/** @typedef {ReturnType<typeof makeExportContext>} ExportContext */

const defaultMakePresence = iface => {
  const severed = `SEVERED: ${iface.replace(/^Alleged: /, '')}`;
  return Far(severed, {});
};

/**
 * Make context for marshalling wallet or board data. To be imported into the
 * client, which never exports objects.
 *
 * @param {(iface: string) => PassableCap} [makePresence]
 */
export const makeImportContext = (makePresence = defaultMakePresence) => {
  const walletObjects = {
    /** @type {IdTable<number, PassableCap>} */
    purse: {
      bySlot: makeScalarMapStore(),
      byVal: makeScalarMapStore(),
    },
    /** @type {IdTable<number, PassableCap>} */
    payment: {
      bySlot: makeScalarMapStore(),
      byVal: makeScalarMapStore(),
    },
    /** @type {IdTable<number, PassableCap>} */
    unknown: {
      bySlot: makeScalarMapStore(),
      byVal: makeScalarMapStore(),
    },
  };
  /** @type {IdTable<BoardId, PassableCap>} */
  const boardObjects = {
    bySlot: makeScalarMapStore(),
    byVal: makeScalarMapStore(),
  };

  /**
   * @template {Key} Slot
   * @template {PassableCap} Val
   * @param {IdTable<Slot, Val>} table
   * @param {Slot} slot
   * @param {string} iface
   */
  const provideVal = async (table, slot, iface) => {
    if (table.bySlot.has(slot)) {
      return table.bySlot.get(slot);
    }
    const val = makePresence(iface);
    initSlotVal(table, slot, val);
    return val;
  };

  const slotToVal = {
    /**
     * @param {string} slot
     * @param {string} iface
     */
    fromBoard: async (slot, iface) => {
      isDefaultBoardId(slot) || Fail`bad board slot ${q(slot)}`;
      return provideVal(boardObjects, slot, iface);
    },

    /**
     * @param {string} slot
     * @param {string} iface
     */
    fromMyWallet: async (slot, iface) => {
      if (!slot) {
        // Empty or null slots are neither in the wallet nor the board.
        return makePresence(`${slot}`);
      }
      const { kind, id } = parseWalletSlot(walletObjects, slot);
      return kind
        ? provideVal(walletObjects[kind], id, iface)
        : slotToVal.fromBoard(slot, iface);
    },
  };

  const valToSlot = {
    fromBoard: val => boardObjects.byVal.get(val),
    /** @param {PassableCap} val */
    fromMyWallet: val => {
      const kind = findKey(walletObjects, k => walletObjects[k].byVal.has(val));
      if (kind === undefined) {
        throw Fail`cannot serialize unregistered ${val}`;
      }

      const id = walletObjects[kind].byVal.get(val);
      return makeWalletSlot(walletObjects, kind, id);
    },
  };

  const marshal = {
    fromBoard: makeMarshal(valToSlot.fromBoard, slotToVal.fromBoard, {
      marshalName: 'fromBoard',
      serializeBodyFormat: 'smallcaps',
    }),
    fromMyWallet: makeMarshal(valToSlot.fromMyWallet, slotToVal.fromMyWallet, {
      marshalName: 'fromMyWallet',
      serializeBodyFormat: 'smallcaps',
    }),
  };

  return harden({
    /**
     * @param {BoardId} id
     * @param {PassableCap} val
     */
    initBoardId: (id, val) => {
      initSlotVal(boardObjects, id, val);
    },
    /**
     * @param {BoardId} id
     * @param {PassableCap} val
     */
    ensureBoardId: (id, val) => {
      if (boardObjects.byVal.has(val)) {
        assert.equal(boardObjects.byVal.get(val), id);
        return;
      }
      initSlotVal(boardObjects, id, val);
    },
    fromMyWallet: Far('wallet marshaller', { ...marshal.fromMyWallet }),
    fromBoard: Far('board marshaller', { ...marshal.fromBoard }),
  });
};
/** @typedef {ReturnType<typeof makeImportContext>} ImportContext */

/**
 * @param {string} iface
 * @param {{
 *   applyMethod: (
 *     target: unknown,
 *     method: string | symbol,
 *     args: unknown[],
 *   ) => void;
 *   applyFunction: (target: unknown, args: unknown[]) => void;
 * }} handler
 */
const makePresence = (iface, handler) => {
  let obj;

  void new HandledPromise((resolve, reject, resolveWithPresence) => {
    obj = resolveWithPresence(handler);
  });
  assert(obj);
  return Remotable(iface, undefined, obj);
};

/**
 * @param {string} iface
 * @param {(parts: unknown[]) => void} log
 */
export const makeLoggingPresence = (iface, log) => {
  /** @type {any} */ // TODO: solve types puzzle
  const it = makePresence(iface, {
    applyMethod: (target, method, args) => {
      log(harden(['applyMethod', target, method, args]));
    },
    applyFunction: (target, args) => {
      log(harden(['applyFunction', target, args]));
    },
  });
  return it;
};
