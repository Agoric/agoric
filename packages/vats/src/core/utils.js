// @ts-check
import { E } from '@endo/far';
import { heapZone } from '@agoric/zone';
import { provide } from '@agoric/vat-data';
import { makeNameHubKit } from '../nameHub.js';
import { Stable, Stake } from '../tokens.js';
import { makeLogHooks, makePromiseSpace } from './promise-space.js';

const { entries, fromEntries, keys } = Object;
const { Fail, quote: q } = assert;

/** @type { <K extends string, T, U>(obj: Record<K, T>, f: (k: K, v: T) => [K, U]) => Record<K, U>} */
const mapEntries = (obj, f) =>
  // @ts-expect-error entries() loses key type
  fromEntries(entries(obj).map(([p, v]) => f(p, v)));

/**
 * We reserve these keys in name hubs.
 *
 * XXX the 2nd level tables are no longer used for reservations.
 *
 * @type {{ [P in keyof WellKnownName]: { [P2 in WellKnownName[P]]: string } }}
 */
export const agoricNamesReserved = harden({
  issuer: {
    [Stake.symbol]: Stake.proposedName,
    [Stable.symbol]: Stable.proposedName,
    Attestation: 'Agoric lien attestation',
    Invitation: 'Zoe invitation',
    AUSD: 'Agoric bridged USDC',
  },
  brand: {
    [Stake.symbol]: Stake.proposedName,
    [Stable.symbol]: Stable.proposedName,
    Attestation: 'Agoric lien attestation',
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
    stakeFactory: 'stakeFactory',
    Pegasus: 'pegasus',
    reserve: 'collateral reserve',
    psm: 'Parity Stability Module',
    econCommitteeCharter: 'Charter for Econ Governance questions',
    priceAggregator: 'simple price aggregator',
  },
  instance: {
    economicCommittee: 'Economic Committee',
    VaultFactory: 'vault factory',
    feeDistributor: 'fee distributor',
    Treasury: 'Treasury', // for compatibility
    auctioneer: 'auctioneer',
    VaultFactoryGovernor: 'vault factory governor',
    stakeFactory: 'stakeFactory',
    stakeFactoryGovernor: 'stakeFactory governor',
    Pegasus: 'remote peg',
    reserve: 'collateral reserve',
    reserveGovernor: 'ReserveGovernor',
    econCommitteeCharter: 'Charter for Econ Governance questions',
    provisionPool: 'Account Provision Pool',
    walletFactory: 'Smart Wallet Factory',
  },
  oracleBrand: {
    USD: 'US Dollar',
  },
  uiConfig: {
    VaultFactory: 'vault factory',
    Treasury: 'vault factory', // compatibility
  },
});

/** @type { FeeIssuerConfig } */
export const feeIssuerConfig = {
  name: Stable.symbol,
  assetKind: Stable.assetKind,
  displayInfo: Stable.displayInfo,
};

/**
 * Wire up a remote between the comms vat and vattp.
 *
 * @param {string} addr
 * @param {{ vats: { vattp: VattpVat, comms: CommsVatRoot }}} powers
 */
export const addRemote = async (addr, { vats: { comms, vattp } }) => {
  const { transmitter, setReceiver } = await E(vattp).addRemote(addr);
  await E(comms).addRemote(addr, transmitter, setReceiver);
};
harden(addRemote);

/**
 * @param {Array<(...args) => Record<string, unknown>>} builders
 * @param  {...unknown} args
 * @returns {Record<string, unknown>}
 */
export const callProperties = (builders, ...args) =>
  fromEntries(builders.map(fn => entries(fn(...args))).flat());

/**
 * Attenuate `specimen` to only allow acccess to properties specified in `template`
 *
 * @param {true | string | Record<string, *>} template true or vat name string or recursive object
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
        if (typeof propName !== 'symbol') {
          propName in t ||
            Fail`${propName} not permitted, only ${keys(template)}`;
        }
        return t[propName];
      },
    });
  } else {
    throw Fail`unexpected template: ${q(template)}`;
  }
};
harden(extract);

/**
 * @param {true | string | Record<string, *>} permit the permit supplied by the manifest
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
 * @param { (name: string, permit: Record<string, unknown>) => unknown} opts.makeConfig
 */
export const runModuleBehaviors = ({
  allPowers,
  behaviors,
  manifest,
  makeConfig,
}) => {
  return Promise.all(
    entries(manifest).map(([name, permit]) =>
      Promise.resolve().then(() => {
        const behavior = behaviors[name];
        assert(behavior, `${name} not in ${Object.keys(behaviors).join(',')}`);
        assert.typeof(
          behavior,
          'function',
          `behaviors[${name}] is not a function; got ${behavior}`,
        );
        const powers = extractPowers(permit, allPowers);
        const config = harden(makeConfig(name, permit));
        return behavior.call(behaviors, powers, config);
      }),
    ),
  );
};
harden(runModuleBehaviors);

const noop = harden(() => {});

/**
 *
 * @param {ERef<import('../types').NameAdmin>} nameAdmin
 * @param {typeof console.log} [log]
 */
