/**
 * @callback makeLiveSlots
 */

/**
 * The MeterControl object gives liveslots a mechanism to disable metering for certain GC-sensitive
 * regions of code. Only the XS worker can actually do metering, but we track the enabled/disabled
 * status on all workers, so that the assertions can be exercised more thoroughly (via non-XS unit
 * tests). MeterControl.isMeteringDisabled()===false does not mean metering is happening, it just
 * means that MeterControl isn't disabling it.
 *
 * @typedef {object} MeterControl
 * @property {() => boolean} isMeteringDisabled Ask whether metering is currently disabled.
 * @property {() => void} assertIsMetered
 * @property {() => void} assertNotMetered
 * @property {(fn: () => any) => ReturnType<fn>} runWithoutMetering Run a callback outside metering
 * @property {(fn: () => any) => Promise<ReturnType<fn>>} runWithoutMeteringAsync Run an async callback outside metering
 * @property {(fn: (...args: unknown[]) => any) => typeof fn} unmetered Wrap a callback with runWithoutMetering
 */

/**
 * GcTools is the interface through which liveslots interacts with
 * host environment garbage collection.
 *
 * @typedef {object} GcTools
 * @property {typeof WeakRef} WeakRef
 * @property {typeof FinalizationRegistry} FinalizationRegistry
 * @property {() => Promise<void>} waitUntilQuiescent
 * @property {() => Promise<void>} gcAndFinalize
 * @property {MeterControl} meterControl
 */

/**
 * @typedef {{
 *   enableDisavow?: boolean,
 *   relaxDurabilityRules?: boolean,
 * }} LiveSlotsOptions
 *
 * @typedef {import('@endo/marshal').CapData<string>} SwingSetCapData
 *
 * @typedef {{
 *                methargs: SwingSetCapData, // of [method, args]
 *                result: string | undefined | null,
 *             }} Message
 * @typedef { [tag: 'message', target: string, msg: Message]} VatDeliveryMessage
 * @typedef { [vpid: string, isReject: boolean, data: SwingSetCapData ] } VatOneResolution
 * @typedef { [tag: 'notify', resolutions: VatOneResolution[] ]} VatDeliveryNotify
 * @typedef { [tag: 'dropExports', vrefs: string[] ]} VatDeliveryDropExports
 * @typedef { [tag: 'retireExports', vrefs: string[] ]} VatDeliveryRetireExports
 * @typedef { [tag: 'retireImports', vrefs: string[] ]} VatDeliveryRetireImports
 * @typedef { [tag: 'changeVatOptions', options: Record<string, unknown> ]} VatDeliveryChangeVatOptions
 * @typedef { [tag: 'startVat', vatParameters: SwingSetCapData ]} VatDeliveryStartVat
 * @typedef { [tag: 'stopVat', disconnectObject: SwingSetCapData ]} VatDeliveryStopVat
 * @typedef { [tag: 'bringOutYourDead' ]} VatDeliveryBringOutYourDead
 * @typedef { VatDeliveryMessage | VatDeliveryNotify | VatDeliveryDropExports
 *            | VatDeliveryRetireExports | VatDeliveryRetireImports | VatDeliveryChangeVatOptions
 *            | VatDeliveryStartVat | VatDeliveryStopVat | VatDeliveryBringOutYourDead
 *          } VatDeliveryObject
 *
 * @typedef { { compute: number } } MeterConsumption
 * @typedef { [tag: 'ok', problem: null, usage: MeterConsumption | null] |
 *            [tag: 'error', problem: string, usage: MeterConsumption | null] } VatDeliveryResult
 *
 * @typedef { (delivery: VatDeliveryObject) => (void | Promise<void>) } VatDeliveryProcessor
 *
 * @typedef { [tag: 'send', target: string, msg: Message] } VatSyscallSend
 * @typedef { [tag: 'callNow', target: string, method: string, args: SwingSetCapData]} VatSyscallCallNow
 * @typedef { [tag: 'subscribe', vpid: string ]} VatSyscallSubscribe
 * @typedef { [tag: 'resolve', resolutions: VatOneResolution[] ]} VatSyscallResolve
 * @typedef { [tag: 'exit', isFailure: boolean, info: SwingSetCapData ]} VatSyscallExit
 * @typedef { [tag: 'vatstoreGet', key: string ]} VatSyscallVatstoreGet
 * @typedef { [tag: 'vatstoreGetNextKey', priorKey: string ]} VatSyscallVatstoreGetNextKey
 * @typedef { [tag: 'vatstoreSet', key: string, data: string ]} VatSyscallVatstoreSet
 * @typedef { [tag: 'vatstoreDelete', key: string ]} VatSyscallVatstoreDelete
 * @typedef { [tag: 'dropImports', slots: string[] ]} VatSyscallDropImports
 * @typedef { [tag: 'retireImports', slots: string[] ]} VatSyscallRetireImports
 * @typedef { [tag: 'retireExports', slots: string[] ]} VatSyscallRetireExports
 * @typedef { [tag: 'abandonExports', slots: string[] ]} VatSyscallAbandonExports
 *
 * @typedef { VatSyscallSend | VatSyscallCallNow | VatSyscallSubscribe
 *    | VatSyscallResolve | VatSyscallExit | VatSyscallVatstoreGet | VatSyscallVatstoreGetNextKey
 *    | VatSyscallVatstoreSet | VatSyscallVatstoreDelete | VatSyscallDropImports
 *    | VatSyscallRetireImports | VatSyscallRetireExports | VatSyscallAbandonExports
 * } VatSyscallObject
 *
 * @typedef { [tag: 'ok', data: SwingSetCapData | string | string[] | null ]} VatSyscallResultOk
 * @typedef { [tag: 'error', err: string ] } VatSyscallResultError
 * @typedef { VatSyscallResultOk | VatSyscallResultError } VatSyscallResult
 *
 * @typedef { (vso: VatSyscallObject) => VatSyscallResult } VatSyscaller
 *
 */

// Ensure this is a module.
export {};
