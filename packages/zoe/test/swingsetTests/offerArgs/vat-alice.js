import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';

const build = async (log, zoe, installations) => {
  return Far('build', {
    offerArgsUsageTest: async () => {
      const { creatorInvitation } = await E(zoe).startInstance(
        installations.offerArgsUsageContract,
      );

      const offerArgs = harden({
        myArg: 'offerArgs.myArg was accessed in the contract',
      });

      const userSeat = await E(zoe).offer(
        creatorInvitation,
        undefined,
        undefined,
        offerArgs,
      );
      const offerResult = await E(userSeat).getOfferResult();
      log(offerResult);
    },
  });
};

export function buildRootObject(vatPowers) {
  return Far('root', {
    build: async (...args) => build(vatPowers.testLog, ...args),
  });
}
