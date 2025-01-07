// @ts-nocheck -- lots of type errors. low prio b/c proposals are like scripts
import { makeTracer } from '@agoric/internal';
import {
  assertPathSegment,
  makeStorageNodeChild,
} from '@agoric/internal/src/lib-chainStorage.js';
import { E } from '@endo/far';

import { unitAmount } from '@agoric/zoe/src/contractSupport/priceQuote.js';
import {
  oracleBrandFeedName,
  reserveThenDeposit,
  reserveThenGetNames,
} from './utils.js';

// backwards compatibility
export { oracleBrandFeedName as instanceNameFor };

const trace = makeTracer('RunPriceFeed', true);

/** @type {(name: string) => string} */
const sanitizePathSegment = name => {
  const candidate = name.replace(/ /g, '_');
  assertPathSegment(candidate);
  return candidate;
};

/**
 * @typedef {{
 *   brandIn?: ERef<Brand<'nat'> | undefined>;
 *   brandOut?: ERef<Brand<'nat'> | undefined>;
 *   IN_BRAND_NAME: string;
 *   IN_BRAND_DECIMALS: string;
 *   OUT_BRAND_NAME: string;
 *   OUT_BRAND_DECIMALS: string;
 * }} PriceFeedOptions
 */

/**
 * Create inert brands (no mint or issuer) referred to by price oracles.
 *
 * @param {ChainBootstrapSpace & NamedVatPowers} space
 * @param {{ options: { priceFeedOptions: PriceFeedOptions } }} opt
 * @returns {Promise<[Brand<'nat'>, Brand<'nat'>]>}
 */
export const ensureOracleBrands = async (
  {
    namedVat: {
      consume: { agoricNames },
    },
    oracleBrand: { produce: oracleBrandProduce },
  },
  {
    options: {
      priceFeedOptions: {
        brandIn: rawBrandIn,
        brandOut: rawBrandOut,
        IN_BRAND_NAME,
        IN_BRAND_DECIMALS,
        OUT_BRAND_NAME,
        OUT_BRAND_DECIMALS,
      },
    },
  },
) => {
  const updateFreshBrand = async (brand, name, decimals) => {
    let b = await brand;
    if (!b) {
      // not 1st await
      b = await E(agoricNames).provideInertBrand(
        name,
        harden({ decimalPlaces: parseInt(decimals, 10) }),
      );
    }
    oracleBrandProduce[name].resolve(b);
  };

  return Promise.all([
    updateFreshBrand(rawBrandIn, IN_BRAND_NAME, IN_BRAND_DECIMALS),
    updateFreshBrand(rawBrandOut, OUT_BRAND_NAME, OUT_BRAND_DECIMALS),
  ]);
};

/**
 * @param {ChainBootstrapSpace} powers
 * @param {{
 *   options: {
 *     priceFeedOptions: {
 *       AGORIC_INSTANCE_NAME: string;
 *       oracleAddresses: string[];
 *       contractTerms: import('@agoric/inter-protocol/src/price/fluxAggregatorKit.js').ChainlinkConfig;
 *       IN_BRAND_NAME: string;
 *       OUT_BRAND_NAME: string;
 *       priceAggregatorRef: Installation;
 *     };
 *   };
 * }} config
 */
