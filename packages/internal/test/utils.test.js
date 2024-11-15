// @ts-check
import test from 'ava';

import { Far } from '@endo/far';
import { deepMapObject, makeMeasureSeconds } from '../src/js-utils.js';
import {
  assertAllDefined,
  whileTrue,
  untilTrue,
  forever,
  deeplyFulfilledObject,
  synchronizedTee,
} from '../src/ses-utils.ts';

test('deeplyFulfilledObject', async t => {
  const someFar = Far('somefar', { getAsync: () => Promise.resolve('async') });
  const unfulfilled = harden({
    obj1: {
      obj2a: {
        stringP: Promise.resolve('foo'),
      },
      obj2b: someFar,
    },
  });
  const fulfilled = await deeplyFulfilledObject(unfulfilled);
  // JS check that it's a now string
  fulfilled.obj1.obj2a.stringP.length;
  t.deepEqual(fulfilled, {
    obj1: { obj2a: { stringP: 'foo' }, obj2b: someFar },
  });
});

/**
 * @typedef {object} DeepMapObjectTestParams
 * @property {any} input
 * @property {[any, any][]} replacements
 * @property {string[][]} unchangedPaths
 * @property {any} [expectedOutput]
 */

/** @type {import('ava').Macro<[DeepMapObjectTestParams]>} */
const deepMapObjectTest = test.macro({
  title(providedTitle, { input }) {
    return `deepMapObject - ${providedTitle || JSON.stringify(input)}`;
  },
  exec(t, { input, replacements, unchangedPaths, expectedOutput }) {
    const replacementMap = new Map(replacements);
    const output = deepMapObject(input, val =>
      replacementMap.has(val) ? replacementMap.get(val) : val,
    );

    for (const unchangedPath of unchangedPaths) {
      /** @type {any} */
      let inputVal = input;
      /** @type {any} */
      let outputVal = output;
      for (const pathPart of unchangedPath) {
        inputVal = inputVal[pathPart];
        outputVal = outputVal[pathPart];
      }
      t.is(
        outputVal,
        inputVal,
        `${['obj', ...unchangedPath].join('.')} is unchanged`,
      );
    }

    if (expectedOutput) {
      t.deepEqual(output, expectedOutput);
    }
  },
});

test('identity', deepMapObjectTest, {
  input: { foo: 42 },
  replacements: [],
  unchangedPaths: [[]],
});
test('non object', deepMapObjectTest, {
  input: 'not an object',
  replacements: [['not an object', 'not replaced']],
  unchangedPaths: [[]],
  expectedOutput: 'not an object',
});
test('one level deep', deepMapObjectTest, {
  input: { replace: 'replace me', notChanged: {} },
  replacements: [['replace me', 'replaced']],
  unchangedPaths: [['notChanged']],
  expectedOutput: { replace: 'replaced', notChanged: {} },
});

const testRecord = { maybeReplace: 'replace me' };
test('replace first before deep map', deepMapObjectTest, {
  input: { replace: testRecord, notChanged: {} },
  replacements: [
    [testRecord, { different: 'something new' }],
    ['replace me', 'should not be replaced'],
  ],
  unchangedPaths: [['notChanged']],
  expectedOutput: { replace: { different: 'something new' }, notChanged: {} },
});

test('not mapping top level container', deepMapObjectTest, {
  input: testRecord,
  replacements: [
    [testRecord, { different: 'should not be different' }],
    ['replace me', 'replaced'],
  ],
  unchangedPaths: [],
  expectedOutput: { maybeReplace: 'replaced' },
});
test('deep mapping', deepMapObjectTest, {
  input: {
    one: { two: { three: 'replace me' }, notChanged: {} },
    another: 'replace me',
  },
  replacements: [['replace me', 'replaced']],
  unchangedPaths: [['one', 'notChanged']],
  expectedOutput: {
    one: { two: { three: 'replaced' }, notChanged: {} },
    another: 'replaced',
  },
});

test('makeMeasureSeconds', async t => {
  const times = [1000.25, 2000.75, NaN];
  /** @type {() => number} */
  // @ts-expect-error undefined on fourth call
  const mockNow = () => times.shift();
  const measureSeconds = makeMeasureSeconds(mockNow);

  const unique = Symbol('unique');
  const output = await measureSeconds(async () => unique);
  t.deepEqual(output, { result: unique, duration: 1.0005 });
  t.deepEqual(times, [NaN]);
});

test('assertAllDefined', t => {
  /** @type {{ s: string; m: string | undefined; u?: string }} */
  const obj = { s: 'defined', m: 'maybe' };
  assertAllDefined(obj);
  // typecheck
  obj.m.length;
  t.throws(
    () =>
      // @ts-expect-error key presence not checked
      obj.u.length,
  );

  t.throws(() => assertAllDefined({ u: undefined, v: undefined }), {
    message: 'missing ["u","v"]',
  });

  /** @type {{ prop?: number }} */
  const foo = {};
  assertAllDefined(foo);
  t.throws(
    () =>
      // @ts-expect-error key presence not checked
      foo.prop.toFixed,
  );
});

