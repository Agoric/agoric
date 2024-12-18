import { makeSpy } from '@agoric/swingset-liveslots/tools/vo-test-harness.js';
import { test, runDVOTest } from '../../tools/dvo-test-harness.js';

function bfile(name) {
  return new URL(name, import.meta.url).pathname;
}

async function dvoTestTest(t, mode) {
  function testLogCheck(_t, phase, log) {
    t.deepEqual(log, [
      'start test',
      phase,
      `fail during "${phase}"`,
      { mode },
      'end test',
    ]);
  }
  await runDVOTest(t, testLogCheck, bfile('vat-dvo-test-test.js'), { mode });
}

test('fail during "before" phase', async t => {
  const tSpy = makeSpy(t);
  await dvoTestTest(t, 'before');
  t.is(tSpy.failureMessage, 'fail during "before"');
});

test('fail during "after" phase', async t => {
  const tSpy = makeSpy(t);
  await dvoTestTest(t, 'after');
  t.is(tSpy.failureMessage, 'fail during "after"');
});

test('succeed', async t => {
  await dvoTestTest(t, 'succeed');
});
