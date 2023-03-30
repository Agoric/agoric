// @ts-check
import '@endo/init';
import test from 'ava';

import { Far } from '@endo/far';
import * as cb from '../src/callback.js';

test('near function callbacks', t => {
  /**
   * @param {number} a
   * @param {number} b
   * @param {string} c
   * @returns {string}
   */
  const f = (a, b, c) => `${a + b}${c}`;

  /** @type {import('../src/callback').SyncCallback<typeof f>} */
  const cb0 = cb.makeSyncFunctionCallback(f);
  t.deepEqual(cb0, { target: f, bound: [] });

  /** @type {import('../src/callback').SyncCallback<(b: number, c: string) => string>} */
  const cb1 = cb.makeSyncFunctionCallback(f, 9);
  t.deepEqual(cb1, { target: f, bound: [9] });

  /** @type {import('../src/callback').SyncCallback<(c: string) => string>} */
  const cb2 = cb.makeSyncFunctionCallback(f, 9, 10);
  t.deepEqual(cb2, { target: f, bound: [9, 10] });

  // @ts-expect-error deliberate: boolean is not assignable to string
  const cb3 = cb.makeSyncFunctionCallback(f, 9, 10, true);
  t.deepEqual(cb3, { target: f, bound: [9, 10, true] });

  // @ts-expect-error deliberate: Expected 4 arguments but got 5
  t.is(cb.callSync(cb0, 2, 3, 'go', 'bad'), '5go');

  // @ts-expect-error deliberate: number is not assignable to string
  t.is(cb.callSync(cb0, 2, 3, 2), '52');

  t.is(cb.callSync(cb1, 10, 'go'), '19go');
  t.is(cb.callSync(cb2, 'go'), '19go');

  // @ts-expect-error deliberate: Promise provides no match for the signature
  const cbp2 = cb.makeSyncFunctionCallback(Promise.resolve(f), 9, 10);
  t.like(cbp2, { bound: [9, 10] });
  t.assert(cbp2.target instanceof Promise);
  t.throws(() => cb.callSync(cbp2, 'go'), { message: /not a function/ });
});

test('near method callbacks', t => {
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
  };

  /** @type {import('../src/callback').SyncCallback<typeof o.m1>} */
  const cb0 = cb.makeSyncMethodCallback(o, 'm1');
  t.deepEqual(cb0, { target: o, methodName: 'm1', bound: [] });

  /** @type {import('../src/callback').SyncCallback<(b: number, c: string) => string>} */
  const cb1 = cb.makeSyncMethodCallback(o, 'm1', 9);
  t.deepEqual(cb1, { target: o, methodName: 'm1', bound: [9] });

  /** @type {import('../src/callback').SyncCallback<(c: string) => string>} */
  const cb2 = cb.makeSyncMethodCallback(o, 'm1', 9, 10);
  t.deepEqual(cb2, { target: o, methodName: 'm1', bound: [9, 10] });

  // @ts-expect-error deliberate: boolean is not assignable to string
  const cb3 = cb.makeSyncMethodCallback(o, 'm1', 9, 10, true);
  t.deepEqual(cb3, { target: o, methodName: 'm1', bound: [9, 10, true] });

  // @ts-expect-error deliberate: Expected 4 arguments but got 5
  t.is(cb.callSync(cb0, 2, 3, 'go', 'bad'), '5go');

  // @ts-expect-error deliberate: number is not assignable to string
  t.is(cb.callSync(cb0, 2, 3, 2), '52');

  t.is(cb.callSync(cb1, 10, 'go'), '19go');
  t.is(cb.callSync(cb2, 'go'), '19go');

  // @ts-expect-error deliberate: Promise provides no match for the signature
  const cbp2 = cb.makeSyncMethodCallback(Promise.resolve(o), 'm1', 9, 10);
  t.like(cbp2, { methodName: 'm1', bound: [9, 10] });
  t.assert(cbp2.target instanceof Promise);
  t.throws(() => cb.callSync(cbp2, 'go'), { message: /not a function/ });
});

test('far method callbacks', async t => {
  const o = Far('MyObject', {
    /**
     *
     * @param {number} a
     * @param {number} b
     * @param {string} c
     * @returns {Promise<string>}
     */
    async m1(a, b, c) {
      return `${a + b}${c}`;
    },
  });

  /** @type {import('../src/callback').Callback<(c: string) => Promise<string>>} */
  const cbp2 = cb.makeMethodCallback(Promise.resolve(o), 'm1', 9, 10);
  t.like(cbp2, { methodName: 'm1', bound: [9, 10] });
  t.assert(cbp2.target instanceof Promise);
  // @ts-expect-error deliberate: is not assignable to SyncCallback
  const thunk = () => cb.callSync(cbp2, 'go');
  t.throws(thunk, { message: /not a function/ });
  const p2r = cb.callE(cbp2, 'go');
  t.assert(p2r instanceof Promise);
  t.is(await p2r, '19go');
});

test('far function callbacks', async t => {
  /**
   * @param {number} a
   * @param {number} b
   * @param {string} c
   * @returns {Promise<string>}
   */
  const f = async (a, b, c) => `${a + b}${c}`;

  /** @type {import('../src/callback').Callback<(c: string) => Promise<string>>} */
  const cbp2 = cb.makeFunctionCallback(Promise.resolve(f), 9, 10);
  t.like(cbp2, { bound: [9, 10] });
  t.assert(cbp2.target instanceof Promise);
  // @ts-expect-error deliberate: is not assignable to SyncCallback
  const thunk = () => cb.callSync(cbp2, 'go');
  t.throws(thunk, { message: /not a function/ });
  const p2r = cb.callE(cbp2, 'go');
  t.assert(p2r instanceof Promise);
  t.is(await p2r, '19go');
});
