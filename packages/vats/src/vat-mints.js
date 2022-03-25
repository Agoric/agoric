// @ts-check
import { Far } from '@endo/far';
import { makeIssuerKit, AmountMath } from '@agoric/ertp';

import { makeStore } from '@agoric/store';

// This vat contains two starting mints for demos: moolaMint and
// simoleanMint.

export function buildRootObject(_vatPowers) {
  /** @type {Store<string, { mint: Mint; brand: Brand }>} */
  const mintsAndBrands = makeStore('issuerName');

  const api = Far('api', {
    getAllIssuerNames: () => [...mintsAndBrands.keys()],
    getIssuer: issuerName => {
      const { mint } = mintsAndBrands.get(issuerName);
      return mint.getIssuer();
    },
    /** @param {string[]} issuerNames */
    getIssuers: issuerNames => issuerNames.map(api.getIssuer),

    /**
     * NOTE: a mint is ability to mint new digital assets, a very powerful
     * authority that is usually closely held. But this mint is for demo /
     * faucet purposes.
     *
     * @param {string} name
     */
    getMint: name => mintsAndBrands.get(name).mint,
    /** @param {string[]} issuerNames */
    getMints: issuerNames => issuerNames.map(api.getMint),
    /**
     * @param {any} issuerNameSingular For example, 'moola', or 'simolean'
     * @param {[AssetKind?, DisplayInfo?]} issuerArgs
     */
    makeMintAndIssuer: (issuerNameSingular, ...issuerArgs) => {
      const { mint, issuer, brand } = makeIssuerKit(
        issuerNameSingular,
        ...issuerArgs,
      );
      mintsAndBrands.init(issuerNameSingular, { mint, brand });
      return issuer;
    },
    provideIssuerKit: (issuerName, ...issuerArgs) => {
      if (mintsAndBrands.has(issuerName)) {
        const { mint, brand } = mintsAndBrands.get(issuerName);
        const issuer = mint.getIssuer();
        return { mint, issuer, brand };
      } else {
        const { mint, issuer, brand } = makeIssuerKit(
          issuerName,
          ...issuerArgs,
        );
        mintsAndBrands.init(issuerName, { mint, brand });
        return { mint, issuer, brand };
      }
    },
    /**
     * @param {string} issuerName
     * @param {bigint} value
     */
    mintInitialPayment: (issuerName, value) => {
      if (!mintsAndBrands.has(issuerName)) {
        return undefined;
      }
      const { mint, brand } = mintsAndBrands.get(issuerName);
      const amount = AmountMath.make(brand, value);
      return mint.mintPayment(amount);
    },
    /**
     * @param {string[]} issuerNames
     * @param {bigint[]} values
     */
    mintInitialPayments: (issuerNames, values) =>
      issuerNames.map((issuerName, i) =>
        api.mintInitialPayment(issuerName, values[i]),
      ),
  });

  return api;
}