test('whileTrue', async t => {
  const elems = [1, 2, 3];
  /** @type {any} */
  let cur;
  let count = 0;
  for await (const produced of whileTrue(() => {
    cur = elems.shift();
    count += 1;
    return count % 2 === 0 ? cur : Promise.resolve(cur);
  })) {
    t.is(produced, cur, 'cur is produced');
    t.not(produced, undefined, 'produced is not undefined');
  }
  t.is(cur, undefined, 'cur is done');
  t.is(count, 4, 'count is expected');
});

test('untilTrue', async t => {
  const elems = [0, false, null, NaN, '', 'truey', 1.39];
  /** @type {any} */
  let cur;
  let count = 0;
  for await (const produced of untilTrue(() => {
    cur = elems.shift();
    count += 1;
    return count % 2 === 0 ? cur : Promise.resolve(cur);
  })) {
    t.is(produced, cur, 'cur is produced');
    t.assert(!produced, 'produced is falsy');
  }
  t.is(cur, 'truey', 'cur is done');
  t.is(count, 6, 'count is expected');
});

test('forever', async t => {
  let count = 0;
  for await (const produced of forever) {
    t.is(produced, undefined, 'produced is undefined');
    count += 1;
    if (count > 3) {
      break;
    }
  }
  t.is(count, 4, 'count is expected');
});

/**
 * @template T
 * @param {AsyncIterable<T>} stream
 * @param {T[]} output
 * @param {number} [maxItems]
 */
const consumeStreamInto = async (stream, output, maxItems) => {
  for await (const item of stream) {
    output.push(item);
    if (output.length === maxItems) break;
  }
};

/**
 * @template T
 * @param {Iterable<T> | AsyncIterable<T>} items
 */
const generateStream = async function* generateStream(items) {
  yield* items;
};
harden(generateStream);

test('synchronizedTee - consumeAll - 1 reader', async t => {
  const sourceData = [1, 2, 3];
  const source = generateStream(sourceData);
  const output = /** @type {number[]} */ ([]);
  const [reader] = synchronizedTee(source, 1);
  await consumeStreamInto(reader, output);
  t.deepEqual(output, sourceData);
});

test('synchronizedTee - consumeAll - 2 reader', async t => {
  const sourceData = [1, 2, 3];
  const source = generateStream(sourceData);
  const output1 = /** @type {number[]} */ ([]);
  const output2 = /** @type {number[]} */ ([]);
  const [reader1, reader2] = synchronizedTee(source, 2);
  await Promise.all([
    consumeStreamInto(reader1, output1),
    consumeStreamInto(reader2, output2),
  ]);

  t.deepEqual(output1, sourceData);
  t.deepEqual(output2, sourceData);
});

test('synchronizedTee - break early', async t => {
  const sourceData = [1, 2, 3];
  const source = generateStream(sourceData);
  const output1 = /** @type {number[]} */ ([]);
  const output2 = /** @type {number[]} */ ([]);
  const [reader1, reader2] = synchronizedTee(source, 2);
  await Promise.all([
    consumeStreamInto(reader1, output1, 2),
    consumeStreamInto(reader2, output2),
  ]);

  t.deepEqual(output1, sourceData.slice(0, 2));
  t.deepEqual(output2, sourceData.slice(0, 2));
});

test('synchronizedTee - throw', async t => {
  const sourceData = [1, 2, 3];
  const source = generateStream(sourceData);
  const output1 = /** @type {number[]} */ ([]);
  const [reader1, reader2] = synchronizedTee(source, 2);
  const rejection = { message: 'Interrupted' };
  const result1 = consumeStreamInto(reader1, output1);
  const result2 = reader2.throw(Error(rejection.message));

  await t.throwsAsync(result1, { message: 'Teed stream threw' });
  await t.throwsAsync(result2, rejection);
});

test('synchronizedTee - consume synchronized', async t => {
  const sourceData = [1, 2, 3];
  const output1 = /** @type {number[]} */ ([]);
  const output2 = /** @type {number[]} */ ([]);
  let i = 0;
  async function* generate() {
    while (i < sourceData.length) {
      try {
        yield sourceData[i];
      } finally {
        i += 1;
        t.deepEqual(output1, sourceData.slice(0, i));
        t.deepEqual(output2, sourceData.slice(0, i));
      }
    }
  }
  harden(generate);
  const source = generate();
  const [reader1, reader2] = synchronizedTee(source, 2);
  await Promise.all([
    consumeStreamInto(reader1, output1),
    consumeStreamInto(reader2, output2, 2),
  ]);

  t.is(i, 2);
  t.deepEqual(output1, sourceData.slice(0, i));
  t.deepEqual(output2, sourceData.slice(0, i));
});
