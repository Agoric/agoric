import { Far, E } from '@endo/far';
import { makePromiseKit } from '@endo/promise-kit';
import { initEmpty } from '@agoric/store';
import {
  makeKindHandle,
  defineDurableKind,
  defineDurableKindMulti,
  defineKind,
  makeScalarBigMapStore,
  makeScalarBigWeakMapStore,
  watchPromise,
} from '@agoric/vat-data';

// we set up a lot of ephemeral, merely-virtual, and durable objects
// holding references to imported objects
// to test what gets deleted vs retained (see object-graph.pdf for the test plan)
const makeEph = (name, held) => {
  return Far(name, { get: () => held });
};
const durandalHandle = makeKindHandle('durandal');
const initHolder = (name, imp, value) => {
  return harden({ name, imp, value });
};
const holderMethods = {
  get: ({ state }) => state.value,
  set: ({ state }, value) => {
    state.value = value;
  },
};
const makeVir = defineKind('virtual', initHolder, holderMethods);
const makeDur = defineDurableKind(durandalHandle, initHolder, holderMethods);

const initWatcher = () => harden({ result: ['unresolved'] });
const watcherMethods = {
  onFulfilled: ({ state }, data) => (state.result = harden(['fulfill', data])),
  onRejected: ({ state }, reason) =>
    (state.result = harden(['reject', reason])),
  getResult: ({ state }) => state.result,
};
const watcherHandle = makeKindHandle('watcher');
const makeWatcher = defineDurableKind(
  watcherHandle,
  initWatcher,
  watcherMethods,
);

// TODO: explore 'export modRetains'
// eslint-disable-next-line no-unused-vars
let modRetains;

/**
 * @param {import('@agoric/vat-data').Baggage} baggage
 * @param {[unknown, ...object]} imp
 * Objects to import, preceded by a dummy element.
 * The `imp` name itself is three characters long for visual similarity
 * with `vir` and `dur` analogs.
 * @returns {Record<string, object>}
 */
const buildExports = (baggage, imp) => {
  // for debugging, these arrays start with a dummy element so
  // the vref of each contained object (o+X/NN where NN starts at 1)
  // is aligned with its index
  /** @type {[string, ...object]} */
  const vir = ['skip0'];
  /** @type {[string, ...object]} */
  const dur = ['skip0'];
  for (let i = 1; i < imp.length; i += 1) {
    vir.push(makeVir(`v${i}`, imp[i], { name: `v${i}` }));
    dur.push(makeDur(`d${i}`, imp[i], { name: `d${i}` }));
  }

  // note: to test #5725, dur[0] must be the first new Durandal
  // instance created in this version of the vat

  // vc1+vc2 form a cycle, as do vir[7]+vir[8], and our lack of
  // cycle-collection means we don't GC it during the lifetime of the
  // vat, however they'll be deleted during upgrade because stopVat()
  // deletes all virtual data independent of refcounts
  const vc1 = makeScalarBigMapStore('vc1');
  const vc2 = makeScalarBigMapStore('vc2');
  const vc3 = makeScalarBigMapStore('vc3');

  // dc1+dc2 form an unreferenced cycle, as do dur[16]+dur[17], which
  // stick around (even after upgrade) because we don't yet have
  // cycle-collecting virtual/durable-object GC. dc3 is dropped (only
  // held by an abandoned Remotable), dc4 is retained by an export,
  // dc5+dc6 are retained by baggage
  const dc1 = makeScalarBigMapStore('dc1', { durable: true });
  const dc2 = makeScalarBigMapStore('dc2', { durable: true });
  const dc3 = makeScalarBigMapStore('dc3', { durable: true });
  const dc4 = makeScalarBigMapStore('dc4', { durable: true });
  const dc5 = makeScalarBigWeakMapStore('dc5', { durable: true });
  const dc6 = makeScalarBigMapStore('dc6', { durable: true });

  // these Remotables are both exported and held by module-level pins,
  // but will still be abandoned
  const rem1 = makeEph('rem1', [imp[4], vir[5], vir[7], vc1, vc3]);
  const rem2 = makeEph('rem2', [dur[21], dc3]);
  const rem3 = makeEph('rem3', [dur[29], imp[30], vir[31]]);
  modRetains = { rem1, rem2, rem3 };

  // now wire them up according to the diagram
  vir[2].set(dur[3]);
  vir[5].set(dur[6]);
  vir[7].set(vir[8]);
  vir[8].set(harden([vir[7], dur[9]]));
  vc1.init('vc2', vc2);
  vc2.init('vc1', vc1);
  vc2.init(dur[10], dur[11]);
  vc2.init(imp[12], dur[12]);
  vc3.init(dur[13], dur[14]);
  vc3.init(imp[15], dur[15]);
  dur[16].set(dur[17]);
  dur[17].set(dur[16]);
  dc1.init('dc2', dc2);
  dc2.init('dc1', dc1);
  dc2.init(dur[18], dur[19]);
  dc2.init(imp[20], dur[20]);
  dur[21].set(dur[22]);
  dc3.init(dur[23], dur[24]);
  dc3.init(imp[25], dur[25]);
  dc4.init(dur[26], dur[27]);
  dc4.init(imp[28], dur[28]);
  dc5.init(imp[32], dur[33]); // imp[32] is recognizable but not reachable
  dc6.init(dur[34], dur[35]);
  dc6.init(imp[36], dur[36]);
  baggage.init('dc5', dc5);
  baggage.init('dc6', dc6);
  baggage.init('dur37', dur[37]);
  baggage.init('imp38', imp[38]);

  // we share dur1/vir2 with the test harness so it can glean the
  // baserefs and interpolate the full vrefs for everything else
  // without holding a GC pin on them
  return {
    dur1: dur[1],
    vir2: vir[2],
    vir5: vir[5],
    vir7: vir[7],
    vc1,
    vc3,
    dc4,
    rem1,
    rem2,
    rem3,
  };
};

