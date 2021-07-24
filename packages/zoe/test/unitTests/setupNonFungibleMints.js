// @ts-check

import { makeIssuerKit, AmountMath, AssetKind } from '@agoric/ertp';
import { makeZoe } from '../../src/zoeService/zoe';
import fakeVatAdmin from '../../tools/fakeVatAdmin';

const setupNonFungible = () => {
  const ccBundle = makeIssuerKit('CryptoCats', AssetKind.SET);
  const rpgBundle = makeIssuerKit('MMORPG Items', AssetKind.SET);
  const allBundles = { cc: ccBundle, rpg: rpgBundle };
  const mints = new Map();
  const issuers = new Map();
  const brands = new Map();

  for (const k of Object.getOwnPropertyNames(allBundles)) {
    mints.set(k, allBundles[k].mint);
    issuers.set(k, allBundles[k].issuer);
    brands.set(k, allBundles[k].brand);
  }

  function createRpgItem(name, power, desc = undefined) {
    return harden([{ name, description: desc || name, power }]);
  }
  const { zoeService: zoe } = makeZoe(fakeVatAdmin);

  const ccIssuer = issuers.get('cc');
  const rpgIssuer = issuers.get('rpg');
  const ccMint = mints.get('cc');
  const rpgMint = mints.get('rpg');
  const cryptoCats = value => AmountMath.make(value, allBundles.cc.brand);
  const rpgItems = value => AmountMath.make(value, allBundles.rpg.brand);
  return {
    ccIssuer,
    rpgIssuer,
    ccMint,
    rpgMint,
    cryptoCats,
    rpgItems,
    brands,
    createRpgItem,
    zoe,
  };
};
harden(setupNonFungible);
export { setupNonFungible };
