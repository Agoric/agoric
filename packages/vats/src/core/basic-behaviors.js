import { AssetKind } from '@agoric/ertp';
import { CONTRACT_ELECTORATE, ParamTypes } from '@agoric/governance';
import { Stable, Stake } from '@agoric/internal/src/tokens.js';
import {
  BridgeId,
  deeplyFulfilledObject,
  VBankAccount,
  WalletName,
} from '@agoric/internal';
import { keyEQ, makeScalarMapStore } from '@agoric/store';
import { provideLazy } from '@agoric/store/src/stores/store-utils.js';
import { E, getInterfaceOf } from '@endo/far';
import { Nat } from '@endo/nat';

import { Fail, NonNullish } from '@agoric/assert';
import { makeNameHubKit } from '../nameHub.js';
import { PowerFlags } from '../walletFlags.js';
import { feeIssuerConfig, makeMyAddressNameAdminKit } from './utils.js';

/** @import {GovernableStartFn, GovernanceFacetKit} from '@agoric/governance/src/types.js'; */

const { details: X } = assert;

/**
 * In golang/cosmos/app/app.go, we define cosmosInitAction with type
 * AG_COSMOS_INIT, with the following shape.
 *
 * The uist supplyCoins value is taken from genesis, thereby authorizing the
 * minting an initial supply of RUN.
 */
// eslint-disable-next-line no-unused-vars
const bootMsgEx = {
  type: 'AG_COSMOS_INIT',
  chainID: 'agoric',
  storagePort: 1,
  supplyCoins: [
    { denom: 'provisionpass', amount: '100' },
    { denom: 'sendpacketpass', amount: '100' },
    { denom: 'ubld', amount: '1000000000000000' },
    { denom: 'uist', amount: '50000000000' },
  ],
  swingsetPort: 4,
  vbankPort: 3,
  vibcPort: 2,
};

/**
 * TODO: review behaviors carefully for powers that go out of scope, since we
 * may want/need them later.
 */

/** @typedef {MapStore<string, CreateVatResults>} VatStore */

/**
 * @param {BootstrapPowers & {}} powers
 * @import {CreateVatResults} from '@agoric/swingset-vat'
 *   as from createVatByName
 */
export const makeVatsFromBundles = async ({
  vats,
  devices,
  consume: { vatStore },
  produce: { vatAdminSvc, loadVat, loadCriticalVat },
}) => {
  // NOTE: we rely on multiple createVatAdminService calls
  // to return cooperating services.
  const svc = E(vats.vatAdmin).createVatAdminService(devices.vatAdmin);
  // @ts-expect-error XXX
  vatAdminSvc.resolve(svc);

  const durableStore = await vatStore;

  /** @type {MapStore<string, Promise<CreateVatResults>>} */
  const tmpStore = makeScalarMapStore();

  const makeLazyVatLoader = (defaultVatCreationOptions = {}) => {
    return async (vatName, bundleRef = { bundleName: vatName }) => {
      const { bundleID, bundleName } = bundleRef;
      const vatInfoP = provideLazy(tmpStore, vatName, async _k => {
        if (bundleName) {
          console.info(`createVatByName(${bundleName})`);
          /** @type {Promise<CreateVatResults>} */
          // @ts-expect-error XXX
          const vatInfo = E(svc).createVatByName(bundleName, {
            ...defaultVatCreationOptions,
            name: vatName,
          });
          return vatInfo;
        }
        console.info(`createVat(${bundleID})`);
        assert(bundleID);
        const bcap = await E(svc).getBundleCap(bundleID);
        /** @type {Promise<CreateVatResults>} */
        // @ts-expect-error XXX
        const vatInfo = E(svc).createVat(bcap, {
          ...defaultVatCreationOptions,
          name: vatName,
        });
        return vatInfo;
      });
      return E.when(vatInfoP, vatInfo => {
        harden(vatInfo); // XXX createVat should do this, no?
        if (!durableStore.has(vatName)) {
          durableStore.init(vatName, vatInfo);
        } else {
          keyEQ(vatInfo, durableStore.get(vatName)) ||
            Fail`duplicate vat ${vatName}`;
        }
        return vatInfo.root;
      });
    };
  };

  loadVat.resolve(makeLazyVatLoader());

  const criticalVatKey = await E(vats.vatAdmin).getCriticalVatKey();
  loadCriticalVat.resolve(makeLazyVatLoader({ critical: criticalVatKey }));
};
harden(makeVatsFromBundles);

