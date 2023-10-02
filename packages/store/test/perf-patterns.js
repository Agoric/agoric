import { Far, makeTagged } from '@endo/marshal';
import {
  makeCopyBag,
  makeCopyMap,
  makeCopySet,
  matches,
  M,
} from '@endo/patterns';
import engineGC from './engine-gc.js';
import { makeGcAndFinalize } from './gc-and-finalize.js';

import {
  AmountShape,
  BrandShape,
  FullProposalShape,
  PaymentShape,
  ProposalShape,
} from './borrow-guards.js';
import '../src/types-ambient.js';

const gcAndFinalize = makeGcAndFinalize(engineGC);

const measurements = [];
/**
 * @typedef MatchTest
 * @property {Passable} specimen
 * @property {Pattern[]} yesPatterns
 */

/** @type {MatchTest[]} */
const matchTests = harden([
  {
    specimen: 3,
    yesPatterns: [
      3,
      M.any(),
      M.not(4),
      M.kind('number'),
      M.number(),
      M.lte(7),
      M.gte(2),
      M.and(3, 3),
      M.or(3, 4),
      M.and(),

      M.scalar(),
      M.key(),
      M.pattern(),
    ],
  },
  {
    specimen: [3, 4],
    yesPatterns: [
      [3, 4],
      [M.number(), M.any()],
      [M.lte(3), M.gte(3)],
      // Arrays compare lexicographically
      M.gte([3, 3]),
      M.lte([4, 4]),
      M.gte([3]),
      M.lte([3, 4, 1]),

      M.split([3], [4]),
      M.split([3]),
      M.split([3], M.array()),
      M.split([3, 4], []),
      M.split([], [3, 4]),

      M.partial([3], [4]),
      M.partial([3, 4, 5, 6]),
      M.partial([3, 4, 5, 6], []),

      M.array(),
      M.key(),
      M.pattern(),
      M.arrayOf(M.number()),
    ],
  },
  {
    specimen: { foo: 3, bar: 4 },
    yesPatterns: [
      { foo: 3, bar: 4 },
      { foo: M.number(), bar: M.any() },
      { foo: M.lte(3), bar: M.gte(3) },
      // Records compare pareto
      M.gte({ foo: 3, bar: 3 }),
      M.lte({ foo: 4, bar: 4 }),

      M.split(
        { foo: M.number() },
        M.and(M.partial({ bar: M.number() }), M.partial({ baz: M.number() })),
      ),

      M.split(
        { foo: M.number() },
        M.partial({ bar: M.number(), baz: M.number() }),
      ),

      M.split({ foo: 3 }, { bar: 4 }),
      M.split({ bar: 4 }, { foo: 3 }),
      M.split({ foo: 3 }),
      M.split({ foo: 3 }, M.record()),
      M.split({}, { foo: 3, bar: 4 }),
      M.split({ foo: 3, bar: 4 }, {}),

      M.partial({ zip: 5, zap: 6 }),
      M.partial({ zip: 5, zap: 6 }, { foo: 3, bar: 4 }),
      M.partial({ foo: 3, zip: 5 }, { bar: 4 }),

      M.record(),
      M.key(),
      M.pattern(),
      M.recordOf(M.string(), M.number()),
    ],
  },
  {
    specimen: makeCopySet([3, 4]),
    yesPatterns: [
      makeCopySet([4, 3]),
      M.gte(makeCopySet([])),
      M.lte(makeCopySet([3, 4, 5])),
      M.set(),
      M.setOf(M.number()),
    ],
  },
  {
    specimen: makeCopyBag([
      ['a', 2n],
      ['b', 3n],
    ]),
    yesPatterns: [
      M.gt(makeCopyBag([])),
      M.gt(makeCopyBag([['a', 2n]])),
      M.gt(
        makeCopyBag([
          ['a', 1n],
          ['b', 3n],
        ]),
      ),
      M.bag(),
      M.bagOf(M.string()),
      M.bagOf(M.string(), M.lt(5n)),
    ],
  },
  {
    specimen: makeCopyMap([
      [{}, 'a'],
      [{ foo: 3 }, 'b'],
    ]),
    yesPatterns: [
      // M.gt(makeCopyMap([])), Map comparison not yet implemented
      M.map(),
      M.mapOf(M.record(), M.string()),
    ],
  },
  {
    specimen: makeTagged('mysteryTag', 88),
    yesPatterns: [M.any(), M.not(M.pattern())],
  },
  {
    specimen: makeTagged('match:any', undefined),
    yesPatterns: [M.any(), M.pattern()],
  },
  {
    specimen: makeTagged('match:any', 88),
    yesPatterns: [M.any(), M.not(M.pattern())],
    noPatterns: [[M.pattern(), 'match:any payload: 88 - Must be undefined']],
  },
  {
    specimen: makeTagged('match:remotable', 88),
    yesPatterns: [M.any(), M.not(M.pattern())],
  },
  {
    specimen: makeTagged('match:remotable', harden({ label: 88 })),
    yesPatterns: [M.any(), M.not(M.pattern())],
  },
  {
    specimen: makeTagged('match:recordOf', harden([M.string(), M.nat()])),
    yesPatterns: [M.pattern()],
  },
  {
    specimen: makeTagged(
      'match:recordOf',
      harden([M.string(), Promise.resolve(null)]),
    ),
    yesPatterns: [M.any(), M.not(M.pattern())],
  },
]);

