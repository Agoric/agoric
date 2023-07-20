// @ts-check
import '@endo/init';
import { M, matches, keyEQ } from '@endo/patterns';
import { makeMarshal } from '@endo/marshal';

import test from 'ava';
import { fc } from '@fast-check/ava';

import { makeBoardContext } from '../src/lib/boardClient.js';
import { arbKey } from './arbPassableKey.js';

const arbBoardId = fc.integer().map(n => `board0${n}`);

const arbSlot = arbBoardId.chain(slot =>
  fc.string({ minLength: 1 }).map(iface => ({ slot, iface })),
);

const RemotableShape = M.remotable();

test('boardProxy.provide() preserves identity', t => {
  const bp = makeBoardContext();
  fc.assert(
    fc.property(
      fc.record({ s1: arbSlot, s3: arbSlot, die: fc.nat(2) }),
      ({ s1, s3, die }) => {
        const v1 = bp.register(s1.slot, s1.iface);
        const { slot, iface = undefined } = die > 0 ? s3 : { slot: s1.slot };
        const v2 = bp.register(slot, iface);
        t.is(s1.slot === slot, v1 === v2);
        t.true(matches(v1, RemotableShape));
        t.true(matches(v2, RemotableShape));
      },
    ),
  );
});

test('boardCtx ingest() preserves identity for passable keys', t => {
  const ctx = makeBoardContext();
  const valToSlot = new Map();
  const m = makeMarshal(
    v => {
      if (valToSlot.has(v)) return valToSlot.get(v);
      const slot = `board0${valToSlot.size}`;
      valToSlot.set(v, slot);
      return slot;
    },
    undefined,
    { serializeBodyFormat: 'smallcaps' },
  );
  fc.assert(
    fc.property(arbKey, key => {
      const { body, slots } = m.toCapData(key);
      const ingested = ctx.ingest({ body, slots });
      const reingested = ctx.ingest({ body, slots });
      t.true(keyEQ(ingested, reingested));
    }),
  );
});
