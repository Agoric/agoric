// @ts-check

export {};

/* This file defines types that part of the external API of swingset. That
 * includes standard services which user-provided vat code might interact
 * with, like VatAdminService. */

/** @typedef {'getExport' | 'nestedEvaluate' | 'endoZipBase64'} BundleFormat */

/** @typedef {import('@endo/marshal').CapData<string>} SwingSetCapData */

/**
 * @typedef {{
 *   moduleFormat: 'getExport';
 *   source: string;
 *   sourceMap: ?string;
 * }} GetExportBundle
 *
 * @typedef {{
 *   moduleFormat: 'nestedEvaluate';
 *   source: string;
 *   sourceMap: ?string;
 * }} NestedEvaluateBundle
 *
 * @typedef {EndoZipBase64Bundle | GetExportBundle | NestedEvaluateBundle} Bundle
 *
 * @typedef {{
 *   bundle: Bundle;
 *   enableSetup: false;
 * }} HasBundle
 *
 * @typedef {{
 *   setup: unknown;
 *   enableSetup: true;
 * }} HasSetup TODO:
 *   liveSlotsConsole... See validateManagerOptions() in factory.js
 *
 * @typedef {| 'local'
 *   | 'nodeWorker'
 *   | 'node-subprocess'
 *   | 'xs-worker'
 *   | 'xs-worker-no-gc'} ManagerType
 *
 * @typedef {{
 *   enablePipelining?: boolean;
 *   managerType: ManagerType;
 *   gcEveryCrank?: boolean;
 *   metered?: boolean;
 *   enableDisavow?: boolean;
 *   useTranscript?: boolean;
 *   reapInterval?: number | 'never';
 *   enableVatstore?: boolean;
 *   vatParameters: Record<string, unknown>;
 *   virtualObjectCacheSize: number;
 *   name: string;
 *   compareSyscalls?: (
 *     originalSyscall: {},
 *     newSyscall: {},
 *   ) => Error | undefined;
 *   vatConsole: Console;
 *   liveSlotsConsole?: Console;
 *   meterID?: string;
 * } & (HasBundle | HasSetup)} ManagerOptions
 */

/**
 * See ../docs/static-vats.md#vatpowers
 *
 * @typedef {MarshallingVatPowers & TerminationVatPowers} VatPowers
 *
 * @typedef {VatPowers & MeteringVatPowers} StaticVatPowers
 *
 * @typedef {{
 *   Remotable: unknown;
 *   getInterfaceOf: unknown;
 * }} MarshallingVatPowers
 *
 * @typedef {{
 *   makeGetMeter: unknown;
 *   transformMetering: unknown;
 * }} MeteringVatPowers
 *
 * @typedef {{
 *   exitVat: (unknown) => void;
 *   exitVatWithFailure: (reason: Error) => void;
 * }} TerminationVatPowers
 */

/*
 * `['message', targetSlot, msg]`
 * msg is `{ method, args, result }`
 * `['notify', resolutions]`
 * `['dropExports', vrefs]`
 */

