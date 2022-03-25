// @ts-check

import { AmountMath } from '@agoric/ertp';

/**
 * Add a lien to an amount for an address.
 *
 * @param {Store<Address, Amount>} store
 * @param {Address} address
 * @param {Amount} amountToLien
 */
const addToLiened = (store, address, amountToLien) => {
  if (store.has(address)) {
    const updated = AmountMath.add(store.get(address), amountToLien);
    store.set(address, updated);
  } else {
    store.init(address, amountToLien);
  }
};
harden(addToLiened);
export { addToLiened };
