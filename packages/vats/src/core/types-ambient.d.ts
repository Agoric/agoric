// Ambient type defs. Cannot use top-level import() because that would turn it into a module.

/** This type conflicts with packages/SwingSet/src/vats/plugin-manager.js */
type Device<T> = 'Device' & { __deviceType__: T };

/** (approximately) */
type DProxy<T = any> = (target: Device<T>) => T;

type BootDevices<T> = { vatPowers: { D: DProxy }; devices: T };

type BridgeDevice = Device<
  ReturnType<
    typeof import('@agoric/swingset-vat/src/devices/bridge/device-bridge.js').buildRootDeviceNode
  >
>;

type CommandDevice = Device<
  ReturnType<
    typeof import('@agoric/swingset-vat/src/devices/command/device-command.js').buildRootDeviceNode
  >
>;

type MailboxDevice = Device<
  ReturnType<
    typeof import('@agoric/swingset-vat/src/devices/mailbox/device-mailbox.js').buildRootDeviceNode
  >
>;

type PluginDevice = Device<
  ReturnType<
    typeof import('@agoric/swingset-vat/src/devices/plugin/device-plugin.js').buildRootDeviceNode
  >
>;

type TimerDevice = Device<
  ReturnType<
    typeof import('@agoric/swingset-vat/src/devices/timer/device-timer.js').buildRootDeviceNode
  >
>;

type VatAdminDevice = Device<
  import('@agoric/swingset-vat/src/devices/vat-admin/device-vat-admin.js').VatAdminRootDeviceNode
>;

type VattpVat = ERef<
  ReturnType<
    typeof import('@agoric/swingset-vat/src/vats/vattp/vat-vattp.js').buildRootObject
  >
>;

type VatAdminVat = ERef<
  ReturnType<
    typeof import('@agoric/swingset-vat/src/vats/vat-admin/vat-vat-admin.js').buildRootObject
  >
>;

/** @see deliverToController in packages/SwingSet/src/vats/comms/controller.js */
type TimerVat = ERef<
  ReturnType<
    typeof import('@agoric/swingset-vat/src/vats/timer/vat-timer.js').buildRootObject
  >
>;

type CommsVatRoot = ERef<{
  addRemote: (name: string, tx: unknown, rx: unknown) => void;
  addEgress: (addr: string, ix: number, provider: unknown) => void;
  addIngress: (
    remoteID: string,
    remoteRefID: number,
    label?: string,
  ) => Promise<any>;
}>;

type SwingsetVats = {
  comms: CommsVatRoot;
  timer: TimerVat;
  vatAdmin: VatAdminVat;
  vattp: VattpVat;
};

type ChainStorageVatParams = {
  vatParameters: { chainStorageEntries?: [k: string, v: string][] };
};

type SoloDevices = {
  vatAdmin: VatAdminDevice;
  mailbox: MailboxDevice;
  command: CommandDevice;
  timer: TimerDevice;
  plugin: PluginDevice;
};

type ChainDevices = {
  vatAdmin: VatAdminDevice;
  mailbox: MailboxDevice;
  timer: TimerDevice;
  bridge?: BridgeDevice;
};

type ClientProvider = {
  getChainBundle: () => unknown;
  getChainConfigNotifier: () => Notifier<unknown>;
};

type Producer<T> = {
  resolve: (v: ERef<T>) => void;
  reject: (r: unknown) => void;
  reset: (reason?: unknown) => void;
};

type VatSourceRef = { bundleName?: string; bundleID?: string };
type VatLoader = <K extends keyof WellKnownVats>(
  name: K,
  sourceRef?: VatSourceRef,
) => WellKnownVats[K];

/** callback to assign a property onto the `home` object of the client */
type PropertyMaker = (addr: string, flags: string[]) => Record<string, unknown>;

/** tool to put properties onto the `home` object of the client */
type ClientManager = {
  assignBundle: (ps: PropertyMaker[]) => void;
};
/**
 * @template B - Bidirectional
 * @template C - Consume only
 * @template P - Produce only
 */
type PromiseSpaceOf<B, C = {}, P = {}> = {
  consume: { [K in keyof (B & C)]: Promise<(B & C)[K]> };
  produce: { [K in keyof (B & P)]: Producer<(B & P)[K]> };
};

type CreateUserBundle = (
  nickname: string,
  clientAddress: string,
  powerFlags: string[],
) => Promise<Record<string, Promise<any>>>;

