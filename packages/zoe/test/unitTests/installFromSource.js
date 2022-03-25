// @ts-check

import bundleSource from '@endo/bundle-source';
import { E } from '@endo/eventual-send';

/**
 * @param {ZoeService} zoe
 * @param {any} vatAdminState
 * @param {string} path
 * @returns {Promise<Installation>}
 */
export const installationPFromSource = async (zoe, vatAdminState, path) => {
  const bundle = await bundleSource(path);
  const id = `b1-${path}`;
  vatAdminState.installBundle(id, bundle);
  return E(zoe).installBundleID(id);
};
