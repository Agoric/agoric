/* eslint-disable no-use-before-define */

import test from 'ava';
import { Far } from '@endo/marshal';
import { setTimeout } from 'timers';

import { makeScalarMapStore } from '../src/stores/scalarMapStore.js';
import { makeAtomicProvider } from '../src/stores/store-utils.js';

import '../src/types-ambient.js';

test('race', async t => {
  const store = makeScalarMapStore('foo');
  const provider = makeAtomicProvider(store);

  let i = 0;
  const make = k =>
    // in Node 15+ use timers/promise
    new Promise(resolve => setTimeout(() => resolve(`${k} ${(i += 1)}`), 10));

  let finishCalled = 0;
  const finish = () => {
    finishCalled += 1;
    return Promise.resolve();
  };

  t.is(await provider.provideAsync('a', make, finish), 'a 1');
  t.is(await provider.provideAsync('a', make, finish), 'a 1');
  t.is(finishCalled, 1);

  provider.provideAsync('b', make, finish).catch(t.fail);
  provider.provideAsync('b', make, finish).catch(t.fail);
  t.is(await provider.provideAsync('b', make, finish), 'b 2');
  t.is(await provider.provideAsync('b', make, finish), 'b 2');
  t.is(finishCalled, 2);
});

test('reject', async t => {
  const store = makeScalarMapStore('foo');
  const provider = makeAtomicProvider(store);

  let i = 0;
  const makeFail = k => Promise.reject(Error(`failure ${k} ${(i += 1)}`));

  let finishCalled = 0;
  const finish = () => {
    finishCalled += 1;
    return Promise.resolve();
  };

  await t.throwsAsync(provider.provideAsync('a', makeFail, finish), {
    message: 'failure a 1',
  });
  await t.throwsAsync(provider.provideAsync('a', makeFail, finish), {
    // makeValue runs again (i += 1)
    message: 'failure a 2',
  });

  await t.throwsAsync(provider.provideAsync('b', makeFail, finish), {
    message: 'failure b 3',
  });
  await t.throwsAsync(provider.provideAsync('b', makeFail, finish), {
    message: 'failure b 4',
  });

  t.is(finishCalled, 0);

  // success after failure
  const makeValue = () => Promise.resolve('success');
  t.is(await provider.provideAsync('a', makeValue, finish), 'success');
  t.is(finishCalled, 1);
});

test('far keys', async t => {
  const store = makeScalarMapStore('foo');
  const provider = makeAtomicProvider(store);

  let i = 0;
  const makeBrand = name =>
    Far(`brand ${name}`, {
      getAllegedName: () => `${name} ${(i += 1)}`,
    });

  const makeValue = brand => Promise.resolve(brand.getAllegedName());

  const moola = makeBrand('moola');
  const moolb = makeBrand('moolb');
  t.is(await provider.provideAsync(moola, makeValue), 'moola 1');
  t.is(await provider.provideAsync(moola, makeValue), 'moola 1');

  provider.provideAsync(moolb, makeValue).catch(t.fail);
  provider.provideAsync(moolb, makeValue).catch(t.fail);
  t.is(await provider.provideAsync(moolb, makeValue), 'moolb 2');
  t.is(await provider.provideAsync(moolb, makeValue), 'moolb 2');
});
