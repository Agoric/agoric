/**
 * @file Source for a core-eval to start a new governed instance of
 * ./governedContract.js.
 * Also functions as an off-chain builder script for such core-evals:
 *     agoric run /path/to/$0 [<bootstrap powers produce key> [<label>]]
 */

/// <reference types="@agoric/vats/src/core/types-ambient"/>

// dynamic import { makeHelpers } from '@agoric/deploy-script-support';
// dynamic import { getSpecifier } from '@agoric/internal/src/module-utils.js';
import { deeplyFulfilledObject, makeTracer } from '@agoric/internal';
import { E } from '@endo/far';

import { CONTRACT_ELECTORATE, ParamTypes } from '@agoric/governance';
import { MALLEABLE_NUMBER } from '@agoric/governance/test/swingsetTests/contractGovernor/governedContract.js';

const trace = makeTracer('GovC-coreEval', true);

/**
 * Start a new governed contract instance.
 *
 * @param {import('@agoric/inter-protocol/src/proposals/econ-behaviors.js').EconomyBootstrapPowers} powers
 * @param {object} config
 * @param {object} config.options
 * @param {Installation} [config.options.contractInstallation]
 *   source installation for the new governed contract
 * @param {string} [config.options.producedKey] if present, the Bootstrap Powers
 *   key with which a reference to the `boardID`-enhanced governed contract kit
 *   should be associated
 * @param {string} [config.options.label] for identification
 */
export const startGovernedInstance = async (
  {
    consume: {
      agoricNames,
      board,
      chainTimerService: chainTimerServiceP,
      economicCommitteeCreatorFacet: electorateCreatorFacet,
      governedContractKits: governedContractKitsP,
      zoe,
    },
    produce,
  },
  {
    options: { contractInstallation, producedKey, label = 'governedContract' },
  },
) => {
  trace('start');

  const governorInstallationPath = ['installation', 'contractGovernor'];
  const consumePs = harden({
    chainTimerService: chainTimerServiceP,
    governedContractKits: governedContractKitsP,
    governorInstallation: E(agoricNames).lookup(...governorInstallationPath),
    poserInvitation: E(electorateCreatorFacet).getPoserInvitation(),
  });
  const {
    chainTimerService,
    governedContractKits,
    governorInstallation,
    poserInvitation,
  } = await deeplyFulfilledObject(consumePs);
  const invitationIssuerP = E(zoe).getInvitationIssuer();
  const invitationAmount =
    await E(invitationIssuerP).getAmountOf(poserInvitation);

  const governedTerms = {
    governedParams: {
      [MALLEABLE_NUMBER]: {
        type: ParamTypes.NAT,
        value: 602214090000000000000000n,
      },
      [CONTRACT_ELECTORATE]: {
        type: ParamTypes.INVITATION,
        value: invitationAmount,
      },
    },
  };
  const governorTerms = {
    chainTimerService,
    governedContractInstallation: contractInstallation,
    governed: {
      terms: governedTerms,
      issuerKeywordRecord: {},
      label,
    },
  };

  const governorInstallation = await E(agoricNames).lookup(
    'installation',
    'contractGovernor',
  );

  const governorStartResult = await E(zoe).startInstance(
    governorInstallation,
    {},
    governorTerms,
    {
      governed: {
        initialPoserInvitation: poserInvitation,
      },
    },
    `${label}.governor`,
  );

  const kit = await deeplyFulfilledObject(
    harden({
      label,
      creatorFacet: E(governorStartResult.creatorFacet).getCreatorFacet(),
      adminFacet: E(governorStartResult.creatorFacet).getAdminFacet(),
      publicFacet: E(governorStartResult.creatorFacet).getPublicFacet(),
      instance: E(governorStartResult.creatorFacet).getInstance(),

      governor: governorStartResult.instance,
      governorCreatorFacet: governorStartResult.creatorFacet,
      governorAdminFacet: governorStartResult.adminFacet,
    }),
  );

  governedContractKits.init(kit.instance, kit);

  if (producedKey !== undefined) {
    const boardID = await E(board).getId(kit.instance);
    trace({ boardID });
    produce[producedKey].reset();
    produce[producedKey].resolve({ ...kit, boardID });
  }
};

/**
 * Return a manifest for instantiating a new governed contract instance.
 *
 * @param {object} utils
 * @param {(b: ERef<ManifestBundleRef>) => Promise<Installation>} utils.restoreRef
 * @param {object} details
 * @param {ERef<ManifestBundleRef>} details.contractBundleRef source bundle for
 *   the new governed contract
 * @param {string} [details.producedKey] if present, the Bootstrap Powers key
 *   with which a reference to the `boardID`-enhanced governed contract kit
 *   should be associated
 * @param {string} [details.label] for identification
 */
export const getManifestForGovernedContract = async (
  { restoreRef },
  { contractBundleRef, producedKey, label },
) => {
  const contractInstallation = restoreRef(contractBundleRef);
  return {
    manifest: {
      [startGovernedInstance.name]: {
        consume: {
          agoricNames: true,
          board: true,
          chainTimerService: true,
          economicCommitteeCreatorFacet: true,
          governedContractKits: true,
          zoe: true,
        },
        produce: producedKey === undefined ? {} : { [producedKey]: true },
      },
    },
    // Provide `startGovernedInstance` a second argument like
    // `{ options: { contractInstallation, producedKey, label } }`.
    options: { contractInstallation, producedKey, label },
  };
};

/** @type {import('@agoric/deploy-script-support/src/externalTypes.js').CoreEvalBuilder} */
export const defaultProposalBuilder = async (
  { publishRef, install },
  [producedKey, label = producedKey] = [],
) => {
  // Dynamic import to avoid inclusion in the proposal bundle.
  const { getSpecifier } = await import('@agoric/internal/src/module-utils.js');
  const SELF = await getSpecifier(import.meta.url);

  return harden({
    sourceSpec: SELF,
    getManifestCall: [
      getManifestForGovernedContract.name,
      {
        contractBundleRef: publishRef(
          install(
            '@agoric/governance/test/swingsetTests/contractGovernor/governedContract.js',
          ),
        ),
        governorBundleRef: publishRef(
          install('@agoric/governance/src/contractGovernor.js'),
        ),
        producedKey,
        label,
      },
    ],
  });
};

/** @type {import('@agoric/deploy-script-support/src/externalTypes.js').DeployScriptFunction} */
export default async (homeP, endowments) => {
  const { scriptArgs } = endowments;
  // Dynamic import to avoid inclusion in the proposal bundle.
  const { makeHelpers } = await import('@agoric/deploy-script-support');
  const { writeCoreEval } = await makeHelpers(homeP, endowments);
  await writeCoreEval(startGovernedInstance.name, utils =>
    defaultProposalBuilder(utils, scriptArgs),
  );
};
