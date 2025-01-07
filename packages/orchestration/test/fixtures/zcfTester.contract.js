import { Far } from '@endo/far';

/**
 * Tests ZCF
 *
 * @param {ZCF} zcf
 */
export const start = async zcf => {
  // make the `zcf` and `instance` available to the tests
  const instance = zcf.getInstance();
  zcf.setTestJig(() => harden({ instance }));

  const publicFacet = Far('public facet', {
    makeInvitation: async () => zcf.makeInvitation(() => 17, 'simple'),
  });

  return { publicFacet };
};

harden(start);
