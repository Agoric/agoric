// to turn on ts-check:
/* global E */

// import { E } from "@endo/far";

const ZCF_BUNDLE_ID = '##ZCF_BUNDLE_ID##';
const ZOE_BUNDLE_ID = '##ZOE_BUNDLE_ID##';

console.info('zoe upgrade: evaluating script');

/*
 * Test a full upgrade of Zoe and ZCF.
 * This will include a change to Zoe's code, and a call to Zoe to change the ZCF
 * code that will get used for new and upgraded contracts.
 */
const upgradeZoeAndZcf = async powers => {
  console.info('upgradeZoeAndZcf');
  const {
    consume: { vatStore, vatAdminSvc },
  } = powers;

  const newZoeBundleCap = await E(vatAdminSvc).getBundleCap(ZOE_BUNDLE_ID);
  const { adminNode, root: zoeRoot } = await E(vatStore).get('zoe');

  await E(adminNode).upgrade(newZoeBundleCap, {});

  const zoeConfigFacet = await E(zoeRoot).getZoeConfigFacet();
  await E(zoeConfigFacet).updateZcfBundleId(ZCF_BUNDLE_ID);
};

upgradeZoeAndZcf;