export const makePromiseSpaceForNameHub = (nameAdmin, log = noop) => {
  const logHooks = makeLogHooks(log);

  /** @type {PromiseSpace<unknown>} */
  const space = makePromiseSpace({
    hooks: harden({
      ...logHooks,
      onAddKey: name => {
        void E(nameAdmin).reserve(name);
        logHooks.onAddKey(name);
      },
      onResolve: (name, valueP) => {
        void E(nameAdmin).update(name, valueP);
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
 * @param {ERef<Pick<Awaited<AgoricNamesVat>, 'getNameHubKit'>>} provider
 * @param {typeof console.log} [log]
 * @param {string[]} [kinds]
 */
export const makeWellKnownSpaces = async (
  provider,
  log = noop,
  kinds = Object.keys(agoricNamesReserved),
) => {
  const { agoricNamesAdmin } = E.get(E(provider).getNameHubKit());
  const spaceEntries = await Promise.all(
    kinds.map(async kind => {
      const { nameAdmin } = await E(agoricNamesAdmin).provideChild(kind);
      const subSpaceLog = (...args) => log(kind, ...args);
      return [kind, makePromiseSpaceForNameHub(nameAdmin, subSpaceLog)];
    }),
  );
  const spaces = Object.fromEntries(spaceEntries);
  const typedSpaces = /** @type { WellKnownSpaces } */ (
    /** @type {any} */ (spaces)
  );
  return typedSpaces;
};

/**
 * Make the well-known agoricNames namespace so that we can
 * E(home.agoricNames).lookup('issuer', 'IST') and likewise
 * for brand, installation, instance, etc.
 *
 * @param {typeof console.log} [log]
 * @param {Record<string, Record<string, unknown>>} reserved a property
 *   for each of issuer, brand, etc. with a value whose keys are names
 *   to reserve.
 *
 * For static typing and integrating with the bootstrap permit system,
 * return { produce, consume } spaces rather than NameAdmins.
 *
 * @deprecated in favor of makeWellKnownSpaces
 *
 * @returns {{
 *   agoricNames: import('../types.js').NameHub,
 *   agoricNamesAdmin: import('../types.js').NameAdmin,
 *   spaces: WellKnownSpaces,
 * }}
 */
export const makeAgoricNamesAccess = (
  log = noop, // console.debug
  reserved = agoricNamesReserved,
) => {
  const { nameHub: agoricNames, nameAdmin: agoricNamesAdmin } =
    makeNameHubKit();

  const hubs = mapEntries(reserved, (key, _d) => {
    const { nameHub, nameAdmin } = makeNameHubKit();
    // const passableAdmin = {
    //   ...nameAdmin,
    //   update: (nameKey, val) => {
    //     assertPassable(val); // else we can't publish
    //     return nameAdmin.update(nameKey, val);
    //   },
    // };
    agoricNamesAdmin.update(key, nameHub, nameAdmin);
    return [key, { nameHub, nameAdmin }];
  });
  const spaces = mapEntries(reserved, (key, detail) => {
    const { nameAdmin } = hubs[key];
    const subSpaceLog = (...args) => log(key, ...args);
    const { produce, consume } = makePromiseSpace({ log: subSpaceLog });
    for (const k of keys(detail)) {
      nameAdmin.reserve(k);
      void consume[k].then(v => nameAdmin.update(k, v));
    }
    return [key, { produce, consume }];
  });
  const typedSpaces = /** @type { WellKnownSpaces } */ (
    /** @type {any} */ (spaces)
  );
  return {
    agoricNames,
    agoricNamesAdmin,
    spaces: typedSpaces,
  };
};

/**
 * @param {ERef<ReturnType<Awaited<VatAdminVat>['createVatAdminService']>>} svc
 * @param {unknown} criticalVatKey
 * @param {import('@agoric/zone').Zone} [zone]
 * @param {(...args: any) => void} [log]
 * @param {string} [label]
 *
 * @typedef {import('@agoric/swingset-vat').CreateVatResults} CreateVatResults as from createVatByName
 * @typedef {MapStore<string, Promise<CreateVatResults>>} VatStore
 */
export const makeVatSpace = (
  svc,
  criticalVatKey,
  zone = heapZone,
  log = noop,
  label = 'namedVat',
) => {
  const subSpaceLog = (...args) => log(label, ...args);

  /** @type {VatStore} */
  const store = zone.mapStore('vatStore');

  const createVatByName = async bundleName => {
    subSpaceLog(`createVatByName(${bundleName})`);

    const vat = await E(svc).createVatByName(bundleName, {
      critical: criticalVatKey,
      name: bundleName,
    });
    return vat;
  };

  /** @type {NamedVatPowers['namedVat']['consume']} */
  // @ts-expect-error cast
  const consume = new Proxy(
    {},
    {
      get: (_target, name, _rx) => {
        assert.typeof(name, 'string');
        return provide(store, name, createVatByName).then(vat => vat.root);
      },
    },
  );
  return { consume };
};
