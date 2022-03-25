// @ts-check
import { E } from '@endo/far';
import { AssetKind } from '@agoric/ertp';
import { makePromiseKit } from '@endo/promise-kit';
import { makeNameHubKit } from '../nameHub.js';

const { entries, fromEntries, keys } = Object;
const { details: X, quote: q } = assert;

/**
 * @type {<K extends string, T, U>(
 *   obj: Record<K, T>,
 *   f: (k: K, v: T) => [K, U],
 * ) => Record<K, U>}
 */
const mapEntries = (obj, f) =>
  // @ts-ignore entries() loses key type
  fromEntries(entries(obj).map(([p, v]) => f(p, v)));

// TODO: phase out ./issuers.js
export const CENTRAL_ISSUER_NAME = 'RUN';

// We reserve these keys in name hubs.
export const agoricNamesReserved = harden({
  issuer: {
    BLD: 'Agoric staking token',
    RUN: 'Agoric RUN currency',
    Attestation: 'Agoric lien attestation',
  },
  brand: {
    BLD: 'Agoric staking token',
    RUN: 'Agoric RUN currency',
    Attestation: 'Agoric lien attestation',
  },
  installation: {
    contractGovernor: 'contract governor',
    committee: 'committee electorate',
    noActionElectorate: 'no action electorate',
    binaryVoteCounter: 'binary vote counter',
    amm: 'Automated Market Maker',
    VaultFactory: 'vault factory',
    liquidate: 'liquidate',
    getRUN: 'getRUN',
    pegasus: 'pegasus',
  },
  instance: {
    economicCommittee: 'Economic Committee',
    amm: 'Automated Market Maker',
    ammGovernor: 'AMM Governor',
    VaultFactory: 'vault factory',
    Treasury: 'Treasury', // for compatibility
    VaultFactoryGovernor: 'vault factory governor',
    liquidate: 'liquidate',
    getRUN: 'getRUN',
    getRUNGovernor: 'getRUN governor',
    Pegasus: 'remote peg',
  },
  uiConfig: {
    VaultFactory: 'vault factory',
    Treasury: 'vault factory', // compatibility
  },
});

/** @type {FeeIssuerConfig} */
export const feeIssuerConfig = {
  name: CENTRAL_ISSUER_NAME,
  assetKind: AssetKind.NAT,
  displayInfo: { decimalPlaces: 6, assetKind: AssetKind.NAT },
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
 * Make { produce, consume } where for each name, `consume[name]` is a promise
 * and `produce[name].resolve` resolves it.
 *
 * Note: repeated resolves() are noops.
 *
 * @param {typeof console.log} [log]
 * @returns {PromiseSpace}
 */
export const makePromiseSpace = (log = (..._args) => {}) => {
  /** @type {Map<string, PromiseRecord<unknown>>} */
  const state = new Map();
  const remaining = new Set();

  const findOrCreateKit = name => {
    let kit = state.get(name);
    if (!kit) {
      log(`${name}: new Promise`);
      kit = makePromiseKit();
      state.set(name, kit);
      remaining.add(name);
    }
    return kit;
  };

  const consume = new Proxy(
    {},
    {
      get: (_target, name) => {
        assert.typeof(name, 'string');
        const kit = findOrCreateKit(name);
        return kit.promise;
      },
    },
  );

  const produce = new Proxy(
    {},
    {
      get: (_target, name) => {
        assert.typeof(name, 'string');
        const { resolve, promise } = findOrCreateKit(name);
        promise.finally(() => {
          remaining.delete(name);
          log(name, 'settled; remaining:', [...remaining.keys()].sort());
        });
        return harden({ resolve });
      },
    },
  );

  return harden({ produce, consume });
};
harden(makePromiseSpace);

/**
 * @param {unknown} template True or vat name string or recursive object
 * @param {unknown} specimen
 */
export const extract = (template, specimen) => {
  if (template === true || typeof template === 'string') {
    return specimen;
  } else if (typeof template === 'object' && template !== null) {
    if (typeof specimen !== 'object' || specimen === null) {
      assert.fail(
        X`object template ${q(template)} requires object specimen, not ${q(
          specimen,
        )}`,
      );
    }
    const target = harden(
      fromEntries(
        entries(template).map(([propName, subTemplate]) => [
          propName,
          extract(subTemplate, specimen[propName]),
        ]),
      ),
    );
    return new Proxy(target, {
      get: (t, propName) => {
        if (typeof propName !== 'symbol') {
          assert(
            propName in t,
            X`${propName} not permitted, only ${keys(template)}`,
          );
        }
        return t[propName];
      },
    });
  } else {
    assert.fail(X`unexpected template: ${q(template)}`);
  }
};
harden(extract);

/**
 * @param {unknown} permit The permit supplied by the manifest
 * @param {unknown} allPowers The powers to attenuate
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
 * Make the well-known agoricNames namespace so that we can
 * E(home.agoricNames).lookup('issuer', 'RUN') and likewise for brand,
 * installation, instance, etc.
 *
 * @param {typeof console.log} [log]
 * @param {Record<string, Record<string, unknown>>} reserved A property for each
 *   of issuer, brand, etc. with a value whose keys are names to reserve.
 *
 *   For static typing and integrating with the bootstrap permit system, return {
 *   produce, consume } spaces rather than NameAdmins.
 * @returns {{
 *   agoricNames: NameHub;
 *   spaces: WellKnownSpaces;
 * }}
 */
export const makeAgoricNamesAccess = (
  log = () => {}, // console.debug
  reserved = agoricNamesReserved,
) => {
  const { nameHub: agoricNames, nameAdmin: agoricNamesAdmin } =
    makeNameHubKit();
  const hubs = mapEntries(reserved, (key, _d) => {
    const { nameHub, nameAdmin } = makeNameHubKit();
    agoricNamesAdmin.update(key, nameHub);
    return [key, { nameHub, nameAdmin }];
  });
  const spaces = mapEntries(reserved, (key, detail) => {
    const { nameAdmin } = hubs[key];
    const subSpaceLog = (...args) => log(key, ...args);
    const { produce, consume } = makePromiseSpace(subSpaceLog);
    keys(detail).forEach(k => {
      nameAdmin.reserve(k);
      consume[k].then(v => nameAdmin.update(k, v));
    });
    return [key, { produce, consume }];
  });
  const typedSpaces = /** @type {WellKnownSpaces} */ (
    /** @type {any} */ (spaces)
  );
  return {
    agoricNames,
    spaces: typedSpaces,
  };
};
