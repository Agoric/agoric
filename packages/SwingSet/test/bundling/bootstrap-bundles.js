import { assert } from '@agoric/assert';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { importBundle } from '@endo/import-bundle';

export function buildRootObject(vatPowers) {
  const { D } = vatPowers;
  let vats;
  let vatAdmin;

  async function checkImport(getCap) {
    const bcap = await getCap();
    const bcap2 = await getCap();
    assert.equal(bcap, bcap2, 'bundlecaps do not match'); // should be consistent
    const bundle = D(bcap).getBundle();
    assert.typeof(bundle, 'object');
    const endowments = harden({ big: 'big' });
    const ns = await importBundle(bundle, { endowments });
    const out = ns.runTheCheck('world');
    // out: [NAME, 'big', 'big', 'world']
    const ok =
      out.length === 4 &&
      out[1] === 'big' &&
      out[2] === 'big' &&
      out[3] === 'world';
    return [out[0], ok];
  }

  return Far('root', {
    async bootstrap(v0, devices) {
      vats = v0;
      // we exercise a little bit of vatAdmin, but this test is mostly about
      // bundles
      vatAdmin = await E(vats.vatAdmin).createVatAdminService(devices.vatAdmin);
    },

    async checkConfiguredVats() {
      const hello = await E(vats.named).hi();
      return [hello];
    },

    async vatFromNamedBundleCap(name, method) {
      const bcap = await E(vatAdmin).getNamedBundleCap(name);
      const { root } = await E(vatAdmin).createVat(bcap);
      const hello = await E(root)[method]();
      return [hello];
    },

    // TODO: this will go away when we remove va~.createVatByName
    async vatByName(name, method) {
      const { root } = await E(vatAdmin).createVatByName(name);
      const hello = await E(root)[method]();
      return [hello];
    },

    async idByName(name) {
      const id = await E(vatAdmin).getBundleIDByName(name);
      return id;
    },

    async vatFromID(id, method) {
      const bcap = await E(vatAdmin).getBundleCap(id);
      const { root } = await E(vatAdmin).createVat(bcap);
      const hello = await E(root)[method]();
      return [hello];
    },

    waitForBundleCap(id) {
      // bad bundleIDs should throw, missing bundleIDs should wait (hang)
      return E(vatAdmin).waitForBundleCap(id);
    },

    getBundleCap(id) {
      // bad bundleIDs should throw, missing bundleIDs should throw
      return E(vatAdmin).getBundleCap(id);
    },

    async getBundle(id) {
      const bcap = await E(vatAdmin).getBundleCap(id);
      return D(bcap).getBundle();
    },

    async checkImportByID(id) {
      async function getCap() {
        const bcap = await E(vatAdmin).getBundleCap(id);
        assert.equal(D(bcap).getBundleID(), id);
        return bcap;
      }
      return checkImport(getCap);
    },

    async checkImportByName(name) {
      async function getCap() {
        const bcap = await E(vatAdmin).getNamedBundleCap(name);
        return bcap;
      }
      return checkImport(getCap);
    },
  });
}
