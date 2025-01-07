// @ts-check
import test from 'ava';
import { Far } from '@endo/far';
import { makeMarshal } from '@endo/marshal';

import {
  defaultMarshaller,
  makeFakeStorageKit,
  slotStringUnserialize,
} from '../src/storage-test-utils.js';

test('makeFakeStorageKit', async t => {
  const rootPath = 'root';
  const opts = { sequence: false };
  const { rootNode, messages, toStorage } = makeFakeStorageKit(rootPath, opts);
  t.is(rootNode.getPath(), rootPath);
  const rootStoreKey = await rootNode.getStoreKey();
  t.deepEqual(
    rootStoreKey,
    { storeName: 'swingset', storeSubkey: `fake:${rootPath}` },
    'root store key matches initialization input',
  );

  // Values must be strings.
  const nonStrings = new Map(
    Object.entries({
      number: 1,
      bigint: 1n,
      boolean: true,
      null: null,
      undefined,
      symbol: Symbol('foo'),
      array: ['foo'],
      object: {
        toString() {
          return 'foo';
        },
      },
    }),
  );
  for (const [label, val] of nonStrings) {
    await t.throwsAsync(
      // @ts-expect-error invalid value
      async () => rootNode.setValue(val),
      undefined,
      `${label} value for root node is rejected`,
    );
  }

  await rootNode.setValue('');
  await rootNode.setValue('foo');
  t.deepEqual(
    messages.slice(-1),
    [{ method: 'set', args: [[rootPath, 'foo']] }],
    'root node setValue message',
  );
  await rootNode.setValue('bar');
  t.deepEqual(
    messages.slice(-1),
    [{ method: 'set', args: [[rootPath, 'bar']] }],
    'second setValue message',
  );

  // Valid path segments are strings of up to 100 ASCII alphanumeric/dash/underscore characters.
  const validSegmentChars = `${
    Array(26)
      .fill(undefined)
      .map((_, i) => 'a'.charCodeAt(0) + i)
      .map(code => String.fromCharCode(code))
      .join('') +
    Array(26)
      .fill(undefined)
      .map((_, i) => 'A'.charCodeAt(0) + i)
      .map(code => String.fromCharCode(code))
      .join('') +
    Array(10)
      .fill(undefined)
      .map((_, i) => '0'.charCodeAt(0) + i)
      .map(code => String.fromCharCode(code))
      .join('')
  }-_`;
  const extremeSegments =
    validSegmentChars
      .repeat(Math.ceil(100 / validSegmentChars.length))
      .match(/.{1,100}/gsu) || [];
  for await (const segment of extremeSegments) {
    const child = rootNode.makeChildNode(segment);
    const childPath = `${rootPath}.${segment}`;
    t.is(child.getPath(), childPath);
    const storeKey = await child.getStoreKey();
    t.deepEqual(
      storeKey,
      { storeName: 'swingset', storeSubkey: `fake:${childPath}` },
      'path segments are dot-separated',
    );
    await child.setValue('foo');
    t.deepEqual(
      messages.slice(-1),
      [{ method: 'set', args: [[childPath, 'foo']] }],
      'non-root setValue message',
    );
  }

  // Invalid path segments are non-strings, empty, too long, or contain unacceptable characters.
  const badSegments = new Map(nonStrings);
  badSegments.set('empty', '');
  badSegments.set('long', 'x'.repeat(101));
  for (let i = 0; i < 128; i += 1) {
    const segment = String.fromCharCode(i);
    if (!validSegmentChars.includes(segment)) {
      badSegments.set(
        `U+${i.toString(16).padStart(4, '0')} ${JSON.stringify(segment)}`,
        segment,
      );
    }
  }
  badSegments.set('non-ASCII', '\u00E1');
  badSegments.set('ASCII with combining diacritical mark', 'a\u0301');
  for (const [label, val] of badSegments) {
    t.throws(
      // @ts-expect-error invalid value
      () => rootNode.makeChildNode(val),
      undefined,
      `${label} segment is rejected`,
    );
  }

  // Level-skipping creation is allowed.
  const childNode = rootNode.makeChildNode('child');
  const childPath = `${rootPath}.child`;
  const deepNode = childNode.makeChildNode('grandchild');
  const deepPath = `${childPath}.grandchild`;
  t.is(deepNode.getPath(), deepPath);
  t.deepEqual(await deepNode.getStoreKey(), {
    storeName: 'swingset',
    storeSubkey: `fake:${deepPath}`,
  });
  for await (const [label, val] of nonStrings) {
    await t.throwsAsync(
      // @ts-expect-error invalid value
      async () => deepNode.setValue(val),
      undefined,
      `${label} value for non-root node is rejected`,
    );
  }
  await deepNode.setValue('foo');
  t.deepEqual(
    messages.slice(-1),
    [{ method: 'set', args: [[deepPath, 'foo']] }],
    'level-skipping setValue message',
  );
  t.deepEqual(
    await toStorage({ method: 'entries', args: [`${rootPath}.child`] }),
    [['grandchild', 'foo']],
    'child entries',
  );
  t.deepEqual(
    await toStorage({ method: 'children', args: [`${rootPath}.child`] }),
    ['grandchild'],
    'child path segments',
  );
  t.deepEqual(
    await toStorage({ method: 'entries', args: [rootPath] }),
    [...extremeSegments.map(segment => [segment, 'foo']), ['child']],
    'entries include empty non-terminals',
  );
  t.deepEqual(
    await toStorage({ method: 'children', args: [rootPath] }),
    [...extremeSegments, 'child'],
    'child path segments include empty non-terminals',
  );

  await childNode.setValue('');
  t.deepEqual(
    messages.slice(-1),
    [{ method: 'set', args: [[childPath]] }],
    'child setValue message',
  );
  await deepNode.setValue('');
  t.deepEqual(
    messages.slice(-1),
    [{ method: 'set', args: [[deepPath]] }],
    'granchild setValue message',
  );
  await childNode.setValue('');
  t.deepEqual(
    messages.slice(-1),
    [{ method: 'set', args: [[childPath]] }],
    'child setValue message',
  );
});

