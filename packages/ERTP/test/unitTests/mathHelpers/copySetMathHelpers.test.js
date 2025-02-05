import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';
import { getCopySetKeys, makeCopySet } from '@agoric/store';

import { Far } from '@endo/far';
import { AmountMath as m, AssetKind } from '../../../src/index.js';
import { mockCopySetBrand as mockBrand } from './mockBrand.js';

/** @import {CopySet} from '@endo/patterns' */

// The "unit tests" for MathHelpers actually make the calls through
// AmountMath so that we can test that any duplication is handled
// correctly.

test('copySet with strings make', t => {
  t.notThrows(
    () => m.make(mockBrand, makeCopySet(['1'])),
    `['1'] is a valid string array`,
  );
  t.notThrows(
    () => m.make(mockBrand, makeCopySet([6])),
    `[6] is a valid set even though it isn't a string`,
  );
  t.throws(
    // @ts-expect-error deliberate invalid arguments for testing
    () => m.make(mockBrand, 'abc'),
    {
      message: 'value "abc" must be an AmountValue, not "string"',
    },
    `'abc' is not a valid string array`,
  );
  t.throws(
    () => m.make(mockBrand, makeCopySet(['a', 'a'])),
    { message: /value has duplicate(| key)s: "a"/ },
    `duplicates in make throw`,
  );
});

test('copySet with strings coerce', t => {
  t.deepEqual(
    m.coerce(
      mockBrand,
      harden({ brand: mockBrand, value: makeCopySet(['1']) }),
    ),
    { brand: mockBrand, value: makeCopySet(['1']) },
    `coerce({ brand, value: ['1']}) is a valid amount`,
  );
  t.notThrows(
    () =>
      m.coerce(
        mockBrand,
        harden({ brand: mockBrand, value: makeCopySet([6]) }),
      ),
    `[6] is a valid set`,
  );
  t.throws(
    // @ts-expect-error deliberate invalid arguments for testing
    () => m.coerce(mockBrand, harden({ brand: mockBrand, value: '6' })),
    {
      message: 'value "6" must be an AmountValue, not "string"',
    },
    `'6' is not a valid array`,
  );
  t.throws(
    () =>
      m.coerce(
        mockBrand,
        harden({ brand: mockBrand, value: makeCopySet(['a', 'a']) }),
      ),
    { message: /value has duplicate(| key)s: "a"/ },
    `duplicates should throw`,
  );
});

test('copySet with strings getValue', t => {
  t.deepEqual(
    m.getValue(
      mockBrand,
      harden({ brand: mockBrand, value: makeCopySet(['1']) }),
    ),
    makeCopySet(['1']),
  );
  t.deepEqual(
    getCopySetKeys(
      /** @type {CopySet} */ (
        m.getValue(
          mockBrand,
          harden({ brand: mockBrand, value: makeCopySet(['1']) }),
        )
      ),
    ),
    ['1'],
  );
  t.deepEqual(
    m.getValue(mockBrand, m.make(mockBrand, makeCopySet(['1']))),
    makeCopySet(['1']),
  );
});

test('copySet with strings makeEmpty', t => {
  t.deepEqual(
    m.makeEmpty(mockBrand, AssetKind.COPY_SET),
    harden({ brand: mockBrand, value: makeCopySet([]) }),
    `empty is []`,
  );

  t.assert(
    m.isEmpty(harden({ brand: mockBrand, value: makeCopySet([]) })),
    `isEmpty([])) is true`,
  );
  t.falsy(
    m.isEmpty(harden({ brand: mockBrand, value: makeCopySet(['abc']) })),
    `isEmpty(['abc']) is false`,
  );
  t.throws(
    () =>
      m.isEmpty(harden({ brand: mockBrand, value: makeCopySet(['a', 'a']) })),
    { message: /value has duplicate(| key)s: "a"/ },
    `duplicates in isEmpty throw`,
  );
});

test('copySet with strings isGTE', t => {
  t.throws(
    () =>
      m.isGTE(
        harden({ brand: mockBrand, value: makeCopySet(['a', 'a']) }),
        harden({ brand: mockBrand, value: makeCopySet(['b']) }),
      ),
    undefined,
    `duplicates in the left of isGTE should throw`,
  );
  t.throws(
    () =>
      m.isGTE(
        harden({ brand: mockBrand, value: makeCopySet(['a']) }),
        harden({ brand: mockBrand, value: makeCopySet(['b', 'b']) }),
      ),
    undefined,
    `duplicates in the right of isGTE should throw`,
  );
  t.assert(
    m.isGTE(
      harden({ brand: mockBrand, value: makeCopySet(['a']) }),
      harden({ brand: mockBrand, value: makeCopySet(['a']) }),
    ),
    `overlap between left and right of isGTE should not throw`,
  );
  t.assert(
    m.isGTE(
      harden({ brand: mockBrand, value: makeCopySet(['a', 'b']) }),
      harden({ brand: mockBrand, value: makeCopySet(['a']) }),
    ),
    `['a', 'b'] is gte to ['a']`,
  );
  t.falsy(
    m.isGTE(
      harden({ brand: mockBrand, value: makeCopySet(['a']) }),
      harden({ brand: mockBrand, value: makeCopySet(['b']) }),
    ),
    `['a'] is not gte to ['b']`,
  );
});

