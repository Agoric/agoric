import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';
import { M } from '@agoric/store';

import { Far } from '@endo/marshal';
import { AmountMath as m, AssetKind } from '../../../src/index.js';
import { mockNatBrand as mockBrand } from './mockBrand.js';

// The "unit tests" for MathHelpers actually make the calls through
// AmountMath so that we can test that any duplication is handled
// correctly.

test('natMathHelpers make', t => {
  t.deepEqual(m.make(mockBrand, 4n), { brand: mockBrand, value: 4n });
  // @ts-expect-error deliberate invalid arguments for testing
  t.throws(() => m.make(mockBrand, 4), {
    message: 'value 4 must be an AmountValue, not "number"',
  });
  t.throws(
    // @ts-expect-error deliberate invalid arguments for testing
    () => m.make(mockBrand, 'abc'),
    {
      message: 'value "abc" must be an AmountValue, not "string"',
    },
    `'abc' is not a nat`,
  );
  t.throws(
    // @ts-expect-error deliberate invalid arguments for testing
    () => m.make(mockBrand, -1),
    {
      message: 'value -1 must be an AmountValue, not "number"',
    },
    `- 1 is not a valid Nat`,
  );
});

test('natMathHelpers make no brand', t => {
  t.throws(
    // @ts-expect-error deliberate invalid arguments for testing
    () => m.make(4n),
    {
      message: '"brand" "[4n]" must be a remotable, not "bigint"',
    },
    `brand is required in make`,
  );
});

test('natMathHelpers coerce', t => {
  t.deepEqual(
    m.coerce(mockBrand, harden({ brand: mockBrand, value: 4n })),
    {
      brand: mockBrand,
      value: 4n,
    },
    `coerce can take an amount`,
  );
  t.throws(
    () =>
      m.coerce(
        mockBrand,
        harden({
          brand: Far('otherBrand', {
            getAllegedName: () => 'somename',
            isMyIssuer: async () => false,
            getDisplayInfo: () => ({ assetKind: AssetKind.NAT }),
            getAmountShape: () => M.any(),
          }),
          value: 4n,
        }),
      ),
    {
      message:
        /The brand in the allegedAmount .* in 'coerce' didn't match the specified brand/,
    },
    `coerce can't take the wrong brand`,
  );
  t.throws(
    // @ts-expect-error deliberate invalid arguments for testing
    () => m.coerce(3n, mockBrand),
    {
      message: '"brand" "[3n]" must be a remotable, not "bigint"',
    },
    `coerce needs a brand`,
  );
});

test('natMathHelpers coerce no brand', t => {
  t.throws(
    // @ts-expect-error deliberate invalid arguments for testing
    () => m.coerce(m.make(4n, mockBrand)),
    {
      message: '"brand" "[4n]" must be a remotable, not "bigint"',
    },
    `brand is required in coerce`,
  );
});

test('natMathHelpers getValue', t => {
  t.is(m.getValue(mockBrand, m.make(mockBrand, 4n)), 4n);
  // @ts-expect-error deliberate invalid arguments for testing
  t.throws(() => m.getValue(mockBrand, m.make(mockBrand, 4)), {
    message: 'value 4 must be an AmountValue, not "number"',
  });
});

test('natMathHelpers getValue no brand', t => {
  t.throws(
    // @ts-expect-error deliberate invalid arguments for testing
    () => m.getValue(m.make(4n, mockBrand)),
    {
      message: '"brand" "[4n]" must be a remotable, not "bigint"',
    },
    `brand is required in getValue`,
  );
});

test('natMathHelpers makeEmpty', t => {
  const empty = m.make(mockBrand, 0n);

  t.deepEqual(m.makeEmpty(mockBrand), empty, `empty is 0`);
});

test('natMathHelpers makeEmpty no brand', t => {
  t.throws(
    // @ts-expect-error deliberate invalid arguments for testing
    () => m.makeEmpty(AssetKind.NAT),
    {
      message: '"brand" "nat" must be a remotable, not "string"',
    },
    `make empty no brand`,
  );
});

test('natMathHelpers isEmpty', t => {
  t.assert(
    m.isEmpty(harden({ brand: mockBrand, value: 0n })),
    `isEmpty(0) is true`,
  );
  t.falsy(
    m.isEmpty(harden({ brand: mockBrand, value: 6n })),
    `isEmpty(6) is false`,
  );
  t.assert(m.isEmpty(m.make(mockBrand, 0n)), `isEmpty(0) is true`);
  t.falsy(m.isEmpty(m.make(mockBrand, 6n)), `isEmpty(6) is false`);
  t.throws(
    // @ts-expect-error deliberate invalid arguments for testing
    () => m.isEmpty('abc'),
    {
      message: '"amount" "abc" must be a pass-by-copy record, not "string"',
    },
    `isEmpty('abc') throws because it cannot be coerced`,
  );
  t.throws(
    // @ts-expect-error deliberate invalid arguments for testing
    () => m.isEmpty(harden({ brand: mockBrand, value: 'abc' })),
    {
      message: 'value "abc" must be an AmountValue, not "string"',
    },
    `isEmpty('abc') throws because it cannot be coerced`,
  );
  t.throws(
    // @ts-expect-error deliberate invalid arguments for testing
    () => m.isEmpty(0n),
    {
      message: '"amount" "[0n]" must be a pass-by-copy record, not "bigint"',
    },
    `isEmpty(0) throws because it cannot be coerced`,
  );
});