/** @param {Pick<ChainBootstrapSpace, 'produce'>} powers */
export const produceDiagnostics = async ({ produce }) => {
  const instancePrivateArgs = new Map();
  const savePrivateArgs = (instance, privateArgs) => {
    if (instancePrivateArgs.has(instance)) {
      Fail`privateArgs already set`;
    }
    instancePrivateArgs.set(instance, privateArgs);
  };
  produce.diagnostics.resolve({ savePrivateArgs });
  produce.instancePrivateArgs.resolve(instancePrivateArgs);
};

/** @param {BootstrapSpace & { zone: import('@agoric/zone').Zone }} powers */
export const produceStartUpgradable = async ({
  zone,
  consume: { diagnostics, zoe },
  produce, // startUpgradable, contractKits
}) => {
  /** @type {MapStore<Instance, StartedInstanceKitWithLabel>} */
  const contractKits = zone.mapStore('ContractKits');

  /** @type {StartUpgradable} */
  const startUpgradable = async ({
    installation,
    issuerKeywordRecord,
    terms,
    privateArgs,
    label,
  }) => {
    const started = await E(zoe).startInstance(
      installation,
      issuerKeywordRecord,
      terms,
      privateArgs,
      label,
    );
    label ||= NonNullish(getInterfaceOf(started.instance));
    const kit = harden({ ...started, label });
    contractKits.init(kit.instance, kit);
    await E(diagnostics).savePrivateArgs(kit.instance, privateArgs);
    return kit;
  };

  produce.startUpgradable.resolve(startUpgradable);
  produce.contractKits.resolve(contractKits);
};
harden(produceStartUpgradable);

/**
 * @template {GovernableStartFn} SF
 * @param {{
 *   zoe: ERef<ZoeService>;
 *   governedContractInstallation: ERef<Installation<SF>>;
 *   issuerKeywordRecord?: IssuerKeywordRecord;
 *   terms: Record<string, unknown>;
 *   privateArgs: any; // TODO: connect with Installation type
 *   label: string;
 * }} zoeArgs
 * @param {{
 *   governedParams: Record<string, unknown>;
 *   timer: ERef<import('@agoric/time').TimerService>;
 *   contractGovernor: ERef<Installation>;
 *   economicCommitteeCreatorFacet: import('@agoric/inter-protocol/src/proposals/econ-behaviors.js').EconomyBootstrapPowers['consume']['economicCommitteeCreatorFacet'];
 * }} govArgs
 * @returns {Promise<GovernanceFacetKit<SF>>}
 */
