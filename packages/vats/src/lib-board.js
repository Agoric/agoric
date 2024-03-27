/**
 * @file lib-board: share objects by way of plain-data ids
 * @see prepareBoardKit()
 */

import { assert, Fail, q } from '@agoric/assert';
import { prepareDurablePublishKit } from '@agoric/notifier';
import { M, makeScalarBigMapStore, prepareExoClassKit } from '@agoric/vat-data';
import {
  defineRecorderKit,
  prepareRecorder,
} from '@agoric/zoe/src/contractSupport/recorder.js';
import { E, Far } from '@endo/far';
import { makeMarshal } from '@endo/marshal';

import { crc6 } from './crc.js';

export const DEFAULT_CRC_DIGITS = 2;
export const DEFAULT_PREFIX = 'board0';

//#region Interface Guards
const CapDataShape = { body: M.string(), slots: M.array() };
const MarshalI = M.interface('Marshaller', {
  toCapData: M.call(M.any()).returns(CapDataShape),
  serialize: M.call(M.any()).returns(CapDataShape),
  fromCapData: M.call(CapDataShape).returns(M.any()),
  serializeAndStringify: M.callWhen(M.any()).returns(M.string()),
  unserialize: M.call(CapDataShape).returns(M.any()),
  parseAndDecode: M.callWhen(M.string()).returns(M.any()),
});

const IdShape = M.string();
const ValShape = M.scalar();
const BoardKitIKit = {
  board: M.interface('Board', {
    has: M.call(ValShape).returns(M.boolean()),
    getValue: M.call(IdShape).returns(ValShape),
    lookup: M.call().rest(M.arrayOf(IdShape)).returns(M.promise()),
    getId: M.call(ValShape).returns(IdShape),
    ids: M.call().returns(M.arrayOf(IdShape)),
    getPublishingMarshaller: M.call().returns(M.remotable()),
    getReadonlyMarshaller: M.call().returns(M.remotable()),
  }),
  publishingMarshaller: MarshalI,
  readonlyMarshaller: MarshalI,
};
//#endregion

/**
 * For a value with a known id in the board, we can use that board id as a slot
 * to preserve identity when marshaling.
 *
 * The contents of the string depend on the `prefix` and `crcDigits` options:
 * `${prefix}${crc}${seq}`
 *
 * For example, 'board0371' for prefix: 'board0', seq: 1, 2 digits crc.
 *
 * @typedef {string} BoardId
 */

/**
 * Calculate a CRC, padding to crcDigits.
 *
 * @param {number | string} data
 * @param {number} crcDigits
 */
const calcCrc = (data, crcDigits) => {
  // The explicit use of crcmodels is to avoid a typing error.
  // Add 1 to guarantee we don't get a 0.
  const crc = crc6.calculate(data) + 1;
  const crcStr = crc.toString().padStart(crcDigits, '0');
  assert(crcStr.length <= crcDigits, `CRC too big for its britches ${crcStr}`);
  return crcStr;
};

/**
 * @typedef {ReturnType<typeof initDurableBoardState>} BoardState // TODO: use
 *   Key from @agoric/store when available
 * @see {prepareExoClassKit}
 * @see {@link ../../SwingSet/docs/virtual-objects.md|SwingSet Virtual Objects} Hoisting this function makes defining the state type concise.
 *
 * @typedef {import('@endo/marshal').Passable} Key
 */

// TODO consider tightening initSequence to bigint only
/**
 * Make state for the board. Hoisted up to define the BoardState type.
 *
 * @param {bigint | number} [initSequence]
 * @param {object} [options]
 * @param {string} [options.prefix] prefix for all ids generated
 * @param {number} [options.crcDigits] count of digits to use in CRC at end of
 *   the id
 */
const initDurableBoardState = (
  initSequence = 0,
  { prefix = DEFAULT_PREFIX, crcDigits = DEFAULT_CRC_DIGITS } = {},
) => {
  const immutable = { prefix, crcDigits };

  const lastSequence = BigInt(initSequence);
  /** @type {MapStore<BoardId, Key>} */
  const idToVal = makeScalarBigMapStore('idToVal', {
    durable: true,
    keyShape: IdShape,
    valueShape: ValShape,
  });
  /** @type {MapStore<Key, BoardId>} */
  const valToId = makeScalarBigMapStore('valToId', {
    durable: true,
    keyShape: ValShape,
    valueShape: IdShape,
  });

  const mutable = { lastSequence, idToVal, valToId };

  return {
    ...immutable,
    ...mutable,
  };
};

