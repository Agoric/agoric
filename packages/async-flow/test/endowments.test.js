// eslint-disable-next-line import/order
import {
  test,
  getBaggage,
  annihilate,
  nextLife,
} from './prepare-test-env-ava.js';

import { Far, getInterfaceOf, isPassable, passStyleOf } from '@endo/pass-style';
import { prepareVowTools } from '@agoric/vow';
import { isVow } from '@agoric/vow/src/vow-utils.js';
import { makeHeapZone } from '@agoric/zone/heap.js';
import { makeVirtualZone } from '@agoric/zone/virtual.js';
import { makeDurableZone } from '@agoric/zone/durable.js';

import { forwardingMethods, prepareEndowmentTools } from '../src/endowments.js';
import { makeConvertKit } from '../src/convert.js';
import { prepareBijection } from '../src/bijection.js';
import { makeEquate } from '../src/equate.js';

const { ownKeys } = Reflect;

const testEndowmentPlay = async (t, zone, gen, isDurable) => {
  const vowTools = prepareVowTools(zone);
  const { when } = vowTools;
  const { prepareEndowment, unwrap } = prepareEndowmentTools(zone, {
    vowTools,
  });

  const endowment = harden({
    promise: Promise.resolve(`${gen} promise`),
    storable: {
      emptyRecord: {},
      primitive: 'foo',
      null: null,
      undefined,
      exo: zone.exo('AnExo', undefined, {
        name() {
          return `${gen} exo`;
        },
      }),
      error: URIError(`${gen} error`),
    },
    far: Far('AFar', {
      name: () => `${gen} far`,
    }),
    function() {
      return `${gen} function`;
    },
    array: [() => `${gen} f1`, () => `${gen} f2`],
    state: {
      // So the concrete keys differ by gen
      get [`${gen}_foo`]() {
        return `${gen} foo`;
      },
      get [`${gen}_bar`]() {
        return `${gen} bar`;
      },
    },
  });

  const wrapped = prepareEndowment(zone, 't1', endowment);

  t.is(passStyleOf(wrapped), 'copyRecord');
  t.is(passStyleOf(wrapped.promise), 'tagged');
  t.true(isVow(wrapped.promise));
  t.is(endowment.storable, wrapped.storable);
  t.deepEqual(ownKeys(endowment), ownKeys(wrapped));
  t.deepEqual(ownKeys(endowment.storable), ownKeys(wrapped.storable));
  t.is(passStyleOf(wrapped.storable), 'copyRecord');
  t.is(wrapped.storable.exo.name(), `${gen} exo`);
  if (isDurable) {
    t.not(endowment.far, wrapped.far); // since not durably storable
  } else {
    t.is(endowment.far, wrapped.far); // storable in heap, virtual
  }
  t.is(passStyleOf(wrapped.far), 'remotable');
  t.is(wrapped.far.name(), `${gen} far`);
  t.is(passStyleOf(wrapped.function), 'remotable');
  t.is(wrapped.function.apply([]), `${gen} function`);
  t.is(passStyleOf(wrapped.array), 'copyArray');
  t.is(passStyleOf(wrapped.array[0]), 'remotable');
  t.is(wrapped.array[0].apply([]), `${gen} f1`);
  t.is(passStyleOf(wrapped.state), 'remotable');
  t.is(endowment.state[`${gen}_foo`], `${gen} foo`);
  t.is(wrapped.state.get(`${gen}_foo`), `${gen} foo`);

  const guestWrappers = new Map();
  const unwrapSpy = (hostWrapped, guestWrapped) => {
    const unwrapped = unwrap(hostWrapped, guestWrapped);
    if (unwrapped !== guestWrapped) {
      guestWrappers.set(hostWrapped, guestWrapped);
    }
    return unwrapped;
  };

  const makeBijection = prepareBijection(zone, unwrapSpy);
  const bij = zone.makeOnce('bij', makeBijection);

  const makeGuestForHostRemotable = hRem => {
    const iface = getInterfaceOf(hRem);
    return Far(`${iface} guest wrapper`, forwardingMethods(hRem));
  };

  const makeGuestForHostVow = async hVow => {
    return when(hVow);
  };

  const {
    // guestToHost,
    hostToGuest,
  } = makeConvertKit(bij, makeGuestForHostRemotable, makeGuestForHostVow);

  const unwrapped = hostToGuest(wrapped);

  t.false(isPassable(unwrapped));
  t.is(passStyleOf(unwrapped.promise), 'promise');
  t.is(await unwrapped.promise, `${gen} promise`);
  t.not(wrapped.storable, unwrapped.storable);
  t.is(passStyleOf(unwrapped.storable), 'copyRecord');
  t.deepEqual(ownKeys(wrapped), ownKeys(unwrapped));
  t.deepEqual(ownKeys(wrapped.storable), ownKeys(unwrapped.storable));
  t.not(wrapped.storable.exo, unwrapped.storable.exo);
  t.is(unwrapped.storable.exo.name(), `${gen} exo`);
  t.is(passStyleOf(unwrapped.far), 'remotable');
  t.is(unwrapped.far.name(), `${gen} far`);
  t.is(passStyleOf(unwrapped.function), 'remotable');
  t.is(typeof unwrapped.function, 'function');
  t.is(unwrapped.function(), `${gen} function`);
  t.is(unwrapped.array[0](), `${gen} f1`);
  t.false(isPassable(unwrapped.state));
  t.is(typeof unwrapped.state, 'object');
  t.is(unwrapped.state[`${gen}_foo`], `${gen} foo`);

  const equate = makeEquate(bij);

  const { state: _1, ...passableUnwrapped } = unwrapped;
  const { state: _2, ...passableWrapped } = wrapped;

  t.notThrows(() => equate(harden(passableUnwrapped), harden(passableWrapped)));
  for (const [hostWrapped, guestWrapped] of guestWrappers) {
    t.notThrows(() => equate(guestWrapped, hostWrapped));
  }
};

const testEndowmentBadReplay = async (_t, _zone, _gen, _isDurable) => {
  // FIXME TODO This upgrade should fail since it doesn't re-prepare
  // everything. Only after that's fixed does it make sense to
  // expand this to test insufficient re-preparation.
};

await test.serial('test heap endowments', async t => {
  const zone = makeHeapZone('heapRoot');
  return testEndowmentPlay(t, zone, 'first', false);
});

test.serial('test virtual endowments', async t => {
  annihilate();
  const zone = makeVirtualZone('virtualRoot');
  return testEndowmentPlay(t, zone, 'first', false);
});

test.serial('test durable endowments', async t => {
  annihilate();

  nextLife();
  const zone1 = makeDurableZone(getBaggage(), 'durableRoot');
  await testEndowmentPlay(t, zone1, 'first', true);

  nextLife();
  const zone2 = makeDurableZone(getBaggage(), 'durableRoot');
  await testEndowmentBadReplay(t, zone2, '2nd', true);

  nextLife();
  const zone3 = makeDurableZone(getBaggage(), 'durableRoot');
  return testEndowmentPlay(t, zone3, '3rd', true);
});
