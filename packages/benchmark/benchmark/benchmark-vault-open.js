import { bench } from '../src/benchmarkerator.js';

// eslint-disable-next-line import/order
import { Offers } from '@agoric/inter-protocol/src/clientSupport.js';

const collateralBrandKey = 'ATOM';

bench.addBenchmark('open vault', {
  executeRound: async (context, round) => {
    const { alice } = context.actors;

    const openVault = async (i, n, r) => {
      const offerId = `open-vault-${i}-of-${n}-round-${r}`;
      await alice.executeOfferMaker(Offers.vaults.OpenVault, {
        offerId,
        collateralBrandKey,
        wantMinted: 5,
        giveCollateral: 1.0,
      });

      const upd = alice.getLatestUpdateRecord();
      assert(
        upd.updated === 'offerStatus' &&
          upd.status.id === offerId &&
          upd.status.numWantsSatisfied === 1,
      );
    };

    const openN = async n => {
      const range = [...Array(n)].map((_, i) => i + 1);
      await Promise.all(range.map(async i => openVault(i, n, round)));
    };

    const roundSize = context.options.size ? Number(context.options.size) : 1;
    await openN(roundSize);
  },
});

await bench.run();
