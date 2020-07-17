/* global harden */

import produceIssuer from '@agoric/ertp';

import makeStore from '@agoric/store';

// This vat contains two starting mints for demos: moolaMint and
// simoleanMint.

function build(_E, _log) {
  const mintsAndMath = makeStore('issuerName');

  const api = harden({
    getAllIssuerNames: () => mintsAndMath.keys(),
    getIssuer: issuerName => {
      const mint = mintsAndMath.get(issuerName);
      return mint.getIssuer();
    },
    getIssuers: issuerNames => issuerNames.map(api.getIssuer),

    // NOTE: having a reference to a mint object gives the ability to mint
    // new digital assets, a very powerful authority. This authority
    // should be closely held.
    getMint: name => mintsAndMath.get(name).mint,
    getMints: issuerNames => issuerNames.map(api.getMint),
    // For example, issuerNameSingular might be 'moola', or 'simolean'
    makeMintAndIssuer: issuerNameSingular => {
      const { mint, issuer, amountMath } = produceIssuer(issuerNameSingular);
      mintsAndMath.init(issuerNameSingular, { mint, amountMath });
      return issuer;
    },
    mintInitialPayment: (issuerName, value) => {
      const { mint, amountMath } = mintsAndMath.get(issuerName);
      const amount = amountMath.make(value);
      return mint.mintPayment(amount);
    },
    mintInitialPayments: (issuerNames, values) =>
      issuerNames.map((issuerName, i) =>
        api.mintInitialPayment(issuerName, values[i]),
      ),
  });

  return api;
}

export default function setup(syscall, state, helpers) {
  return helpers.makeLiveSlots(
    syscall,
    state,
    E => build(E, helpers.log),
    helpers.vatID,
  );
}