const startGovernedInstance = async (
  {
    zoe,
    governedContractInstallation,
    issuerKeywordRecord,
    terms,
    privateArgs,
    label,
  },
  { governedParams, timer, contractGovernor, economicCommitteeCreatorFacet },
) => {
  const poserInvitationP = E(
    economicCommitteeCreatorFacet,
  ).getPoserInvitation();
  const [initialPoserInvitation, electorateInvitationAmount] =
    await Promise.all([
      poserInvitationP,
      E(E(zoe).getInvitationIssuer()).getAmountOf(poserInvitationP),
    ]);

  const governorTerms = await deeplyFulfilledObject(
    harden({
      timer,
      governedContractInstallation,
      governed: {
        terms: {
          ...terms,
          governedParams: {
            [CONTRACT_ELECTORATE]: {
              type: ParamTypes.INVITATION,
              value: electorateInvitationAmount,
            },
            ...governedParams,
          },
        },
        issuerKeywordRecord,
        label,
      },
    }),
  );
  const governorFacets = await E(zoe).startInstance(
    contractGovernor,
    {},
    governorTerms,
    harden({
      economicCommitteeCreatorFacet,
      governed: {
        ...privateArgs,
        initialPoserInvitation,
      },
    }),
    `${label}-governor`,
  );
  const [instance, publicFacet, creatorFacet, adminFacet] = await Promise.all([
    E(governorFacets.creatorFacet).getInstance(),
    E(governorFacets.creatorFacet).getPublicFacet(),
    E(governorFacets.creatorFacet).getCreatorFacet(),
    E(governorFacets.creatorFacet).getAdminFacet(),
  ]);
  /** @type {GovernanceFacetKit<SF>} */
  const facets = harden({
    instance,
    publicFacet,
    governor: governorFacets.instance,
    creatorFacet,
    adminFacet,
    governorCreatorFacet: governorFacets.creatorFacet,
    governorAdminFacet: governorFacets.adminFacet,
  });
  return facets;
};

/**
 * @param {BootstrapSpace & {
 *   zone: import('@agoric/zone').Zone;
 *   consume: {
 *     economicCommitteeCreatorFacet: import('@agoric/inter-protocol/src/proposals/econ-behaviors.js').EconomyBootstrapPowers['consume']['economicCommitteeCreatorFacet'];
 *   };
 * }} powers
 */
export const produceStartGovernedUpgradable = async ({
  zone,
  consume: {
    chainTimerService,
    diagnostics,
    economicCommitteeCreatorFacet,
    zoe,
  },
  produce, // startGovernedUpgradable, governedContractKits
  installation: {
    consume: { contractGovernor },
  },
}) => {
  /**
   * @type {MapStore<
   *   Instance,
   *   GovernanceFacetKit<any> & { label: string }
   * >}
   */
  const contractKits = zone.mapStore('GovernedContractKits');

  /** @type {startGovernedUpgradable} */
  const startGovernedUpgradable = async ({
    installation,
    issuerKeywordRecord,
    governedParams,
    terms,
    privateArgs,
    label,
  }) => {
    const facets = await startGovernedInstance(
      {
        zoe,
        governedContractInstallation: installation,
        issuerKeywordRecord,
        terms,
        privateArgs,
        label,
      },
      {
        governedParams,
        timer: chainTimerService,
        contractGovernor,
        economicCommitteeCreatorFacet,
      },
    );
    const kit = harden({ ...facets, label });
    contractKits.init(facets.instance, kit);

    await E(diagnostics).savePrivateArgs(kit.instance, privateArgs);
    await E(diagnostics).savePrivateArgs(kit.governor, {
      economicCommitteeCreatorFacet: await economicCommitteeCreatorFacet,
    });

    return facets;
  };

  produce.startGovernedUpgradable.resolve(startGovernedUpgradable);
  produce.governedContractKits.resolve(contractKits);
};
harden(produceStartGovernedUpgradable);

/**
 * @param {BootstrapPowers} powers
 */
export const buildZoe = async ({
  consume: { vatAdminSvc, loadCriticalVat, client },
  produce: { zoe, feeMintAccess },
  brand: {
    produce: { Invitation: invitationBrand },
  },
  issuer: {
    produce: { Invitation: invitationIssuer },
  },
}) => {
  const zcfBundleName = 'zcf'; // should match config.bundles.zcf=
  const { zoeService, feeMintAccess: fma } = await E(
    E(loadCriticalVat)('zoe'),
  ).buildZoe(vatAdminSvc, feeIssuerConfig, zcfBundleName);

  zoe.resolve(zoeService);
  const issuer = E(zoeService).getInvitationIssuer();
  const brand = E(issuer).getBrand();
  invitationIssuer.resolve(issuer);
  invitationBrand.resolve(brand);

  feeMintAccess.resolve(fma);
  await Promise.all([E(client).assignBundle([_addr => ({ zoe: zoeService })])]);
};
harden(buildZoe);

