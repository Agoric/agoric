// @ts-check
import { Fail } from '@endo/errors';
import { deeplyFulfilledObject } from '@agoric/internal';
import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';

import { defangAndTrim, stringify } from './code-gen.js';
import {
  makeCoreProposalBehavior,
  makeEnactCoreProposalsFromBundleRef,
} from './coreProposalBehavior.js';

/**
 * @typedef {string | {module: string, entrypoint?: string, args?: Array<unknown>}} ConfigProposal
 */

/**
 * @typedef {{steps: ConfigProposal[][]}} SequentialCoreProposals
 * @typedef {ConfigProposal[] | SequentialCoreProposals} CoreProposals
 */

const req = createRequire(import.meta.url);

/**
 * @param  {...(CoreProposals | undefined | null)} args
 * @returns {SequentialCoreProposals}
 */
export const mergeCoreProposals = (...args) => {
  /** @type {ConfigProposal[][]} */
  const steps = [];
  for (const coreProposal of args) {
    if (!coreProposal) {
      continue;
    }
    if ('steps' in coreProposal) {
      steps.push(...coreProposal.steps);
    } else {
      steps.push(coreProposal);
    }
  }
  return harden({ steps });
};
harden(mergeCoreProposals);

/**
 * @param {(ModuleSpecifier | FilePath)[]} paths
 * @typedef {string} ModuleSpecifier
 * @typedef {string} FilePath
 */
const pathResolve = (...paths) => {
  const fileName = /** @type {string} */ (paths.pop());
  fileName || Fail`base name required`;
  try {
    return req.resolve(fileName, {
      paths,
    });
  } catch (e) {
    return path.resolve(...paths, fileName);
  }
};