type ClientFacet = {
  /**
   * Required for ag-solo, but deprecated in favour of getConfiguration NOTE: we
   * use `any` rather than `unknown` because each client that wants to call a
   * method such as `E(userBundle.bank).deposit(payment)` has to cast
   * userBundle.bank; ideally, the cast is to some useful type. But unknown
   * can't be cast directly to some other type; it has to be cast to any first.
   */
  getChainBundle(): ERef<Record<string, any>>;
  getConfiguration(): AsyncIterable<{
    clientAddress: string;
    clientHome: Record<string, any>;
  }>;
};
type ClientCreator = {
  createClientFacet(
    nickname: string,
    clientAddress: string,
    powerFlags: string[],
  ): Promise<ClientFacet>;
  createUserBundle: CreateUserBundle;
};

type WellKnownName = {
  issuer:
    | import('@agoric/internal/src/tokens.js').TokenKeyword
    | 'Invitation'
    | 'AUSD';
  installation:
    | 'centralSupply'
    | 'mintHolder'
    | 'walletFactory'
    | 'provisionPool'
    | 'auctioneer'
    | 'feeDistributor'
    | 'contractGovernor'
    | 'committee'
    | 'noActionElectorate'
    | 'binaryVoteCounter'
    | 'VaultFactory'
    | 'liquidate'
    | 'Pegasus'
    | 'reserve'
    | 'psm'
    | 'scaledPriceAuthority'
    | 'stakeAtom' // test contract
    | 'stakeBld' // test contract
    | 'econCommitteeCharter'
    | 'priceAggregator';
  instance:
    | 'economicCommittee'
    | 'feeDistributor'
    | 'auctioneer'
    | 'VaultFactory'
    | 'VaultFactoryGovernor'
    | 'econCommitteeCharter'
    | 'walletFactory'
    | 'provisionPool'
    | 'reserve'
    | 'reserveGovernor'
    | 'stakeAtom' // test contract
    | 'stakeBld' // test contract
    | 'Pegasus';
  oracleBrand: 'USD';
  uiConfig: 'VaultFactory';
};

type ContractInstallationPromises<
  StartFns extends Record<WellKnownNames['installation'], ContractStartFn>,
> = {
  [Property in keyof StartFns]: Promise<Installation<StartFns[Property]>>;
};

type ContractInstancePromises<
  StartFns extends Record<WellKnownNames['instance'], ContractStartFn>,
> = {
  [Property in keyof StartFns]: Promise<
    import('@agoric/zoe/src/zoeService/utils.js').Instance<StartFns[Property]>
  >;
};

type WellKnownContracts = {
  auctioneer: typeof import('@agoric/inter-protocol/src/auction/auctioneer.js').start;
  centralSupply: typeof import('@agoric/vats/src/centralSupply.js').start;
  committee: typeof import('@agoric/governance/src/committee.js').start;
  contractGovernor: typeof import('@agoric/governance/src/contractGovernor.js').start;
  econCommitteeCharter: typeof import('@agoric/inter-protocol/src/econCommitteeCharter.js').start;
  feeDistributor: typeof import('@agoric/inter-protocol/src/feeDistributor.js').start;
  mintHolder: typeof import('@agoric/vats/src/mintHolder.js').start;
  psm: typeof import('@agoric/inter-protocol/src/psm/psm.js').start;
  provisionPool: typeof import('@agoric/inter-protocol/src/provisionPool.js').start;
  reserve: typeof import('@agoric/inter-protocol/src/reserve/assetReserve.js').start;
  VaultFactory: typeof import('@agoric/inter-protocol/src/vaultFactory/vaultFactory.js').start;
  // no typeof because walletFactory is exporting `start` as a type
  walletFactory: import('@agoric/smart-wallet/src/walletFactory.js').start;
};

type WellKnownSpaces = {
  issuer: {
    produce: Record<WellKnownName['issuer'], Producer<Issuer>>;
    consume: Record<WellKnownName['issuer'], Promise<Issuer>> & {
      BLD: Promise<Issuer<'nat'>>;
      IST: Promise<Issuer<'nat'>>;
    };
  };
  brand: {
    produce: Record<WellKnownName['issuer'], Producer<Brand>> & {
      timer: Producer<import('@agoric/time').TimerBrand>;
    };
    consume: Record<WellKnownName['issuer'], Promise<Brand>> & {
      BLD: Promise<Brand<'nat'>>;
      IST: Promise<Brand<'nat'>>;
      timer: Producer<import('@agoric/time').TimerBrand>;
    };
  };
  oracleBrand: {
    produce: Record<WellKnownName['oracleBrand'], Producer<Brand>>;
    consume: Record<WellKnownName['oracleBrand'], Promise<Brand>>;
  };
  installation: {
    produce: Record<WellKnownName['installation'], Producer<Installation>>;
    consume: Record<
      WellKnownName['installation'],
      Promise<Installation<unknown>>
    > &
      ContractInstallationPromises<WellKnownContracts>;
  };
  instance: {
    produce: Record<WellKnownName['instance'], Producer<Instance>>;
    consume: Record<WellKnownName['instance'], Promise<Instance>> &
      ContractInstancePromises<WellKnownContracts>;
  };
  uiConfig: {
    produce: Record<WellKnownName['uiConfig'], Producer<Record<string, any>>>;
    consume: Record<WellKnownName['uiConfig'], Promise<Record<string, any>>>;
  };
};