export const createPriceFeed = async (
  {
    consume: {
      agoricNamesAdmin,
      board,
      chainStorage,
      chainTimerService,
      client,
      econCharterKit,
      highPrioritySendersManager,
      namesByAddressAdmin,
      priceAuthority,
      priceAuthorityAdmin,
      startGovernedUpgradable,
      zoe,
    },
    instance: { produce: produceInstance },
  },
  {
    options: {
      priceFeedOptions: {
        AGORIC_INSTANCE_NAME,
        oracleAddresses,
        contractTerms,
        IN_BRAND_NAME,
        OUT_BRAND_NAME,
        priceAggregatorRef,
      },
    },
  },
) => {
  trace('createPriceFeed', AGORIC_INSTANCE_NAME);
  const STORAGE_PATH = 'priceFeed';

  void E(client).assignBundle([_addr => ({ priceAuthority })]);

  let installationP;
  await null;
  if (priceAggregatorRef) {
    const bundleID = await E.get(priceAggregatorRef).bundleID;
    if (bundleID) {
      installationP = E(zoe).installBundleID(bundleID);
      await E.when(
        installationP,
        async installation =>
          E(E(agoricNamesAdmin).lookupAdmin('installation')).update(
            'priceAggregator',
            installation,
          ),
        err =>
          console.error(
            `🚨 failed to update priceAggregator installation for ${AGORIC_INSTANCE_NAME}`,
            err,
          ),
      );
    }
  }
  if (!installationP) {
    installationP = E.get(
      reserveThenGetNames(E(agoricNamesAdmin).lookupAdmin('installation'), [
        'priceAggregator',
      ]),
    )[0];
    console.error(
      '🚨 failed to install new fluxAggregator bundle, reusing previous one.',
    );
  }

  /**
   * @type {[
   *   [Brand<'nat'>, Brand<'nat'>],
   *   Installation<import('@agoric/inter-protocol/src/price/fluxAggregatorContract.js')['start]>,
   *   Timer,
   * ]}
   */
  const [[brandIn, brandOut], installation, timer] = await Promise.all([
    reserveThenGetNames(E(agoricNamesAdmin).lookupAdmin('oracleBrand'), [
      IN_BRAND_NAME,
      OUT_BRAND_NAME,
    ]),
    installationP,
    chainTimerService,
  ]);

  const unitAmountIn = await unitAmount(brandIn);
  const terms = harden({
    ...contractTerms,
    description: AGORIC_INSTANCE_NAME,
    brandIn,
    brandOut,
    timer,
    unitAmountIn,
  });
  const label = sanitizePathSegment(AGORIC_INSTANCE_NAME);

  const storageNode = await makeStorageNodeChild(chainStorage, STORAGE_PATH);
  const marshaller = await E(board).getReadonlyMarshaller();

  const faKit = await E(startGovernedUpgradable)({
    governedParams: {},
    privateArgs: {
      highPrioritySendersManager: await highPrioritySendersManager,
      marshaller,
      namesByAddressAdmin,
      storageNode: await E(storageNode).makeChildNode(label),
    },
    terms,
    label,
    installation,
  });

  // Publish price feed in home.priceAuthority.
  const forceReplace = true;
  // Make sure this PA is registered before sharing the instance in agoricNames,
  // which allows contracts that depend on the registry value to wait for it and
  // prevent a race.
  await E(priceAuthorityAdmin).registerPriceAuthority(
    E(faKit.publicFacet).getPriceAuthority(),
    brandIn,
    brandOut,
    forceReplace,
  );

  await E(E(agoricNamesAdmin).lookupAdmin('instance'))
    .update(AGORIC_INSTANCE_NAME, faKit.instance)
    .catch(err =>
      console.error(`🚨 failed to update ${AGORIC_INSTANCE_NAME}`, err),
    );

  // being after the above awaits means that when this resolves, the consumer
  // gets notified that the authority is in the registry and its instance is in
  // agoricNames. reset() in case we're replacing an existing feed.
  produceInstance[AGORIC_INSTANCE_NAME].reset();
  produceInstance[AGORIC_INSTANCE_NAME].resolve(faKit.instance);

  E(E.get(econCharterKit).creatorFacet).addInstance(
    faKit.instance,
    faKit.governorCreatorFacet,
    AGORIC_INSTANCE_NAME,
  );

  /**
   * Initialize a new oracle and send an invitation to administer it.
   *
   * @param {string} addr
   */
  const addOracle = async addr => {
    const invitation = await E(faKit.creatorFacet).makeOracleInvitation(addr);
    const debugName = `${AGORIC_INSTANCE_NAME} member ${addr}`;
    await reserveThenDeposit(debugName, namesByAddressAdmin, addr, [
      invitation,
    ]).catch(err => console.error(`failed deposit to ${debugName}`, err));
  };

  trace('distributing invitations', oracleAddresses);
  // This doesn't resolve until oracle operators create their smart wallets.
  // Don't block bootstrap on it.
  void Promise.all(oracleAddresses.map(addOracle));
  trace('createPriceFeed complete');
};

