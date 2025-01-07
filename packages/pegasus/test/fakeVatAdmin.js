import { E } from '@endo/far';
import { makePromiseKit } from '@endo/promise-kit';

import { evalContractBundle } from '@agoric/zoe/src/contractFacet/evalContractCode.js';

export default harden({
  createMeter: () => {},
  createUnlimitedMeter: () => {},
  createVat: async bundle => {
    const rootP = E(evalContractBundle(bundle)).buildRootObject();
    return E.when(rootP, root =>
      harden({
        root,
        adminNode: {
          done: async () => {
            return makePromiseKit().promise;
          },
          terminate: () => {},
        },
      }),
    );
  },
  createVatByName: _name => {
    throw Error(`createVatByName not supported in fake mode`);
  },
});