const findModule = (initDir, srcSpec) =>
  srcSpec.match(/^(\.\.?)?\//)
    ? pathResolve(initDir, srcSpec)
    : req.resolve(srcSpec);

/**
 * @param {{ bundleID?: string, bundleName?: string }} handle - mutated then hardened
 * @param {string} sourceSpec - the specifier of a module to load
 * @param {string} key - the key of the proposal
 * @param {string} piece - the piece of the proposal
 * @returns {Promise<[string, any]>}
 */
const namedHandleToBundleSpec = async (handle, sourceSpec, key, piece) => {
  handle.bundleName = `coreProposal${String(key)}_${piece}`;
  harden(handle);
  return harden([handle.bundleName, { sourceSpec }]);
};

/**
 * Format core proposals to be run at bootstrap:
 * SwingSet `bundles` configuration
 * and `code` to execute them, interpolating functions
 * such as `makeCoreProposalBehavior`.
 *
 * Core proposals are proposals for use with swingset-core-eval.
 * In production, they are triggered by BLD holder governance decisions,
 * but for sim-chain and such, they can be declared statically in
 * the chain configuration, in which case they are run at bootstrap.
 *
 * @param {CoreProposals} coreProposals - governance
 * proposals to run at chain bootstrap for scenarios such as sim-chain.
 * @param {FilePath} [dirname]
 * @param {object} [opts]
 * @param {typeof makeEnactCoreProposalsFromBundleRef} [opts.makeEnactCoreProposals]
 * @param {(key: PropertyKey) => PropertyKey} [opts.getSequenceForProposal]
 * @param {typeof namedHandleToBundleSpec} [opts.handleToBundleSpec]
 */
export const extractCoreProposalBundles = async (
  coreProposals,
  dirname = '.',
  opts,
) => {
  const {
    makeEnactCoreProposals = makeEnactCoreProposalsFromBundleRef,
    getSequenceForProposal = key => key,
    handleToBundleSpec = namedHandleToBundleSpec,
  } = opts || {};

  dirname = pathResolve(dirname);
  dirname = await fs.promises
    .stat(dirname)
    .then(stbuf => (stbuf.isDirectory() ? dirname : path.dirname(dirname)));

  /** @type {Map<{ bundleID?: string, bundleName?: string }, { source: string, bundle?: string }>} */
  const bundleHandleToAbsolutePaths = new Map();

  const proposalSteps =
    'steps' in coreProposals ? coreProposals.steps : [coreProposals];
  const bundleToSource = new Map();
  const extractedSteps = await Promise.all(
    proposalSteps.map(async (proposalStep, i) =>
      Promise.all(
        proposalStep.map(async (coreProposal, j) => {
          const key = `${i}.${j}`;
          // console.debug(`Parsing core proposal:`, coreProposal);

          /** @type {string} */
          let entrypoint;
          /** @type {unknown[]} */
          let args;
          /** @type {string} */
          let module;
          if (typeof coreProposal === 'string') {
            module = coreProposal;
            entrypoint = 'defaultProposalBuilder';
            args = [];
          } else {
            ({
              module,
              entrypoint = 'defaultProposalBuilder',
              args = [],
            } = coreProposal);
          }

          typeof module === 'string' ||
            Fail`coreProposal module ${module} must be string`;
          typeof entrypoint === 'string' ||
            Fail`coreProposal entrypoint ${entrypoint} must be string`;
          Array.isArray(args) || Fail`coreProposal args ${args} must be array`;

          const thisProposalBundleHandles = new Set();
          assert(getSequenceForProposal);
          const thisProposalSequence = getSequenceForProposal(key);
          const initPath = findModule(dirname, module);
          const initDir = path.dirname(initPath);
          /** @type {Record<string, import('./externalTypes.js').CoreEvalBuilder>} */
          const ns = await import(initPath);
          const install = (srcSpec, bundlePath) => {
            const absoluteSrc = findModule(initDir, srcSpec);
            const bundleHandle = {};
            const absolutePaths = { source: absoluteSrc };
            if (bundlePath) {
              const absoluteBundle = pathResolve(initDir, bundlePath);
              absolutePaths.bundle = absoluteBundle;
              const oldSource = bundleToSource.get(absoluteBundle);
              if (oldSource) {
                oldSource === absoluteSrc ||
                  Fail`${bundlePath} already installed from ${oldSource}, now ${absoluteSrc}`;
              } else {
                bundleToSource.set(absoluteBundle, absoluteSrc);
              }
            }
            // Don't harden the bundleHandle since we need to set the bundleName on
            // its unique identity later.
            thisProposalBundleHandles.add(bundleHandle);
            bundleHandleToAbsolutePaths.set(
              bundleHandle,
              harden(absolutePaths),
            );
            return bundleHandle;
          };
          /** @type {import('./externalTypes.js').PublishBundleRef} */
          const publishRef = async handleP => {
            const handle = await handleP;
            bundleHandleToAbsolutePaths.has(handle) ||
              Fail`${handle} not in installed bundles`;
            return handle;
          };
          const proposal = await ns[entrypoint](
            {
              publishRef,
              // @ts-expect-error not statically verified to return a full obj
              install,
            },
            ...args,
          );

          // Add the proposal bundle handles in sorted order.
          const bundleSpecEntries = await Promise.all(
            [...thisProposalBundleHandles.keys()]
              .map(handle => [handle, bundleHandleToAbsolutePaths.get(handle)])
              .sort(([_hnda, { source: a }], [_hndb, { source: b }]) => {
                if (a < b) {
                  return -1;
                }
                if (a > b) {
                  return 1;
                }
                return 0;
              })
              .map(async ([handle, absolutePaths], k) => {
                // Transform the bundle handle identity into a bundleName reference.
                const specEntry = await handleToBundleSpec(
                  handle,
                  absolutePaths.source,
                  thisProposalSequence,
                  String(k),
                );
                harden(handle);
                return specEntry;
              }),
          );

          // Now that we've assigned all the bundleNames and hardened the
          // handles, we can extract the behavior bundle.
          const { sourceSpec, getManifestCall } = await deeplyFulfilledObject(
            harden(proposal),
          );

          const proposalSource = pathResolve(initDir, sourceSpec);
          const proposalNS = await import(proposalSource);
          const [manifestGetterName, ...manifestGetterArgs] = getManifestCall;
          manifestGetterName in proposalNS ||
            Fail`proposal ${proposalSource} missing export ${manifestGetterName}`;
          const { manifest: customManifest } = await proposalNS[
            manifestGetterName
          ](harden({ restoreRef: () => null }), ...manifestGetterArgs);

          const behaviorBundleHandle = {};
          const specEntry = await handleToBundleSpec(
            behaviorBundleHandle,
            proposalSource,
            thisProposalSequence,
            'proposalNS',
          );
          bundleSpecEntries.unshift(specEntry);

          bundleHandleToAbsolutePaths.set(
            behaviorBundleHandle,
            harden({
              source: proposalSource,
            }),
          );

          return /** @type {const} */ ([
            key,
            {
              ref: behaviorBundleHandle,
              call: getManifestCall,
              customManifest,
              bundleSpecs: bundleSpecEntries,
            },
          ]);
        }),
      ),
    ),
  );

  // Extract all the bundle specs in already-sorted order.
  const bundles = Object.fromEntries(
    extractedSteps.flatMap(step =>
      step.flatMap(([_key, { bundleSpecs }]) => bundleSpecs),
    ),
  );
  harden(bundles);

  const codeSteps = extractedSteps.map(extractedStep => {
    // Extract the manifest references and calls.
    const metadataRecords = extractedStep.map(([_key, extractedSpec]) => {
      const { ref, call, customManifest } = extractedSpec;
      return { ref, call, customManifest };
    });
    harden(metadataRecords);

    const code = `\
// This is generated by @agoric/deploy-script-support/src/extract-proposal.js - DO NOT EDIT
/* eslint-disable */

const metadataRecords = harden(${stringify(metadataRecords, true)});

// Make an enactCoreProposals function and "export" it by way of script completion value.
// It is constructed by an IIFE to ensure the absence of global bindings for
// makeCoreProposalBehavior and makeEnactCoreProposals (the latter referencing the former),
// which may not be necessary but preserves behavior pre-dating
// https://github.com/Agoric/agoric-sdk/pull/8712 .
const enactCoreProposals = ((
  makeCoreProposalBehavior = ${makeCoreProposalBehavior},
  makeEnactCoreProposals = ${makeEnactCoreProposals},
) => makeEnactCoreProposals({ metadataRecords, E }))();
enactCoreProposals;
`;
    return defangAndTrim(code);
  });

  // console.debug('created bundles from proposals:', coreProposals, bundles);
  return harden({
    bundles,
    codeSteps,
    bundleHandleToAbsolutePaths,
  });
};