/**
 * @param {BootstrapPowers} powers
 */
export const startPriceAuthorityRegistry = async ({
  consume: { loadCriticalVat, client },
  produce,
}) => {
  const vats = { priceAuthority: E(loadCriticalVat)('priceAuthority') };
  const { priceAuthority, adminFacet } = await E(
    vats.priceAuthority,
  ).getRegistry();

  produce.priceAuthorityVat.resolve(vats.priceAuthority);
  produce.priceAuthority.resolve(priceAuthority);
  produce.priceAuthorityAdmin.resolve(adminFacet);

  return E(client).assignBundle([_addr => ({ priceAuthority })]);
};
harden(startPriceAuthorityRegistry);

/**
 * Create inert brands (no mint or issuer) referred to by price oracles.
 *
 * @param {BootstrapPowers & NamedVatPowers} powers
 */
export const makeOracleBrands = async ({
  namedVat: {
    consume: { agoricNames },
  },
  oracleBrand: {
    produce: { USD },
  },
}) => {
  const brand = await E(agoricNames).provideInertBrand(
    'USD',
    harden({ decimalPlaces: 6, assetKind: AssetKind.NAT }),
  );
  USD.resolve(brand);
};
harden(makeOracleBrands);

/** @param {BootstrapPowers & NamedVatPowers} powers */
export const produceBoard = async ({
  consume: { client },
  produce: { board: pBoard },
  namedVat: {
    consume: { board: vatBoard },
  },
}) => {
  const board = await E(vatBoard).getBoard();
  pBoard.resolve(board);
  return E(client).assignBundle([_addr => ({ board })]);
};
harden(produceBoard);

/**
 * @deprecated use produceBoard
 * @param {BootstrapPowers} powers
 */
export const makeBoard = async ({
  consume: { loadCriticalVat, client },
  produce: {
    board: { resolve: resolveBoard },
  },
}) => {
  const board = await E(E(loadCriticalVat)('board')).getBoard();
  resolveBoard(board);
  return E(client).assignBundle([_addr => ({ board })]);
};
harden(makeBoard);

/**
 * Produce the remote namesByAddress hierarchy.
 *
 * namesByAddress is a NameHub for each provisioned client, available, for
 * example, as `E(home.namesByAddress).lookup('agoric1...')`. `depositFacet` as
 * in `E(home.namesByAddress).lookup('agoric1...', 'depositFacet')` is reserved
 * for use by the Agoric wallet. Each client is given `home.myAddressNameAdmin`,
 * which they can use to assign (update / reserve) any other names they choose.
 *
 * @param {BootstrapPowers} powers
 */
export const produceNamesByAddress = async ({
  consume: { agoricNames, provisioning: provisioningOptP, client },
  produce: { namesByAddress, namesByAddressAdmin },
}) => {
  const provisioning = await provisioningOptP;
  if (!provisioning) {
    namesByAddress.reject('no provisioning vat');
    namesByAddressAdmin.reject('no provisioning vat');
    return;
  }
  const kit = await E(provisioning).getNamesByAddressKit();
  namesByAddress.resolve(kit.namesByAddress);
  namesByAddressAdmin.resolve(kit.namesByAddressAdmin);
  const agoricNamesR = await agoricNames;
  return E(client).assignBundle([
    _a => ({ agoricNames: agoricNamesR, namesByAddress: kit.namesByAddress }),
    addr => ({
      myAddressNameAdmin: E(kit.namesByAddressAdmin)
        .provideChild(addr, [WalletName.depositFacet])
        .then(myKit => myKit.nameAdmin),
    }),
  ]);
};