export const buildRootObject = (_vatPowers, vatParameters, baggage) => {
  const { promise: p1 } = makePromiseKit();
  const { promise: p2 } = makePromiseKit();
  const { promise: p3 } = makePromiseKit();
  const watcher = makeWatcher();
  watchPromise(p3, watcher);
  baggage.init('watcher', watcher);
  baggage.init('wh', watcherHandle);

  let heldPromise;
  let counter = 0;

  baggage.init('data', harden(['some', 'data']));
  baggage.init('durandalHandle', durandalHandle);

  if (vatParameters?.handler) {
    E(vatParameters.handler).ping('hello from v1');
  }

  return Far('root', {
    getVersion: () => 'v1',
    getParameters: () => vatParameters,

    acceptPresence: pres => {
      baggage.init('presence', pres);
    },
    getPresence: () => baggage.get('presence'),
    getData: () => baggage.get('data'),
    getDurandal: arg => makeDur('durandal', 0, arg),
    getExports: imports => buildExports(baggage, imports),

    acceptPromise: p => {
      // upgrade will reject the promises that we decide, but should
      // not touch the ones we don't decide, so we hold onto this
      // until upgrade, to probe for bugs in that process
      heldPromise = p;
      heldPromise.catch(() => 'hush');
    },
    getEternalPromiseInArray: () => [p1],
    getEternalPromise: async () => p2,
    getWatchedDecidedPromise: async () => p3,

    makeLostKind: () => {
      makeKindHandle('unhandled');
    },

    makeSingleKind: () => {
      const kh = makeKindHandle('kind');
      baggage.init('kh', kh);
      defineDurableKind(kh, initEmpty, {});
    },

    makeMultiKind: () => {
      const kh = makeKindHandle('kind');
      baggage.init('kh', kh);
      defineDurableKindMulti(kh, initEmpty, {
        foo: {},
        bar: {},
      });
    },
    pingback: handler => {
      counter += 1;
      return E(handler).ping(`ping ${counter}`);
    },
  });
};