/**
 * @typedef {{
 *   method: string;
 *   args: SwingSetCapData;
 *   result: string | undefined | null;
 * }} Message
 *
 * @typedef {'none' | 'ignore' | 'logAlways' | 'logFailure' | 'panic'} ResolutionPolicy
 *
 * @typedef {[tag: 'message', target: string, msg: Message]} VatDeliveryMessage
 *
 * @typedef {[vpid: string, isReject: boolean, data: SwingSetCapData]} VatOneResolution
 *
 * @typedef {[tag: 'notify', resolutions: VatOneResolution[]]} VatDeliveryNotify
 *
 * @typedef {[tag: 'dropExports', vrefs: string[]]} VatDeliveryDropExports
 *
 * @typedef {[tag: 'retireExports', vrefs: string[]]} VatDeliveryRetireExports
 *
 * @typedef {[tag: 'retireImports', vrefs: string[]]} VatDeliveryRetireImports
 *
 * @typedef {[tag: 'startVat', vatParameters: SwingSetCapData]} VatDeliveryStartVat
 *
 * @typedef {[tag: 'bringOutYourDead']} VatDeliveryBringOutYourDead
 *
 * @typedef {| VatDeliveryMessage
 *   | VatDeliveryNotify
 *   | VatDeliveryDropExports
 *   | VatDeliveryRetireExports
 *   | VatDeliveryRetireImports
 *   | VatDeliveryStartVat
 *   | VatDeliveryBringOutYourDead} VatDeliveryObject
 *
 * @typedef {| [tag: 'ok', message: null, usage: { compute: number } | null]
 *   | [tag: 'error', message: string, usage: unknown | null]} VatDeliveryResult
 *
 * @typedef {[tag: 'send', target: string, msg: Message]} VatSyscallSend
 *
 * @typedef {[
 *   tag: 'callNow',
 *   target: string,
 *   method: string,
 *   args: SwingSetCapData,
 * ]} VatSyscallCallNow
 *
 * @typedef {[tag: 'subscribe', vpid: string]} VatSyscallSubscribe
 *
 * @typedef {[tag: 'resolve', resolutions: VatOneResolution[]]} VatSyscallResolve
 *
 * @typedef {[tag: 'exit', isFailure: boolean, info: SwingSetCapData]} VatSyscallExit
 *
 * @typedef {[tag: 'vatstoreGet', key: string]} VatSyscallVatstoreGet
 *
 * @typedef {[
 *   tag: 'vatstoreGetAfter',
 *   priorKey: string,
 *   lowerBound: string,
 *   upperBound: string | undefined,
 * ]} VatSyscallVatstoreGetAfter
 *
 * @typedef {[tag: 'vatstoreSet', key: string, data: string]} VatSyscallVatstoreSet
 *
 * @typedef {[tag: 'vatstoreDelete', key: string]} VatSyscallVatstoreDelete
 *
 * @typedef {[tag: 'dropImports', slots: string[]]} VatSyscallDropImports
 *
 * @typedef {[tag: 'retireImports', slots: string[]]} VatSyscallRetireImports
 *
 * @typedef {[tag: 'retireExports', slots: string[]]} VatSyscallRetireExports
 *
 * @typedef {| VatSyscallSend
 *   | VatSyscallCallNow
 *   | VatSyscallSubscribe
 *   | VatSyscallResolve
 *   | VatSyscallExit
 *   | VatSyscallVatstoreGet
 *   | VatSyscallVatstoreGetAfter
 *   | VatSyscallVatstoreSet
 *   | VatSyscallVatstoreDelete
 *   | VatSyscallDropImports
 *   | VatSyscallRetireImports
 *   | VatSyscallRetireExports} VatSyscallObject
 *
 * @typedef {[
 *   tag: 'ok',
 *   data: SwingSetCapData | string | string[] | undefined[] | null,
 * ]} VatSyscallResultOk
 *
 * @typedef {[tag: 'error', err: string]} VatSyscallResultError
 *
 * @typedef {VatSyscallResultOk | VatSyscallResultError} VatSyscallResult
 *
 * @typedef {(vso: VatSyscallObject) => VatSyscallResult} VatSyscaller
 *
 * @typedef {[tag: 'message', target: string, msg: Message]} KernelDeliveryMessage
 *
 * @typedef {[kpid: string, kp: { state: string; data: SwingSetCapData }]} KernelDeliveryOneNotify
 *
 * @typedef {[tag: 'notify', resolutions: KernelDeliveryOneNotify[]]} KernelDeliveryNotify
 *
 * @typedef {[tag: 'dropExports', krefs: string[]]} KernelDeliveryDropExports
 *
 * @typedef {[tag: 'retireExports', krefs: string[]]} KernelDeliveryRetireExports
 *
 * @typedef {[tag: 'retireImports', krefs: string[]]} KernelDeliveryRetireImports
 *
 * @typedef {[tag: 'startVat', vatParameters: SwingSetCapData]} KernelDeliveryStartVat
 *
 * @typedef {[tag: 'bringOutYourDead']} KernelDeliveryBringOutYourDead
 *
 * @typedef {| KernelDeliveryMessage
 *   | KernelDeliveryNotify
 *   | KernelDeliveryDropExports
 *   | KernelDeliveryRetireExports
 *   | KernelDeliveryRetireImports
 *   | KernelDeliveryStartVat
 *   | KernelDeliveryBringOutYourDead} KernelDeliveryObject
 *
 * @typedef {[tag: 'send', target: string, msg: Message]} KernelSyscallSend
 *
 * @typedef {[
 *   tag: 'invoke',
 *   target: string,
 *   method: string,
 *   args: SwingSetCapData,
 * ]} KernelSyscallInvoke
 *
 * @typedef {[tag: 'subscribe', vatID: string, kpid: string]} KernelSyscallSubscribe
 *
 * @typedef {[kpid: string, rejected: boolean, data: SwingSetCapData]} KernelOneResolution
 *
 * @typedef {[
 *   tag: 'resolve',
 *   vatID: string,
 *   resolutions: KernelOneResolution[],
 * ]} KernelSyscallResolve
 *
 * @typedef {[
 *   tag: 'exit',
 *   vatID: string,
 *   isFailure: boolean,
 *   info: SwingSetCapData,
 * ]} KernelSyscallExit
 *
 * @typedef {[tag: 'vatstoreGet', vatID: string, key: string]} KernelSyscallVatstoreGet
 *
 * @typedef {[
 *   tag: 'vatstoreGetAfter',
 *   vatID: string,
 *   priorKey: string,
 *   lowerBound: string,
 *   upperBound: string | undefined,
 * ]} KernelSyscallVatstoreGetAfter
 *
 * @typedef {[tag: 'vatstoreSet', vatID: string, key: string, data: string]} KernelSyscallVatstoreSet
 *
 * @typedef {[tag: 'vatstoreDelete', vatID: string, key: string]} KernelSyscallVatstoreDelete
 *
 * @typedef {[tag: 'dropImports', krefs: string[]]} KernelSyscallDropImports
 *
 * @typedef {[tag: 'retireImports', krefs: string[]]} KernelSyscallRetireImports
 *
 * @typedef {[tag: 'retireExports', krefs: string[]]} KernelSyscallRetireExports
 *
 * @typedef {[tag: 'callKernelHook', hookName: string, args: SwingSetCapData]} KernelSyscallCallKernelHook
 *
 * @typedef {| KernelSyscallSend
 *   | KernelSyscallInvoke
 *   | KernelSyscallSubscribe
 *   | KernelSyscallResolve
 *   | KernelSyscallExit
 *   | KernelSyscallVatstoreGet
 *   | KernelSyscallVatstoreGetAfter
 *   | KernelSyscallVatstoreSet
 *   | KernelSyscallVatstoreDelete
 *   | KernelSyscallDropImports
 *   | KernelSyscallRetireImports
 *   | KernelSyscallRetireExports
 *   | KernelSyscallCallKernelHook} KernelSyscallObject
 *
 * @typedef {[
 *   tag: 'ok',
 *   data: SwingSetCapData | string | string[] | undefined[] | null,
 * ]} KernelSyscallResultOk
 *
 * @typedef {[tag: 'error', err: string]} KernelSyscallResultError
 *
 * @typedef {KernelSyscallResultOk | KernelSyscallResultError} KernelSyscallResult
 *
 * @typedef {[string, string, SwingSetCapData]} DeviceInvocation
 * @property {string} 0 Kernel slot designating the device node that is the
 *   target of the invocation
 * @property {string} 1 A string naming the method to be invoked
 * @property {import('@endo/marshal').CapData<unknown>} 2 A capdata object
 *   containing the arguments to the invocation
 *
 * @typedef {[tag: 'ok', data: SwingSetCapData]} DeviceInvocationResultOk
 *
 * @typedef {[tag: 'error', problem: string]} DeviceInvocationResultError
 *
 * @typedef {DeviceInvocationResultOk | DeviceInvocationResultError} DeviceInvocationResult
 *
 * @typedef {{ d: VatDeliveryObject; syscalls: VatSyscallObject[] }} TranscriptEntry
 *
 * @typedef {{ transcriptCount: number }} VatStats
 *
 * @typedef {ReturnType<
 *   typeof import('./kernel/state/vatKeeper').makeVatKeeper
 * >} VatKeeper
 *
 * @typedef {ReturnType<typeof import('./kernel/state/kernelKeeper').default>} KernelKeeper
 *
 * @typedef {ReturnType<typeof import('@agoric/xsnap').xsnap>} XSnap
 *
 * @typedef {(dr: VatDeliveryResult) => void} SlogFinishDelivery
 *
 * @typedef {(ksr: KernelSyscallResult, vsr: VatSyscallResult) => void} SlogFinishSyscall
 *
 * @typedef {{
 *   write: ({}) => void;
 *   vatConsole: (vatID: string, origConsole: {}) => {};
 *   delivery: (
 *     vatID: string,
 *     newCrankNum: BigInt,
 *     newDeliveryNum: BigInt,
 *     kd: KernelDeliveryObject,
 *     vd: VatDeliveryObject,
 *     replay?: boolean,
 *   ) => SlogFinishDelivery;
 *   syscall: (
 *     vatID: string,
 *     ksc: KernelSyscallObject | undefined,
 *     vsc: VatSyscallObject,
 *   ) => SlogFinishSyscall;
 *   provideVatSlogger: (
 *     vatID: string,
 *     dynamic?: boolean,
 *     description?: string,
 *     name?: string,
 *     vatSourceBundle?: any,
 *     managerType?: string,
 *     vatParameters?: any,
 *   ) => VatSlog;
 *   terminateVat: (
 *     vatID: string,
 *     shouldReject: boolean,
 *     info: SwingSetCapData,
 *   ) => void;
 * }} KernelSlog
 *
 * @typedef {any} VatSlog
 *
 * @typedef {{
 *   createFromBundle: (
 *     vatID: string,
 *     bundle: Bundle,
 *     managerOptions: ManagerOptions,
 *     vatSyscallHandler: unknown,
 *   ) => Promise<VatManager>;
 * }} VatManagerFactory
 *
 * @typedef {{
 *   deliver: (delivery: VatDeliveryObject) => Promise<VatDeliveryResult>;
 *   replayTranscript: (
 *     startPos: StreamPosition | undefined,
 *   ) => Promise<?number>;
 *   makeSnapshot?: (ss: SnapStore) => Promise<string>;
 *   shutdown: () => Promise<void>;
 * }} VatManager
 *
 * @typedef {ReturnType<typeof import('@agoric/swing-store').makeSnapStore>} SnapStore
 *
 * @typedef {() => Promise<void>} WaitUntilQuiescent
 */

