import harden from '@agoric/harden';
import { makeMint } from '@agoric/ertp/core/mint';

// This vat contains two starting mints: moolaMint and simoleanMint
// A third mint, the dustMint, is associated with the pixel demo

function build(_E, _log) {
  const mints = new Map();

  const storeMint = assetNameSingular =>
    mints.set(assetNameSingular, makeMint(assetNameSingular));

  const assetNames = harden(['moola', 'simolean']);

  for (const assetName of assetNames) {
    storeMint(assetName);
  }

  return harden({
    getAssetNames: () => assetNames,
    getMints: () => assetNames.map(mints.get),
    getAssays: () =>
      assetNames.map(assetName => mints.get(assetName).getAssay()),
    mintInitialPurses: () =>
      assetNames.map(assetName =>
        mints.get(assetName).mint(1000, `${assetName} purse`),
      ),
  });
}

export default function setup(syscall, state, helpers) {
  return helpers.makeLiveSlots(
    syscall,
    state,
    E => build(E, helpers.log),
    helpers.vatID,
  );
}
