import { Fail, q } from '@endo/errors';
import { Stable, Stake } from '@agoric/internal/src/tokens.js';
import { WalletName } from '@agoric/internal';
import { E, Far } from '@endo/far';
import { makeAtomicProvider } from '@agoric/store/src/stores/store-utils.js';
import { makeScalarBigMapStore, makeScalarMapStore } from '@agoric/vat-data';
import { keyEQ } from '@agoric/store';
import { makeNameHubKit } from '../nameHub.js';
import { makeLogHooks, makePromiseSpace } from './promise-space.js';

import './types-ambient.js';

const { entries, fromEntries, keys } = Object;

/**
 * Used in bootstrap to reserve names in the agoricNames namespace before any
 * other proposals.
 *
 * @type {{
 *   [P in keyof WellKnownName]: { [P2 in WellKnownName[P]]: string };
 * }}
 */
export const agoricNamesReserved = harden({
  issuer: {
    [Stake.symbol]: Stake.proposedName,
    [Stable.symbol]: Stable.proposedName,
    Invitation: 'Zoe invitation',
    AUSD: 'Agoric bridged USDC',
  },
  brand: {
    [Stake.symbol]: Stake.proposedName,
    [Stable.symbol]: Stable.proposedName,
    AUSD: 'Agoric bridged USDC',
    Invitation: 'Zoe invitation',
    timer: 'timer service',
  },
  vbankAsset: {
    [Stake.denom]: Stake.proposedName,
    [Stable.denom]: Stable.proposedName,
  },
  installation: {
    centralSupply: 'central supply',
    mintHolder: 'mint holder',
    walletFactory: 'multitenant smart wallet',
    provisionPool: 'provision accounts with initial IST',
    contractGovernor: 'contract governor',
    committee: 'committee electorate',
    noActionElectorate: 'no action electorate',
    binaryVoteCounter: 'binary vote counter',
    VaultFactory: 'vault factory',
    auctioneer: 'auctioneer',
    feeDistributor: 'fee distributor',
    liquidate: 'liquidate',
    Pegasus: 'pegasus',
    reserve: 'collateral reserve',
    psm: 'Parity Stability Module',
    econCommitteeCharter: 'Charter for Econ Governance questions',
    priceAggregator: 'simple price aggregator',
    scaledPriceAuthority: 'scaled price authority',
    stakeAtom: 'example ATOM staking contract',
    stakeBld: 'example BLD staking contract',
  },
  instance: {
    economicCommittee: 'Economic Committee',
    VaultFactory: 'vault factory',
    feeDistributor: 'fee distributor',
    auctioneer: 'auctioneer',
    VaultFactoryGovernor: 'vault factory governor',
    Pegasus: 'remote peg',
    reserve: 'collateral reserve',
    reserveGovernor: 'ReserveGovernor',
    econCommitteeCharter: 'Charter for Econ Governance questions',
    provisionPool: 'Account Provision Pool',
    walletFactory: 'Smart Wallet Factory',
    stakeAtom: 'example ATOM staking contract',
    stakeBld: 'example BLD staking contract',
  },
  oracleBrand: {
    USD: 'US Dollar',
  },
  uiConfig: {
    VaultFactory: 'vault factory',
  },
});

/** @type {FeeIssuerConfig} */
export const feeIssuerConfig = {
  name: Stable.symbol,
  assetKind: Stable.assetKind,
  displayInfo: Stable.displayInfo,
};

/**
 * Wire up a remote between the comms vat and vattp.
 *
 * @param {string} addr
 * @param {{ vats: { vattp: VattpVat; comms: CommsVatRoot } }} powers
 */
export const addRemote = async (addr, { vats: { comms, vattp } }) => {
  const { transmitter, setReceiver } = await E(vattp).addRemote(addr);
  await E(comms).addRemote(addr, transmitter, setReceiver);
};
harden(addRemote);

/**
 * @param {((...args) => Record<string, unknown>)[]} builders
 * @param {...unknown} args
 * @returns {Record<string, unknown>}
 */
export const callProperties = (builders, ...args) =>
  fromEntries(builders.map(fn => entries(fn(...args))).flat());