const t = 'priceFeed';
/**
 * Add a price feed to a running chain, returning the manifest, installations,
 * and options.
 *
 * @param {object} utils
 * @param {(ref: unknown) => Promise<unknown>} [utils.restoreRef]
 * @param {PriceFeedOptions} priceFeedOptions
 */
export const getManifestForPriceFeed = async (
  { restoreRef },
  priceFeedOptions,
) => ({
  manifest: {
    [createPriceFeed.name]: {
      consume: {
        agoricNamesAdmin: t,
        board: t,
        chainStorage: t,
        chainTimerService: t,
        client: t,
        econCharterKit: t,
        highPrioritySendersManager: t,
        namesByAddressAdmin: t,
        priceAuthority: t,
        priceAuthorityAdmin: t,
        startGovernedUpgradable: t,
        zoe: t,
      },
      instance: {
        produce: t,
      },
    },
    [ensureOracleBrands.name]: {
      namedVat: {
        consume: { agoricNames: 'agoricNames' },
      },
      oracleBrand: {
        produce: t,
      },
    },
  },
  installations: {
    // ??? will every eval of price-feed-proposal install priceAggregator ?
    priceAggregator: restoreRef(priceFeedOptions.priceAggregatorRef),
  },
  options: {
    priceFeedOptions: {
      brandIn:
        priceFeedOptions.brandInRef && restoreRef(priceFeedOptions.brandInRef),
      brandOut:
        priceFeedOptions.brandOutRef &&
        restoreRef(priceFeedOptions.brandeOutRef),
      ...priceFeedOptions,
    },
  },
});

/**
 * @param {import('./econ-behaviors.js').EconomyBootstrapPowers} powers
 * @param {object} [config]
 * @param {object} [config.options]
 * @param {string[]} [config.options.demoOracleAddresses]
 */
export const startPriceFeeds = async (
  {
    consume,
    produce,
    installation: {
      consume: { priceAggregator },
    },
  },
  { options: { demoOracleAddresses = [] } = {} },
) => {
  trace('startPriceFeeds');

  // eventually this will have be parameterized. for now we just need one contract
  // working well enough to build tooling around.
  const inBrandName = 'ATOM';
  const outBrandName = 'USD';

  /** @type {ERef<NameAdmin>} */
  const installAdmin = E(consume.agoricNamesAdmin).lookupAdmin('installation');
  await E(installAdmin).update('priceAggregator', priceAggregator);

  await ensureOracleBrands(
    { consume },
    {
      options: {
        priceFeedOptions: {
          IN_BRAND_NAME: inBrandName,
          IN_BRAND_DECIMALS: '6',
          OUT_BRAND_NAME: outBrandName,
          OUT_BRAND_DECIMALS: '6',
        },
      },
    },
  );

  await createPriceFeed(
    { consume, produce },
    {
      options: {
        priceFeedOptions: {
          AGORIC_INSTANCE_NAME: oracleBrandFeedName(inBrandName, outBrandName),
          contractTerms: {
            minSubmissionCount: 2,
            minSubmissionValue: 1,
            maxSubmissionCount: 5,
            maxSubmissionValue: 99999,
            restartDelay: 1n,
            timeout: 10,
          },
          oracleAddresses: demoOracleAddresses,
          IN_BRAND_NAME: inBrandName,
          OUT_BRAND_NAME: outBrandName,
        },
      },
    },
  );
  trace('startPriceFeeds complete');
};
harden(startPriceFeeds);
