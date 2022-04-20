/* eslint-disable no-use-before-define, import/no-extraneous-dependencies */
import { expectType } from 'tsd';
import {
  defineKind,
  defineKindMulti,
  makeKindHandle,
  defineDurableKind,
  partialAssign,
} from '.';
import { KindFacets, DurableKindHandle, KindFacet } from './types.js';

/*
export const makePaymentMaker = (allegedName: string, brand: unknown) => {
  const makePayment = defineKind(
    `${allegedName} payment`,
    () => ({}),
    // @ts-expect-error "state" type implied by init() doesn't provide "a"
    ({ a: something }) => ({
      getAllegedBrand: () => brand,
    }),
  );
  return makePayment;
};

type FlorgState = { str: string };
const makeFlorg = defineKind(
  'florg',
  (num: number) => ({ str: String(num), extra: 'extra' }),
  ({ str }: FlorgState) => str,
);
const f = makeFlorg(42);
f.concat; // string
// @ts-expect-error
makeFlorg('notnumber');
*/

// Single-faceted example from virtual-objects.md
type SingleCounterState = { counter: number; name: string };
type SingleCounterContext = {
  state: SingleCounterState;
};
const initCounter = (name: string, str: string): SingleCounterState => ({
  counter: 0,
  name,
});

const counterBehavior = {
  inc: ({ state }: SingleCounterContext) => {
    state.counter += 1;
  },
  dec: ({ state }: SingleCounterContext) => {
    state.counter -= 1;
  },
  reset: ({ state }: SingleCounterContext) => {
    state.counter = 0;
  },
  rename: ({ state }: SingleCounterContext, newName: string) => {
    state.name = newName;
  },
  getCount: ({ state }: SingleCounterContext) => state.counter,
  getName: ({ state }: SingleCounterContext) => state.name,
};

const finishCounter = (
  { state }: SingleCounterContext,
  counter: KindFacet<typeof counterBehavior>,
) => {
  expectType<string>(state.name);
  expectType<number>(counter.getCount());
};

const makeCounter = defineKind('counter', initCounter, counterBehavior, {
  finish: finishCounter,
});

// Multi-faceted example from virtual-objects.md
type MultiCounterContext = {
  state: ReturnType<typeof initFacetedCounter>;
  facets: KindFacets<typeof facetedCounterBehavior>;
};
const initFacetedCounter = () => ({ counter: 0 });
const getCount = ({ state }: MultiCounterContext) => state.counter;
const facetedCounterBehavior = {
  incr: {
    step: ({ state }: MultiCounterContext) => {
      state.counter += 1;
    },
    getCount,
  },
  decr: {
    step: (context: MultiCounterContext) => {
      // Destructure within method because doing so in params creates a circular reference
      const { state, facets } = context;
      const { other } = facets;
      other.echo('hi');
      state.counter -= 1;
    },
    getCount,
  },
  other: {
    emptyFn: () => null,
    echo: (context: MultiCounterContext, toEcho: string) => toEcho,
  },
};

const makeFacetedCounter = defineKindMulti(
  'counter',
  initFacetedCounter,
  facetedCounterBehavior,
);

const fc = makeFacetedCounter();
expectType<void>(fc.incr.step());
expectType<void>(fc.decr.step());
expectType<number>(fc.decr.getCount());
// @ts-expect-error missing argument
fc.decr.echo();
expectType<string>(fc.other.echo('foo'));
// @ts-expect-error missing method
fc.incr.echo('foo');
expectType<null>(fc.other.emptyFn());

// durable kind
const fooHandle = makeKindHandle('foo');
expectType<DurableKindHandle>(fooHandle);
const fooInit = (name: string) => ({ name });
const fooBehavior = {
  sayHi: ({ state }: { state: { name: string } }) => `Howdy, ${state.name}`,
};
const makeFoo = defineDurableKind(fooHandle, fooInit, fooBehavior);
const foo = makeFoo('Doody');
expectType<string>(foo.sayHi());
// @ts-expect-error missing method
foo.sayBye();

// partialAssign
const state = { name: 'ted', color: 'red' };
partialAssign(state, { name: 'ed' });
// @ts-expect-error
partialAssign(state, { key: 'ted' });
// @ts-expect-error
partialAssign(state, { name: 3 });
