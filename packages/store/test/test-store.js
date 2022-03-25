// @ts-check
/* eslint-disable no-use-before-define */
// eslint-disable-next-line import/no-extraneous-dependencies
import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import { Far, passStyleOf } from '@endo/marshal';
import { makeLegacyMap } from '../src/legacy/legacyMap.js';
import { makeLegacyWeakMap } from '../src/legacy/legacyWeakMap.js';
import { makeScalarMapStore } from '../src/stores/scalarMapStore.js';
import { makeScalarSetStore } from '../src/stores/scalarSetStore.js';
import { makeScalarWeakMapStore } from '../src/stores/scalarWeakMapStore.js';

import '../src/types.js';

/**
 * Simulate ava v4 "assertions now return a boolean indicating whether they
 * passed" behavior
 * https://github.com/avajs/ava/releases/tag/v4.0.0#:~:text=Assertions%20as%20type%20guards
 *
 * @param {boolean | undefined} assertionResult
 * @param {() => boolean} getFallbackResult
 * @returns {boolean}
 */
export const assertionPassed = (assertionResult, getFallbackResult) => {
  if (assertionResult === undefined) return getFallbackResult();
  console.warn(
    'Got non-undefined assertion result, has ava been upgraded to v4+? ' +
      'Consider removing assertionPassed.',
  );
  return assertionResult;
};

function check(t, mode, objMaker) {
  // Check the full API, and make sure object identity isn't a problem by
  // creating two potentially-similar things for use as keys.
  let s;
  if (mode === 'strong') {
    s = makeScalarMapStore('store1');
  } else if (mode === 'weak') {
    s = makeScalarWeakMapStore('store1');
  } else {
    throw Error(`unknown mode ${mode}`);
  }
  const k1 = objMaker(1);
  const k2 = objMaker(2);

  function checkEntries(entries) {
    if (mode === 'strong') {
      t.deepEqual(new Set(s.keys()), new Set(entries.map(([k, _v]) => k)));
      t.deepEqual(new Set(s.values()), new Set(entries.map(([_k, v]) => v)));
      t.deepEqual(new Set(s.entries()), new Set(entries));
    }
  }

  checkEntries([]);

  s.init(k1, 'one');
  t.truthy(s.has(k1));
  t.is(s.get(k1), 'one');
  t.falsy(s.has(k2));
  checkEntries([[k1, 'one']]);

  t.throws(() => s.init(k1, 'other'), {
    message:
      // Should be able to use more informative error once SES double
      // disclosure bug is fixed. See
      // https://github.com/endojs/endo/pull/640
      //
      // /"store1" already registered:/,
      /.* already registered:/,
  });
  t.throws(() => s.get(k2), { message: /"store1" not found:/ });
  t.throws(() => s.set(k2, 'other'), { message: /"store1" not found:/ });
  t.throws(() => s.delete(k2), { message: /"store1" not found:/ });

  s.init(k2, 'two');
  t.truthy(s.has(k1));
  t.truthy(s.has(k2));
  t.is(s.get(k1), 'one');
  t.is(s.get(k2), 'two');
  checkEntries([
    [k1, 'one'],
    [k2, 'two'],
  ]);

  s.set(k1, 'oneplus');
  t.truthy(s.has(k1));
  t.truthy(s.has(k2));
  t.is(s.get(k1), 'oneplus');
  t.is(s.get(k2), 'two');
  checkEntries([
    [k1, 'oneplus'],
    [k2, 'two'],
  ]);

  s.delete(k1);
  t.falsy(s.has(k1));
  t.truthy(s.has(k2));
  t.is(s.get(k2), 'two');
  checkEntries([[k2, 'two']]);

  s.delete(k2);
  t.falsy(s.has(k1));
  t.falsy(s.has(k2));
  checkEntries([]);
}

test('store', t => {
  // makeScalarMap
  check(t, 'strong', count => count); // simple numeric keys
  check(t, 'strong', count => `${count}`); // simple strings
  check(t, 'strong', () => Far('handle', {}));

  // makeScalarWeakMap
  check(t, 'weak', () => Far('handle', {}));
});

test('reject promise keys', t => {
  const k = harden(Promise.resolve());
  const s = makeScalarMapStore('store1');
  t.throws(() => s.init(k, 1), {
    message: /A "promise" cannot be a scalar key: "\[Promise\]"/,
  });
  t.is(s.has(k), false);
  t.throws(() => s.get(k), { message: /not found:/ });
  t.throws(() => s.set(k, 1), { message: /not found/ });
  t.throws(() => s.delete(k), { message: /not found/ });

  const w = makeScalarWeakMapStore('store1');
  const i = 8;
  t.throws(() => w.init(i, 1), {
    message: /Only remotables can be keys of scalar WeakMapStores: 8/,
  });
  t.is(s.has(i), false);
  t.throws(() => w.get(i), { message: /not found/ });
  t.throws(() => w.set(i, 1), { message: /not found/ });
  t.throws(() => w.delete(i), { message: /not found/ });
});

test('passability of stores', t => {
  t.is(passStyleOf(makeScalarMapStore('foo')), 'remotable');
  t.is(passStyleOf(makeScalarWeakMapStore('foo')), 'remotable');
  t.throws(() => passStyleOf(makeLegacyMap('foo')), { message: /x/ });
  t.throws(() => passStyleOf(makeLegacyWeakMap('foo')), { message: /x/ });
});

test('passability of store iters', t => {
  // See test 'copyMap - iters are passable'
  const m = makeScalarMapStore('bar');
  m.init('x', 8);
  m.init('y', 7);
  const keys = m.keys();
  t.is(passStyleOf(keys), 'remotable');
  const iter = keys[Symbol.iterator]();
  t.is(passStyleOf(iter), 'remotable');
  const iterResult = iter.next();
  t.is(passStyleOf(iterResult), 'copyRecord');
});

test('iteration fails with concurrent addition', t => {
  const m = makeScalarMapStore('mapFail');
  const s = makeScalarSetStore('setFail');
  for (let i = 0; i < 6; i += 1) {
    m.init(i, `foo`);
    s.add(i);
  }

  let pos = 0;
  t.throws(
    () => {
      // eslint-disable-next-line no-unused-vars
      for (const k of m.keys()) {
        pos += 1;
        if (pos === 2) {
          m.init(47, 'nonsense');
        }
      }
    },
    {
      message: `Store "mapFail" cursor stale`,
    },
  );

  pos = 0;
  t.throws(
    () => {
      // eslint-disable-next-line no-unused-vars
      for (const k of s.keys()) {
        pos += 1;
        if (pos === 2) {
          s.add(47);
        }
      }
    },
    {
      message: `Store "setFail" cursor stale`,
    },
  );
});

test('iteration succeeds with concurrent deletion', t => {
  const m = makeScalarMapStore('mapOK');
  const s = makeScalarSetStore('setOK');
  for (let i = 0; i < 6; i += 1) {
    m.init(i, `foo`);
    s.add(i);
  }

  let pos = 0;
  const seenKeys = [];
  for (const k of m.keys()) {
    seenKeys.push(k);
    pos += 1;
    if (pos === 2) {
      m.delete(4);
    }
  }
  t.deepEqual(seenKeys, [0, 1, 2, 3, 5]);

  pos = 0;
  const seenValues = [];
  for (const v of s.values()) {
    seenValues.push(v);
    pos += 1;
    if (pos === 2) {
      s.delete(4);
    }
  }
  t.deepEqual(seenValues, [0, 1, 2, 3, 5]);
});
