// @ts-check
/** @file Boot script for PSM-only (aka Pismo) chain */
import * as ERTPmod from '@agoric/ertp';
import { E, Far } from '@endo/far';
// TODO: factor startEconomicCommittee out of econ-behaviors.js
import { M, makeScalarMapStore, mustMatch } from '@agoric/store';
import {
  addBankAssets,
  buildZoe,
  installBootContracts,
  makeAddressNameHubs,
  makeBoard,
  makeVatsFromBundles,
  mintInitialSupply,
  produceDiagnostics,
  produceStartGovernedUpgradable,
  produceStartUpgradable,
} from '@agoric/vats/src/core/basic-behaviors.js';
import {
  bridgeCoreEval,
  bridgeProvisioner,
  CHAIN_BOOTSTRAP_MANIFEST,
  makeBridgeManager,
  makeChainStorage,
  noProvisioner,
  produceHighPrioritySendersManager,
  publishAgoricNames,
  startTimerService,
} from '@agoric/vats/src/core/chain-behaviors.js';
import { makePromiseSpace } from '@agoric/vats/src/core/promise-space.js';
import {
  startWalletFactory,
  WALLET_FACTORY_MANIFEST,
} from '@agoric/vats/src/core/startWalletFactory.js';
import * as utils from '@agoric/vats/src/core/utils.js';
import { makeHeapZone } from '@agoric/zone';
import { Stable, Stake } from '@agoric/internal/src/tokens.js';
import {
  ECON_COMMITTEE_MANIFEST,
  startEconomicCommittee,
} from '../../src/proposals/startEconCommittee.js';
import * as startPSMmod from '../../src/proposals/startPSM.js';
import {
  INVITE_PSM_COMMITTEE_MANIFEST,
  makeAnchorAsset,
  PSM_MANIFEST,
  startPSM,
} from '../../src/proposals/startPSM.js';
import {
  inviteCommitteeMembers,
  inviteToEconCharter,
  startEconCharter,
} from '../../src/proposals/committee-proposal.js';

/** @import {EconomyBootstrapSpace} from '@agoric/inter-protocol/src/proposals/econ-behaviors.js' */

/** @param {BootstrapSpace & EconomyBootstrapSpace} powers */
export const installGovAndPSMContracts = async ({
  consume: { vatAdminSvc, zoe },
  produce: { psmKit },
  installation: {
    produce: {
      contractGovernor,
      committee,
      binaryVoteCounter,
      psm,
      econCommitteeCharter,
    },
  },
}) => {
  // In order to support multiple instances of the PSM, we store all the facets
  // indexed by the brand. Since each name in the BootstrapSpace can only be
  // produced  once, we produce an empty store here, and each time a PSM is
  // started up, the details are added to the store.
  psmKit.resolve(makeScalarMapStore());

  return Promise.all(
    Object.entries({
      contractGovernor,
      committee,
      binaryVoteCounter,
      psm,
      econCommitteeCharter,
    }).map(async ([name, producer]) => {
      const bundleID = await E(vatAdminSvc).getBundleIDByName(name);
      const installation = await E(zoe).installBundleID(bundleID, name);

      producer.resolve(installation);
    }),
  );
};

/**
 * PSM and gov contracts are available as named swingset bundles only in
 * decentral-psm-config.json
 *
 * @type {import('@agoric/vats/src/core/lib-boot.js').BootstrapManifest}
 */
export const PSM_GOV_MANIFEST = {
  [installGovAndPSMContracts.name]: {
    consume: { vatAdminSvc: 'true', zoe: 'zoe' },
    produce: { psmKit: 'true' },
    installation: {
      produce: {
        contractGovernor: 'zoe',
        committee: 'zoe',
        binaryVoteCounter: 'zoe',
        psm: 'zoe',
        econCommitteeCharter: 'zoe',
      },
    },
  },
};

