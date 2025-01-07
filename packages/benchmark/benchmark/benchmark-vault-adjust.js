import { bench } from '../src/benchmarkerator.js';

// eslint-disable-next-line import/order
import { Offers } from '@agoric/inter-protocol/src/clientSupport.js';

const collateralBrandKey = 'ATOM';
const adjustOpenOfferId = 'adjust-open';

// The benchmark-defined option `size` (default 1) indicates how many operations
// will be performed per round.  The difference between performing 10 rounds of
// 1 operation each (command line: `--rounds 10`) and performing 1 round of 10
// operations (command line: `-o size 10`) is that while both will perform 10
// operations, in the first case the 10 operations will be done sequentially
// while in the second case they will be done concurrently.  These are two
// different modes you might want to measure.  (Of course, you could do 10
// rounds of 10 operations each: `--rounds 10 -o size 10`, and that would work
// fine also.)

bench.addBenchmark('adjust vault balance', {
  setup: async context => {
    const { alice } = context.actors;

    await alice.executeOfferMaker(Offers.vaults.OpenVault, {
      offerId: adjustOpenOfferId,
      collateralBrandKey,
      wantMinted: 5.0,
      giveCollateral: 9.0,
    });
    const upd = alice.getLatestUpdateRecord();
    assert(
      upd.updated === 'offerStatus' &&
        upd.status.id === adjustOpenOfferId &&
        upd.status.numWantsSatisfied === 1,
    );
    return undefined;
  },

  executeRound: async (context, round) => {
    const { alice } = context.actors;

    const adjustVault = async (i, n, r) => {
      const offerId = `adjust-vault-${i}-of-${n}=round-${r}`;
      await alice.executeOfferMaker(
        Offers.vaults.AdjustBalances,
        {
          offerId,
          collateralBrandKey,
          giveMinted: 0.0005,
        },
        adjustOpenOfferId,
      );
      const upd = alice.getLatestUpdateRecord();
      assert(
        upd.updated === 'offerStatus' &&
          upd.status.id === offerId &&
          upd.status.numWantsSatisfied === 1,
      );
    };

    const adjustN = async n => {
      const range = [...Array(n)].map((_, i) => i + 1);
      await Promise.all(range.map(async i => adjustVault(i, n, round)));
    };

    const roundSize = context.options.size ? Number(context.options.size) : 1;
    await adjustN(roundSize);
  },
});

await bench.run();
