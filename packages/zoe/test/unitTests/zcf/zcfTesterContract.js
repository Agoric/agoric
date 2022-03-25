// @ts-check

import '../../../exported.js';
import { Far } from '@endo/far';

/**
 * Tests ZCF
 *
 * @type {ContractStartFn<{ makeInvitation: unknown }>}
 */
const start = async zcf => {
  // make the `zcf` and `instance` available to the tests
  const instance = zcf.getInstance();
  zcf.setTestJig(() => harden({ instance }));

  const publicFacet = Far('public facet', {
    makeInvitation: () => zcf.makeInvitation(() => 17, 'simple'),
  });

  return { publicFacet };
};

harden(start);
export { start };
