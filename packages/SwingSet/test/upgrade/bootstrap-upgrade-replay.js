import { Far, E } from '@endo/far';

export function buildRootObject() {
  let vatAdmin;
  let uptonRoot;
  /** @type {import('@agoric/swingset-vat').VatAdminFacet} */
  let uptonAdmin;

  return Far('root', {
    async bootstrap(vats, devices) {
      vatAdmin = await E(vats.vatAdmin).createVatAdminService(devices.vatAdmin);
    },

    async buildV1() {
      // build Upton, the upgrading vat
      const bcap = await E(vatAdmin).getNamedBundleCap('upton');
      const vatParameters = { version: 'v1' };
      const options = { vatParameters };
      const res = await E(vatAdmin).createVat(bcap, options);
      uptonRoot = res.root;
      uptonAdmin = res.adminNode;
      return E(uptonRoot).phase1();
    },

    async upgradeV2() {
      // upgrade Upton to version 2
      const bcap = await E(vatAdmin).getNamedBundleCap('upton');
      const vatParameters = { version: 'v2' };
      await E(uptonAdmin).restartVat(bcap, { vatParameters });
      return E(uptonRoot).phase2();
    },

    async checkReplay() {
      // ask Upton to do something after a restart
      return E(uptonRoot).checkReplay();
    },
  });
}
