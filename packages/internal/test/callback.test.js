// @ts-check
import test from 'ava';

import { Far } from '@endo/far';
import { makeHeapZone } from '@agoric/base-zone/heap.js';
import * as cb from '../src/callback.js';

/** @import {Callback, SyncCallback} from '../src/types.js' */

test('near function callbacks', t => {
  /**
   * @param {number} a
   * @param {number} b
   * @param {string} c
   * @returns {string}
   */
  const f = (a, b, c) => `${a + b}${c}`;

  /** @type {SyncCallback<typeof f>} */
  const cb0 = cb.makeSyncFunctionCallback(f);
  t.deepEqual(cb0, { target: f, bound: [], isSync: true });

  /** @type {SyncCallback<(b: number, c: string) => string>} */
  const cb1 = cb.makeSyncFunctionCallback(f, 9);
  t.deepEqual(cb1, { target: f, bound: [9], isSync: true });

  /** @type {SyncCallback<(c: string) => string>} */
  const cb2 = cb.makeSyncFunctionCallback(f, 9, 10);
  t.deepEqual(cb2, { target: f, bound: [9, 10], isSync: true });

  // @ts-expect-error deliberate: boolean is not assignable to string
  const cb3 = cb.makeSyncFunctionCallback(f, 9, 10, true);
  t.deepEqual(cb3, { target: f, bound: [9, 10, true], isSync: true });

  // @ts-expect-error deliberate: Expected 4 arguments but got 5
  t.is(cb.callSync(cb0, 2, 3, 'go', 'bad'), '5go');

  // @ts-expect-error deliberate: number is not assignable to string
  t.is(cb.callSync(cb0, 2, 3, 2), '52');

  t.is(cb.callSync(cb1, 10, 'go'), '19go');
  t.is(cb.callSync(cb2, 'go'), '19go');

  const cbp2 = /** @type {SyncCallback<(...args: unknown[]) => any>} */ ({
    target: Promise.resolve(f),
    methodName: undefined,
    bound: [9, 10],
  });
  t.throws(() => cb.callSync(cbp2, 'go'), { message: /not a function/ });
});

test('near method callbacks', t => {
  const m2 = Symbol.for('m2');
  const o = {
    /**
     * @param {number} a
     * @param {number} b
     * @param {string} c
     * @returns {string}
     */
    m1(a, b, c) {
      return `${a + b}${c}`;
    },

    /**
     * @param {number} a
     * @param {number} b
     * @param {string} c
     * @returns {string}
     */
    [m2](a, b, c) {
      return `${a + b}${c}`;
    },
  };

  /** @type {SyncCallback<typeof o.m1>} */
  const cb0 = cb.makeSyncMethodCallback(o, 'm1');
  t.deepEqual(cb0, { target: o, methodName: 'm1', bound: [], isSync: true });

  /** @type {SyncCallback<(b: number, c: string) => string>} */
  const cb1 = cb.makeSyncMethodCallback(o, 'm1', 9);
  t.deepEqual(cb1, { target: o, methodName: 'm1', bound: [9], isSync: true });

  /** @type {SyncCallback<(c: string) => string>} */
  const cb2 = cb.makeSyncMethodCallback(o, 'm1', 9, 10);
  t.deepEqual(cb2, {
    target: o,
    methodName: 'm1',
    bound: [9, 10],
    isSync: true,
  });

  // @ts-expect-error deliberate: boolean is not assignable to string
  const cb3 = cb.makeSyncMethodCallback(o, 'm1', 9, 10, true);
  t.deepEqual(cb3, {
    target: o,
    methodName: 'm1',
    bound: [9, 10, true],
    isSync: true,
  });

  /** @type {SyncCallback<(c: string) => string>} */
  const cb4 = cb.makeSyncMethodCallback(o, m2, 9, 10);
  t.deepEqual(cb4, { target: o, methodName: m2, bound: [9, 10], isSync: true });

  // @ts-expect-error deliberate: Expected 4 arguments but got 5
  t.is(cb.callSync(cb0, 2, 3, 'go', 'bad'), '5go');

  // @ts-expect-error deliberate: number is not assignable to string
  t.is(cb.callSync(cb0, 2, 3, 2), '52');

  t.is(cb.callSync(cb1, 10, 'go'), '19go');
  t.is(cb.callSync(cb2, 'go'), '19go');
  t.is(cb.callSync(cb4, 'go'), '19go');

  // @ts-expect-error deliberate: Promise provides no match for the signature
  const cbp2 = cb.makeSyncMethodCallback(Promise.resolve(o), 'm1', 9, 10);
  t.like(cbp2, { methodName: 'm1', bound: [9, 10], isSync: true });
  t.assert(cbp2.target instanceof Promise);
  t.throws(() => cb.callSync(cbp2, 'go'), { message: /not a function/ });
});

