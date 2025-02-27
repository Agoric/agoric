// @ts-nocheck
/* eslint-disable no-underscore-dangle */

import test from 'ava';
import '@endo/init/debug.js';

import { Far } from '@endo/marshal';
import { M } from '@agoric/store';
import { makeLiveSlots } from '../../src/liveslots.js';
import { kser } from '../kmarshal.js';
import { buildSyscall } from '../liveslots-helpers.js';
import { makeStartVat } from '../util.js';
import { makeMockGC } from '../mock-gc.js';

const init = value => ({ ...value });
const behavior = {
  set: ({ state }, name, value) => (state[name] = value),
  get: ({ state }, name) => state[name],
};
const stateShape0 = { prop1: M.string };
const stateShape1 = { prop1: M.string, prop2: M.number() };
const stateShape2 = { prop1renamed: M.string, prop2: M.number() };

async function withNewIncarnation(kvStore, func) {
  async function buildRootObject(vatPowers, _vatParameters, baggage) {
    await func(vatPowers.VatData, baggage);
    return Far('root', {});
  }
  const makeNS = () => ({ buildRootObject });
  const { syscall } = buildSyscall({ kvStore });
  const gcTools = makeMockGC();
  const ls = makeLiveSlots(syscall, 'vatA', {}, {}, gcTools, undefined, makeNS);
  await ls.dispatch(makeStartVat(kser())); // TODO: needed?
}

test('check helper function', async t => {
  const kvStore = new Map();
  await withNewIncarnation(kvStore, (VatData, baggage) => {
    const thingHandle = VatData.makeKindHandle('thing');
    baggage.init('handle', thingHandle);
    const makeV0 = VatData.defineDurableKind(thingHandle, init, behavior);
    baggage.init('thingA', makeV0({ prop1: 'valueA' }));
    baggage.init('thingB', makeV0({ prop1: 'valueB' }));

    t.is(baggage.get('thingA').get('prop1'), 'valueA');
    t.is(baggage.get('thingA').get('prop2'), undefined);
    t.is(baggage.get('thingB').get('prop1'), 'valueB');
    t.is(baggage.get('thingB').get('prop2'), undefined);
  });

  await withNewIncarnation(kvStore, (VatData, baggage) => {
    const thingHandle = baggage.get('handle');
    const _makeV1 = VatData.defineDurableKind(thingHandle, init, behavior);
    t.is(baggage.get('thingA').get('prop1'), 'valueA');
    t.is(baggage.get('thingA').get('prop2'), undefined);
    t.is(baggage.get('thingB').get('prop1'), 'valueB');
    t.is(baggage.get('thingB').get('prop2'), undefined);
  });
});

test.failing('upgrade state', async t => {
  const kvStore = new Map();
  await withNewIncarnation(kvStore, (VatData, baggage) => {
    const thingHandle = VatData.makeKindHandle('thing');
    baggage.init('handle', thingHandle);
    const makeV0 = VatData.defineDurableKind(thingHandle, init, behavior);
    baggage.init('thingA', makeV0({ prop1: 'valueA' }));
    baggage.init('thingB', makeV0({ prop1: 'valueB' }));

    t.is(baggage.get('thingA').get('prop1'), 'valueA');
    t.is(baggage.get('thingA').get('prop2'), undefined);
    t.is(baggage.get('thingB').get('prop1'), 'valueB');
    t.is(baggage.get('thingB').get('prop2'), undefined);
  });

  await withNewIncarnation(kvStore, (VatData, baggage) => {
    function upgrader1(version, oldState) {
      const state = { ...oldState };
      if (version === 0) {
        state.prop2 = 0;
        version = 1;
      }
      return { version, state };
    }
    const thingHandle = baggage.get('handle');
    const _makeV1 = VatData.defineDurableKind(thingHandle, init, behavior, {
      currentVersion: 1,
      upgradeState: upgrader1,
      stateShape: stateShape1,
    });

    t.is(baggage.get('thingA').get('prop1'), 'valueA');
    t.is(baggage.get('thingA').get('prop2'), 0);
    baggage.get('thingA').set('prop2', 5);
  });

  await withNewIncarnation(kvStore, (VatData, baggage) => {
    function upgrader2(version, oldState) {
      const state = { ...oldState };
      if (version === 0) {
        state.prop2 = 0;
        version = 1;
      }
      if (version === 1) {
        state.prop1renamed = state.prop1;
        delete state.prop1;
        state.prop2 *= 10;
        version = 2;
      }
      return { version, state };
    }
    const thingHandle = baggage.get('handle');
    const _makeV2 = VatData.defineDurableKind(thingHandle, init, behavior, {
      currentVersion: 2,
      upgradeState: upgrader2,
      stateShape: stateShape2,
    });

    t.is(baggage.get('thingA').get('prop1'), undefined);
    t.is(baggage.get('thingA').get('prop1renamed'), 'valueA');
    t.is(baggage.get('thingA').get('prop2'), 50);
    // thingB gets upgraded from 0->2 in a single ugprader2() call
    t.is(baggage.get('thingB').get('prop1'), undefined);
    t.is(baggage.get('thingB').get('prop1renamed'), 'valueB');
    t.is(baggage.get('thingB').get('prop2'), 0);
  });
});

