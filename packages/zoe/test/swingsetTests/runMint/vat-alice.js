import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';

/**
 * @param {any} log
 * @param {ZoeService} zoe
 * @param {any} installations
 * @param {FeeMintAccess} feeMintAccess
 */
const build = async (log, zoe, installations, feeMintAccess) => {
  return Far('build', {
    runMintTest: async () => {
      log('starting runMintTest');
      const { instance } = await E(zoe).startInstance(
        installations.offerArgsUsageContract,
        {
          RUN: E(zoe).getFeeIssuer(),
        },
        undefined,
      );
      const issuers = await E(zoe).getIssuers(instance);
      log(issuers);
      const { creatorFacet: cf1 } = await E(zoe).startInstance(
        installations.runMintContract,
        undefined,
        undefined,
        {
          feeMintAccess,
        },
      );
      log('first instance started');
      const { creatorFacet: cf2 } = await E(zoe).startInstance(
        installations.runMintContract,
        undefined,
        undefined,
        {
          feeMintAccess,
        },
      );
      log('second instance started');

      const payment1 = await E(cf1).mintRun();
      log('first payment minted');
      const payment2 = await E(cf2).mintRun();
      log('second payment minted');

      const runIssuer = E(zoe).getFeeIssuer();
      const amount1 = await E(runIssuer).getAmountOf(payment1);
      const amount2 = await E(runIssuer).getAmountOf(payment2);
      log(amount1);
      log(amount2);
    },
  });
};

export function buildRootObject(vatPowers) {
  return Far('root', {
    build: (...args) => build(vatPowers.testLog, ...args),
  });
}
