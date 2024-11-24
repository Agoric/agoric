// eslint-disable-next-line -- not in the TS project
import centralSupply from '../bundles/bundle-centralSupply.js';
// eslint-disable-next-line -- not in the TS project
import mintHolder from '../bundles/bundle-mintHolder.js';
// eslint-disable-next-line -- not in the TS project
import provisionPool from '../bundles/bundle-provisionPool.js';

export const bundles = {
  centralSupply,
  mintHolder,
  provisionPool,
};

export const devices = {
  vatAdmin: {
    getNamedBundleCap: name => ({
      getBundle: () => {
        const bundle = bundles[name];
        assert(bundle, `unknown bundle ${name}`);
        return bundle;
      },
    }),
  },
};
