/* global setTimeout */
// @ts-check
// eslint-disable-next-line import/order
import { test } from '../tools/prepare-test-env-ava.js';
import { spawn } from 'child_process';
import bundleSource from '@endo/bundle-source';

import { makeXsSubprocessFactory } from '../src/kernel/vat-loader/manager-subprocess-xsnap.js';
import { makeStartXSnap } from '../src/controller/controller.js';
import { capargs } from './util.js';

test('child termination distinguished from meter exhaustion', async t => {
  const makeb = rel =>
    bundleSource(new URL(rel, import.meta.url).pathname, 'getExport');
  const lockdown = await makeb(
    '../src/supervisors/subprocess-xsnap/lockdown-subprocess-xsnap.js',
  );
  const supervisor = await makeb(
    '../src/supervisors/subprocess-xsnap/supervisor-subprocess-xsnap.js',
  );
  const bundles = [lockdown, supervisor];

  /** @type {ReturnType<typeof spawn>} */
  let theProc;

  const startXSnap = makeStartXSnap(bundles, {
    snapstorePath: undefined, // close enough for this test
    env: {},
    // @ts-ignore we only need one path thru spawn
    spawn: (command, args, opts) => {
      const noMetering = ['-l', '0'];
      theProc = spawn(command, [args, ...noMetering], opts);
      return theProc;
    },
  });

  // just enough methods to not crash
  /** @type {any} */
  const kernelKeeper = {
    provideVatKeeper: () => ({
      getLastSnapshot: () => undefined,
      addToTranscript: () => undefined,
    }),
  };

  const xsWorkerFactory = makeXsSubprocessFactory({
    startXSnap,
    kernelKeeper,
    // @ts-ignore kernelSlog is not used in this test
    kernelSlog: {},
    allVatPowers: undefined,
    testLog: undefined,
  });

  const fn = new URL('vat-xsnap-hang.js', import.meta.url).pathname;
  const bundle = await bundleSource(fn);

  /** @type {ManagerOptions} */
  // @ts-ignore close enough for this test
  const managerOptions = { useTranscript: true };
  const schandler = _vso => ['ok', null];
  const m = await xsWorkerFactory.createFromBundle(
    'v1',
    bundle,
    managerOptions,
    schandler,
  );

  await m.deliver(['startVat', capargs()]);

  const msg = { method: 'hang', args: capargs([]) };
  /** @type {VatDeliveryObject} */
  const delivery = ['message', 'o+0', msg];

  const p = m.deliver(delivery); // won't resolve until child dies

  // please excuse ambient authority
  setTimeout(
    () => theProc.kill(),
    // long enough for the delivery to make it to the XS interpreter,
    // thus avoiding a race with EPIPE / ECONNRESET
    250,
  );

  await t.throwsAsync(p, {
    instanceOf: Error,
    code: 'SIGTERM',
    message: 'v1:undefined exited due to signal SIGTERM',
  });
});
