import { Fail } from '@agoric/assert';
import { StorageNodeShape } from '@agoric/internal';
import { prepareDurablePublishKit } from '@agoric/notifier';
import {
  makeFakeMarshaller,
  makeFakeStorage,
} from '@agoric/notifier/tools/testSupports.js';
import { mustMatch } from '@agoric/store';
import { M, makeScalarBigMapStore, prepareExoClass } from '@agoric/vat-data';
import { E } from '@endo/eventual-send';

/**
 * Recorders support publishing data to vstorage.
 *
 * `Recorder` is similar to `Publisher` (in that they send out data) but has different signatures:
 * - methods are async because they await remote calls to Marshaller and StorageNode
 * - method names convey the durability
 * - omits fail()
 * - adds getStorageNode() from its durable state
 *
 * Other names such as StoredPublisher or ChainStoragePublisher were considered, but found to be sometimes confused with *durability*, another trait of this class.
 */

/**
 * @template T
 * @typedef {{ getStorageNode(): Awaited<import('@endo/far').FarRef<StorageNode>>, getStoragePath(): Promise<string>, write(value: T): Promise<void>, writeFinal(value: T): Promise<void> }} Recorder
 */

/**
 * @template T
 * @typedef {Pick<PublishKit<T>, 'subscriber'> & { recorder: Recorder<T> }} RecorderKit
 */

/**
 * @template T
 * @typedef {Pick<PublishKit<T>, 'subscriber'> & { recorderP: ERef<Recorder<T>> }} EventualRecorderKit
 */

/**
 * Wrap a Publisher to record all the values to chain storage.
 *
 * @param {import('@agoric/zoe').Baggage} baggage
 * @param {ERef<Marshaller>} marshaller
 */
export const prepareRecorder = (baggage, marshaller) => {
  const makeRecorder = prepareExoClass(
    baggage,
    'Recorder',
    M.interface('Recorder', {
      getStorageNode: M.call().returns(StorageNodeShape),
      getStoragePath: M.call().returns(M.promise(/* string */)),
      write: M.call(M.any()).returns(M.promise()),
      writeFinal: M.call(M.any()).returns(M.promise()),
    }),
    /**
     * @template T
     * @param {PublishKit<T>['publisher']} publisher
     * @param {Awaited<import('@endo/far').FarRef<StorageNode>>} storageNode
     * @param {TypedMatcher<T>} [valueShape]
     */
    (
      publisher,
      storageNode,
      valueShape = /** @type {TypedMatcher<any>} */ (M.any()),
    ) => {
      return {
        closed: false,
        publisher,
        storageNode,
        storagePath: /** @type {string | undefined} */ (undefined),
        valueShape,
      };
    },
    {
      getStorageNode() {
        return this.state.storageNode;
      },
      /**
       * Memoizes the remote call to the storage node
       *
       * @returns {Promise<string>}
       */
      async getStoragePath() {
        const { storagePath: heldPath } = this.state;
        // end synchronous prelude
        await null;
        if (heldPath !== undefined) {
          return heldPath;
        }
        const path = await E(this.state.storageNode).getPath();
        this.state.storagePath = path;
        return path;
      },
      /**
       * Marshalls before writing to storage or publisher to help ensure the two streams match.
       *
       * @param {unknown} value
       * @returns {Promise<void>}
       */
      async write(value) {
        const { closed, publisher, storageNode, valueShape } = this.state;
        !closed || Fail`cannot write to closed recorder`;
        mustMatch(value, valueShape);
        const serializedP = await E(marshaller).serializeAndStringify(value);
        await E(storageNode).setValue(serializedP);

        // below here differs from writeFinal()
        return publisher.publish(value);
      },
      /**
       * Like `write` but prevents future writes and terminates the publisher.
       *
       * @param {unknown} value
       * @returns {Promise<void>}
       */
      async writeFinal(value) {
        const { closed, publisher, storageNode, valueShape } = this.state;
        !closed || Fail`cannot write to closed recorder`;
        mustMatch(value, valueShape);
        const serializedP = await E(marshaller).serializeAndStringify(value);
        await E(storageNode).setValue(serializedP);

        // below here differs from write()
        this.state.closed = true;
        return publisher.finish(value);
      },
    },
  );

  return makeRecorder;
};
harden(prepareRecorder);
/** @typedef {ReturnType<typeof prepareRecorder>} MakeRecorder */

/**
 * `makeRecorderKit` is suitable for making a durable `RecorderKit` which can be held in Exo state.
 *
 * @see {defineERecorderKit}
 *
 * @param {{makeRecorder: MakeRecorder, makeDurablePublishKit: ReturnType<typeof prepareDurablePublishKit>}} makers
 */
