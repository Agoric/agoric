export {};

/* This file defines types that part of the external API of swingset. That
 * includes standard services which user-provided vat code might interact
 * with, like VatAdminService. */

/**
 * @typedef {'getExport' | 'nestedEvaluate' | 'endoZipBase64'} BundleFormat
 */

/**
 * @typedef {import('@endo/marshal').CapData<string>} SwingSetCapData
 */

/**
 * @typedef { { moduleFormat: 'getExport', source: string, sourceMap?: string } } GetExportBundle
 * @typedef { { moduleFormat: 'nestedEvaluate', source: string, sourceMap?: string } } NestedEvaluateBundle
 * @typedef { EndoZipBase64Bundle | GetExportBundle | NestedEvaluateBundle } Bundle
 *
 * @typedef { 'local' | 'xsnap' | 'xs-worker' } ManagerType
 */

/**
 * @typedef {{
 *   defaultManagerType?: ManagerType,
 *   defaultReapInterval?: number | 'never',
 *   relaxDurabilityRules?: boolean,
 *   snapshotInitial?: number,
 *   snapshotInterval?: number,
 *   pinBootstrapRoot?: boolean,
 * }} KernelOptions
 */

/**
 * See ../docs/static-vats.md#vatpowers
 *
 * @typedef { MarshallingVatPowers & TerminationVatPowers } VatPowers
 *
 * @typedef { (VatPowers & MeteringVatPowers) } StaticVatPowers
 *
 * @typedef {{
 *   Remotable: unknown,
 *   getInterfaceOf: unknown,
 * }} MarshallingVatPowers
 *
 * @typedef {{
 *   makeGetMeter: unknown,
 *   transformMetering: unknown,
 * }} MeteringVatPowers
 *
 * @typedef {{
 *   exitVat: (unknown) => void,
 *   exitVatWithFailure: (reason: Error) => void,
 * }} TerminationVatPowers
 */

/*
 * `['message', targetSlot, msg]`
 * msg is `{ methargs, result }`
 * `['notify', resolutions]`
 * `['dropExports', vrefs]`
 */

