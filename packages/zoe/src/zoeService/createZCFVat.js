import { E } from '@endo/eventual-send';

/**
 * Attenuate the power of vatAdminSvc by restricting it such that only ZCF Vats
 * can be created.
 *
 * @param {VatAdminSvc} vatAdminSvc
 * @param {ZCFSpec} zcfSpec
 * @returns {CreateZCFVat}
 */
export const setupCreateZCFVat = (vatAdminSvc, zcfSpec) => {
  /** @type {CreateZCFVat} */
  const createZCFVat = async () => {
    /** @type {ERef<BundleCap>} */
    let bundleCapP;
    if (zcfSpec.bundleCap) {
      bundleCapP = zcfSpec.bundleCap;
    } else if (zcfSpec.name) {
      bundleCapP = E(vatAdminSvc).getNamedBundleCap(zcfSpec.name);
    } else if (zcfSpec.id) {
      bundleCapP = E(vatAdminSvc).getBundleCap(zcfSpec.id);
    } else {
      const keys = Object.keys(zcfSpec).join(',');
      assert.fail(`setupCreateZCFVat: bad zcfSpec, has keys '${keys}'`);
    }
    /** @type {BundleCap} */
    const bundleCap = await bundleCapP;
    assert(bundleCap, `setupCreateZCFVat did not get bundleCap`);
    const rootAndAdminNodeP = E(vatAdminSvc).createVat(bundleCap);
    const rootAndAdminNode = await rootAndAdminNodeP;
    return rootAndAdminNode;
  };
  return createZCFVat;
};