export const defineRecorderKit = ({ makeRecorder, makeDurablePublishKit }) => {
  /**
   * @template T
   * @param {StorageNode | Awaited<import('@endo/far').FarRef<StorageNode>>} storageNode
   * @param {TypedMatcher<T>} [valueShape]
   * @returns {RecorderKit<T>}
   */
  const makeRecorderKit = (storageNode, valueShape) => {
    const { subscriber, publisher } = makeDurablePublishKit();
    const recorder = makeRecorder(
      publisher,
      /** @type { Awaited<import('@endo/far').FarRef<StorageNode>> } */ (
        storageNode
      ),
      valueShape,
    );
    return harden({ subscriber, recorder });
  };
  return makeRecorderKit;
};
/** @typedef {ReturnType<typeof defineRecorderKit>} MakeRecorderKit */

/**
 * `makeERecorderKit` is for closures that must return a `subscriber` synchronously but can defer the `recorder`.
 *
 * @see {defineRecorderKit}
 *
 * @param {{makeRecorder: MakeRecorder, makeDurablePublishKit: ReturnType<typeof prepareDurablePublishKit>}} makers
 */
export const defineERecorderKit = ({ makeRecorder, makeDurablePublishKit }) => {
  /**
   * @template T
   * @param {ERef<StorageNode>} storageNodeP
   * @param {TypedMatcher<T>} [valueShape]
   * @returns {EventualRecorderKit<T>}
   */
  const makeERecorderKit = (storageNodeP, valueShape) => {
    const { publisher, subscriber } = makeDurablePublishKit();
    const recorderP = E.when(storageNodeP, storageNode =>
      makeRecorder(
        publisher,
        // @ts-expect-error Casting because it's remote
        /** @type { import('@endo/far').FarRef<StorageNode> } */ (storageNode),
        valueShape,
      ),
    );
    return { subscriber, recorderP };
  };
  return makeERecorderKit;
};
harden(defineERecorderKit);
/** @typedef {ReturnType<typeof defineERecorderKit>} MakeERecorderKit */

/**
 * Convenience wrapper to prepare the DurablePublishKit and Recorder kinds.
 * Note that because prepareRecorder() can only be called once per baggage,
 * this should only be used when there is no need for an EventualRecorderKit.
 * When there is, prepare the kinds separately and pass to the kit definers.
 *
 * @param {import('@agoric/vat-data').Baggage} baggage
 * @param {ERef<Marshaller>} marshaller
 */
export const prepareRecorderKit = (baggage, marshaller) => {
  const makeDurablePublishKit = prepareDurablePublishKit(
    baggage,
    'Durable Publish Kit',
  );
  const makeRecorder = prepareRecorder(baggage, marshaller);
  return defineRecorderKit({ makeDurablePublishKit, makeRecorder });
};

/**
 * Convenience wrapper for DurablePublishKit and Recorder kinds.
 *
 * NB: this defines two durable kinds. Must be called at most once per baggage.
 *
 * `makeRecorderKit` is suitable for making a durable `RecorderKit` which can be held in Exo state.
 * `makeERecorderKit` is for closures that must return a `subscriber` synchronously but can defer the `recorder`.
 *
 * @param {import('@agoric/vat-data').Baggage} baggage
 * @param {ERef<Marshaller>} marshaller
 */
export const prepareRecorderKitMakers = (baggage, marshaller) => {
  const makeDurablePublishKit = prepareDurablePublishKit(
    baggage,
    'Durable Publish Kit',
  );
  const makeRecorder = prepareRecorder(baggage, marshaller);

  const makeRecorderKit = defineRecorderKit({
    makeRecorder,
    makeDurablePublishKit,
  });
  const makeERecorderKit = defineERecorderKit({
    makeRecorder,
    makeDurablePublishKit,
  });

  return {
    makeDurablePublishKit,
    makeRecorder,
    makeRecorderKit,
    makeERecorderKit,
  };
};

/**
 * For use in tests
 */
export const prepareMockRecorderKitMakers = () => {
  const baggage = makeScalarBigMapStore('mock recorder baggage');
  const marshaller = makeFakeMarshaller();
  return {
    ...prepareRecorderKitMakers(baggage, marshaller),
    storageNode: makeFakeStorage('mock recorder storage'),
  };
};

/**
 * Stop-gap until https://github.com/Agoric/agoric-sdk/issues/6160
 * explictly specify the type that the Pattern will verify through a match.
 *
 * This is a Pattern but since that's `any`, including in the typedef turns the
 * whole thing to `any`.
 *
 * @template T
 * @typedef {{ validatedType?: T }} TypedMatcher
 */

/**
 * @template {TypedMatcher<any>} TM
 * @typedef {TM extends TypedMatcher<infer T> ? T : never} MatchedType
 */