type StartGovernedUpgradableOpts<SF extends GovernableStartFn> = {
  installation: ERef<Installation<SF>>;
  issuerKeywordRecord?: IssuerKeywordRecord;
  governedParams: Record<string, unknown>;
  terms: Omit<
    import('@agoric/zoe/src/zoeService/utils').StartParams<SF>['terms'],
    'brands' | 'issuers' | 'governedParams' | 'electionManager'
  >;
  privateArgs: Omit<
    import('@agoric/zoe/src/zoeService/utils').StartParams<SF>['privateArgs'],
    'initialPoserInvitation'
  >;
  label: string;
};

type StartGovernedUpgradable = <SF extends GovernableStartFn>(
  opts: StartGovernedUpgradableOpts<SF>,
) => Promise<GovernanceFacetKit<SF>>;

type StartUpgradableOpts<
  SF extends import('@agoric/zoe/src/zoeService/utils').ContractStartFunction,
> = {
  installation: ERef<Installation<SF>>;
  issuerKeywordRecord?: IssuerKeywordRecord;
  terms?: Omit<
    import('@agoric/zoe/src/zoeService/utils').StartParams<SF>['terms'],
    'brands' | 'issuers'
  >;
  privateArgs?: Parameters<SF>[1];
  label: string;
};

type StartUpgradable = <
  SF extends import('@agoric/zoe/src/zoeService/utils').ContractStartFunction,
>(
  opts: StartUpgradableOpts<SF>,
) => Promise<
  import('@agoric/zoe/src/zoeService/utils').StartedInstanceKit<SF> & {
    label: string;
  }
>;

type StartedInstanceKit<T> =
  import('@agoric/zoe/src/zoeService/utils').StartedInstanceKit<T>;

type StartedInstanceKitWithLabel = {
  label: string;
} & StartedInstanceKit<
  import('@agoric/zoe/src/zoeService/utils').ContractStartFunction
>;

type ChainBootstrapSpaceT = {
  agoricNames: import('../types.js').NameHub;
  agoricNamesAdmin: import('@agoric/vats').NameAdmin;
  bankManager: BankManager;
  bldIssuerKit: RemoteIssuerKit;
  board: import('@agoric/vats').Board;
  bridgeManager: import('../types.js').BridgeManager | undefined;
  chainStorage: StorageNode | null;
  chainTimerService: import('@agoric/time').TimerService;
  client: ClientManager;
  clientCreator: any;
  coreEvalBridgeHandler: import('../types.js').BridgeHandler;
  /** Utilities to support debugging */
  diagnostics: {
    /**
     * Intended to save arguments in durable storage for disaster recovery.
     *
     * Powerful. Can overwrite privateArgs storage for any instance.
     */
    savePrivateArgs: (instance: Instance, privateArgs: unknown) => void;
  };
  /** Super powerful ability to mint IST. ("License to print money") */
  feeMintAccess: FeeMintAccess;
  highPrioritySendersManager:
    | import('@agoric/internal/src/priority-senders.js').PrioritySendersManager
    | undefined
    | null;
  initialSupply: Payment<'nat'>;
  /**
   * Very powerful. Has the private args for critical contract instances such as
   * Vault Factory. ONLY FOR DISASTER RECOVERY
   */
  instancePrivateArgs: Map<Instance, unknown>;
  localchain: import('@agoric/vats/src/localchain.js').LocalChain;
  mints?: MintsVat;
  namesByAddress: import('../types.js').NameHub;
  namesByAddressAdmin: import('../types.js').NamesByAddressAdmin;
  networkVat: NetworkVat;
  orchestration: import('@agoric/orchestration/src/service.js').OrchestrationService;
  pegasusConnections: import('@agoric/vats').NameHubKit;
  pegasusConnectionsAdmin: import('@agoric/vats').NameAdmin;
  priceAuthorityVat: Awaited<PriceAuthorityVat>;
  priceAuthority: PriceAuthority;
  priceAuthorityAdmin: import('@agoric/vats/src/priceAuthorityRegistry').PriceAuthorityRegistryAdmin;
  provisioning: Awaited<ProvisioningVat> | undefined;
  provisionBridgeManager: import('../types.js').ScopedBridgeManager | undefined;
  provisionWalletBridgeManager:
    | import('../types.js').ScopedBridgeManager
    | undefined;
  storageBridgeManager:
    | import('../types.js').ScopedBridgeManager<'storage'>
    | undefined;
  /**
   * Convienence function for starting a contract (ungoverned) and saving its
   * facets (including adminFacet)
   */
  startUpgradable: StartUpgradable;
  /** kits stored by startUpgradable */
  contractKits: MapStore<Instance, StartedInstanceKitWithLabel>;
  /** Convience function for starting contracts governed by the Econ Committee */
  startGovernedUpgradable: StartGovernedUpgradable;
  /** kits stored by startGovernedUpgradable */
  governedContractKits: MapStore<
    Instance,
    GovernanceFacetKit<any> & { label: string }
  >;
  /** Used only for testing. Should not appear in any production proposals. */
  testFirstAnchorKit: import('../vat-bank.js').AssetIssuerKit;
  walletBridgeManager: import('../types.js').ScopedBridgeManager | undefined;
  walletFactoryStartResult: import('./startWalletFactory.js').WalletFactoryStartResult;
  provisionPoolStartResult: GovernanceFacetKit<
    typeof import('@agoric/inter-protocol/src/provisionPool.js').start
  >;
  vatStore: import('./utils.js').VatStore;
  vatUpgradeInfo: MapStore;
  zoe: ZoeService;
};