test('natMathHelpers isGTE', t => {
  t.assert(m.isGTE(m.make(mockBrand, 5n), m.make(mockBrand, 3n)), `5 >= 3`);
  t.assert(m.isGTE(m.make(mockBrand, 3n), m.make(mockBrand, 3n)), `3 >= 3`);
  t.falsy(
    m.isGTE(
      harden({ brand: mockBrand, value: 3n }),
      harden({ brand: mockBrand, value: 4n }),
    ),
    `3 < 4`,
  );
});

test('natMathHelpers isGTE mixed brands', t => {
  t.throws(
    () =>
      m.isGTE(
        m.make(
          Far('otherBrand', {
            getAllegedName: () => 'somename',
            isMyIssuer: async () => false,
            getDisplayInfo: () => ({ assetKind: AssetKind.NAT }),
            getAmountShape: () => M.any(),
          }),
          5n,
        ),
        m.make(mockBrand, 3n),
      ),
    {
      message: /Brands in left .* and right .* should match but do not/,
    },
  );
});

test(`natMathHelpers isGTE - brands don't match objective brand`, t => {
  t.throws(
    () =>
      m.isGTE(
        m.make(mockBrand, 5n),
        m.make(mockBrand, 3n),
        Far('otherBrand', {
          getAllegedName: () => 'somename',
          isMyIssuer: async () => false,
          getDisplayInfo: () => ({ assetKind: AssetKind.NAT }),
          getAmountShape: () => M.any(),
        }),
      ),
    {
      message: /amount's brand .* did not match expected brand .*/,
    },
  );
});

test('natMathHelpers isEqual', t => {
  t.assert(
    m.isEqual(m.make(mockBrand, 4n), m.make(mockBrand, 4n)),
    `4 equals 4`,
  );
  t.falsy(
    m.isEqual(m.make(mockBrand, 4n), m.make(mockBrand, 5n)),
    `4 does not equal 5`,
  );
});

test('natMathHelpers isEqual mixed brands', t => {
  t.throws(
    () =>
      m.isEqual(
        m.make(
          Far('otherBrand', {
            getAllegedName: () => 'somename',
            isMyIssuer: async () => false,
            getDisplayInfo: () => ({ assetKind: AssetKind.NAT }),
            getAmountShape: () => M.any(),
          }),
          4n,
        ),
        m.make(mockBrand, 4n),
      ),
    {
      message: /Brands in left .* and right .* should match but do not/,
    },
  );
});

test(`natMathHelpers isEqual - brands don't match objective brand`, t => {
  t.throws(
    () =>
      m.isEqual(
        m.make(mockBrand, 4n),
        m.make(mockBrand, 4n),
        Far('otherBrand', {
          getAllegedName: () => 'somename',
          isMyIssuer: async () => false,
          getDisplayInfo: () => ({ assetKind: AssetKind.NAT }),
          getAmountShape: () => M.any(),
        }),
      ),
    {
      message: /amount's brand .* did not match expected brand .*/,
    },
  );
});

test('natMathHelpers add', t => {
  t.deepEqual(
    m.add(m.make(mockBrand, 5n), m.make(mockBrand, 9n)),
    m.make(mockBrand, 14n),
    `5 + 9 = 14`,
  );
});

test('natMathHelpers add mixed brands', t => {
  t.throws(
    () =>
      m.add(
        m.make(
          Far('otherBrand', {
            getAllegedName: () => 'somename',
            isMyIssuer: async () => false,
            getDisplayInfo: () => ({ assetKind: AssetKind.NAT }),
            getAmountShape: () => M.any(),
          }),
          5n,
        ),
        m.make(mockBrand, 9n),
      ),
    {
      message: /Brands in left .* and right .* should match but do not/,
    },
  );
});

test(`natMathHelpers add - brands don't match objective brand`, t => {
  t.throws(
    () =>
      m.add(
        m.make(mockBrand, 5n),
        m.make(mockBrand, 9n),
        Far('otherBrand', {
          getAllegedName: () => 'somename',
          isMyIssuer: async () => false,
          getDisplayInfo: () => ({ assetKind: AssetKind.NAT }),
          getAmountShape: () => M.any(),
        }),
      ),
    {
      message: /amount's brand .* did not match expected brand .*/,
    },
  );
});

test('natMathHelpers subtract', t => {
  t.deepEqual(
    m.subtract(m.make(mockBrand, 6n), m.make(mockBrand, 1n)),
    m.make(mockBrand, 5n),
    `6 - 1 = 5`,
  );
});

test('natMathHelpers subtract mixed brands', t => {
  t.throws(
    () =>
      m.subtract(
        m.make(
          Far('otherBrand', {
            getAllegedName: () => 'somename',
            isMyIssuer: async () => false,
            getDisplayInfo: () => ({ assetKind: AssetKind.NAT }),
            getAmountShape: () => M.any(),
          }),
          6n,
        ),
        m.make(mockBrand, 1n),
      ),
    {
      message: /Brands in left .* and right .* should match but do not/,
    },
  );
});

test(`natMathHelpers subtract brands don't match brand`, t => {
  t.throws(
    () =>
      m.subtract(
        m.make(mockBrand, 6n),
        m.make(mockBrand, 1n),
        Far('otherBrand', {
          getAllegedName: () => 'somename',
          isMyIssuer: async () => false,
          getDisplayInfo: () => ({ assetKind: AssetKind.NAT }),
          getAmountShape: () => M.any(),
        }),
      ),
    {
      message: /amount's brand .* did not match expected brand .*/,
    },
  );
});