/**
 * @typedef {{
 *   sourceSpec: string; // path to pre-bundled root
 * }} SourceSpec
 *
 * @typedef {{
 *   bundleSpec: string; // path to bundled code
 * }} BundleSpec
 *
 * @typedef {{
 *   bundle: Bundle;
 * }} BundleRef
 *
 * @typedef {(SourceSpec | BundleSpec | BundleRef) & {
 *   creationOptions?: Record<string, any>;
 *   parameters?: Record<string, any>;
 * }} SwingSetConfigProperties
 */

/**
 * @typedef {Record<string, SwingSetConfigProperties>} SwingSetConfigDescriptor
 *   Where the property name is the name of the vat. Note that the `bootstrap`
 *   property names the vat that should be used as the bootstrap vat. Although a
 *   swingset configuration can designate any vat as its bootstrap vat,
 *   `loadBasedir` will always look for a file named 'bootstrap.js' and use that
 *   (note that if there is no 'bootstrap.js', there will be no bootstrap vat).
 */

/**
 * @typedef {Object} SwingSetConfig A swingset config object
 * @property {string} [bootstrap]
 * @property {boolean} [includeDevDependencies] Indicates that `devDependencies`
 *   of the surrounding `package.json` should be accessible to bundles.
 * @property {ManagerType} [defaultManagerType]
 * @property {SwingSetConfigDescriptor} [vats]
 * @property {SwingSetConfigDescriptor} [bundles]
 * @property {BundleFormat} [bundleFormat] The bundle source / import bundle format.
 * @property {any} [devices]
 */