/**
 * Attenuate `specimen` to only allow access to properties specified in
 * `template`
 *
 * @param {true | string | Record<string, any>} template true or vat name string
 *   or recursive object
 * @param {unknown} specimen
 * @param {string[]} [path]
 */
export const extract = (template, specimen, path = []) => {
  if (template === true || typeof template === 'string') {
    return specimen;
  } else if (typeof template === 'object' && template !== null) {
    if (typeof specimen !== 'object' || specimen === null) {
      throw Fail`object template ${q(
        template,
      )} requires object specimen at [${q(path.join('.'))}], not ${q(
        specimen,
      )}`;
    }
    const target = harden(
      fromEntries(
        entries(template).map(([propName, subTemplate]) => [
          propName,
          extract(subTemplate, specimen[propName], [...path, propName]),
        ]),
      ),
    );
    return new Proxy(target, {
      get: (t, propName) => {
        propName in t ||
          Fail`${q(propName)} not permitted, only ${q(keys(template))}`;
        return t[propName];
      },
    });
  } else {
    throw Fail`unexpected template: ${q(template)}`;
  }
};
harden(extract);

/**
 * @param {true | string | Record<string, any>} permit the permit supplied by
 *   the manifest
 * @param {unknown} allPowers the powers to attenuate
 */
export const extractPowers = (permit, allPowers) => {
  if (typeof permit === 'object' && permit !== null) {
    const {
      // TODO: use these for more than just visualization.
      home: _h,
      ...effectivePermit
    } = /** @type {Record<string, unknown>} */ (permit);
    permit = effectivePermit;
  }
  return extract(permit, allPowers);
};
harden(extractPowers);

/**
 * @param {object} opts
 * @param {unknown} opts.allPowers
 * @param {Record<string, unknown>} opts.behaviors
 * @param {Record<string, Record<string, unknown>>} opts.manifest
 * @param {(name: string, permit: Record<string, unknown>) => unknown} opts.makeConfig
 */
export const runModuleBehaviors = ({
  allPowers,
  behaviors,
  manifest,
  makeConfig,
}) => {
  return Promise.all(
    entries(manifest).map(async ([name, permit]) => {
      await null;
      const behavior = behaviors[name];
      if (typeof behavior !== 'function') {
        const behaviorKeys = Reflect.ownKeys(behaviors).map(key =>
          typeof key === 'string' ? JSON.stringify(key) : String(key),
        );
        const keysStr = `[${behaviorKeys.join(', ')}]`;
        throw Fail`${q(name)} is not a function in ${keysStr}: ${behavior}`;
      }
      const powers = extractPowers(permit, allPowers);
      const config = harden(makeConfig(name, permit));
      return Reflect.apply(behavior, behaviors, [powers, config]);
    }),
  );
};
harden(runModuleBehaviors);

const noop = harden(() => {});

/**
 * @param {ERef<import('../types.js').NameAdmin>} nameAdmin
 * @param {typeof console.log} [log]
 */
export const makePromiseSpaceForNameHub = (nameAdmin, log = noop) => {
  const logHooks = makeLogHooks(log);

  /** @type {PromiseSpaceOf<any>} */
  const space = makePromiseSpace({
    hooks: harden({
      ...logHooks,
      onAddKey: name => {
        void E(nameAdmin).reserve(name);
        logHooks.onAddKey(name);
      },
      onResolve: (name, valueP) => {
        void E.when(valueP, value => E(nameAdmin).update(name, value));
      },
      onReset: name => {
        void E(nameAdmin).delete(name);
      },
    }),
    log,
  });

  return space;
};

/**
 * @param {ERef<import('../types.js').NameAdmin>} parentAdmin
 * @param {typeof console.log} [log]
 * @param {string[]} [kinds]
 */
export const makeWellKnownSpaces = async (
  parentAdmin,
  log = noop,
  kinds = Object.keys(agoricNamesReserved),
) => {
  const spaceEntries = await Promise.all(
    kinds.map(async kind => {
      const { nameAdmin } = await E(parentAdmin).provideChild(kind);
      const subSpaceLog = (...args) => log(kind, ...args);
      const entry = [kind, makePromiseSpaceForNameHub(nameAdmin, subSpaceLog)];
      return entry;
    }),
  );
  const spaces = Object.fromEntries(spaceEntries);
  const typedSpaces = /** @type {WellKnownSpaces} */ (
    /** @type {any} */ (spaces)
  );
  return typedSpaces;
};