/** We reserve these keys in name hubs. */
export const agoricNamesReserved = harden(
  /** @type {const} */ ({
    issuer: {
      [Stake.symbol]: Stake.proposedName,
      [Stable.symbol]: Stable.proposedName,
      AUSD: 'Agoric bridged USDC',
    },
    brand: {
      [Stake.symbol]: Stake.proposedName,
      [Stable.symbol]: Stable.proposedName,
      AUSD: 'Agoric bridged USDC',
    },
    vbankAsset: {
      [Stake.symbol]: Stake.proposedName,
      [Stable.symbol]: Stable.proposedName,
    },
    oracleBrand: {
      USD: 'US Dollar',
    },
    installation: {
      centralSupply: 'central supply',
      mintHolder: 'mint holder',
      walletFactory: 'multitenant smart wallet',
      contractGovernor: 'contract governor',
      committee: 'committee electorate',
      binaryVoteCounter: 'binary vote counter',
      psm: 'Parity Stability Module',
      econCommitteeCharter: 'Econ Governance Charter',
    },
    instance: {
      economicCommittee: 'Economic Committee',
      'psm-IST-AUSD': 'Parity Stability Module: IST:AUSD',
      econCommitteeCharter: 'Econ Governance Charter',
      walletFactory: 'Smart Wallet Factory',
      provisionPool: 'Provision Pool',
    },
  }),
);

/**
 * @typedef {{
 *   denom: string;
 *   keyword?: string;
 *   proposedName?: string;
 *   decimalPlaces?: number;
 * }} AnchorOptions
 */
const AnchorOptionsShape = M.splitRecord(
  { denom: M.string() },
  {
    keyword: M.string(),
    proposedName: M.string(),
    decimalPlaces: M.number(),
  },
);

export const ParametersShape = M.splitRecord(
  {},
  {
    anchorAssets: M.arrayOf(AnchorOptionsShape),
    economicCommitteeAddresses: M.recordOf(M.string(), M.string()),
  },
);

/**
 * Build root object of the PSM-only bootstrap vat.
 *
 * @param {{
 *   D: DProxy;
 *   logger?: (msg: string) => void;
 * }} vatPowers
 * @param {{
 *   economicCommitteeAddresses: Record<string, string>;
 *   anchorAssets: { denom: string; keyword?: string }[];
 * }} vatParameters
 */
