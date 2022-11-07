/* global WeakRef, FinalizationRegistry */
import anylogger from 'anylogger';

import bundleSource from '@endo/bundle-source';

import { waitUntilQuiescent } from '../src/lib-nodejs/waitUntilQuiescent.js';
import { provideHostStorage } from '../src/controller/hostStorage.js';
import { createSHA256 } from '../src/lib-nodejs/hasher.js';
import { extractMessage, capdata, capargs, ignore } from './vat-util.js';

export { extractMessage, capdata, capargs, ignore };

function compareArraysOfStrings(a, b) {
  a = a.join(' ');
  b = b.join(' ');
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
}

export function checkKT(t, kernel, expected) {
  // extract the "kernel table" (a summary of all Vat clists) and assert that
  // the contents match the expected list. This does a sort of the two lists
  // before a t.deepEqual, which makes it easier to incrementally add
  // expected mappings.

  const got = Array.from(kernel.dump().kernelTable);
  got.sort(compareArraysOfStrings);
  expected = Array.from(expected);
  expected.sort(compareArraysOfStrings);
  t.deepEqual(got, expected);
}

export function dumpKT(kernel) {
  const got = Array.from(kernel.dump().kernelTable).map(
    ([kid, vatdev, vid]) => [vatdev, vid, kid],
  );
  got.sort(compareArraysOfStrings);
  for (const [vatdev, vid, kid] of got) {
    console.log(`${vatdev}:${vid} <-> ${kid}`);
  }
}

/**
 * @param {(d: unknown) => void} [onDispatchCallback ]
 */
export function buildDispatch(onDispatchCallback) {
  const log = [];

  const GC = ['dropExports', 'retireExports', 'retireImports'];

  function dispatch(vatDeliverObject) {
    const [type, ...vdoargs] = vatDeliverObject;
    if (type === 'message') {
      const [target, msg] = vdoargs;
      const { methargs, result } = msg;
      const d = {
        type: 'deliver',
        targetSlot: target,
        methargs,
        resultSlot: result,
      };
      log.push(d);
      if (onDispatchCallback) {
        onDispatchCallback(d);
      }
    } else if (type === 'notify') {
      const [resolutions] = vdoargs;
      const d = { type: 'notify', resolutions };
      log.push(d);
      if (onDispatchCallback) {
        onDispatchCallback(d);
      }
    } else if (type === 'startVat') {
      // ignore
    } else if (GC.includes(type)) {
      const [vrefs] = vdoargs;
      log.push({ type, vrefs });
    } else {
      throw Error(`unknown vatDeliverObject type ${type}`);
    }
  }

  return { log, dispatch };
}

export function capSlot(index, iface = 'export') {
  // @ts-expect-error undefined not assignable to type string
  iface = iface ? `Alleged: ${iface}` : undefined;
  return { '@qclass': 'slot', iface, index };
}

export function methargsOneSlot(method, slot, iface = 'export') {
  // @ts-expect-error undefined not assignable to type string
  iface = iface ? `Alleged: ${iface}` : undefined;
  return capargs([method, [{ '@qclass': 'slot', iface, index: 0 }]], [slot]);
}

export function capdataOneSlot(slot, iface = 'export') {
  // @ts-expect-error undefined not assignable to type string
  iface = iface ? `Alleged: ${iface}` : undefined;
  return capargs({ '@qclass': 'slot', iface, index: 0 }, [slot]);
}

export function capargsOneSlot(slot, iface = 'export') {
  // @ts-expect-error undefined not assignable to type string
  iface = iface ? `Alleged: ${iface}` : undefined;
  return capargs([{ '@qclass': 'slot', iface, index: 0 }], [slot]);
}

/**
 *
 * @param {unknown} target
 * @param {string} method
 * @param {any[]} args
 * @param {any[]} slots
 * @param {unknown} result
 */
export function makeMessage(
  target,
  method,
  args = [],
  slots = [],
  result = null,
) {
  const methargs = capargs([method, args], slots);
  const msg = { methargs, result };
  const vatDeliverObject = harden(['message', target, msg]);
  return vatDeliverObject;
}

export function makeBringOutYourDead() {
  return harden(['bringOutYourDead']);
}

export function makeResolutions(resolutions) {
  const vatDeliverObject = harden(['notify', resolutions]);
  return vatDeliverObject;
}

export function makeResolve(target, result) {
  const resolutions = [[target, false, result]];
  return makeResolutions(resolutions);
}

export function makeReject(target, result) {
  const resolutions = [[target, true, result]];
  const vatDeliverObject = harden(['notify', resolutions]);
  return vatDeliverObject;
}

export function makeDropExports(...vrefs) {
  const vatDeliverObject = harden(['dropExports', vrefs]);
  return vatDeliverObject;
}

export function makeRetireExports(...vrefs) {
  const vatDeliverObject = harden(['retireExports', vrefs]);
  return vatDeliverObject;
}

export function makeRetireImports(...vrefs) {
  const vatDeliverObject = harden(['retireImports', vrefs]);
  return vatDeliverObject;
}

function makeConsole(tag) {
  const log = anylogger(tag);
  const cons = {};
  for (const level of ['debug', 'log', 'info', 'warn', 'error']) {
    cons[level] = log[level];
  }
  return harden(cons);
}

export function makeKernelEndowments() {
  return {
    waitUntilQuiescent,
    hostStorage: provideHostStorage(),
    runEndOfCrank: () => {},
    makeConsole,
    WeakRef,
    FinalizationRegistry,
    createSHA256,
  };
}

export function bundleOpts(data, extraRuntimeOpts) {
  const { kernel: kernelBundle, ...kernelBundles } = data.kernelBundles;
  const initOpts = { kernelBundles };
  const runtimeOpts = { kernelBundle, ...extraRuntimeOpts };
  return { initOpts, runtimeOpts };
}

export async function restartVatAdminVat(controller) {
  const vaBundle = await bundleSource(
    new URL('../src/vats/vat-admin/vat-vat-admin.js', import.meta.url).pathname,
  );
  const bundleID = await controller.validateAndInstallBundle(vaBundle);
  controller.upgradeStaticVat('vatAdmin', true, bundleID, {});
  await controller.run();
}