test('far method callbacks', async t => {
  const m2 = Symbol.for('m2');
  const o = Far('MyObject', {
    /**
     * @param {number} a
     * @param {number} b
     * @param {string} c
     * @returns {Promise<string>}
     */
    async m1(a, b, c) {
      return `${a + b}${c}`;
    },

    /**
     * @param {number} a
     * @param {number} b
     * @param {string} c
     * @returns {Promise<string>}
     */
    [m2]: async (a, b, c) => {
      return `${a + b}${c}`;
    },
  });

  /** @type {Callback<(c: string) => Promise<string>>} */
  const cbp2 = cb.makeMethodCallback(Promise.resolve(o), 'm1', 9, 10);
  t.like(cbp2, { methodName: 'm1', bound: [9, 10] });
  t.assert(cbp2.target instanceof Promise);
  const p2r = cb.callE(cbp2, 'go');
  t.assert(p2r instanceof Promise);
  t.is(await p2r, '19go');

  /** @type {Callback<(c: string) => Promise<string>>} */
  const cbp3 = cb.makeMethodCallback(Promise.resolve(o), m2, 9, 10);
  t.like(cbp3, { methodName: m2, bound: [9, 10] });
  t.assert(cbp3.target instanceof Promise);
  const p3r = cb.callE(cbp3, 'go');
  t.assert(p3r instanceof Promise);
  t.is(await p3r, '19go');

  // @ts-expect-error deliberate: is not assignable to SyncCallback
  const thunk = async () => cb.callSync(cbp2, 'go');
  t.throws(thunk, { message: /not a function/ });
});

test('far function callbacks', async t => {
  /**
   * @param {number} a
   * @param {number} b
   * @param {string} c
   * @returns {Promise<string>}
   */
  const f = async (a, b, c) => `${a + b}${c}`;

  /** @type {Callback<(c: string) => Promise<string>>} */
  const cbp2 = cb.makeFunctionCallback(Promise.resolve(f), 9, 10);
  t.like(cbp2, { bound: [9, 10] });
  t.assert(cbp2.target instanceof Promise);
  // @ts-expect-error deliberate: is not assignable to SyncCallback
  const thunk = async () => cb.callSync(cbp2, 'go');
  t.throws(thunk, { message: /not a function/ });
  const p2r = cb.callE(cbp2, 'go');
  t.assert(p2r instanceof Promise);
  t.is(await p2r, '19go');
});

test('bad callbacks', t => {
  t.throws(
    // @ts-expect-error deliberate: number is not assignable to function
    () => cb.makeFunctionCallback(42),
    undefined,
    'number as function presence',
  );
  t.throws(
    () => cb.makeMethodCallback('string', 'slice'),
    undefined,
    'string as presence',
  );
  t.throws(
    // @ts-expect-error deliberate: object is not assignable to function
    () => cb.makeSyncFunctionCallback({}),
    undefined,
    'plain object as function',
  );
  t.throws(
    () => cb.makeSyncMethodCallback(false, 'valueOf'),
    undefined,
    'boolean as object',
  );
});