/**
 * @typedef {Object} SwingSetKernelConfig The config object passed to initializeKernel
 * @property {string} [bootstrap]
 * @property {boolean} [includeDevDependencies] Indicates that `devDependencies`
 *   of the surrounding `package.json` should be accessible to bundles.
 * @property {ManagerType} [defaultManagerType]
 * @property {SwingSetConfigDescriptor} [vats]
 * @property {SwingSetConfigDescriptor} [bundles]
 * @property {Record<string, BundleID>} namedBundleIDs
 * @property {Record<BundleID, Bundle>} idToBundle
 * @property {BundleFormat} [bundleFormat] The bundle source / import bundle format.
 * @property {any} [devices]
 */

/**
 * @typedef {| { bundleName: string }
 *   | { bundle: Bundle }
 *   | { bundleID: BundleID }} SourceOfBundle
 */
/**
 * @typedef {import('@agoric/swing-store').KVStore} KVStore
 *
 * @typedef {import('@agoric/swing-store').StreamStore} StreamStore
 *
 * @typedef {import('@agoric/swing-store').StreamPosition} StreamPosition
 *
 * @typedef {import('@agoric/swing-store').SwingStore} SwingStore
 *
 * @typedef {{
 *   kvStore: KVStore;
 *   streamStore: StreamStore;
 *   snapStore?: SnapStore;
 * }} HostStore
 *
 * @typedef {ReturnType<
 *   typeof import('./kernel/state/storageWrapper').addHelpers
 * >} KVStorePlus
 */