/**
 * Make the namesByAddress name hierarchy in the heap.
 *
 * @deprecated use produceNamesByAddress to avoid Far objects in bootstrap
 * @param {BootstrapSpace} powers
 */
export const makeAddressNameHubs = async ({
  consume: { agoricNames: agoricNamesP, client },
  produce,
}) => {
  const agoricNames = await agoricNamesP;

  const { nameHub: namesByAddress, nameAdmin: namesByAddressAdmin } =
    makeNameHubKit();
  produce.namesByAddress.resolve(namesByAddress);
  // @ts-expect-error deprecated type structure
  produce.namesByAddressAdmin.resolve(namesByAddressAdmin);

  const perAddress = address => {
    const { nameHub, myAddressNameAdmin } = makeMyAddressNameAdminKit(address);
    // XXX deprecated utility used only in solo
    void myAddressNameAdmin.reserve(WalletName.depositFacet);

    // This may race against walletFactory.js/publishDepositFacet, so we are
    // careful not to clobber the first nameHub that is used to update
    // namesByAddressAdmin.
    namesByAddressAdmin.default(address, nameHub, myAddressNameAdmin);

    const actualAdmin = namesByAddressAdmin.lookupAdmin(address);
    return { agoricNames, namesByAddress, myAddressNameAdmin: actualAdmin };
  };

  return E(client).assignBundle([perAddress]);
};
harden(makeAddressNameHubs);

/** @param {BootstrapSpace} powers */
export const makeClientBanks = async ({
  consume: {
    namesByAddressAdmin,
    client,
    bankManager,
    walletFactoryStartResult,
  },
}) => {
  const walletFactoryCreatorFacet = E.get(
    walletFactoryStartResult,
  ).creatorFacet;
  return E(client).assignBundle([
    (address, powerFlags) => {
      const bank = E(bankManager).getBankForAddress(address);
      if (!powerFlags.includes(PowerFlags.SMART_WALLET)) {
        return { bank };
      }
      assert(
        !powerFlags.includes(PowerFlags.REMOTE_WALLET),
        `REMOTE and SMART_WALLET are exclusive`,
      );
      const myAddressNameAdmin = E(namesByAddressAdmin).lookupAdmin(address);

      const smartWallet = E(walletFactoryCreatorFacet).provideSmartWallet(
        address,
        bank,
        myAddressNameAdmin,
      );

      // sets these values in REPL home by way of registerWallet
      return { bank, smartWallet };
    },
  ]);
};
harden(makeClientBanks);

/** @param {BootstrapSpace} powers */
export const installBootContracts = async ({
  consume: { vatAdminSvc, zoe },
  installation: {
    produce: { centralSupply, mintHolder },
  },
}) => {
  for (const [name, producer] of Object.entries({
    centralSupply,
    mintHolder,
  })) {
    const idP = E(vatAdminSvc).getBundleIDByName(name);
    const installationP = idP.then(bundleID =>
      E(zoe).installBundleID(bundleID, name),
    );
    producer.resolve(installationP);
  }
};

/**
 * Mint IST genesis supply.
 *
 * @param {BootstrapPowers & {
 *   vatParameters: { argv: { bootMsg?: typeof bootMsgEx } };
 * }} powers
 */
export const mintInitialSupply = async ({
  vatParameters: {
    argv: { bootMsg },
  },
  consume: { feeMintAccess: feeMintAccessP, zoe },
  produce: { initialSupply },
  installation: {
    consume: { centralSupply },
  },
}) => {
  const feeMintAccess = await feeMintAccessP;

  const { supplyCoins = [] } = bootMsg || {};
  const centralBootstrapSupply = supplyCoins.find(
    ({ denom }) => denom === Stable.denom,
  ) || { amount: '0' };
  const bootstrapPaymentValue = Nat(BigInt(centralBootstrapSupply.amount));

  /**
   * @type {Awaited<
   *   ReturnType<typeof import('../centralSupply.js').start>
   * >}
   */
  const { creatorFacet } = await E(zoe).startInstance(
    centralSupply,
    {},
    { bootstrapPaymentValue },
    { feeMintAccess },
    'centralSupply',
  );
  const payment = E(creatorFacet).getBootstrapPayment();
  // TODO: shut down the centralSupply contract, now that we have the payment?
  initialSupply.resolve(payment);
};
harden(mintInitialSupply);

