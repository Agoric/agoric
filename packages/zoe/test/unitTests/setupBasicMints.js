// @ts-check

import { makeIssuerKit, AmountMath } from '@agoric/ertp';
import { makeStore } from '@agoric/store';
import { makeZoeKit } from '../../src/zoeService/zoe.js';
import { makeFakeVatAdmin } from '../../tools/fakeVatAdmin.js';

const setup = () => {
  const moolaBundle = makeIssuerKit('moola');
  const simoleanBundle = makeIssuerKit('simoleans');
  const bucksBundle = makeIssuerKit('bucks');
  const allBundles = {
    moola: moolaBundle,
    simoleans: simoleanBundle,
    bucks: bucksBundle,
  };
  /** @type {Store<string, Brand>} */
  const brands = makeStore('brandName');

  for (const k of Object.getOwnPropertyNames(allBundles)) {
    brands.init(k, allBundles[k].brand);
  }

  const { admin: fakeVatAdmin, vatAdminState } = makeFakeVatAdmin();
  const { zoeService: zoe } = makeZoeKit(fakeVatAdmin);

  /** @type {(brand: Brand) => (value: AmountValue) => Amount} */
  const makeSimpleMake = brand => value => AmountMath.make(brand, value);

  /**
   * @typedef {Object} BasicMints
   * @property {Issuer} moolaIssuer
   * @property {Mint} moolaMint
   * @property {IssuerKit} moolaR
   * @property {IssuerKit} moolaKit
   * @property {Issuer} simoleanIssuer
   * @property {Mint} simoleanMint
   * @property {IssuerKit} simoleanR
   * @property {IssuerKit} simoleanKit
   * @property {Issuer} bucksIssuer
   * @property {Mint} bucksMint
   * @property {IssuerKit} bucksR
   * @property {IssuerKit} bucksKit
   * @property {Store<string, Brand>} brands
   * @property {(value: AmountValue) => Amount} moola
   * @property {(value: AmountValue) => Amount} simoleans
   * @property {(value: AmountValue) => Amount} bucks
   * @property {ERef<ZoeService>} zoe
   * @property {any} vatAdminState
   */

  /** @type {BasicMints} */
  const result = {
    moolaIssuer: moolaBundle.issuer,
    moolaMint: moolaBundle.mint,
    moolaR: moolaBundle,
    moolaKit: moolaBundle,
    simoleanIssuer: simoleanBundle.issuer,
    simoleanMint: simoleanBundle.mint,
    simoleanR: simoleanBundle,
    simoleanKit: simoleanBundle,
    bucksIssuer: bucksBundle.issuer,
    bucksMint: bucksBundle.mint,
    bucksR: bucksBundle,
    bucksKit: bucksBundle,
    brands,
    moola: makeSimpleMake(moolaBundle.brand),
    simoleans: makeSimpleMake(simoleanBundle.brand),
    bucks: makeSimpleMake(bucksBundle.brand),
    zoe,
    vatAdminState,
  };
  harden(result);
  return result;
};
harden(setup);
export { setup };
