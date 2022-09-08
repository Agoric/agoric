import bundleCommittee from '@agoric/governance/bundles/bundle-committee.js';
import bundleContractGovernor from '@agoric/governance/bundles/bundle-contractGovernor.js';
import bundleBinaryVoteCounter from '@agoric/governance/bundles/bundle-binaryVoteCounter.js';
import bundlePSM from '@agoric/inter-protocol/bundles/bundle-psm.js';
import bundlePSMCharter from '@agoric/inter-protocol/bundles/bundle-psmCharter.js';

import bundleCentralSupply from '../bundles/bundle-centralSupply.js';
import bundleMintHolder from '../bundles/bundle-mintHolder.js';
import bundleSingleWallet from '../bundles/bundle-singleWallet.js';
import bundleWalletFactory from '../bundles/bundle-legacy-walletFactory.js';

const bundles = {
  centralSupply: bundleCentralSupply,
  mintHolder: bundleMintHolder,
  singleWallet: bundleSingleWallet,
  walletFactory: bundleWalletFactory,
  committee: bundleCommittee,
  contractGovernor: bundleContractGovernor,
  binaryVoteCounter: bundleBinaryVoteCounter,
  psm: bundlePSM,
  psmCharter: bundlePSMCharter,
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