/**
 * @typedef { import('@agoric/swingset-liveslots').Message } Message
 *
 * @typedef { 'none' | 'ignore' | 'logAlways' | 'logFailure' | 'panic' } ResolutionPolicy
 * @typedef {import('@agoric/internal/src/upgrade-api.js').DisconnectionObject} DisconnectionObject
 *
 * @typedef { import('@agoric/swingset-liveslots').VatDeliveryObject } VatDeliveryObject
 * @typedef { import('@agoric/swingset-liveslots').VatDeliveryResult } VatDeliveryResult
 * @typedef { import('@agoric/swingset-liveslots').VatSyscallObject } VatSyscallObject
 * @typedef { import('@agoric/swingset-liveslots').VatSyscallResult } VatSyscallResult
 *
 * @typedef { [tag: 'message', target: string, msg: Message]} KernelDeliveryMessage
 * @typedef { [kpid: string, kp: { state: string, data: SwingSetCapData }] } KernelDeliveryOneNotify
 * @typedef { [tag: 'notify', resolutions: KernelDeliveryOneNotify[] ]} KernelDeliveryNotify
 * @typedef { [tag: 'dropExports', krefs: string[] ]} KernelDeliveryDropExports
 * @typedef { [tag: 'retireExports', krefs: string[] ]} KernelDeliveryRetireExports
 * @typedef { [tag: 'retireImports', krefs: string[] ]} KernelDeliveryRetireImports
 * @typedef { [tag: 'changeVatOptions', options: Record<string, unknown> ]} KernelDeliveryChangeVatOptions
 * @typedef { [tag: 'startVat', vatParameters: SwingSetCapData ]} KernelDeliveryStartVat
 * @typedef { [tag: 'stopVat', disconnectObject: SwingSetCapData ]} KernelDeliveryStopVat
 * @typedef { [tag: 'bringOutYourDead']} KernelDeliveryBringOutYourDead
 * @typedef { KernelDeliveryMessage | KernelDeliveryNotify | KernelDeliveryDropExports
 *            | KernelDeliveryRetireExports | KernelDeliveryRetireImports | KernelDeliveryChangeVatOptions
 *            | KernelDeliveryStartVat | KernelDeliveryStopVat | KernelDeliveryBringOutYourDead
 *          } KernelDeliveryObject
 * @typedef { [tag: 'send', target: string, msg: Message] } KernelSyscallSend
 * @typedef { [tag: 'invoke', target: string, method: string, args: SwingSetCapData]} KernelSyscallInvoke
 * @typedef { [tag: 'subscribe', vatID: string, kpid: string ]} KernelSyscallSubscribe
 * @typedef { [kpid: string, rejected: boolean, data: SwingSetCapData]} KernelOneResolution
 * @typedef { [tag: 'resolve', vatID: string, resolutions: KernelOneResolution[] ]} KernelSyscallResolve
 * @typedef { [tag: 'exit', vatID: string, isFailure: boolean, info: SwingSetCapData ]} KernelSyscallExit
 * @typedef { [tag: 'vatstoreGet', vatID: string, key: string ]} KernelSyscallVatstoreGet
 * @typedef { [tag: 'vatstoreGetNextKey', vatID: string, priorKey: string ]} KernelSyscallVatstoreGetNextKey
 * @typedef { [tag: 'vatstoreSet', vatID: string, key: string, data: string ]} KernelSyscallVatstoreSet
 * @typedef { [tag: 'vatstoreDelete', vatID: string, key: string ]} KernelSyscallVatstoreDelete
 * @typedef { [tag: 'dropImports', krefs: string[] ]} KernelSyscallDropImports
 * @typedef { [tag: 'retireImports', krefs: string[] ]} KernelSyscallRetireImports
 * @typedef { [tag: 'retireExports', krefs: string[] ]} KernelSyscallRetireExports
 * @typedef { [tag: 'abandonExports', vatID: string, krefs: string[] ]} KernelSyscallAbandonExports
 * @typedef { [tag: 'callKernelHook', hookName: string, args: SwingSetCapData]} KernelSyscallCallKernelHook
 *
 * @typedef { KernelSyscallSend | KernelSyscallInvoke | KernelSyscallSubscribe
 *    | KernelSyscallResolve | KernelSyscallExit | KernelSyscallVatstoreGet | KernelSyscallVatstoreGetNextKey
 *    | KernelSyscallVatstoreSet | KernelSyscallVatstoreDelete | KernelSyscallDropImports
 *    | KernelSyscallRetireImports | KernelSyscallRetireExports | KernelSyscallAbandonExports
 *    | KernelSyscallCallKernelHook
 * } KernelSyscallObject
 * @typedef { [tag: 'ok', data: SwingSetCapData | string | string[] | undefined[] | null ]} KernelSyscallResultOk
 * @typedef { [tag: 'error', err: string ] } KernelSyscallResultError
 * @typedef { KernelSyscallResultOk | KernelSyscallResultError } KernelSyscallResult
 *
 * @typedef {[string, string, SwingSetCapData]} DeviceInvocation
 * @property {string} 0 Kernel slot designating the device node that is the target of
 * the invocation
 * @property {string} 1 A string naming the method to be invoked
 * @property {import('@endo/marshal').CapData<unknown>} 2 A capdata object containing the arguments to the invocation
 * @typedef {[tag: 'ok', data: SwingSetCapData]} DeviceInvocationResultOk
 * @typedef {[tag: 'error', problem: string]} DeviceInvocationResultError
 * @typedef { DeviceInvocationResultOk | DeviceInvocationResultError } DeviceInvocationResult
 *
 * @typedef { { transcriptCount: number } } VatStats
 * @typedef { ReturnType<typeof import('./kernel/state/vatKeeper').makeVatKeeper> } VatKeeper
 * @typedef { ReturnType<typeof import('./kernel/state/kernelKeeper').default> } KernelKeeper
 * @typedef { Awaited<ReturnType<typeof import('@agoric/xsnap').xsnap>> } XSnap
 * @typedef { (dr: VatDeliveryResult) => void } SlogFinishDelivery
 * @typedef { (ksr: KernelSyscallResult, vsr: VatSyscallResult) => void } SlogFinishSyscall
 * @typedef { { write: ({}) => void,
 *              vatConsole: (vatID: string, origConsole: {}) => {},
 *              delivery: (vatID: string,
 *                         newCrankNum: BigInt, newDeliveryNum: BigInt,
 *                         kd: KernelDeliveryObject, vd: VatDeliveryObject,
 *                         replay?: boolean) => SlogFinishDelivery,
 *              syscall: (vatID: string,
 *                        ksc: KernelSyscallObject | undefined,
 *                        vsc: VatSyscallObject) => SlogFinishSyscall,
 *              provideVatSlogger: (vatID: string,
 *                                  dynamic?: boolean,
 *                                  description?: string,
 *                                  name?: string,
 *                                  vatSourceBundle?: *,
 *                                  managerType?: string,
 *                                  vatParameters?: *) => VatSlog,
 *              terminateVat: (vatID: string, shouldReject: boolean, info: SwingSetCapData) => void,
 *             } } KernelSlog
 * @typedef { * } VatSlog
 *
 * @typedef { () => Promise<void> } WaitUntilQuiescent
 */

