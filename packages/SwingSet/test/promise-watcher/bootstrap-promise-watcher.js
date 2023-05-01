import { Far, E } from '@endo/far';
import { makePromiseKit } from '@endo/promise-kit';

export function buildRootObject() {
  let vatAdmin;
  let uptonRoot;
  /** @type {import('@agoric/swingset-vat').VatAdminFacet} */
  let uptonAdmin;
  const pk1 = makePromiseKit();
  const pk2 = makePromiseKit();
  const pk3 = makePromiseKit();
  const pk4 = makePromiseKit();
  const resolveAfterUpgrade = [];

  const self = Far('root', {
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
      await E(uptonRoot).haveSomePromises(
        self,
        pk1.promise,
        pk2.promise,
        pk3.promise,
        pk4.promise,
      );
      pk1.resolve('val1');
      pk2.reject('err2');
    },

    replyToThis(withSuccess, beforeUpgrade) {
      if (beforeUpgrade) {
        if (withSuccess) {
          return 'rvalbefore';
        } else {
          // eslint-disable-next-line no-throw-literal
          throw 'rerrbefore';
        }
      } else {
        const rp = makePromiseKit();
        resolveAfterUpgrade.push({ rp, withSuccess });
        return rp.promise;
      }
    },

    async upgradeV2() {
      const bcap = await E(vatAdmin).getNamedBundleCap('upton');
      const vatParameters = { version: 'v2' };
      await E(uptonAdmin).restartVat(bcap, {
        vatParameters,
        upgradeMessage: 'test upgrade',
      });
      pk3.resolve('val3');
      pk4.reject('err4');
      for (const { rp, withSuccess } of resolveAfterUpgrade) {
        if (withSuccess) {
          rp.resolve('rvalafter');
        } else {
          rp.reject('rerrafter');
        }
      }
    },
  });
  return self;
}