test.failing('upgrader throws error', async t => {
  const kvStore = new Map();
  await withNewIncarnation(kvStore, (VatData, baggage) => {
    const thingHandle = VatData.makeKindHandle('thing');
    baggage.init('handle', thingHandle);
    const makeV0 = VatData.defineDurableKind(thingHandle, init, behavior);
    baggage.init('thingA', makeV0({ prop1: 'valueA' }));
  });

  await withNewIncarnation(kvStore, (VatData, baggage) => {
    function upgrader1(_version, _oldState) {
      throw Error('error during upgrade');
    }
    const thingHandle = baggage.get('handle');
    const _makeV1 = VatData.defineDurableKind(thingHandle, init, behavior, {
      currentVersion: 1,
      upgradeState: upgrader1,
    });

    t.throws(() => baggage.get('thingA').get('prop1'), {
      message: /error during upgrade/,
    });
  });
});

test.failing('upgrader makes wrong version', async t => {
  const kvStore = new Map();
  await withNewIncarnation(kvStore, (VatData, baggage) => {
    const thingHandle = VatData.makeKindHandle('thing');
    baggage.init('handle', thingHandle);
    const makeV0 = VatData.defineDurableKind(thingHandle, init, behavior);
    baggage.init('thingA', makeV0({ prop1: 'valueA' }));
  });

  await withNewIncarnation(kvStore, (VatData, baggage) => {
    function upgrader1(version, oldState) {
      return { version, state: oldState };
    }
    const thingHandle = baggage.get('handle');
    const _makeV1 = VatData.defineDurableKind(thingHandle, init, behavior, {
      currentVersion: 1,
      upgradeState: upgrader1,
    });

    t.throws(() => baggage.get('thingA').get('prop1'), {
      message: /XXX error during upgrade/,
    });
  });
});

test.failing('upgrader does not match state shape', async t => {
  const kvStore = new Map();
  await withNewIncarnation(kvStore, (VatData, baggage) => {
    const thingHandle = VatData.makeKindHandle('thing');
    baggage.init('handle', thingHandle);
    const makeV0 = VatData.defineDurableKind(thingHandle, init, behavior, {
      stateShape: stateShape0,
    });
    baggage.init('thingA', makeV0({ prop1: 'valueA' }));
  });

  await withNewIncarnation(kvStore, (VatData, baggage) => {
    function upgrader1(version, oldState) {
      // missing prop2, which stateShape1 requires
      return { version: 1, state: oldState };
    }
    const thingHandle = baggage.get('handle');
    const _makeV1 = VatData.defineDurableKind(thingHandle, init, behavior, {
      currentVersion: 1,
      upgradeState: upgrader1,
      stateShape: stateShape1,
    });

    t.throws(() => baggage.get('thingA').get('prop1'), {
      message: /XXX error during upgrade/,
    });
  });
});

// TODO: examine saved DurableKindDescriptor.stateShapeCapData for updates