/**
 * @typedef {{
 *   sourceSpec: string // path to pre-bundled root
 * }} SourceSpec
 * @typedef {{
 *   bundleSpec: string // path to bundled code
 * }} BundleSpec
 * @typedef {{
 *   bundle: Bundle
 * }} BundleRef
 * @typedef {(SourceSpec | BundleSpec | BundleRef ) & {
 *   creationOptions?: Record<string, any>,
 *   parameters?: Record<string, any>,
 * }} SwingSetConfigProperties
 */

/**
 * @typedef {Record<string, SwingSetConfigProperties>} SwingSetConfigDescriptor
 * Where the property name is the name of the vat.  Note that
 * the `bootstrap` property names the vat that should be used as the bootstrap vat.  Although a swingset
 * configuration can designate any vat as its bootstrap vat, `loadBasedir` will always look for a file named
 * 'bootstrap.js' and use that (note that if there is no 'bootstrap.js', there will be no bootstrap vat).
 */

/**
 * @typedef {{ module: string, entrypoint: string, args?: Array<unknown>} | string} ConfigProposal
 */

/**
 * @typedef {object} SwingSetOptions
 * @property {string} [bootstrap]
 * @property {ConfigProposal[]} [coreProposals]
 * @property {string[]} [exportStorageSubtrees] chain storage paths identifying roots of subtrees
 *   for which data should be exported into bootstrap vat parameter `chainStorageEntries`
 *   (e.g., `exportStorageSubtrees: ['c.o']` might result in vatParameters including
 *   `chainStorageEntries: [ ['c.o', null], ['c.o.i', null], ['c.o.i.n', '42'], ['c.o.w', '"moo"'] ]`).
 * @property {boolean} [includeDevDependencies] indicates that
 * `devDependencies` of the surrounding `package.json` should be accessible to
 * bundles.
 * @property {string} [bundleCachePath] if present, SwingSet will use a bundle cache at this path
 * @property {SwingSetConfigDescriptor} vats
 * @property {SwingSetConfigDescriptor} [bundles]
 * @property {BundleFormat} [bundleFormat] the bundle source / import bundle
 * format.
 * @property {*} [devices]
 */
/**
 * @typedef {KernelOptions & SwingSetOptions} SwingSetConfig a swingset config object
 */

/**
 * @typedef {SwingSetConfig & {
 *   namedBundleIDs: Record<string, BundleID>,
 *   idToBundle: Record<BundleID, Bundle>
 * }} SwingSetKernelConfig the config object passed to initializeKernel
 */

/**
 * @typedef {{ bundleName: string} | { bundle: Bundle } | { bundleID: BundleID } } SourceOfBundle
 */
