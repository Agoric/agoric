// eslint-disable-next-line import/order
import { test } from '../../tools/prepare-test-env-ava.js';

import crypto from 'crypto';
import bundleSource from '@endo/bundle-source';
import { parseArchive } from '@endo/compartment-mapper';
import { decodeBase64 } from '@endo/base64';
import { makeKernelEndowments } from '../util.js';
import buildKernel from '../../src/kernel/index.js';
import { initializeKernel } from '../../src/controller/initializeKernel.js';

test('install bundle', async t => {
  const endowments = makeKernelEndowments();
  const { bundleStore } = endowments.kernelStorage;
  const kconfig = { vats: {}, namedBundleIDs: {}, idToBundle: {} };
  await initializeKernel(kconfig, endowments.kernelStorage);
  const kernel = buildKernel(endowments, {}, {});
  await kernel.start(); // empty queue

  const bundleFile = new URL('./bootstrap-bundles.js', import.meta.url)
    .pathname;
  const bundle = await bundleSource(bundleFile);
  const { endoZipBase64Sha512: expectedSha512 } = bundle;
  const bundleID = `b1-${expectedSha512}`;

  // confirm that Endo agrees
  function computeSha512(bytes) {
    const hash = crypto.createHash('sha512');
    hash.update(bytes);
    return hash.digest().toString('hex');
  }

  // eslint-disable-next-line no-unused-vars
  const a = await parseArchive(
    decodeBase64(bundle.endoZipBase64),
    '<unknown>',
    { computeSha512, expectedSha512 },
  );

  const badVersion =
    'b2-00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
  await t.throwsAsync(async () => kernel.installBundle(badVersion, bundle), {
    message: /unsupported BundleID/,
  });

  const tooShort = 'b1-000';
  await t.throwsAsync(async () => kernel.installBundle(tooShort, bundle), {
    message: /does not match bundle/,
  });

  // actual installation should succeed
  await kernel.installBundle(bundleID, bundle);
  t.deepEqual(bundleStore.getBundle(bundleID), bundle);

  // installing the same bundle twice is a NOP
  await kernel.installBundle(bundleID, bundle);
  t.deepEqual(bundleStore.getBundle(bundleID), bundle);
});
