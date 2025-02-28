// @ts-check

import { passStyleOf } from '@endo/pass-style';
import { Fail, q } from '@endo/errors';
import { M, mustMatch } from '@endo/patterns';
import { assertPattern } from '@agoric/store';

/**
 * @import { StateShape } from '@endo/exo'
 */

const { hasOwn, defineProperty, getOwnPropertyNames } = Object;
const { ownKeys } = Reflect;

/**
 * @param {any} [stateShape]
 * @returns {asserts stateShape is (StateShape | undefined)}
 */
const assertStateShape = stateShape => {
  harden(stateShape);
  stateShape === undefined ||
    passStyleOf(stateShape) === 'copyRecord' ||
    Fail`A stateShape must be a copyRecord: ${q(stateShape)}`;
  assertPattern(stateShape);
};

/**
 * @param {StateShape} [stateShape]
 */
const provideCheckStatePropertyValue = stateShape => {
  /** @type {(value: any, prop: string) => void} */
  let checkStatePropertyValue = (value, _prop) => {
    mustMatch(value, M.any());
  };
  if (stateShape) {
    checkStatePropertyValue = (value, prop) => {
      hasOwn(stateShape, prop) ||
        Fail`State must only have fields described by stateShape: ${q(
          ownKeys(stateShape),
        )}`;
      mustMatch(value, stateShape[prop]);
    };
  }
  return checkStatePropertyValue;
};

/**
 * @param {(state: object) => Record<string, any>} getStateData
 * @param {ReturnType<typeof provideCheckStatePropertyValue>} checkStatePropertyValue
 */
const provideFieldDescriptorMaker = (getStateData, checkStatePropertyValue) => {
  /** @param {string} prop */
  const makeFieldDescriptor = prop => {
    return harden({
      get() {
        const stateData = getStateData(this);
        stateData || Fail`Invalid state object ${this}`;
        return stateData[prop];
      },
      /** @param {any} value */
      set(value) {
        const stateData = getStateData(this);
        stateData || Fail`Invalid state object ${this}`;
        harden(value);
        checkStatePropertyValue(value, prop);
        stateData[prop] = value;
      },
      enumerable: true,
      configurable: false,
    });
  };

  return makeFieldDescriptor;
};

/**
 * @param {StateShape} [stateShape]
 */
const provideStateMakerForShape = stateShape => {
  class State {
    /** @type {Record<string, any>} */
    #data;

    /** @param {State} state */
    static getStateData(state) {
      return state.#data;
    }

    /**
     * @param {State} state
     * @param {Record<string, any>} data
     */
    static setStateData(state, data) {
      state.#data = data;
    }
  }

  const { getStateData, setStateData } = State;
  // @ts-expect-error
  delete State.getStateData;
  // @ts-expect-error
  delete State.setStateData;

  // Private maker
  const makeState = () => {
    const state = new State();
    setStateData(state, {});
    harden(state);
    return /** @type {Record<string, any>} */ (state);
  };

  const checkStatePropertyValue = provideCheckStatePropertyValue(stateShape);
  const makeFieldDescriptor = provideFieldDescriptorMaker(
    getStateData,
    checkStatePropertyValue,
  );

  for (const prop of getOwnPropertyNames(stateShape)) {
    defineProperty(State.prototype, prop, makeFieldDescriptor(prop));
  }
  harden(State);

  /**
   * @template {Record<string, any>} T
   * @param {T} initialData
   */
  return initialData => {
    const state = makeState();
    const stateOwnKeys = new Set(ownKeys(initialData));
    for (const prop of getOwnPropertyNames(stateShape)) {
      stateOwnKeys.delete(prop);
      state[prop] = initialData[prop];
    }
    stateOwnKeys.size === 0 ||
      Fail`Init returned keys not allowed by stateShape: ${[...stateOwnKeys]}`;
    return /** @type {T} */ (state);
  };
};

const provideStateMakerWithoutShape = () => {
  const statePrototype = harden({});
  const checkStatePropertyValue = provideCheckStatePropertyValue();

  /** @param {object} expectedState */
  const makeGetStateData = expectedState => {
    /** @type {Record<string, any>} */
    const stateData = {};
    /** @param {object} state */
    return state => {
      expectedState === state || Fail`Unexpected state object ${state}`;
      return stateData;
    };
  };

  /**
   * @template {Record<string, any>} T
   * @param {T} initialData
   */
  return initialData => {
    /** @type {Record<string, any>} */
    const state = { __proto__: statePrototype };
    const getStateData = makeGetStateData(state);
    const makeFieldDescriptor = provideFieldDescriptorMaker(
      getStateData,
      checkStatePropertyValue,
    );

    for (const prop of ownKeys(initialData)) {
      assert(typeof prop === 'string');
      defineProperty(state, prop, makeFieldDescriptor(prop));
      state[prop] = initialData[prop];
    }
    harden(state);
    return /** @type {T} */ (state);
  };
};

/**
 * @param {StateShape} [stateShape]
 */
export const provideStateMaker = stateShape => {
  assertStateShape(stateShape);
  return stateShape
    ? provideStateMakerForShape(stateShape)
    : provideStateMakerWithoutShape();
};
