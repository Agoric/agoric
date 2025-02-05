import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import { Far } from '@endo/marshal';

import { AmountMath as m, AssetKind } from '../../../src/index.js';
import { mockSetBrand as mockBrand } from './mockBrand.js';

// The "unit tests" for MathHelpers actually make the calls through
// AmountMath so that we can test that any duplication is handled
// correctly.

const runSetMathHelpersTests = (t, [a, b, c], a2) => {
  // a2 is a copy of a which should have the same values but not same
  // identity. This doesn't make sense to use for handle tests, but
  // makes sense for anything where the identity is based on data.

  // make
  t.deepEqual(
    m.make(mockBrand, harden([a])),
    { brand: mockBrand, value: harden([a]) },
    `[a] is a valid set`,
  );
  t.assert(
    m.isEqual(
      m.make(mockBrand, harden([a, b])),
      harden({
        brand: mockBrand,
        value: harden([b, a]),
      }),
    ),
    `[b, a] is a valid set`,
  );
  t.deepEqual(
    m.make(mockBrand, harden([])),
    { brand: mockBrand, value: harden([]) },
    `[] is a valid set`,
  );
  t.throws(
    () => m.make(mockBrand, harden([a, a])),
    { message: /value has duplicate(| key)s/ },
    `duplicates in make should throw`,
  );
  t.assert(
    m.isEqual(
      m.make(mockBrand, harden(['a', 'b'])),
      harden({ brand: mockBrand, value: harden(['b', 'a']) }),
    ),
    'any key is a valid element',
  );
  t.throws(
    // @ts-expect-error deliberate invalid arguments for testing
    () => m.make(mockBrand, 'a'),
    {
      message: 'value "a" must be an AmountValue, not "string"',
    },
    'strings are not valid',
  );
  if (a2 !== undefined) {
    t.throws(
      () => m.make(mockBrand, harden([a, a2])),
      { message: /value has duplicate(| key)s/ },
      `data identity throws`,
    );
  }

  // coerce
  t.deepEqual(
    m.coerce(mockBrand, harden({ brand: mockBrand, value: harden([a]) })),
    { brand: mockBrand, value: harden([a]) },
    `[a] is a valid set`,
  );
  t.assert(
    m.isEqual(
      m.coerce(mockBrand, harden({ brand: mockBrand, value: harden([a, b]) })),
      harden({ brand: mockBrand, value: harden([b, a]) }),
    ),
    `[a, b] is a valid set`,
  );
  t.deepEqual(
    m.coerce(mockBrand, harden({ brand: mockBrand, value: harden([]) })),
    { brand: mockBrand, value: harden([]) },
    `[] is a valid set`,
  );
  t.throws(
    () => m.coerce(mockBrand, m.make(mockBrand, harden([a, a]))),
    { message: /value has duplicate(| key)s/ },
    `duplicates in coerce should throw`,
  );
  t.assert(
    m.isEqual(
      m.coerce(mockBrand, m.make(mockBrand, harden(['a', 'b']))),
      harden({ brand: mockBrand, value: harden(['b', 'a']) }),
    ),
    'any key is a valid element',
  );
  t.throws(
    // @ts-expect-error deliberate invalid arguments for testing
    () => m.coerce(mockBrand, harden({ brand: mockBrand, value: 'a' })),
    {
      message: 'value "a" must be an AmountValue, not "string"',
    },
    'strings are not valid',
  );
  if (a2 !== undefined) {
    t.throws(
      () => m.coerce(mockBrand, harden({ brand: mockBrand, value: [a, a2] })),
      { message: /value has duplicate(| key)s/ },
      `data identity throws`,
    );
  }

  // m.getValue(
  t.deepEqual(
    m.getValue(mockBrand, harden({ brand: mockBrand, value: [a] })),
    [a],
    `m.getValue( of m.make([a]) is [a]`,
  );

  // makeEmpty
  t.deepEqual(
    m.makeEmpty(mockBrand, AssetKind.SET),
    { brand: mockBrand, value: harden([]) },
    `empty is []`,
  );

  // isEmpty
  t.assert(
    m.isEmpty(m.make(mockBrand, harden([])), mockBrand),
    `m.isEmpty([]) is true`,
  );
  t.throws(
    // @ts-expect-error deliberate invalid arguments for testing
    () => m.isEmpty(harden({ brand: mockBrand, value: {} })),
    {
      message: 'value {} must be an AmountValue, not "copyRecord"',
    },
    `m.isEmpty({}) throws`,
  );
  t.falsy(
    m.isEmpty(m.make(mockBrand, harden(['abc']))),
    `m.isEmpty(['abc']) is false`,
  );
  t.falsy(m.isEmpty(m.make(mockBrand, harden([a]))), `m.isEmpty([a]) is false`);
  t.throws(
    () => m.isEmpty(harden({ brand: mockBrand, value: harden([a, a]) })),
    { message: /value has duplicate(| key)s/ },
    `duplicates in value in isEmpty throw because of coercion`,
  );
  t.assert(m.isEmpty(m.make(mockBrand, harden([]))), `m.isEmpty([]) is true`);
  t.falsy(
    m.isEmpty(m.make(mockBrand, harden(['abc']))),
    `m.isEmpty(['abc']) is false`,
  );
  t.falsy(m.isEmpty(m.make(mockBrand, harden([a]))), `m.isEmpty([a]) is false`);
  if (a2 !== undefined) {
    t.throws(
      () => m.isEmpty(harden({ brand: mockBrand, value: harden([a, a2]) })),
      { message: /value has duplicate(| key)s/ },
      `data identity throws`,
    );
  }

  // isGTE
  t.throws(
    () =>
      m.isGTE(
        harden({ brand: mockBrand, value: [a, a] }),
        harden({ brand: mockBrand, value: [b] }),
      ),
    { message: /value has duplicate(| key)s/ },
    `duplicates in the left of isGTE should throw`,
  );
  t.throws(
    () =>
      m.isGTE(
        harden({ brand: mockBrand, value: [a] }),
        harden({ brand: mockBrand, value: [b, b] }),
      ),
    { message: /value has duplicate(| key)s/ },
    `duplicates in the right of isGTE should throw`,
  );
  t.assert(
    m.isGTE(
      harden({ brand: mockBrand, value: [a] }),
      harden({ brand: mockBrand, value: [a] }),
    ),
    `overlap between left and right of isGTE should not throw`,
  );
  t.assert(
    m.isGTE(
      harden({ brand: mockBrand, value: [a, b] }),
      harden({ brand: mockBrand, value: [b] }),
    ),
    '[a, b] is GTE [b]',
  );
  t.falsy(
    m.isGTE(
      harden({ brand: mockBrand, value: [b] }),
      harden({ brand: mockBrand, value: [b, a] }),
    ),
    '[b] does not include [b, a]',
  );
  if (a2 !== undefined) {
    t.throws(
      () =>
        m.isGTE(
          harden({ brand: mockBrand, value: [a, a2] }),
          harden({ brand: mockBrand, value: [b] }),
        ),
      { message: /value has duplicate(| key)s/ },
      `data identity throws`,
    );
  }

  // isEqual
  t.throws(
    () =>
      m.isEqual(
        harden({ brand: mockBrand, value: [a, a] }),
        harden({ brand: mockBrand, value: [a] }),
      ),
    { message: /value has duplicate(| key)s/ },
    `duplicates in left of isEqual should throw`,
  );
  t.throws(
    () =>
      m.isEqual(
        harden({ brand: mockBrand, value: [a] }),
        harden({ brand: mockBrand, value: [a, a] }),
      ),
    { message: /value has duplicate(| key)s/ },
    `duplicates in right of isEqual should throw`,
  );
  t.assert(
    m.isEqual(
      harden({ brand: mockBrand, value: [a] }),
      harden({ brand: mockBrand, value: [a] }),
    ),
    `overlap between left and right of isEqual is ok`,
  );
  t.assert(
    m.isEqual(
      harden({ brand: mockBrand, value: [b, a, c] }),
      harden({ brand: mockBrand, value: [a, c, b] }),
    ),
    `order doesn't matter`,
  );
  t.falsy(
    m.isEqual(
      harden({ brand: mockBrand, value: [b, c] }),
      harden({ brand: mockBrand, value: [b, a] }),
    ),
    `not equal`,
  );
  if (a2 !== undefined) {
    t.throws(
      () =>
        m.isEqual(
          harden({ brand: mockBrand, value: [a, a2] }),
          harden({ brand: mockBrand, value: [a] }),
        ),
      { message: /value has duplicate(| key)s/ },
      `data identity throws`,
    );
  }

  // add
  t.throws(
    () =>
      m.add(
        harden({ brand: mockBrand, value: [a, a] }),
        harden({ brand: mockBrand, value: [b] }),
      ),
    { message: /value has duplicate(| key)s/ },
    `duplicates in left of add should throw`,
  );
  t.throws(
    () =>
      m.add(
        harden({ brand: mockBrand, value: [a] }),
        harden({ brand: mockBrand, value: [b, b] }),
      ),
    { message: /value has duplicate(| key)s/ },
    `duplicates in right of add should throw`,
  );
  t.throws(
    () =>
      m.add(
        harden({ brand: mockBrand, value: [a] }),
        harden({ brand: mockBrand, value: [a] }),
      ),
    { message: /Sets must not have common elements: .*/ },
    `overlap between left and right of add should throw`,
  );
  t.assert(
    m.isEqual(
      m.add(
        harden({ brand: mockBrand, value: [] }),
        harden({ brand: mockBrand, value: [b, c] }),
      ),
      harden({ brand: mockBrand, value: [c, b] }),
    ),
    `anything + identity stays same`,
  );
  t.assert(
    m.isEqual(
      m.add(
        harden({ brand: mockBrand, value: [b, c] }),
        harden({ brand: mockBrand, value: [] }),
      ),
      harden({ brand: mockBrand, value: [c, b] }),
    ),
    `anything + identity stays same`,
  );
  if (a2 !== undefined) {
    t.throws(
      () =>
        m.add(
          harden({ brand: mockBrand, value: [a, a2] }),
          harden({ brand: mockBrand, value: [b] }),
        ),
      { message: /value has duplicate(| key)s/ },
      `data identity throws`,
    );
  }

  // subtract
  t.throws(
    () =>
      m.subtract(
        harden({ brand: mockBrand, value: [a, a] }),
        harden({ brand: mockBrand, value: [b] }),
      ),
    { message: /value has duplicate(| key)s/ },
    `duplicates in left of subtract should throw`,
  );
  t.throws(
    () =>
      m.subtract(
        harden({ brand: mockBrand, value: [a] }),
        harden({ brand: mockBrand, value: [b, b] }),
      ),
    { message: /value has duplicate(| key)s/ },
    `duplicates in right of subtract should throw`,
  );
  t.deepEqual(
    m.subtract(
      harden({ brand: mockBrand, value: [a] }),
      harden({ brand: mockBrand, value: [a] }),
    ),
    { brand: mockBrand, value: [] },
    `overlap between left and right of subtract should not throw`,
  );
  t.throws(
    () =>
      m.subtract(
        harden({ brand: mockBrand, value: [a, b] }),
        harden({ brand: mockBrand, value: [c] }),
      ),
    { message: /right element .* was not in left/ },
    `elements in right but not in left of subtract should throw`,
  );
  t.assert(
    m.isEqual(
      m.subtract(
        harden({ brand: mockBrand, value: [b, c] }),
        harden({ brand: mockBrand, value: [] }),
      ),
      harden({ brand: mockBrand, value: [c, b] }),
    ),
    `anything - identity stays same`,
  );
  t.deepEqual(
    m.subtract(
      harden({ brand: mockBrand, value: [b, c] }),
      harden({ brand: mockBrand, value: [b] }),
    ),
    { brand: mockBrand, value: [c] },
    `b, c - b is c`,
  );
  if (a2 !== undefined) {
    t.throws(
      () =>
        m.subtract(
          harden({ brand: mockBrand, value: [a, a2] }),
          harden({
            brand: mockBrand,
            value: [b],
          }),
        ),
      { message: /value has duplicate(| key)s/ },
      `data identity throws`,
    );
  }
};

test('setMathHelpers with handles', t => {
  const a = Far('iface a', {});
  const b = Far('iface b', {});
  const c = Far('iface c', {});

  runSetMathHelpersTests(t, [a, b, c]);
});

test('setMathHelpers with basic objects', t => {
  const a = { name: 'a' };
  const b = { name: 'b' };
  const c = { name: 'c' };

  const a2 = { ...a };

  runSetMathHelpersTests(t, [a, b, c], a2);
});

test('setMathHelpers with complex objects', t => {
  const a = {
    handle: Far('handle', {}),
    instanceHandle: Far('ihandle', {}),
    name: 'a',
  };
  const b = {
    handle: Far('handle', {}),
    instanceHandle: a.instanceHandle,
    name: 'b',
  };
  const c = {
    handle: Far('handle', {}),
    instanceHandle: Far('ihandle', {}),
    name: 'c',
  };

  const a2 = { ...a };

  runSetMathHelpersTests(t, [a, b, c], a2);
});
