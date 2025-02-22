import { Far } from '@endo/marshal';
import { setupTestLiveslots } from '../test/liveslots-helpers.js';

// This file contains a test harness for virtual objects. runVOTest()
// is to to help verify that a VO can be garbage collected and then
// reloaded from persistent storage while maintaining functionality.

/**
 * A spy wrapping Ava's t for tests that are testing the harness itself.
 * @param {import('ava').ExecutionContext} t
 */
export const makeSpy = t => {
  const tSpy = {
    ...t,
    fail: msg => {
      tSpy.failureMessage = msg;
    },
    // In Ava 6, assertions throw?
    falsy: (check, msg) => {
      if (!check) return;
      tSpy.falsyMessage = msg;
    },
    failureMessage: '',
    falsyMessage: '',
  };
  return tSpy;
};

// Testing VO swapping with runVOTest:
//
// Step 1: import the necessary harness paraphernalia
//
//   import { test, runVOTest } from '@agoric/swingset-vat/tools/vo-test-harness.js';
//
// `test` is the regular Ava test object that you'd normally import from
// `@agoric/swingset-vat/tools/prepare-test-env-ava.js`.  The test harness will
// import it for you, since it needs to set up some test things itself.
//
// Step 2: write three functions that you will pass to the test harness
//
// `prepare(VatData)` should perform any necessary environmental setup that the
// virtual object kind under test will require.  In particular, this includes
// executing any necessary `defineKind` or `defineDurableKind` calls to
// establish the VO itself.  The `VatData` parameter is a regular `VatData`
// object that can be used to obtain functions like `defineKind`.
//
// `makeTestObject()` should create and return an instance of the VO to be tested.
//
// `testTestObject(obj, phase)` should execute whatever actual testing and test
// assertions you care to perform to verify your VO kind.  `obj` will be a
// reference to an in-memory representative of the virtual object being tested
// and `phase` will be a string, either 'before' or 'after', indicating whether
// this instance of the object is before or after having been swapped out of
// memory and then reloaded.  A correctly functioning VO should, among other
// things, behave exactly the same in both cases.
//
// Step 3: write an Ava test that invokes the test harness
//
// The outer portion of this should be a conventional Ava test written in the
// conventional way, e.g.:
//
// test('test name', async t => {
//   ...your test here...
// });
//
// The body of your test most likely will enclose the three functions described
// above, since your `testTestObject` function (and possibly the others,
// depending on how you code things) will need access to the `t` object in order
// to execute test assertions.  Then, from inside your test invoke:
//
//   await runVOTest(t, prepare, makeTestObject, testTestObject);
//
// This will:
//   1 - execute the `prepare` function
//   2 - create a test object instance via `makeTestObject`
//   3 - run `testTestObject` on the test object (this is the 'before' phase)
//   4 - drop all in-memory references to the test object and force a GC pass
//   5 - run `testTestObject` on the test object *again* (this is the 'after' phase)
//
// The key thing that the test harness provides for you is step 4, which
// packages up some awkward boilerplate that's a bit of mysterious if you're not
// already pretty familiar with how the VO GC mechanism works (or perhaps even
// if you are).
//
// Note: It is critical that none of your own code retain any in-memory
// references to the test object beyond step 3.  However, another key service
// that the test harness provides is to detect if you did this and if so fail
// the test.  One use of the test harness is to verify that you aren't
// accidentally holding such references when you didn't mean to.
//
// The SwingSet test `vo-test-harness/test-vo-test-harness.js` is a test of the
// VO test harness itself, but can be used as a simple example of how to set
// things up.

export async function runVOTest(t, prepare, makeTestObject, testTestObject) {
  function buildRootObject(vatPowers) {
    const { VatData } = vatPowers;
    const { defineKind } = VatData;

    const freeChecker = new WeakSet();

    const makeSlug = defineKind('slug', label => ({ label }), {
      getLabel: ({ state }) => state.label,
    });
    const cacheDisplacer = makeSlug('cacheDisplacer');

    const makeHolder = defineKind('holder', (held = null) => ({ held }), {
      setValue: ({ state }, value) => {
        state.held = value;
      },
      getValue: ({ state }) => state.held,
    });
    const holder = makeHolder();

    let held = null;

    prepare(VatData);

    function displaceCache() {
      return cacheDisplacer.getLabel();
    }

    return Far('root', {
      makeAndHold() {
        held = makeTestObject();
        freeChecker.add(held);
        displaceCache();
      },
      storeHeld() {
        holder.setValue(held);
        displaceCache();
      },
      dropHeld() {
        held = null;
        displaceCache();
      },
      fetchAndHold() {
        held = holder.getValue();
        t.falsy(
          freeChecker.has(held),
          'somebody continues to hold test object',
        );
        displaceCache();
      },
      testHeld(phase) {
        testTestObject(held, phase);
      },
    });
  }

  const { dispatchMessage } = await setupTestLiveslots(
    t,
    buildRootObject,
    'bob',
    { forceGC: true, skipLogging: true },
  );

  await dispatchMessage('makeAndHold');
  await dispatchMessage('testHeld', 'before');
  await dispatchMessage('storeHeld');
  await dispatchMessage('dropHeld');
  await dispatchMessage('fetchAndHold');
  await dispatchMessage('testHeld', 'after');
}