/**
 * @typedef { import('@agoric/swing-store').KVStore } KVStore
 * @typedef { import('@agoric/swing-store').SnapStore } SnapStore
 * @typedef { import('@agoric/swing-store').SnapshotResult } SnapshotResult
 * @typedef { import('@agoric/swing-store').TranscriptStore } TranscriptStore
 * @typedef { import('@agoric/swing-store').SwingStore } SwingStore
 * @typedef { import('@agoric/swing-store').SwingStoreKernelStorage } SwingStoreKernelStorage
 * @typedef { import('@agoric/swing-store').SwingStoreHostStorage } SwingStoreHostStorage
 */

/**
 * @typedef { { computrons?: bigint } } PolicyInputDetails
 * @typedef { [tag: 'none', details: PolicyInputDetails ] } PolicyInputNone
 * @typedef { [tag: 'create-vat', details: PolicyInputDetails  ]} PolicyInputCreateVat
 * @typedef { [tag: 'crank', details: PolicyInputDetails ] } PolicyInputCrankComplete
 * @typedef { [tag: 'crank-failed', details: PolicyInputDetails ]} PolicyInputCrankFailed
 * @typedef { PolicyInputNone | PolicyInputCreateVat | PolicyInputCrankComplete | PolicyInputCrankFailed } PolicyInput
 * @typedef { boolean } PolicyOutput
 * @typedef { { vatCreated: (details: {}) => PolicyOutput,
 *              crankComplete: (details: { computrons?: bigint }) => PolicyOutput,
 *              crankFailed: (details: {}) => PolicyOutput,
 *              emptyCrank: () => PolicyOutput,
 *             } } RunPolicy
 *
 * @typedef {object} VatWarehousePolicy
 * @property { number } [maxVatsOnline]     Limit the number of simultaneous workers
 * @property { boolean } [restartWorkerOnSnapshot]     Reload worker immediately upon snapshot creation
 */

/**
 * Vat Creation and Management
 *
 * @typedef { string } BundleID
 * @typedef {*} BundleCap
 * @typedef { { moduleFormat: 'endoZipBase64', endoZipBase64: string, endoZipBase64Sha512: string } } EndoZipBase64Bundle
 *
 * @typedef { unknown } Meter
 *
 * E(vatAdminService).createVat(bundle, options: DynamicVatOptions)
 */

/**
 * The options used to define vats pass can come from two primary APIs:
 *  * config record: config.vats[name].creationOptions
 *  * E(vatAdminService).createVat(bundlecap, options)
 *
 * These two sources use StaticVatOptions and DynamicVatOptions
 * respectively (the dynamic options are more restrictive, but can include
 * a Meter object). The dynamic `createVat()` process creates a run-queue
 * event named 'create-vat', which carries a form named
 * InternalDynamicVatOptions (which can include a MeterID integer).
 *
 * For both types, when we finally create the vat, the options are
 * converted into RecordedVatOptions, which is plain data and gets stored
 * in the DB (vatKeeper.setSourceAndOptions).
 *
 * Later, when a worker is launched for this vat, vat-loader.js converts
 * the recorded options into ManagerOptions, which explains to the manager
 * how to configure and communicate with the worker.
 *
 * 'BaseVatOptions' holds the common subset of all these types. The other
 * types are then defined as amendments to this base type.
 *
 * @typedef { object } BaseVatOptions
 * @property { string } name
 * @property { * } [vatParameters]
 * @property { boolean } [enableSetup]
 *           If true, permits the vat to construct itself using the
 *           `setup()` API, which bypasses the imposition of LiveSlots but
 *           requires the vat implementation to enforce the vat invariants
 *           manually.  If false, the vat will be constructed using the
 *           `buildRootObject()` API, which uses LiveSlots to enforce the
 *           vat invariants automatically.  Defaults to false.
 * @property { boolean } [enablePipelining]
 *            If true, permits the kernel to pipeline messages to promises
 *            for which the vat is the decider directly to the vat without
 *            waiting for the promises to be resolved.  If false, such
 *            messages will be queued inside the kernel.  Defaults to
 *            false.
 * @property { boolean } [useTranscript]
 *            If true, saves a transcript of a vat's inbound deliveries and
 *            outbound syscalls so that the vat's internal state can be
 *            reconstructed via replay.  If false, no such record is kept.
 *            Defaults to true.
 * @property { number | 'never' } [reapInterval]
 *            The interval (measured in number of deliveries to the vat)
 *            after which the kernel will deliver the 'bringOutYourDead'
 *            directive to the vat.  If the value is 'never',
 *            'bringOutYourDead' will never be delivered and the vat will
 *            be responsible for internally managing (in a deterministic
 *            manner) any visible effects of garbage collection.  Defaults
 *            to the kernel's configured 'defaultReapInterval' value.
 * @property { boolean } [critical]
 */