/**
 * @typedef {[tag: 'none']} PolicyInputNone
 *
 * @typedef {[tag: 'create-vat', details: {}]} PolicyInputCreateVat
 *
 * @typedef {[tag: 'crank', details: { computrons?: bigint }]} PolicyInputCrankComplete
 *
 * @typedef {[tag: 'crank-failed', details: {}]} PolicyInputCrankFailed
 *
 * @typedef {| PolicyInputNone
 *   | PolicyInputCreateVat
 *   | PolicyInputCrankComplete
 *   | PolicyInputCrankFailed} PolicyInput
 *
 * @typedef {boolean} PolicyOutput
 *
 * @typedef {{
 *   vatCreated: (details: {}) => PolicyOutput;
 *   crankComplete: (details: { computrons?: bigint }) => PolicyOutput;
 *   crankFailed: (details: {}) => PolicyOutput;
 *   emptyCrank: () => PolicyOutput;
 * }} RunPolicy
 */

/**
 * The MeterControl object gives liveslots a mechanism to disable metering for
 * certain GC-sensitive regions of code. Only the XS worker can actually do
 * metering, but we track the enabled/disabled status on all workers, so that
 * the assertions can be exercised more thoroughly (via non-XS unit tests).
 * MeterControl.isMeteringDisabled()===false does not mean metering is
 * happening, it just means that MeterControl isn't disabling it.
 *
 * @typedef {Object} MeterControl
 * @property {() => boolean} isMeteringDisabled Ask whether metering is
 *   currently disabled.
 * @property {any} assertIsMetered
 * @property {any} assertNotMetered
 * @property {any} runWithoutMetering Run a callback outside metering
 * @property {any} runWithoutMeteringAsync Run an async callback outside metering
 * @property {any} unmetered Wrap a callback with runWithoutMetering
 */

/**
 * @typedef {string} BundleID
 *
 * @typedef {any} BundleCap
 *
 * @typedef {{
 *   moduleFormat: 'endoZipBase64';
 *   endoZipBase64: string;
 *   endoZipBase64Sha512;
 * }} EndoZipBase64Bundle
 *
 * @typedef {unknown} Meter E(vatAdminService).createVat(bundle, options:
 *   DynamicVatOptions)
 *
 * @typedef {{
 *   description?: string;
 *   meter?: Meter;
 *   managerType?: ManagerType;
 *   vatParameters?: any;
 *   enableSetup?: boolean;
 *   enablePipelining?: boolean;
 *   enableVatstore?: boolean;
 *   virtualObjectCacheSize?: number;
 *   useTranscript?: boolean;
 *   reapInterval?: number | 'never';
 * }} DynamicVatOptionsWithoutMeter
 *
 * @typedef {{ meter?: Meter }} HasMeter
 *
 * @typedef {DynamicVatOptionsWithoutMeter & HasMeter} DynamicVatOptions
 *   Config.vats[name].creationOptions: StaticVatOptions
 *
 * @typedef {{ enableDisavow?: boolean }} HasEnableDisavow
 *
 * @typedef {DynamicVatOptions & HasEnableDisavow} StaticVatOptions
 */
