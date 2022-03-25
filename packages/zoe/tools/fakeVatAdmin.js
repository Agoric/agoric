// @ts-check

import { E } from '@endo/eventual-send';
import { makePromiseKit } from '@endo/promise-kit';
import { Far } from '@endo/marshal';
import { makeStore } from '@agoric/store';

import { assert } from '@agoric/assert';
import { evalContractBundle } from '../src/contractFacet/evalContractCode.js';
import { handlePKitWarning } from '../src/handleWarning.js';
import { makeHandle } from '../src/makeHandle.js';
import zcfContractBundle from '../bundles/bundle-contractFacet.js';

/** @typedef {import('@agoric/swingset-vat').BundleID} BundleID */
/** @typedef {import('@agoric/swingset-vat').EndoZipBase64Bundle} EndoZipBase64Bundle */

// this simulates a bundlecap, which is normally a swingset "device node"
/** @typedef {import('@agoric/swingset-vat').BundleCap} BundleCap */
/** @type {() => BundleCap} */
const fakeBundleCap = () => makeHandle('BundleCap');
export const zcfBundleCap = fakeBundleCap();

/**
 * @param {(...args) => unknown} [testContextSetter]
 * @param {(x: unknown) => unknown} [makeRemote]
 */
function makeFakeVatAdmin(testContextSetter = undefined, makeRemote = x => x) {
  // FakeVatPowers isn't intended to support testing of vat termination, it is
  // provided to allow unit testing of contracts that call zcf.shutdown()
  let exitMessage;
  let hasExited = false;
  let exitWithFailure;
  /** @type {Store<BundleID, BundleCap>} */
  const idToBundleCap = makeStore('idToBundleCap');
  /** @type {Store<BundleCap, EndoZipBase64Bundle>} */
  const bundleCapToBundle = makeStore('bundleCapToBundle');
  const fakeVatPowers = {
    exitVat: completion => {
      exitMessage = completion;
      hasExited = true;
      exitWithFailure = false;
    },
    exitVatWithFailure: reason => {
      exitMessage = reason;
      hasExited = true;
      exitWithFailure = true;
    },
    D: bundleCap => ({
      getBundle: () => bundleCapToBundle.get(bundleCap),
    }),
    testJigSetter: testContextSetter,
  };

  // This is explicitly intended to be mutable so that
  // test-only state can be provided from contracts
  // to their tests.
  const admin = Far('vatAdmin', {
    getBundleCap: bundleID => {
      if (!idToBundleCap.has(bundleID)) {
        idToBundleCap.init(bundleID, fakeBundleCap());
      }
      return Promise.resolve(idToBundleCap.get(bundleID));
    },
    getNamedBundleCap: name => {
      assert.equal(name, 'zcf', 'fakeVatAdmin only knows ZCF');
      return Promise.resolve(zcfBundleCap);
    },
    createVat: bundleCap => {
      assert.equal(bundleCap, zcfBundleCap, 'fakeVatAdmin only knows ZCF');
      const bundle = zcfContractBundle;
      return Promise.resolve(
        harden({
          root: makeRemote(
            E(evalContractBundle(bundle)).buildRootObject(fakeVatPowers),
          ),
          adminNode: Far('adminNode', {
            done: () => {
              const kit = makePromiseKit();
              handlePKitWarning(kit);
              return kit.promise;
            },
            terminateWithFailure: () => {},
          }),
        }),
      );
    },
  });
  const vatAdminState = {
    getExitMessage: () => exitMessage,
    getHasExited: () => hasExited,
    getExitWithFailure: () => exitWithFailure,
    installBundle: (id, bundle) => {
      if (idToBundleCap.has(id)) {
        assert.equal(
          bundle.endoZipBase64,
          bundleCapToBundle.get(idToBundleCap.get(id)).endoZipBase64,
        );
        return;
      }
      const bundleCap = fakeBundleCap();
      idToBundleCap.init(id, bundleCap);
      bundleCapToBundle.init(bundleCap, bundle);
    },
  };
  return { admin, vatAdminState };
}

// Tests which use this global/shared fakeVatAdmin should really import
// makeFakeVatAdmin() instead, and build their own private instance. This
// will be forced when #4565 requires them to use
// vatAdminState.installBundle().

const fakeVatAdmin = makeFakeVatAdmin().admin;

export default fakeVatAdmin;
export { makeFakeVatAdmin };