test('isCallback', t => {
  t.true(
    cb.isCallback(cb.makeFunctionCallback(async () => {})),
    'makeFunctionCallback',
  );
  const sym = Symbol.asyncIterator;
  t.true(
    cb.isCallback(cb.makeMethodCallback({ [sym]: async () => {} }, sym)),
    'makeMethodCallback',
  );
  t.true(
    cb.isCallback(cb.makeSyncFunctionCallback(() => {})),
    'makeSyncFunctionCallback',
  );
  t.true(
    cb.isCallback(cb.makeSyncMethodCallback({ m: () => {} }, 'm')),
    'makeSyncMethodCallback',
  );
  // manually-implemented original-format callback objects must always work
  t.true(cb.isCallback({ target: () => {}, bound: [] }), 'manual function');
  t.true(
    cb.isCallback({ target: {}, methodName: 'foo', bound: [] }),
    'manual method',
  );
  t.true(
    cb.isCallback({ target: {}, methodName: Symbol.for('foo'), bound: [] }),
    'manual symbol-keyed method',
  );

  t.false(cb.isCallback(undefined), 'undefined');
  t.false(cb.isCallback(null), 'null');
  t.false(cb.isCallback('string'), 'string');
  t.false(cb.isCallback({}), 'empty object');
  t.false(
    cb.isCallback({ target: 'non-object', bound: [] }),
    'non-object target',
  );
  t.false(
    cb.isCallback({ target: {}, methodName: Symbol('foo'), bound: [] }),
    'unique symbol method name',
  );
  t.false(cb.isCallback({ target: {}, bound: {} }), 'non-array bound args');
  t.false(
    cb.isCallback({ target: {}, bound: undefined }),
    'undefined bound args',
  );
  t.false(
    cb.isCallback({ target: {}, methodName: 'foo' }),
    'missing bound args',
  );
});

test('makeAttenuator', async t => {
  const zone = makeHeapZone();
  const makeAttenuator = cb.prepareAttenuator(zone, ['m0', 'm1', 'm2', 'm4']);
  const target = Far('original', {
    m0() {
      return 'return original.m0';
    },
    m1() {
      return 'return original.m1';
    },
    m2() {
      throw Error('unexpected original.m2');
    },
    m3() {
      throw Error('unexpected original.m3');
    },
  });
  // @ts-expect-error deliberate: omitted method
  t.throws(() => makeAttenuator({ target, overrides: { m3: null } }), {
    message: `"Attenuator" overrides["m3"] not allowed by methodNames`,
  });

  // Null out a method.
  const atE = makeAttenuator({ target, overrides: { m1: null } });
  const p1 = atE.m0();
  t.assert(p1 instanceof Promise);
  t.is(await p1, 'return original.m0');
  await t.throwsAsync(() => atE.m1(), {
    message: `unimplemented "Attenuator" method "m1"`,
  });
  await t.throwsAsync(() => atE.m2(), { message: `unexpected original.m2` });
  // @ts-expect-error deliberate: omitted method
  t.throws(() => atE.m3(), { message: /not a function/ });
  await t.throwsAsync(() => atE.m4(), { message: /target has no method "m4"/ });

  const atSync = makeAttenuator({
    target,
    isSync: true,
    overrides: {
      m1: null,
      m2: cb.makeMethodCallback(
        Far('Abc', {
          abc() {
            return 'return abc';
          },
        }),
        'abc',
      ),
    },
  });

  t.is(atSync.m0(), 'return original.m0');
  t.throws(() => atSync.m1(), {
    message: `unimplemented "Attenuator" method "m1"`,
  });
  const p2 = atSync.m2();
  t.assert(p2 instanceof Promise);
  t.is(await p2, 'return abc');
  // @ts-expect-error deliberate: omitted method
  t.throws(() => atSync.m3(), { message: /not a function/ });
  t.throws(() => atSync.m4(), { message: /not a function/ });
});