export const buildRootObject = async (vatPowers, vatParameters) => {
  const log = vatPowers.logger || console.info;

  mustMatch(harden(vatParameters), ParametersShape, 'boot-psm params');
  const { anchorAssets, economicCommitteeAddresses } = vatParameters;

  const { produce, consume } = makePromiseSpace(log);
  const { agoricNames, agoricNamesAdmin, spaces } =
    await utils.makeAgoricNamesAccess(log, agoricNamesReserved);
  produce.agoricNames.resolve(agoricNames);
  produce.agoricNamesAdmin.resolve(agoricNamesAdmin);
  produce.vatStore.resolve(makeScalarMapStore());

  const runBootstrapParts = async (vats, devices) => {
    /** TODO: BootstrapPowers type puzzle */
    /** @type {any} */
    const allPowers = harden({
      vatPowers,
      vatParameters,
      vats,
      devices,
      produce,
      consume,
      zone: makeHeapZone(),
      ...spaces,
      // ISSUE: needed? runBehaviors,
      // These module namespaces might be useful for core eval governance.
      modules: {
        utils: { ...utils },
        startPSM: { ...startPSMmod },
        ERTP: { ...ERTPmod },
      },
    });
    const manifest = {
      ...CHAIN_BOOTSTRAP_MANIFEST,
      ...WALLET_FACTORY_MANIFEST,
      ...PSM_GOV_MANIFEST,
      ...ECON_COMMITTEE_MANIFEST,
      ...PSM_MANIFEST,
      ...INVITE_PSM_COMMITTEE_MANIFEST,
      [startEconCharter.name]: {
        consume: { zoe: 'zoe', agoricNames: true },
        produce: {
          econCharterKit: 'econCommitteeCharter',
        },
        installation: {
          consume: { binaryVoteCounter: 'zoe', econCommitteeCharter: 'zoe' },
        },
        instance: {
          produce: { econCommitteeCharter: 'econCommitteeCharter' },
        },
      },
      [noProvisioner.name]: {
        produce: {
          provisioning: 'provisioning',
        },
      },
    };
    /** @param {string} name */
    const powersFor = name => {
      const permit = manifest[name];
      assert(permit, `missing permit for ${name}`);
      return utils.extractPowers(permit, allPowers);
    };

    await Promise.all([
      produceDiagnostics(allPowers),
      produceStartUpgradable(allPowers),
      produceStartGovernedUpgradable(allPowers),
      produceHighPrioritySendersManager(allPowers),
      makeVatsFromBundles(powersFor('makeVatsFromBundles')),
      buildZoe(powersFor('buildZoe')),
      makeBoard(allPowers),
      makeBridgeManager(powersFor('makeBridgeManager')),
      noProvisioner(powersFor('noProvisioner')),
      bridgeProvisioner(powersFor('bridgeProvisioner')),
      makeChainStorage(powersFor('makeChainStorage')),
      makeAddressNameHubs(allPowers),
      publishAgoricNames(allPowers, {
        options: {
          agoricNamesOptions: { topLevel: Object.keys(agoricNamesReserved) },
        },
      }),
      startWalletFactory(powersFor('startWalletFactory')),
      mintInitialSupply(powersFor('mintInitialSupply')),
      addBankAssets(powersFor('addBankAssets')),
      startTimerService(powersFor('startTimerService')),
      installBootContracts(powersFor('installBootContracts')),
      installGovAndPSMContracts(powersFor('installGovAndPSMContracts')),
      startEconomicCommittee(powersFor('startEconomicCommittee'), {
        options: {
          econCommitteeOptions: {
            committeeSize: Object.values(economicCommitteeAddresses).length,
          },
        },
      }),
      inviteCommitteeMembers(powersFor('inviteCommitteeMembers'), {
        options: { voterAddresses: economicCommitteeAddresses },
      }),
      inviteToEconCharter(powersFor('inviteToEconCharter'), {
        options: { voterAddresses: economicCommitteeAddresses },
      }),
      ...anchorAssets.map(async anchorOptions =>
        makeAnchorAsset(powersFor('makeAnchorAsset'), {
          options: { anchorOptions },
        }),
      ),
      ...anchorAssets.map(async anchorOptions =>
        startPSM(powersFor(startPSM.name), {
          options: { anchorOptions },
        }),
      ),
      startEconCharter(powersFor(startEconCharter.name)),
      // Allow bootstrap powers to be granted by governance
      // to code to be evaluated after initial bootstrap.
      bridgeCoreEval(powersFor('bridgeCoreEval')),
    ]);
    // xxx this doesn't ever resolve yet, due to a dropped promise in startPSM (datalock)
    console.log('boot-psm fully resolved');
  };

  return Far('bootstrap', {
    bootstrap: async (vats, devices) => {
      const { D } = vatPowers;
      D(devices.mailbox).registerInboundHandler(
        Far('dummyInboundHandler', { deliverInboundMessages: () => {} }),
      );

      return runBootstrapParts(vats, devices).catch(e => {
        console.error('BOOTSTRAP FAILED:', e);
        throw e;
      });
    },
    /**
     * Allow kernel to provide things to CORE_EVAL.
     *
     * @param {string} name
     * @param {unknown} resolution
     */
    produceItem: (name, resolution) => {
      assert.typeof(name, 'string');
      produce[name].resolve(resolution);
    },
    // expose reset in case we need to do-over
    resetItem: name => {
      assert.typeof(name, 'string');
      produce[name].reset();
    },
    // expose consume mostly for testing
    consumeItem: async name => {
      assert.typeof(name, 'string');
      return consume[name];
    },
    /** @type {() => ChainBootstrapSpace} */
    // @ts-expect-error cast
    getPromiseSpace: () => ({ consume, produce, ...spaces }),
  });
};

harden({ buildRootObject });