/**
 * Add IST (with initialSupply payment), BLD (with mint) to BankManager.
 *
 * @param {BootstrapSpace} powers
 */
export const addBankAssets = async ({
  consume: {
    agoricNamesAdmin,
    initialSupply,
    bridgeManager: bridgeManagerP,
    loadCriticalVat,
    startUpgradable,
    zoe,
  },
  produce: { bankManager, bldIssuerKit },
  installation: {
    consume: { mintHolder },
  },
  issuer: { produce: produceIssuer },
  brand: { produce: produceBrand },
}) => {
  const stableIssuer = await E(zoe).getFeeIssuer();
  const [stableBrand, payment] = await Promise.all([
    E(stableIssuer).getBrand(),
    initialSupply,
  ]);
  const runKit = { issuer: stableIssuer, brand: stableBrand, payment };
  const terms = harden({
    keyword: Stake.symbol,
    assetKind: Stake.assetKind,
    displayInfo: Stake.displayInfo,
  });

  const { creatorFacet: bldMint, publicFacet: bldIssuer } = await E(
    startUpgradable,
  )({
    installation: mintHolder,
    label: Stake.symbol,
    terms,
  });

  const bldBrand = await E(bldIssuer).getBrand();
  const bldKit = /** @type {IssuerKit<'nat'>} */ (
    harden({ mint: bldMint, issuer: bldIssuer, brand: bldBrand })
  );
  bldIssuerKit.resolve(bldKit);

  const assetAdmin = E(agoricNamesAdmin).lookupAdmin('vbankAsset');

  const bridgeManager = await bridgeManagerP;
  /** @type {import('../types.js').ScopedBridgeManager<'bank'> | undefined} */
  // @ts-expect-error XXX EProxy
  const bankBridgeManager =
    bridgeManager && E(bridgeManager).register(BridgeId.BANK);
  const bankMgr = await E(E(loadCriticalVat)('bank')).makeBankManager(
    bankBridgeManager,
    assetAdmin,
  );
  bankManager.resolve(bankMgr);

  // Sanity check: the bank manager should have a reserve module account.
  const reserveAddress = await E(bankMgr).getModuleAccountAddress(
    VBankAccount.reserve.module,
  );
  if (reserveAddress !== null) {
    // bridgeManager is available, so we should have a legit reserve address.
    assert.equal(
      reserveAddress,
      VBankAccount.reserve.address,
      X`vbank address for reserve module ${VBankAccount.reserve.module} is ${reserveAddress}; expected ${VBankAccount.reserve.address}`,
    );
  }

  produceIssuer.BLD.resolve(bldKit.issuer);
  produceIssuer.IST.resolve(runKit.issuer);
  produceBrand.BLD.resolve(bldKit.brand);
  produceBrand.IST.resolve(runKit.brand);
  await Promise.all([
    E(bankMgr).addAsset(
      Stake.denom,
      Stake.symbol,
      Stake.proposedName,
      bldKit, // with mint
    ),
    E(bankMgr).addAsset(
      Stable.denom,
      Stable.symbol,
      Stable.proposedName,
      runKit, // without mint, with payment
    ),
  ]);
};
harden(addBankAssets);

