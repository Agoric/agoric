import { deeplyFulfilledObject, makeTracer, objectMap } from '@agoric/internal';
import { Fail } from '@endo/errors';
import { E } from '@endo/far';
import { makeMarshal } from '@endo/marshal';
import { M } from '@endo/patterns';
import {
  FastUSDCTermsShape,
  FeeConfigShape,
  FeedPolicyShape,
} from './type-guards.js';
import { fromExternalConfig } from './utils/config-marshal.js';

/**
 * @import {DepositFacet} from '@agoric/ertp/src/types.js'
 * @import {TypedPattern} from '@agoric/internal'
 * @import {Instance, StartParams} from '@agoric/zoe/src/zoeService/utils'
 * @import {Board} from '@agoric/vats'
 * @import {ManifestBundleRef} from '@agoric/deploy-script-support/src/externalTypes.js'
 * @import {BootstrapManifest} from '@agoric/vats/src/core/lib-boot.js'
 * @import {Passable} from '@endo/marshal';
 * @import {LegibleCapData} from './utils/config-marshal.js'
 * @import {FastUsdcSF, FastUsdcTerms} from './fast-usdc.contract.ts'
 * @import {FeeConfig, FeedPolicy} from './types.js'
 */

const trace = makeTracer('FUSD-Start', true);

const contractName = 'fastUsdc';

/**
 * @typedef {{
 *   terms: FastUsdcTerms;
 *   oracles: Record<string, string>;
 *   feeConfig: FeeConfig;
 *   feedPolicy: FeedPolicy & Passable;
 * }} FastUSDCConfig
 */
/** @type {TypedPattern<FastUSDCConfig>} */
export const FastUSDCConfigShape = M.splitRecord({
  terms: FastUSDCTermsShape,
  oracles: M.recordOf(M.string(), M.string()),
  feeConfig: FeeConfigShape,
  feedPolicy: FeedPolicyShape,
});

/**
 * XXX Shouldn't the bridge or board vat handle this?
 *
 * @param {string} path
 * @param {{
 *   chainStorage: ERef<StorageNode>;
 *   board: ERef<Board>;
 * }} io
 */
const makePublishingStorageKit = async (path, { chainStorage, board }) => {
  const storageNode = await E(chainStorage).makeChildNode(path);

  const marshaller = await E(board).getPublishingMarshaller();
  return { storageNode, marshaller };
};

const BOARD_AUX = 'boardAux';
const marshalData = makeMarshal(_val => Fail`data only`);
/**
 * @param {Brand} brand
 * @param {Pick<BootstrapPowers['consume'], 'board' | 'chainStorage'>} powers
 */
const publishDisplayInfo = async (brand, { board, chainStorage }) => {
  // chainStorage type includes undefined, which doesn't apply here.
  // @ts-expect-error UNTIL https://github.com/Agoric/agoric-sdk/issues/8247
  const boardAux = E(chainStorage).makeChildNode(BOARD_AUX);
  const [id, displayInfo, allegedName] = await Promise.all([
    E(board).getId(brand),
    E(brand).getDisplayInfo(),
    E(brand).getAllegedName(),
  ]);
  const node = E(boardAux).makeChildNode(id);
  const aux = marshalData.toCapData(harden({ allegedName, displayInfo }));
  await E(node).setValue(JSON.stringify(aux));
};

const FEED_POLICY = 'feedPolicy';

/**
 * @param {ERef<StorageNode>} node
 * @param {FeedPolicy} policy
 */
const publishFeedPolicy = async (node, policy) => {
  const feedPolicy = E(node).makeChildNode(FEED_POLICY);
  await E(feedPolicy).setValue(JSON.stringify(policy));
};

/**
 * @typedef { PromiseSpaceOf<{
 *   fastUsdcKit: FastUSDCKit
 *  }> & {
 *   installation: PromiseSpaceOf<{ fastUsdc: Installation<FastUsdcSF> }>;
 *   instance: PromiseSpaceOf<{ fastUsdc: Instance<FastUsdcSF> }>;
 *   issuer: PromiseSpaceOf<{ FastLP: Issuer }>;
 *   brand: PromiseSpaceOf<{ FastLP: Brand }>;
 * }} FastUSDCCorePowers
 *
 * @typedef {StartedInstanceKitWithLabel & {
 *   privateArgs: StartParams<FastUsdcSF>['privateArgs'];
 * }} FastUSDCKit
 */

/**
 * @throws if oracle smart wallets are not yet provisioned
 *
 * @param {BootstrapPowers & FastUSDCCorePowers } powers
 * @param {{ options: LegibleCapData<FastUSDCConfig> }} config
 */
