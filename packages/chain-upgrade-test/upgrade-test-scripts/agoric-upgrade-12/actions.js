import { promises as fs } from 'fs';
import * as path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { voteLatestProposalAndWait } from '../commonUpgradeHelpers.js';
import { CHAINID, GOV1ADDR, VALIDATORADDR } from '../constants.js';
import { agd, bundleSource } from '../cliHelper.js';

const directoryName = dirname(fileURLToPath(import.meta.url));

export const installBundles = async bundlesData => {
  const bundleIds = {};

  for (const bundleData of bundlesData) {
    const bundleFilePath = await bundleSource(
      bundleData.filePath,
      bundleData.name,
    );

    const bundleJSONData = await fs.readFile(bundleFilePath, 'binary');

    const bundle = JSON.parse(bundleJSONData);
    bundleIds[bundleData.name] = bundle.endoZipBase64Sha512;

    await agd.tx(
      'swingset',
      'install-bundle',
      `@${bundleFilePath}`,
      '--from',
      GOV1ADDR,
      '--keyring-backend=test',
      '--gas=auto',
      '--chain-id',
      CHAINID,
      '-bblock',
      '--yes',
    );
  }

  return bundleIds;
};

export const prepForCoreEval = async (filePath, constants) => {
  let sourceFileData = await fs.readFile(filePath, 'binary');

  for (const constant in constants) {
    if (Object.prototype.hasOwnProperty.call(constants, constant)) {
      sourceFileData = sourceFileData.replace(
        `##${constant}##`,
        constants[constant],
      );
    }
  }

  const newFilePath = `/tmp/${path.basename(filePath)}`;
  await fs.writeFile(newFilePath, sourceFileData);
  return newFilePath;
};

export const runProber = async bundleId => {
  const proberScriptPath = path.join(
    directoryName,
    'zoe-full-upgrade',
    'run-prober-script.js',
  );
  const proberUpgradePermitPath = path.join(
    directoryName,
    'zoe-full-upgrade',
    'zcf-upgrade-permit.json',
  );
  const filePath = await prepForCoreEval(proberScriptPath, {
    PROBER_BUNDLE_ID: `b1-${bundleId}`,
  });
  await agd.tx(
    'gov',
    'submit-proposal',
    'swingset-core-eval',
    proberUpgradePermitPath,
    filePath,
    `--title="Run Prober"`,
    `--description="run prober"`,
    '--deposit=10000000ubld',
    '--from',
    VALIDATORADDR,
    '--keyring-backend=test',
    '--gas=auto',
    '--gas-adjustment=1.2',
    '--chain-id',
    CHAINID,
    '-bblock',
    '--yes',
  );

  await voteLatestProposalAndWait();
};

export const runZcfUpgrade = async (zcfBundleId, zoeBundleId) => {
  const zcfScriptPath = path.join(
    directoryName,
    'zoe-full-upgrade',
    'zcf-upgrade-script.js',
  );
  const zcfUpgradePermitPath = path.join(
    directoryName,
    'zoe-full-upgrade',
    'zcf-upgrade-permit.json',
  );
  const filePath = await prepForCoreEval(zcfScriptPath, {
    ZCF_BUNDLE_ID: `b1-${zcfBundleId}`,
    ZOE_BUNDLE_ID: `b1-${zoeBundleId}`,
  });
  await agd.tx(
    'gov',
    'submit-proposal',
    'swingset-core-eval',
    zcfUpgradePermitPath,
    filePath,
    `--title="Run Prober"`,
    `--description="run prober"`,
    '--deposit=10000000ubld',
    '--from',
    VALIDATORADDR,
    '--keyring-backend=test',
    '--gas=auto',
    '--gas-adjustment=1.2',
    '--chain-id',
    CHAINID,
    '-bblock',
    '--yes',
  );

  return voteLatestProposalAndWait();
};