test('copySet with strings isEqual', t => {
  t.throws(
    () =>
      m.isEqual(
        harden({ brand: mockBrand, value: makeCopySet(['a', 'a']) }),
        harden({ brand: mockBrand, value: makeCopySet(['a']) }),
      ),
    { message: /value has duplicate(| key)s: "a"/ },
    `duplicates in left of isEqual should throw`,
  );
  t.throws(
    () =>
      m.isEqual(
        harden({ brand: mockBrand, value: makeCopySet(['a']) }),
        harden({ brand: mockBrand, value: makeCopySet(['a', 'a']) }),
      ),
    { message: /value has duplicate(| key)s: "a"/ },
    `duplicates in right of isEqual should throw`,
  );
  t.assert(
    m.isEqual(
      harden({ brand: mockBrand, value: makeCopySet(['a']) }),
      harden({ brand: mockBrand, value: makeCopySet(['a']) }),
    ),
    `overlap between left and right of isEqual is ok`,
  );
  t.assert(
    m.isEqual(
      harden({ brand: mockBrand, value: makeCopySet(['a', 'b']) }),
      harden({ brand: mockBrand, value: makeCopySet(['b', 'a']) }),
    ),
    `['a', 'b'] equals ['b', 'a']`,
  );
  t.falsy(
    m.isEqual(
      harden({ brand: mockBrand, value: makeCopySet(['a']) }),
      harden({ brand: mockBrand, value: makeCopySet(['b']) }),
    ),
    `['a'] does not equal ['b']`,
  );
});

test('copySet with strings add', t => {
  t.throws(
    () =>
      m.add(
        harden({ brand: mockBrand, value: makeCopySet(['a', 'a']) }),
        // @ts-expect-error deliberate invalid arguments for testing
        harden({ brand: mockBrand, value: makeCopySet(['b']) }),
      ),
    { message: /value has duplicate(| key)s: "a"/ },
    `duplicates in left of add should throw`,
  );
  t.throws(
    () =>
      m.add(
        harden({ brand: mockBrand, value: makeCopySet(['a']) }),
        // @ts-expect-error deliberate invalid arguments for testing
        harden({ brand: mockBrand, value: makeCopySet(['b', 'b']) }),
      ),
    { message: /value has duplicate(| key)s: "b"/ },
    `duplicates in right of add should throw`,
  );
  t.throws(
    () =>
      m.add(
        harden({ brand: mockBrand, value: makeCopySet(['a']) }),
        harden({ brand: mockBrand, value: makeCopySet(['a']) }),
      ),
    {
      message: /Sets must not have common elements: "a"/,
    },
    `overlap between left and right of add should throw`,
  );
  t.deepEqual(
    m.add(
      harden({ brand: mockBrand, value: makeCopySet(['a']) }),
      harden({ brand: mockBrand, value: makeCopySet(['b']) }),
    ),
    { brand: mockBrand, value: makeCopySet(['b', 'a']) },
    `['a'] + ['b'] = ['a', 'b']`,
  );
});

test('copySet with strings subtract', t => {
  t.throws(
    () =>
      m.subtract(
        harden({ brand: mockBrand, value: makeCopySet(['a', 'a']) }),
        harden({ brand: mockBrand, value: makeCopySet(['b']) }),
      ),
    { message: /value has duplicate(| key)s: "a"/ },
    `duplicates in left of subtract should throw`,
  );
  t.throws(
    () =>
      m.subtract(
        harden({ brand: mockBrand, value: makeCopySet(['a']) }),
        harden({ brand: mockBrand, value: makeCopySet(['b', 'b']) }),
      ),
    { message: /value has duplicate(| key)s: "b"/ },
    `duplicates in right of subtract should throw`,
  );
  t.deepEqual(
    m.subtract(
      harden({ brand: mockBrand, value: makeCopySet(['a']) }),
      harden({ brand: mockBrand, value: makeCopySet(['a']) }),
    ),
    { brand: mockBrand, value: makeCopySet([]) },
    `overlap between left and right of subtract should not throw`,
  );
  t.throws(
    () =>
      m.subtract(
        harden({ brand: mockBrand, value: makeCopySet(['a', 'b']) }),
        harden({ brand: mockBrand, value: makeCopySet(['c']) }),
      ),
    { message: /right element "c" was not in left/ },
    `elements in right but not in left of subtract should throw`,
  );
  t.deepEqual(
    m.subtract(
      harden({ brand: mockBrand, value: makeCopySet(['a', 'b']) }),
      harden({ brand: mockBrand, value: makeCopySet(['a']) }),
    ),
    { brand: mockBrand, value: makeCopySet(['b']) },
    `['a', 'b'] - ['a'] = ['a']`,
  );
});

const mockHandle = iface => Far(iface, {});

test('balance {x, y, z} >= {z}', t => {
  const x = { instance: mockHandle('Foo'), description: 'fraz' };
  const y = { instance: mockHandle('Foo'), description: 'fraz' };
  const z = { instance: mockHandle('Foo'), description: 'alan' };

  const balance = harden({ brand: mockBrand, value: makeCopySet([x, y, z]) });
  const withdraw = harden({ brand: mockBrand, value: makeCopySet([z]) });

  t.true(m.isGTE(balance, withdraw));
});
