#!/usr/bin/env node
import url from 'url';
import { makeHelpers } from '@agoric/deploy-script-support';
import { E } from '@endo/eventual-send';
import { getCopyMapEntries, makeCopyMap } from '@agoric/store';

// Ambient types. Needed only for dev but this does a runtime import.
// https://github.com/Agoric/agoric-sdk/issues/6512
import '@agoric/zoe/exported.js';

// TODO: CLI options to choose contracts
const contractRefs = [
  '../../governance/bundles/bundle-contractGovernor.js',
  '../../governance/bundles/bundle-committee.js',
  '../../governance/bundles/bundle-binaryVoteCounter.js',
  '../bundles/bundle-vaultFactory.js',
  '../bundles/bundle-reserve.js',
  '../bundles/bundle-psm.js',
  '../bundles/bundle-auctioneer.js',
  '../../vats/bundles/bundle-mintHolder.js',
];
const contractRoots = contractRefs.map(ref =>
  url.fileURLToPath(new URL(ref, import.meta.url)),
);

/** @type {<T>(store: any, key: string, make: () => T) => Promise<T>} */
const provideWhen = async (store, key, make) => {
  const found = await E(store).get(key);
  if (found) {
    return found;
  }
  const value = make();
  await E(store).set(key, value);
  return value;
};

export default async (homeP, endowments) => {
  const home = await homeP;
  const { zoe, scratch, board } = home;

  const { installInPieces, getBundlerMaker } = await makeHelpers(
    homeP,
    endowments,
  );
  const bundler = E(getBundlerMaker({ log: console.log })).makeBundler({
    zoe,
  });

  console.log('getting installCache...');
  /**
   * @type {import('@endo/patterns').CopyMap<
   *   string,
   *   { installation: Installation; boardId: string; path?: string }
   * >}
   */
  const initial = await provideWhen(scratch, 'installCache', () =>
    makeCopyMap([]),
  );
  console.log('initially:', initial.payload.keys.length, 'entries');

  // ISSUE: getCopyMapEntries of CopyMap<K, V> loses K, V.
  /**
   * @type {Map<
   *   string,
   *   { installation: Installation; boardId: string; path?: string }
   * >}
   */
  const working = new Map(getCopyMapEntries(initial));

  let added = 0;

  /** @type {EndoZipBase64Bundle[]} */
  const bundles = await Promise.all(
    contractRoots.map(path => import(path).then(m => m.default)),
  );

  let ix = 0;
  for await (const bundle of bundles) {
    const sha512 = bundle.endoZipBase64Sha512;
    if (working.has(bundle.endoZipBase64Sha512)) {
      console.log('hit:', { path: contractRefs[ix], sha512 });
    } else {
      console.log('miss:', {
        path: contractRefs[ix],
        length: bundle.endoZipBase64.length,
        sha512,
      });
      const installation = await installInPieces(bundle, bundler, {
        persist: true,
      });
      const boardId = await E(board).getId(installation);
      working.set(sha512, { installation, boardId, path: contractRefs[ix] });
      added += 1;
    }
    ix += 1;
  }

  const final = makeCopyMap(working);
  assert.equal(final.payload.keys.length, working.size);
  await (added > 0 && E(home.scratch).set('installCache', final));
  console.log({
    initial: initial.payload.keys.length,
    added,
    total: working.size,
  });

  const items = [...working.entries()]
    .map(([sha512, { boardId, path }]) => ({ sha512, boardId, path }))
    .sort();
  const boardId = await E(board).getId(JSON.stringify(items));
  console.log({
    boardId,
  });
};