/** @type {import('./lib-boot.js').BootstrapManifest} */
export const BASIC_BOOTSTRAP_PERMITS = {
  bridgeCoreEval: true, // Needs all the powers.
  [makeOracleBrands.name]: {
    oracleBrand: { produce: { USD: 'agoricNames' } },
    namedVat: { consume: { agoricNames: 'agoricNames' } },
  },
  [startPriceAuthorityRegistry.name]: {
    consume: { loadCriticalVat: true, client: true },
    produce: {
      priceAuthorityVat: 'priceAuthority',
      priceAuthority: 'priceAuthority',
      priceAuthorityAdmin: 'priceAuthority',
    },
  },
  [makeVatsFromBundles.name]: {
    vats: {
      vatAdmin: 'vatAdmin',
    },
    devices: {
      vatAdmin: 'kernel',
    },
    consume: {
      vatStore: true,
    },
    produce: {
      vatAdminSvc: 'vatAdmin',
      loadVat: true,
      loadCriticalVat: true,
    },
  },
  [buildZoe.name]: {
    consume: {
      vatAdminSvc: true,
      loadCriticalVat: true,
      client: true,
    },
    produce: {
      zoe: 'zoe',
      feeMintAccess: 'zoe',
    },
    issuer: { produce: { Invitation: 'zoe' } },
    brand: { produce: { Invitation: 'zoe' } },
  },
  [produceBoard.name]: {
    consume: {
      client: true,
    },
    produce: {
      board: 'board',
    },
    namedVat: { consume: { board: 'board' } },
  },
  [produceNamesByAddress.name]: {
    consume: {
      agoricNames: 'agoricNames',
      client: true,
      provisioning: 'provisioning',
    },
    produce: {
      namesByAddress: 'provisioning',
      namesByAddressAdmin: 'provisioning',
    },
  },
  [makeClientBanks.name]: {
    consume: {
      namesByAddressAdmin: true,
      bankManager: 'bank',
      client: true,
      walletFactoryStartResult: 'walletFactory',
    },
    home: { produce: { bank: 'bank' } },
  },
  [installBootContracts.name]: {
    consume: { zoe: 'zoe', vatAdminSvc: true },
    installation: {
      produce: {
        centralSupply: 'zoe',
        mintHolder: 'zoe',
      },
    },
  },
  [mintInitialSupply.name]: {
    vatParameters: {
      argv: { bootMsg: true },
    },
    consume: {
      feeMintAccess: true,
      zoe: true,
    },
    produce: {
      initialSupply: true,
    },
    installation: {
      consume: { centralSupply: 'zoe' },
    },
  },
  [addBankAssets.name]: {
    consume: {
      agoricNamesAdmin: 'agoricNames',
      initialSupply: true,
      bridgeManager: 'bridge',
      // TODO: re-org loadCriticalVat to be subject to permits
      loadCriticalVat: true,
      startUpgradable: true,
      zoe: true,
    },
    produce: {
      bankManager: 'bank',
      bldIssuerKit: true,
    },
    installation: {
      consume: { centralSupply: 'zoe', mintHolder: 'zoe' },
    },
    issuer: { produce: { BLD: 'BLD', IST: 'zoe' } },
    brand: { produce: { BLD: 'BLD', IST: 'zoe' } },
  },
  [produceDiagnostics.name]: {
    produce: { diagnostics: true, instancePrivateArgs: true },
  },
  [produceStartUpgradable.name]: {
    zone: true,
    consume: { diagnostics: true, zoe: 'zoe' },
    produce: { startUpgradable: true, contractKits: true },
  },
  [produceStartGovernedUpgradable.name]: {
    zone: true,
    consume: {
      chainTimerService: 'timer',
      diagnostics: true,
      economicCommitteeCreatorFacet: 'economicCommittee',
      zoe: 'zoe',
    },
    produce: { startGovernedUpgradable: true, governedContractKits: true },
    installation: {
      consume: { contractGovernor: 'zoe' },
    },
  },
};
harden(BASIC_BOOTSTRAP_PERMITS);