export const startFastUSDC = async (
  {
    produce: { fastUsdcKit },
    consume: {
      agoricNames,
      namesByAddress,
      board,
      chainStorage,
      chainTimerService: timerService,
      localchain,
      cosmosInterchainService,
      startUpgradable,
      zoe,
    },
    issuer: {
      produce: { FastLP: produceShareIssuer },
    },
    brand: {
      produce: { FastLP: produceShareBrand },
    },
    installation: {
      consume: { fastUsdc },
    },
    instance: {
      produce: { fastUsdc: produceInstance },
    },
  },
  config,
) => {
  trace('startFastUSDC');

  await null;
  /** @type {Issuer<'nat'>} */
  const USDCissuer = await E(agoricNames).lookup('issuer', 'USDC');
  const brands = harden({
    USDC: await E(USDCissuer).getBrand(),
  });

  const { terms, oracles, feeConfig, feedPolicy } = fromExternalConfig(
    config?.options, // just in case config is missing somehow
    brands,
    FastUSDCConfigShape,
  );
  trace('using terms', terms);
  trace('using fee config', feeConfig);

  trace('look up oracle deposit facets');
  const oracleDepositFacets = await deeplyFulfilledObject(
    objectMap(oracles, async address => {
      /** @type {DepositFacet} */
      const depositFacet = await E(namesByAddress).lookup(
        address,
        'depositFacet',
      );
      return depositFacet;
    }),
  );

  const { storageNode, marshaller } = await makePublishingStorageKit(
    contractName,
    {
      board,
      // @ts-expect-error Promise<null> case is vestigial
      chainStorage,
    },
  );

  const privateArgs = await deeplyFulfilledObject(
    harden({
      agoricNames,
      feeConfig,
      localchain,
      orchestrationService: cosmosInterchainService,
      storageNode,
      timerService,
      marshaller,
    }),
  );

  const kit = await E(startUpgradable)({
    label: contractName,
    installation: fastUsdc,
    issuerKeywordRecord: harden({ USDC: USDCissuer }),
    terms,
    privateArgs,
  });
  fastUsdcKit.resolve(harden({ ...kit, privateArgs }));
  const { instance, creatorFacet } = kit;

  await publishFeedPolicy(storageNode, feedPolicy);

  const {
    issuers: { PoolShares: shareIssuer },
    brands: { PoolShares: shareBrand },
  } = await E(zoe).getTerms(instance);
  produceShareIssuer.resolve(shareIssuer);
  produceShareBrand.resolve(shareBrand);
  await publishDisplayInfo(shareBrand, { board, chainStorage });

  await Promise.all(
    Object.entries(oracleDepositFacets).map(async ([name, depositFacet]) => {
      const address = oracles[name];
      trace('making invitation for', name, address);
      const toWatch = await E(creatorFacet).makeOperatorInvitation(address);

      const amt = await E(depositFacet).receive(toWatch);
      trace('sent', amt, 'to', name);
    }),
  );

  produceInstance.reset();
  produceInstance.resolve(instance);
  trace('startFastUSDC done', instance);
};
harden(startFastUSDC);

/**
 * @param {{
 *   restoreRef: (b: ERef<ManifestBundleRef>) => Promise<Installation>;
 * }} utils
 * @param {{
 *   installKeys: { fastUsdc: ERef<ManifestBundleRef> };
 *   options: LegibleCapData<FastUSDCConfig>;
 * }} param1
 */
export const getManifestForFastUSDC = (
  { restoreRef },
  { installKeys, options },
) => {
  return {
    /** @type {BootstrapManifest} */
    manifest: {
      [startFastUSDC.name]: {
        produce: {
          fastUsdcKit: true,
        },
        consume: {
          chainStorage: true,
          chainTimerService: true,
          localchain: true,
          cosmosInterchainService: true,

          // limited distribution durin MN2: contract installation
          startUpgradable: true,
          zoe: true, // only getTerms() is needed. XXX should be split?

          // widely shared: name services
          agoricNames: true,
          namesByAddress: true,
          board: true,
        },
        issuer: {
          produce: { FastLP: true }, // UNTIL #10432
        },
        brand: {
          produce: { FastLP: true }, // UNTIL #10432
        },
        instance: {
          produce: { fastUsdc: true },
        },
        installation: {
          consume: { fastUsdc: true },
        },
      },
    },
    installations: {
      fastUsdc: restoreRef(installKeys.fastUsdc),
    },
    options,
  };
};