//#region Marshaller utils
// These utils are used by the {readonlyMarshaller, publishingMarshaller} facets
// to serialize/unserialize. They can't return the marshallers themselves
// because of the heap cost of maintaining those objects. Instead they make
// transient marshallers that get GCed when the function completes.

/**
 * @param {Key} value
 * @param {BoardState} state
 */
const getId = (value, state) => {
  const { idToVal, valToId, prefix, crcDigits } = state;

  if (valToId.has(value)) {
    return valToId.get(value);
  }

  state.lastSequence += 1n;
  const seq = state.lastSequence;

  const crcInput = `${prefix}${seq}`;
  const crc = calcCrc(crcInput, crcDigits);

  const id = `${prefix}${crc}${seq}`;

  valToId.init(value, id);
  idToVal.init(id, value);
  return id;
};

/**
 * @param {string} id
 * @param {Readonly<BoardState>} state
 */
const getValue = (id, { prefix, crcDigits, idToVal }) => {
  id.startsWith(prefix) || Fail`id must start with ${q(prefix)}: ${id}`;
  const digits = id.slice(prefix.length);
  // the +1 is because the serial number will be at least one digit
  const DIGITS_REGEXP = new RegExp(`^[0-9]{${crcDigits + 1},}$`);
  DIGITS_REGEXP.test(digits) ||
    Fail`id must end in at least ${q(crcDigits + 1)} digits: ${id}`;

  if (idToVal.has(id)) {
    return idToVal.get(id);
  }

  const allegedCrc = digits.slice(0, crcDigits);

  const seq = digits.slice(crcDigits);
  const crcInput = `${prefix}${seq}`;
  const crc = calcCrc(crcInput, crcDigits);

  allegedCrc === crc || Fail`id is probably a typo, cannot verify CRC: ${id}`;
  // template Fail alone can't trigger type inference https://github.com/microsoft/TypeScript/issues/50739
  throw Fail`board does not have id: ${id}`;
};

/** @param {BoardState} state */
const makeSlotToVal = state => {
  const ifaceAllegedPrefix = 'Alleged: ';
  const ifaceInaccessiblePrefix = 'SEVERED: ';

  /**
   * @param {BoardId} slot
   * @param {string} iface
   * @returns {unknown}
   */
  const slotToVal = (slot, iface) => {
    if (slot !== null) {
      return getValue(slot, state);
    }

    // Private object.
    if (typeof iface === 'string' && iface.startsWith(ifaceAllegedPrefix)) {
      iface = iface.slice(ifaceAllegedPrefix.length);
    }
    return Far(`${ifaceInaccessiblePrefix}${iface}`, {});
  };
  return slotToVal;
};

// TODO make Marshaller type generic on slot
/**
 * @param {BoardState} state
 * @returns {ReturnType<typeof makeMarshal<string?>>}
 */
const makeReadonlyMarshaller = state => {
  const { valToId } = state;
  const slotToVal = makeSlotToVal(state);
  const valToSlot = val => {
    if (!valToId.has(val)) {
      // Unpublished value.
      return null;
    }

    // Published value.
    return valToId.get(val);
  };
  return makeMarshal(valToSlot, slotToVal, {
    serializeBodyFormat: 'smallcaps',
  });
};

/**
 * @param {BoardState} state
 * @returns {ReturnType<typeof makeMarshal<string>>}
 */
const makePublishingMarshaller = state => {
  const slotToVal = makeSlotToVal(state);
  // Always put the value in the board.
  const valToSlot = val => getId(val, state);
  return makeMarshal(valToSlot, slotToVal, {
    serializeBodyFormat: 'smallcaps',
  });
};
//#endregion

/**
 * A board is a two-way mapping between objects (such as issuers, brands,
 * installation handles) and plain-data string IDs. A well-known board allows
 * sharing objects by way of their ids.
 *
 * @param {import('@agoric/vat-data').Baggage} baggage for upgrade successors
 * @see {@link packages/SwingSet/docs/vat-upgrade.md|Vat Upgrade}
 */
