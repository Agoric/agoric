import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';
import { makeCopyBag } from '@agoric/store';
import fc from 'fast-check';

import { q } from '@agoric/assert';
import { AmountMath as m, AssetKind } from '../../src/index.js';
import { mockBrand } from './mathHelpers/mockBrand.js';
import { assertionPassed } from '../../../store/test/test-store.js';

// Perhaps makeCopyBag should coalesce duplicate labels, but for now, it does
// not.
const distinctLabels = pairs =>
  new Set(pairs.map(([label, _qty]) => label)).size === pairs.length;
const positiveCounts = pairs =>
  pairs.filter(([_l, qty]) => qty > 0n).length === pairs.length;
const arbBagContents = fc
  .nat(7)
  .chain(size =>
    fc.array(
      fc.tuple(fc.string(), fc.bigUint({ max: 1_000_000_000_000_000n })),
      { minLength: size, maxLength: size },
    ),
  )
  .filter(pairs => distinctLabels(pairs) && positiveCounts(pairs));

const arbAmount = arbBagContents.map(contents =>
  m.make(mockBrand, harden(makeCopyBag(contents))),
);

// Note: we write P => Q as !P || Q since JS has no logical => operator
const implies = (p, q) => !p || q;

test('isEqual is a (total) equivalence relation', async t => {
  await fc.assert(
    fc.property(
      fc.record({ x: arbAmount, y: arbAmount, z: arbAmount }),
      ({ x, y, z }) => {
        return (
          // Total
          assertionPassed(t.true([true, false].includes(m.isEqual(x, y))), () =>
            [true, false].includes(m.isEqual(x, y)),
          ) &&
          // Reflexive
          assertionPassed(t.true(m.isEqual(x, x)), () => m.isEqual(x, x)) &&
          // Symmetric
          assertionPassed(
            t.true(implies(m.isEqual(x, y), m.isEqual(y, x))),
            () => implies(m.isEqual(x, y), m.isEqual(y, x)),
          ) &&
          // Transitive
          assertionPassed(
            t.true(
              implies(m.isEqual(x, y) && m.isEqual(y, z), m.isEqual(x, z)),
            ),
            () => implies(m.isEqual(x, y) && m.isEqual(y, z), m.isEqual(x, z)),
          )
        );
      },
    ),
  );
});

test('isGT definition', async t => {
  await fc.assert(
    fc.property(fc.record({ x: arbAmount, y: arbAmount }), ({ x, y }) => {
      const definition = m.isGTE(x, y) && !m.isEqual(x, y);
      console.log('DEBUG x', x.value);
      console.log('DEBUG y', y.value);
      console.log('DEBUG isGTE', m.isGTE(x, y));
      console.log('DEBUG isEqual', m.isEqual(x, y));
      console.log('DEBUG definition', definition);
      console.log('DEBUG actual isGT', m.isGT(x, y));
      return t.is(m.isGT(x, y), definition);
    }),
  );
});

test('isGTE is a partial order with empty as minimum', async t => {
  const empty = m.makeEmpty(mockBrand, AssetKind.COPY_BAG);
  await fc.assert(
    fc.property(fc.record({ x: arbAmount, y: arbAmount }), ({ x, y }) => {
      return (
        assertionPassed(t.true(m.isGTE(x, empty)), () => m.isGTE(x, empty)) &&
        // Total
        assertionPassed(t.true([true, false].includes(m.isGTE(x, y))), () =>
          [true, false].includes(m.isGTE(x, y)),
        ) &&
        // Reflexive
        assertionPassed(t.true(m.isGTE(x, x)), () => m.isGTE(x, x)) &&
        // Antisymmetric
        assertionPassed(
          t.true(implies(m.isGTE(x, y) && m.isGTE(y, x), m.isEqual(x, y))),
          () => implies(m.isGTE(x, y) && m.isGTE(y, x), m.isEqual(x, y)),
        )
      );
    }),
  );
});

test('isLT definition', async t => {
  await fc.assert(
    fc.property(fc.record({ x: arbAmount, y: arbAmount }), ({ x, y }) => {
      const definition = !m.isGTE(x, y);
      return t.is(m.isLT(x, y), definition);
    }),
  );
});

test.only('isLTE definition', async t => {
  await fc.assert(
    fc.property(fc.record({ x: arbAmount, y: arbAmount }), ({ x, y }) => {
      const definition = !m.isGTE(x, y) || m.isEqual(x, y);
      console.log('DEBUG x', x.value);
      console.log('DEBUG y', y.value);
      console.log('DEBUG isGTE', m.isGTE(x, y));
      console.log('DEBUG isEqual', m.isEqual(x, y));
      console.log('DEBUG definition', definition);
      console.log('DEBUG actual isLTE', m.isLTE(x, y));
      return t.is(m.isLTE(x, y), definition);
    }),
  );
});

test('add: closed, commutative, associative, monotonic, with empty identity', async t => {
  const empty = m.makeEmpty(mockBrand, AssetKind.COPY_BAG);
  await fc.assert(
    fc.property(
      fc.record({ x: arbAmount, y: arbAmount, z: arbAmount }),
      ({ x, y, z }) => {
        return (
          // note: + for SET is not total.
          assertionPassed(t.truthy(m.coerce(mockBrand, m.add(x, y))), () =>
            m.coerce(mockBrand, m.add(x, y)),
          ) &&
          // Identity (right)
          assertionPassed(t.true(m.isEqual(m.add(x, empty), x)), () =>
            m.isEqual(m.add(x, empty), x),
          ) &&
          // Identity (left)
          assertionPassed(t.true(m.isEqual(m.add(empty, x), x)), () =>
            m.isEqual(m.add(empty, x), x),
          ) &&
          // Commutative
          assertionPassed(t.true(m.isEqual(m.add(x, y), m.add(y, x))), () =>
            m.isEqual(m.add(x, y), m.add(y, x)),
          ) &&
          // Associative
          assertionPassed(
            t.true(m.isEqual(m.add(m.add(x, y), z), m.add(x, m.add(y, z)))),
            () => m.isEqual(m.add(m.add(x, y), z), m.add(x, m.add(y, z))),
          ) &&
          // Monotonic (left)
          assertionPassed(t.true(m.isGTE(m.add(x, y), x)), () =>
            m.isGTE(m.add(x, y), x),
          ) &&
          // Monotonic (right)
          assertionPassed(t.true(m.isGTE(m.add(x, y), y)), () =>
            m.isGTE(m.add(x, y), y),
          )
        );
      },
    ),
  );
});

test('subtract: (x + y) - y = x; (y - x) + x = y if y >= x', async t => {
  await fc.assert(
    fc.property(fc.record({ x: arbAmount, y: arbAmount }), ({ x, y }) => {
      return (
        assertionPassed(t.true(m.isEqual(m.subtract(m.add(x, y), y), x)), () =>
          m.isEqual(m.subtract(m.add(x, y), y), x),
        ) &&
        assertionPassed(
          t.true(
            m.isGTE(y, x) ? m.isEqual(m.add(m.subtract(y, x), x), y) : true,
          ),
          () =>
            m.isGTE(y, x) ? m.isEqual(m.add(m.subtract(y, x), x), y) : true,
        )
      );
    }),
  );
});

test('minmax', t => {
  fc.assert(
    fc.property(fc.record({ x: arbAmount, y: arbAmount }), ({ x, y }) => {
      t.deepEqual(m.min(x, y), m.isGTE(x, y) ? y : x, 'SET: min');
      t.deepEqual(m.max(x, y), m.isGTE(x, y) ? x : y, 'SET: max');
    }),
  );
});