/**
 * Make the well-known agoricNames namespace so that we can
 * E(home.agoricNames).lookup('issuer', 'IST') and likewise for brand,
 * installation, instance, etc.
 *
 * @deprecated use vat-agoricNames, makeWellKnownSpaces
 * @param {typeof console.log} [log]
 * @param {Record<string, Record<string, unknown>>} reserved a property for each
 *   of issuer, brand, etc. with a value whose keys are names to reserve.
 *
 *   For static typing and integrating with the bootstrap permit system, return {
 *   produce, consume } spaces rather than NameAdmins.
 * @returns {Promise<{
 *   agoricNames: import('../types.js').NameHub;
 *   agoricNamesAdmin: import('../types.js').NameAdmin;
 *   spaces: WellKnownSpaces;
 * }>}
 */
export const makeAgoricNamesAccess = async (
  log = () => {}, // console.debug
  reserved = agoricNamesReserved,
) => {
  const { nameHub: agoricNames, nameAdmin: agoricNamesAdmin } =
    makeNameHubKit();
  const spaces = await makeWellKnownSpaces(
    agoricNamesAdmin,
    log,
    Object.keys(reserved),
  );

  const typedSpaces = /** @type {WellKnownSpaces} */ (
    /** @type {any} */ (spaces)
  );
  return {
    agoricNames,
    agoricNamesAdmin,
    spaces: typedSpaces,
  };
};

/**
 * @deprecated use nameAdmin.provideChild() instead
 * @param {string} address
 */
export const makeMyAddressNameAdminKit = address => {
  // Create a name hub for this address.
  const { nameHub, nameAdmin: rawMyAddressNameAdmin } = makeNameHubKit();

  /** @type {import('../types.js').MyAddressNameAdmin} */
  const myAddressNameAdmin = Far('myAddressNameAdmin', {
    ...rawMyAddressNameAdmin,
    getMyAddress: () => address,
  });
  // reserve space for deposit facet
  // XXX deprecated utility used only in solo
  void myAddressNameAdmin.reserve(WalletName.depositFacet);

  return { nameHub, myAddressNameAdmin };
};

/** @typedef {MapStore<string, CreateVatResults>} VatStore */

/**
 * @param {ERef<ReturnType<Awaited<VatAdminVat>['createVatAdminService']>>} svc
 * @param {unknown} criticalVatKey
 * @param {(...args: any) => void} [log]
 * @param {string} [label]
 * @import {CreateVatResults} from '@agoric/swingset-vat'
 *   as from createVatByName
 */
export const makeVatSpace = (
  svc,
  criticalVatKey,
  log = noop,
  label = 'namedVat',
) => {
  const subSpaceLog = (...args) => log(label, ...args);

  // XXX share vat stores with makeVatsFromBundles
  const durableStore = makeScalarBigMapStore('Vat space backing', {
    durable: true,
  });

  // XXX Only remotables can be keys of scalar WeakMapStores
  /** @type {MapStore<string, CreateVatResults>} */
  const tmpStore = makeScalarMapStore();

  const createVatByName = async bundleName => {
    subSpaceLog(`vatSpace: createVatByName(${bundleName})`);

    const vatInfo = await E(svc).createVatByName(bundleName, {
      critical: criticalVatKey,
      name: bundleName,
    });
    return vatInfo;
  };

  const { provideAsync } = makeAtomicProvider(tmpStore);
  /** @type {NamedVatPowers['namedVat']['consume']} */
  // @ts-expect-error cast
  const consume = new Proxy(
    {},
    {
      get: (_target, name, _rx) => {
        assert.typeof(name, 'string');
        return provideAsync(name, createVatByName).then(vat => {
          if (!durableStore.has(name)) {
            durableStore.init(name, vat);
          } else {
            keyEQ(vat, durableStore.get(name)) || Fail`duplicate vat ${name}`;
          }
          return vat.root;
        });
      },
    },
  );
  return { space: { consume }, durableStore };
};
