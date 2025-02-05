import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';
import { makeTagged } from '@endo/marshal';
import {
  getCopyBagEntries,
  makeCopyBagFromElements as makeBag,
} from '@agoric/store';

import { AmountMath as m, AssetKind } from '../../../src/index.js';
import { mockCopyBagBrand as mockBrand } from './mockBrand.js';

// The "unit tests" for MathHelpers actually make the calls through
// AmountMath so that we can test that any duplication is handled
// correctly.

test('copyBag with strings make', t => {
  t.notThrows(
    () => m.make(mockBrand, makeBag(['1'])),
    `['1'] is a valid string array`,
  );
  t.notThrows(
    () => m.make(mockBrand, makeBag([6])),
    `[6] is a valid bag even though it isn't a string`,
  );
  t.throws(
    // @ts-expect-error deliberate invalid arguments for testing
    () => m.make(mockBrand, 'abc'),
    {
      message: 'value "abc" must be an AmountValue, not "string"',
    },
    `'abc' is not a valid string array`,
  );
  t.deepEqual(m.make(mockBrand, makeBag(['a', 'a'])), {
    brand: mockBrand,
    value: makeTagged('copyBag', [['a', 2n]]),
  });
});

test('copyBag with strings coerce', t => {
  t.deepEqual(
    m.coerce(mockBrand, harden({ brand: mockBrand, value: makeBag(['1']) })),
    { brand: mockBrand, value: makeBag(['1']) },
    `coerce({ brand, value: ['1']}) is a valid amount`,
  );
  t.notThrows(
    () =>
      m.coerce(mockBrand, harden({ brand: mockBrand, value: makeBag([6]) })),
    `[6] is a valid bag`,
  );
  t.throws(
    // @ts-expect-error deliberate invalid arguments for testing
    () => m.coerce(mockBrand, harden({ brand: mockBrand, value: '6' })),
    {
      message: 'value "6" must be an AmountValue, not "string"',
    },
    `'6' is not a valid array`,
  );
});

test('copyBag with strings getValue', t => {
  t.deepEqual(
    m.getValue(mockBrand, harden({ brand: mockBrand, value: makeBag(['1']) })),
    makeBag(['1']),
  );
  t.deepEqual(
    getCopyBagEntries(
      /** @type {import('@endo/patterns').CopyBag} */ (
        m.getValue(
          mockBrand,
          harden({ brand: mockBrand, value: makeBag(['1']) }),
        )
      ),
    ),
    [['1', 1n]],
  );
  t.deepEqual(
    m.getValue(mockBrand, m.make(mockBrand, makeBag(['1']))),
    makeBag(['1']),
  );
});

test('copyBag with strings makeEmpty', t => {
  t.deepEqual(
    m.makeEmpty(mockBrand, AssetKind.COPY_BAG),
    harden({ brand: mockBrand, value: makeBag([]) }),
    `empty is []`,
  );

  t.assert(
    m.isEmpty(harden({ brand: mockBrand, value: makeBag([]) })),
    `isEmpty([])) is true`,
  );
  t.falsy(
    m.isEmpty(harden({ brand: mockBrand, value: makeBag(['abc']) })),
    `isEmpty(['abc']) is false`,
  );
});

test('copyBag with strings isGTE', t => {
  t.assert(
    m.isGTE(
      harden({ brand: mockBrand, value: makeBag(['a']) }),
      harden({ brand: mockBrand, value: makeBag(['a']) }),
    ),
    `overlap between left and right of isGTE should not throw`,
  );
  t.assert(
    m.isGTE(
      harden({ brand: mockBrand, value: makeBag(['a', 'b']) }),
      harden({ brand: mockBrand, value: makeBag(['a']) }),
    ),
    `['a', 'b'] is gte to ['a']`,
  );
  t.falsy(
    m.isGTE(
      harden({ brand: mockBrand, value: makeBag(['a']) }),
      harden({ brand: mockBrand, value: makeBag(['b']) }),
    ),
    `['a'] is not gte to ['b']`,
  );
});

test('copyBag with strings isEqual', t => {
  t.assert(
    m.isEqual(
      harden({ brand: mockBrand, value: makeBag(['a']) }),
      harden({ brand: mockBrand, value: makeBag(['a']) }),
    ),
    `overlap between left and right of isEqual is ok`,
  );
  t.assert(
    m.isEqual(
      harden({ brand: mockBrand, value: makeBag(['a', 'b']) }),
      harden({ brand: mockBrand, value: makeBag(['b', 'a']) }),
    ),
    `['a', 'b'] equals ['b', 'a']`,
  );
  t.falsy(
    m.isEqual(
      harden({ brand: mockBrand, value: makeBag(['a']) }),
      harden({ brand: mockBrand, value: makeBag(['b']) }),
    ),
    `['a'] does not equal ['b']`,
  );
});

test('copyBag with strings add', t => {
  t.deepEqual(
    m.add(
      harden({ brand: mockBrand, value: makeBag(['a', 'a']) }),
      harden({ brand: mockBrand, value: makeBag(['b']) }),
    ),
    {
      brand: mockBrand,
      value: makeTagged('copyBag', [
        ['b', 1n],
        ['a', 2n],
      ]),
    },
  );
  t.deepEqual(
    m.add(
      harden({ brand: mockBrand, value: makeBag(['a']) }),
      harden({ brand: mockBrand, value: makeBag(['b']) }),
    ),
    { brand: mockBrand, value: makeBag(['b', 'a']) },
    `['a'] + ['b'] = ['a', 'b']`,
  );
});

test('copyBag with strings subtract', t => {
  t.throws(
    () =>
      m.subtract(
        harden({ brand: mockBrand, value: makeBag(['a', 'a']) }),
        harden({ brand: mockBrand, value: makeBag(['b']) }),
      ),
    { message: /right element "b" was not in left/ },
  );
  t.throws(
    () =>
      m.subtract(
        harden({ brand: mockBrand, value: makeBag(['a']) }),
        harden({ brand: mockBrand, value: makeBag(['b', 'b']) }),
      ),
    { message: /right element "b" was not in left/ },
  );
  t.deepEqual(
    m.subtract(
      harden({ brand: mockBrand, value: makeBag(['a']) }),
      harden({ brand: mockBrand, value: makeBag(['a']) }),
    ),
    { brand: mockBrand, value: makeBag([]) },
    `overlap between left and right of subtract should not throw`,
  );
  t.throws(
    () =>
      m.subtract(
        harden({ brand: mockBrand, value: makeBag(['a', 'b']) }),
        harden({ brand: mockBrand, value: makeBag(['c']) }),
      ),
    { message: /right element "c" was not in left/ },
    `elements in right but not in left of subtract should throw`,
  );
  t.deepEqual(
    m.subtract(
      harden({ brand: mockBrand, value: makeBag(['a', 'b']) }),
      harden({ brand: mockBrand, value: makeBag(['a']) }),
    ),
    { brand: mockBrand, value: makeBag(['b']) },
    `['a', 'b'] - ['a'] = ['a']`,
  );
});
