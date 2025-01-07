import { Far, E } from '@endo/far';
import { assert } from '@endo/errors';
import { initEmpty } from '@agoric/store';
import { defineDurableKind, defineDurableKindMulti } from '@agoric/vat-data';

const initialize = (name, imp, value) => {
  return harden({ name, imp, value });
};

const behavior = {
  get: ({ state }) => ({ new: 'new', ...state.value }),
  getImport: ({ state }) => state.imp,
  set: ({ state }, value) => {
    state.value = value;
  },
};

export const buildRootObject = async (_vatPowers, vatParameters, baggage) => {
  const durandalHandle = baggage.get('durandalHandle');
  const makeDurandal = defineDurableKind(durandalHandle, initialize, behavior);
  // note: to test #5725, newDur must be the first new Durandal
  // instance in this version of the vat
  const newDur = makeDurandal('dur-new', undefined, { name: 'd1' });
  let counter = 20;

  if (vatParameters?.handler) {
    E(vatParameters.handler).ping('hello from v2');
  }

  if (vatParameters?.explode) {
    throw Error(vatParameters.explode);
  }

  if (baggage.has('kh')) {
    const kh = baggage.get('kh');
    const { v2mode } = vatParameters;
    switch (v2mode) {
      case 'single':
        defineDurableKind(kh, initEmpty, {});
        break;
      case 'multi-foo':
        defineDurableKindMulti(kh, initEmpty, { foo: {} });
        break;
      case 'multi-foo-bar':
        defineDurableKindMulti(kh, initEmpty, { foo: {}, bar: {} });
        break;
      case 'multi-bar-foo':
        defineDurableKindMulti(kh, initEmpty, { bar: {}, foo: {} });
        break;
      case 'multi-foo-bar-arf': // new facet sorts earlier than others
        defineDurableKindMulti(kh, initEmpty, { foo: {}, bar: {}, arf: {} });
        break;
      case 'multi-arf-foo-bar': // new facet sorts earlier than others
        defineDurableKindMulti(kh, initEmpty, { foo: {}, bar: {}, arf: {} });
        break;
      case 'multi-foo-bar-baz': // new facet sorts later than others
        defineDurableKindMulti(kh, initEmpty, { foo: {}, bar: {}, baz: {} });
        break;
      default:
        throw Error(`unknown case ${v2mode}`);
    }
  }

  const watcherHandle = baggage.get('wh');
  const initWatcher = () => harden({ result: ['unresolved'] });
  const watcherMethods = {
    onFulfilled: ({ state }, data) =>
      (state.result = harden(['fulfill', data])),
    onRejected: ({ state }, reason) =>
      (state.result = harden(['reject', reason])),
    getResult: ({ state }) => state.result,
  };
  defineDurableKind(watcherHandle, initWatcher, watcherMethods);
  const watcher = baggage.get('watcher');

  const root = Far('root', {
    getVersion: () => 'v2',
    getParameters: () => vatParameters,
    getPresence: () => baggage.get('presence'),
    getData: () => baggage.get('data'),
    getEntries: collection => Array.from(collection.entries()),
    checkBaggage: (imp32, imp36) => {
      // console.log(`baggage:`, Array.from(baggage.keys()));
      const dc5 = baggage.get('dc5');
      const dc6 = baggage.get('dc6');
      const imp33 = dc5.get(imp32).getImport();
      let dur34;
      for (const key of dc6.keys()) {
        if (key !== imp36) {
          dur34 = key;
        }
      }
      const imp35 = dc6.get(dur34).getImport();
      assert.equal(imp36, dc6.get(imp36).getImport());
      const imp37 = baggage.get('dur37').getImport();
      const imp38 = baggage.get('imp38');
      return { imp33, imp35, imp37, imp38 };
    },
    pingback: handler => {
      counter += 1;
      return E(handler).ping(`ping ${counter}`);
    },
    getNewDurandal: () => newDur,
    getWatcherResult: () => watcher.getResult(),
  });
  // buildRootObject() is allowed to return a Promise, as long as it fulfills
  // promptly (we added this in #5246 to allow ZCF to use the async
  // importBundle() during contract upgrade).  We return a pre-fulfilled Promise
  // here to exercise this ability.
  return Promise.resolve(root);
};
