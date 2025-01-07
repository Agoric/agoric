import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';

const build = async (log, zoe, installations) => {
  return Far('build', {
    privateArgsUsageTest: async () => {
      const privateArgs = harden({
        myArg: Far('arg', {
          doTest: () => 'privateArgs.myArg was accessed in the contract',
        }),
      });
      const { creatorFacet } = await E(zoe).startInstance(
        installations.privateArgsUsageContract,
        undefined,
        undefined,
        privateArgs,
      );

      const testResult = await E(creatorFacet).usePrivateArgs();
      log(testResult);
    },
  });
};

export function buildRootObject(vatPowers) {
  return Far('root', {
    build: async (...args) => build(vatPowers.testLog, ...args),
  });
}