export const prepareBoardKit = baggage => {
  return prepareExoClassKit(
    baggage,
    'Board',
    BoardKitIKit,
    initDurableBoardState,
    {
      board: {
        /**
         * Provide an ID for a value, generating one if not already present.
         *
         * Each board ID includes a CRC so that the last part is
         * well-distributed, which mitigates typo risks.
         *
         * Scaling Consideration: since we cannot know when consumers are no
         * longer interested in an ID, a board holds a strong reference to
         * `value` for its entire lifetime. For a well-known board, this is
         * essentially forever.
         *
         * @param {Key} value
         * @throws if `value` is not a Key in the @agoric/store sense
         */
        getId(value) {
          return getId(value, this.state);
        },
        /**
         * @param {BoardId} id
         * @throws if id is not in the mapping
         */
        getValue(id) {
          return getValue(id, this.state);
        },
        /**
         * Convenience method for recursively traversing boards and board-like
         * remotables to get data associated with a sequence of ids
         * corresponding to each successive board. For example, `lookup("foo",
         * "bar")` gets the value associated with id "foo" and returns the
         * result of invoking `lookup("bar")` upon it to get the value it
         * associates with id "bar".
         *
         * @param {...string} path
         */
        async lookup(...path) {
          const {
            facets: { board },
          } = this;
          if (path.length === 0) {
            return board;
          }
          const [first, ...rest] = path;
          const firstValue = board.getValue(/** @type {BoardId} */ (first));
          if (rest.length === 0) {
            return firstValue;
          }
          return E(firstValue).lookup(...rest);
        },
        /** @param {Key} val */
        has(val) {
          const { state } = this;
          return state.valToId.has(val);
        },
        ids() {
          const { state } = this;
          return harden([...state.idToVal.keys()]);
        },
        /**
         * Get a marshaller that implements the convertValToSlot hook using
         * getId(), "publishing" previously un-mapped objects.
         */
        getPublishingMarshaller() {
          return this.facets.publishingMarshaller;
        },
        /**
         * Get a marshaller that implements the convertValToSlot hook using
         * getId(), only for objects that the board has().
         *
         * For other objects, we don't throw, but we emit a null slot.
         * Un-serializing a null slot always produces a fresh object rather than
         * preserving object identity.
         */
        getReadonlyMarshaller() {
          return this.facets.readonlyMarshaller;
        },
      },
      readonlyMarshaller: {
        toCapData(val) {
          const readonly = makeReadonlyMarshaller(this.state);
          return readonly.toCapData(val);
        },
        fromCapData(data) {
          const readonly = makeReadonlyMarshaller(this.state);
          return readonly.fromCapData(data);
        },
        serialize(data) {
          return this.facets.readonlyMarshaller.toCapData(data);
        },
        unserialize(data) {
          return this.facets.readonlyMarshaller.fromCapData(data);
        },
        serializeAndStringify(val) {
          const readonly = makeReadonlyMarshaller(this.state);
          return JSON.stringify(readonly.serialize(val));
        },
        parseAndDecode(str) {
          const data = JSON.parse(str);
          const readonly = makeReadonlyMarshaller(this.state);
          return readonly.unserialize(data);
        },
      },
      publishingMarshaller: {
        toCapData(val) {
          const publishing = makePublishingMarshaller(this.state);
          return publishing.toCapData(val);
        },
        fromCapData(data) {
          const publishing = makePublishingMarshaller(this.state);
          return publishing.fromCapData(data);
        },
        serialize(data) {
          return this.facets.publishingMarshaller.toCapData(data);
        },
        unserialize(data) {
          return this.facets.publishingMarshaller.fromCapData(data);
        },
        serializeAndStringify(val) {
          const publishing = makePublishingMarshaller(this.state);
          return JSON.stringify(publishing.serialize(val));
        },
        parseAndDecode(str) {
          const data = JSON.parse(str);
          const publishing = makePublishingMarshaller(this.state);
          return publishing.unserialize(data);
        },
      },
    },
  );
};

/** @param {import('@agoric/zone').Zone} zone */
export const prepareRecorderFactory = zone => {
  const baggage = zone.mapStore(`Recorder Baggage`);
  const makeDurablePublishKit = prepareDurablePublishKit(
    baggage,
    'DurablePublishKit',
  );

  /**
   * @param {string} label
   * @param {Marshaller} marshaller
   */
  const prepareRecorderKit = (label, marshaller) => {
    const myZone = zone.subZone(label);
    const makeRecorder = prepareRecorder(
      myZone.mapStore(`Recorder Baggage: ${label}`),
      marshaller,
    );
    return defineRecorderKit({ makeRecorder, makeDurablePublishKit });
  };

  return prepareRecorderKit;
};