type ChainBootstrapSpace = PromiseSpaceOf<ChainBootstrapSpaceT>;

type BootstrapVatParams = {
  argv: {
    hardcodedClientAddresses?: string[];
    FIXME_GCI: string;
    PROVISIONER_INDEX?: number;
  };
};

type BootstrapPowers = BootstrapSpace & {
  zone: import('@agoric/zone').Zone;
  devices: SoloDevices | ChainDevices;
  vats: SwingsetVats;
  vatPowers: { [prop: string]: any; D: DProxy };
  vatParameters: BootstrapVatParams;
  runBehaviors: (manifest: unknown) => Promise<unknown>;
  modules: import('./boot-chain.js').BootstrapModules;
};

type BootstrapSpace = WellKnownSpaces &
  PromiseSpaceOf<
    ChainBootstrapSpaceT & {
      vatAdminSvc: VatAdminSvc;
    } & {
      loadVat: VatLoader;
      loadCriticalVat: VatLoader;
    },
    {},
    {}
  >;

type ProvisioningVat = ERef<
  ReturnType<typeof import('../vat-provisioning.js').buildRootObject>
>;

type MintsVat = ERef<
  ReturnType<typeof import('../vat-mints.js').buildRootObject>
>;

type PriceAuthorityVat = ERef<
  ReturnType<typeof import('../vat-priceAuthority.js').buildRootObject>
>;

type NetworkVat = ERef<
  ReturnType<typeof import('../vat-network.js').buildRootObject>
>;
type IBCVat = ERef<ReturnType<typeof import('../vat-ibc.js').buildRootObject>>;
type NamedVatPowers = {
  namedVat: PromiseSpaceOf<{
    agoricNames: Awaited<AgoricNamesVat>;
    board: Awaited<BoardVat>;
  }>;
};

type RemoteIssuerKit = {
  mint: ERef<Mint>;
  issuer: ERef<Issuer>;
  brand: Brand;
};
type AgoricNamesVat = ERef<
  ReturnType<typeof import('../vat-agoricNames.js').buildRootObject>
>;
type BankVat = ERef<
  ReturnType<typeof import('../vat-bank.js').buildRootObject>
>;
type BoardVat = ERef<
  ReturnType<typeof import('../vat-board.js').buildRootObject>
>;
type ChainStorageVat = ERef<
  ReturnType<typeof import('../vat-bridge.js').buildRootObject>
>;
type BankManager = Awaited<ReturnType<Awaited<BankVat>['makeBankManager']>>;

type DemoFaucetPowers = PromiseSpaceOf<{
  mints: MintsVat;
}>;

type SoloVats = {
  spawner: SpawnerVat;
  http: HttpVat;
  network: NetworkVat;
  uploads: UploadsVat;
  bootstrap: unknown;
};

type SpawnerVat = ERef<
  ReturnType<typeof import('@agoric/solo/src/vat-spawner.js').buildRootObject>
>;

type HttpVat = ERef<
  ReturnType<typeof import('@agoric/solo/src/vat-http.js').buildRootObject>
>;

type UploadsVat = ERef<
  ReturnType<typeof import('@agoric/solo/src/vat-uploads.js').buildRootObject>
>;

type WellKnownVats = SwingsetVats & {
  bank: BankVat;
  board: BoardVat;
  bridge: ChainStorageVat;
  localchain: LocalChainVat;
  ibc: IBCVat;
  mints: MintsVat;
  network: NetworkVat;
  orchestration: ERef<
    ReturnType<
      typeof import('@agoric/orchestration/src/vat-orchestration.js').buildRootObject
    >
  >;
  priceAuthority: PriceAuthorityVat;
  provisioning: ProvisioningVat;
  zoe: ERef<ReturnType<typeof import('../vat-zoe.js').buildRootObject>>;
};