/**
 * @typedef { { meter?: Meter } } OptMeter
 *        If a meter is provided, the new dynamic vat is limited to a fixed
 *        amount of computation and allocation that can occur during any
 *        given crank. Peak stack frames are limited as well. In addition,
 *        the given meter's "remaining" value will be reduced by the amount
 *        of computation used by each crank. The meter will eventually
 *        underflow unless it is topped up, at which point the vat is
 *        terminated. If undefined, the vat is unmetered. Static vats
 *        cannot be metered.
 *
 * @typedef { { managerType?: ManagerType } } OptManagerType
 * @typedef { BaseVatOptions & OptMeter & OptManagerType } DynamicVatOptions
 *
 * config.vats[name].creationOptions: StaticVatOptions
 *
 * @typedef { { enableDisavow?: boolean } } OptEnableDisavow
 * @typedef { BaseVatOptions & OptManagerType & OptEnableDisavow } StaticVatOptions
 *
 * @typedef { { vatParameters?: object, upgradeMessage?: string } } VatRestartOptions
 * @typedef { { incarnationNumber: number } } VatRestartResults
 *
 * @callback ShutdownWithFailure
 * Called to shut something down because something went wrong, where the reason
 * is supposed to be an Error that describes what went wrong. Some valid
 * implementations of `ShutdownWithFailure` will never return, either
 * because they throw or because they immediately shutdown the enclosing unit
 * of computation. However, they also might return, so the caller should
 * follow this call by their own defensive `throw reason;` if appropriate.
 *
 * @param {Error} reason
 * @returns {void}
 *
 * @typedef {object} VatAdminFacet
 * A powerful object corresponding with a vat
 * that can be used to upgrade it with new code or parameters,
 * terminate it, or be notified when it terminates.
 *
 * @property {() => Promise<any>} done
 * returns a promise that will be fulfilled or rejected when the vat is
 * terminated. If the vat terminates with a failure, the promise will be
 * rejected with the reason. If the vat terminates successfully, the
 * promise will fulfill to the completion value.
 * @property {ShutdownWithFailure} terminateWithFailure
 * Terminate the vat with a failure reason.
 * @property {(bundlecap: BundleCap, options?: VatRestartOptions) => Promise<VatRestartResults>} restartVat
 * Restart the vat with the specified bundle and options. This is a "baggage-style" upgrade,
 * in which the JS memory space is abandoned. The new image is launched with access to 'baggage'
 * and any durable storage reachable from it, and must fulfill all the obligations of the previous
 * incarnation.
 *
 *
 * @typedef {object} CreateVatResults
 * @property {object} root
 * @property {VatAdminFacet} adminNode
 *
 * @typedef {object} VatAdminSvc
 * @property {(id: BundleID) => import('@endo/far').ERef<BundleCap>} waitForBundleCap
 * @property {(id: BundleID) => import('@endo/far').ERef<BundleCap>} getBundleCap
 * @property {(name: string) => import('@endo/far').ERef<BundleCap>} getNamedBundleCap
 * @property {(name: string) => import('@endo/far').ERef<BundleID>} getBundleIDByName
 * @property {(bundleCap: BundleCap, options?: DynamicVatOptions) => import('@endo/far').ERef<CreateVatResults>} createVat
 *
 */