test('makeFakeStorageKit sequence data', async t => {
  const rootPath = 'root';
  const { rootNode, messages } = makeFakeStorageKit(rootPath, {
    sequence: true,
  });

  await t.throwsAsync(
    // @ts-expect-error
    async () => rootNode.setValue([]),
    undefined,
    'array value is rejected',
  );

  await rootNode.setValue('foo');
  t.deepEqual(
    messages.slice(-1),
    [{ method: 'append', args: [[rootPath, 'foo']] }],
    'root setValue message',
  );
  await rootNode.setValue('bar');
  t.deepEqual(
    messages.slice(-1),
    [{ method: 'append', args: [[rootPath, 'bar']] }],
    'second setValue message',
  );

  // Child nodes inherit configuration unless overridden.
  let childNode = rootNode.makeChildNode('child');
  const childPath = `${rootPath}.child`;
  let deepNode = childNode.makeChildNode('grandchild');
  const deepPath = `${childPath}.grandchild`;
  await childNode.setValue('foo');
  t.deepEqual(
    messages.slice(-1),
    [{ method: 'append', args: [[childPath, 'foo']] }],
    'auto-sequence child setValue message',
  );
  await deepNode.setValue('foo');
  t.deepEqual(
    messages.slice(-1),
    [{ method: 'append', args: [[deepPath, 'foo']] }],
    'auto-sequence grandchild setValue message',
  );
  deepNode = childNode.makeChildNode('grandchild', { sequence: false });
  await deepNode.setValue('bar');
  t.deepEqual(
    messages.slice(-1),
    [{ method: 'set', args: [[deepPath, 'bar']] }],
    'manual-single grandchild setValue message',
  );
  childNode = rootNode.makeChildNode('child', { sequence: false });
  await childNode.setValue('bar');
  t.deepEqual(
    messages.slice(-1),
    [{ method: 'set', args: [[childPath, 'bar']] }],
    'manual-single child setValue message',
  );
  deepNode = childNode.makeChildNode('grandchild');
  await deepNode.setValue('baz');
  t.deepEqual(
    messages.slice(-1),
    [{ method: 'set', args: [[deepPath, 'baz']] }],
    'auto-single grandchild setValue message',
  );
  deepNode = childNode.makeChildNode('grandchild', { sequence: true });
  await deepNode.setValue('qux');
  t.deepEqual(
    messages.slice(-1),
    [{ method: 'append', args: [[deepPath, 'qux']] }],
    'manual-sequence grandchild setValue message',
  );
});

const testUnmarshaller = test.macro((t, format) => {
  /**
   * @type {(
   *   val: import('@endo/marshal').RemotableObject & SlottedRemotable,
   * ) => string}
   */
  const convertValToSlot = val => val.getBoardId();
  const serializeBodyFormat = /** @type {any} */ (format);
  const m = makeMarshal(convertValToSlot, undefined, { serializeBodyFormat });

  // create capdata with specific slots
  /** @typedef {{ getBoardId: () => string }} SlottedRemotable */
  const foo = Far('foo');
  const foo1 = Far('foo', { getBoardId: () => 'board1' });
  const foo2 = Far('foo', { getBoardId: () => 'board2' });
  const bar = Far('bar');
  const bar1 = Far('bar', { getBoardId: () => 'board1' });
  const foo1CD = m.toCapData(harden({ o: foo1 }));
  const foo2CD = m.toCapData(harden({ o: foo2 }));
  const bar1CD = m.toCapData(harden({ o: bar1 }));

  // the default marshaller will produce Remotables with a matching
  // iface, and t.deepEqual knows how to compare them
  t.deepEqual(defaultMarshaller.fromCapData(foo1CD), { o: foo });
  t.notDeepEqual(defaultMarshaller.fromCapData(foo1CD), { o: bar });

  // t.deepEqual pays attention to presence/identity of methods,
  // but they are always absent in deserialized values
  t.notDeepEqual(foo, foo1);
  t.notDeepEqual(foo1, foo2);
  t.notDeepEqual(defaultMarshaller.fromCapData(foo1CD), { o: foo1 });

  // the display unserializer reports the slot values, but not ifaces
  t.deepEqual(slotStringUnserialize(foo1CD), { o: 'board1' });
  t.deepEqual(slotStringUnserialize(foo2CD), { o: 'board2' });
  t.deepEqual(slotStringUnserialize(bar1CD), { o: 'board1' });
});

test('unmarshal @qclass', testUnmarshaller, 'capdata');
test('unmarshal smallcaps', testUnmarshaller, 'smallcaps');
