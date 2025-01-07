import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';

/**
 * @param {*} log
 * @param {ZoeService} zoe
 * @param {*} installations
 * @param {FeeMintAccess} feeMintAccess
 */
const build = async (log, zoe, installations, feeMintAccess) => {
  return Far('build', {
    runMintTest: async () => {
      log('starting runMintTest');
      const { instance } = await E(zoe).startInstance(
        installations.offerArgsUsageContract,
        harden({
          RUN: await E(zoe).getFeeIssuer(),
        }),
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

      const stableIssuer = E(zoe).getFeeIssuer();
      const amount1 = await E(stableIssuer).getAmountOf(payment1);
      const amount2 = await E(stableIssuer).getAmountOf(payment2);
      log(amount1);
      log(amount2);
    },
  });
};

export function buildRootObject(vatPowers) {
  return Far('root', {
    build: async (zoe, installations, feeMintAccess) =>
      build(vatPowers.testLog, zoe, installations, feeMintAccess),
  });
}