const makeBatch = testCases => {
  const specimens = [];
  const patterns = [];
  for (const { specimen, yesPatterns } of testCases) {
    for (const yesPattern of yesPatterns) {
      specimens.push(specimen);
      patterns.push(yesPattern);
    }
  }
  return harden({ specimens, patterns });
};

const repetitions = 200;

// export NODE_OPTIONS="--jitless --cpu-prof --heap-prof --expose-gc"
// NODE_OPTIONS="--jitless" node --cpu-prof --prof test/perf-patterns.js
// node --prof-process isolate-0x140008000-36726-v8.log > processed.txt
// node --prof test/perf-patterns.js
// node --prof-process isolate-0x130008000-37133-v8.log > processed.txt

const measure = async (title, specimen, yesPattern, factor = 1) => {
  const times = factor * repetitions;
  await gcAndFinalize();
  const startAt = Date.now();
  for (let j = 0; j < times; j += 1) {
    // mustMatch(specimen, yesPattern);
    assert(matches(specimen, yesPattern), title);
  }
  const totalTime = Date.now() - startAt;
  const perStep = totalTime / times;
  measurements.push([title, perStep, Math.round(1000 / perStep)]);
  console.log(
    `test '${title}': ${times} repetitions took ${totalTime}ms;  each: ${perStep}ms`,
  );
};

const brand = Far('fungible brand', {});
const amount1000 = harden({
  brand,
  value: 1000n,
});
const payment1000 = Far('fungible payment', {});

const proposal = harden({
  give: { In: amount1000 },
  want: { Out: amount1000 },
  exit: { onDemand: null },
});
const smallArray = harden([1, 2, 3]);
const bigArray = harden([...Array(10000).keys()]);

const allMeasures = async () => {
  await measure('amount', amount1000, AmountShape, 100);
  await measure('array big', bigArray, M.array(), 400);
  await measure('array big ANY', bigArray, M.any(), 2000);
  await measure('array small', smallArray, M.array(), 500);
  await measure('brand', brand, BrandShape, 2000);
  await measure('empty', true, true, 1000);
  await measure('payment', payment1000, PaymentShape, 2000);
  await measure('full proposal', proposal, FullProposalShape, 10);
  await measure('partial proposal', proposal, ProposalShape, 10);
  const { specimens, patterns } = makeBatch(matchTests);
  await measure('z base patterns', specimens, patterns, 1);

  const results = measurements.sort((a, b) => (a[0] <= b[0] ? -1 : 1));
  results.unshift(['name', 'ms', 'ops/s']);
  console.log();
  for (const [name, ms, ops] of results) {
    console.log(`${name}, ${ms}, ${ops}`);
  }
  console.log();
};

await allMeasures();
