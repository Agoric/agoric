// @ts-check

/** @typedef {import('./types-external.js').BundleFormat} BundleFormat */

/** @typedef {import('@endo/marshal').CapData<string>} SwingSetCapData */

/** @typedef {import('./types-external.js').BundleID} BundleID */
/** @typedef {import('./types-external.js').BundleCap} BundleCap */
/** @typedef {import('./types-external.js').EndoZipBase64Bundle} EndoZipBase64Bundle */

/**
 * @typedef {import('./types-external.js').GetExportBundle} GetExportBundle
 *
 * @typedef {import('./types-external.js').NestedEvaluateBundle} NestedEvaluateBundle
 *
 * @typedef {import('./types-external.js').Bundle} Bundle
 *
 * @typedef {import('./types-external.js').HasBundle} HasBundle
 *
 * @typedef {import('./types-external.js').HasSetup} HasSetup
 *
 * @typedef {import('./types-external.js').ManagerType} ManagerType
 *
 * @typedef {import('./types-external.js').ManagerOptions} ManagerOptions
 */

/**
 * See ../docs/static-vats.md#vatpowers
 *
 * @typedef {import('./types-external.js').VatPowers} VatPowers
 *
 * @typedef {import('./types-external.js').StaticVatPowers} StaticVatPowers
 *
 * @typedef {import('./types-external.js').MarshallingVatPowers} MarshallingVatPowers
 *
 * @typedef {import('./types-external.js').MeteringVatPowers} MeteringVatPowers
 *
 * @typedef {import('./types-external.js').TerminationVatPowers} TerminationVatPowers
 */

/**
 * @typedef {import('./types-external.js').Message} Message
 *
 * @typedef {import('./types-external.js').ResolutionPolicy} ResolutionPolicy
 *
 * @typedef {import('./types-external.js').VatDeliveryMessage} VatDeliveryMessage
 *
 * @typedef {import('./types-external.js').VatOneResolution} VatOneResolution
 *
 * @typedef {import('./types-external.js').VatDeliveryNotify} VatDeliveryNotify
 *
 * @typedef {import('./types-external.js').VatDeliveryDropExports} VatDeliveryDropExports
 *
 * @typedef {import('./types-external.js').VatDeliveryRetireExports} VatDeliveryRetireExports
 *
 * @typedef {import('./types-external.js').VatDeliveryRetireImports} VatDeliveryRetireImports
 *
 * @typedef {import('./types-external.js').VatDeliveryStartVat} VatDeliveryStartVat
 *
 * @typedef {import('./types-external.js').VatDeliveryBringOutYourDead} VatDeliveryBringOutYourDead
 *
 * @typedef {import('./types-external.js').VatDeliveryObject} VatDeliveryObject
 *
 * @typedef {import('./types-external.js').VatDeliveryResult} VatDeliveryResult
 *
 * @typedef {import('./types-external.js').VatSyscallSend} VatSyscallSend
 *
 * @typedef {import('./types-external.js').VatSyscallCallNow} VatSyscallCallNow
 *
 * @typedef {import('./types-external.js').VatSyscallSubscribe} VatSyscallSubscribe
 *
 * @typedef {import('./types-external.js').VatSyscallResolve} VatSyscallResolve
 *
 * @typedef {import('./types-external.js').VatSyscallExit} VatSyscallExit
 *
 * @typedef {import('./types-external.js').VatSyscallVatstoreGet} VatSyscallVatstoreGet
 *
 * @typedef {import('./types-external.js').VatSyscallVatstoreGetAfter} VatSyscallVatstoreGetAfter
 *
 * @typedef {import('./types-external.js').VatSyscallVatstoreSet} VatSyscallVatstoreSet
 *
 * @typedef {import('./types-external.js').VatSyscallVatstoreDelete} VatSyscallVatstoreDelete
 *
 * @typedef {import('./types-external.js').VatSyscallDropImports} VatSyscallDropImports
 *
 * @typedef {import('./types-external.js').VatSyscallRetireImports} VatSyscallRetireImports
 *
 * @typedef {import('./types-external.js').VatSyscallRetireExports} VatSyscallRetireExports
 *
 * @typedef {import('./types-external.js').VatSyscallObject} VatSyscallObject
 *
 * @typedef {import('./types-external.js').VatSyscallResultOk} VatSyscallResultOk
 *
 * @typedef {import('./types-external.js').VatSyscallResultError} VatSyscallResultError
 *
 * @typedef {import('./types-external.js').VatSyscallResult} VatSyscallResult
 *
 * @typedef {import('./types-external.js').VatSyscaller} VatSyscaller
 *
 * @typedef {import('./types-external.js').KernelDeliveryMessage} KernelDeliveryMessage
 *
 * @typedef {import('./types-external.js').KernelDeliveryOneNotify} KernelDeliveryOneNotify
 *
 * @typedef {import('./types-external.js').KernelDeliveryNotify} KernelDeliveryNotify
 *
 * @typedef {import('./types-external.js').KernelDeliveryDropExports} KernelDeliveryDropExports
 *
 * @typedef {import('./types-external.js').KernelDeliveryRetireExports} KernelDeliveryRetireExports
 *
 * @typedef {import('./types-external.js').KernelDeliveryRetireImports} KernelDeliveryRetireImports
 *
 * @typedef {import('./types-external.js').KernelDeliveryStartVat} KernelDeliveryStartVat
 *
 * @typedef {import('./types-external.js').KernelDeliveryBringOutYourDead} KernelDeliveryBringOutYourDead
 *
 * @typedef {import('./types-external.js').KernelDeliveryObject} KernelDeliveryObject
 *
 * @typedef {import('./types-external.js').KernelSyscallSend} KernelSyscallSend
 *
 * @typedef {import('./types-external.js').KernelSyscallInvoke} KernelSyscallInvoke
 *
 * @typedef {import('./types-external.js').KernelSyscallSubscribe} KernelSyscallSubscribe
 *
 * @typedef {import('./types-external.js').KernelOneResolution} KernelOneResolution
 *
 * @typedef {import('./types-external.js').KernelSyscallResolve} KernelSyscallResolve
 *
 * @typedef {import('./types-external.js').KernelSyscallExit} KernelSyscallExit
 *
 * @typedef {import('./types-external.js').KernelSyscallVatstoreGet} KernelSyscallVatstoreGet
 *
 * @typedef {import('./types-external.js').KernelSyscallVatstoreGetAfter} KernelSyscallVatstoreGetAfter
 *
 * @typedef {import('./types-external.js').KernelSyscallVatstoreSet} KernelSyscallVatstoreSet
 *
 * @typedef {import('./types-external.js').KernelSyscallVatstoreDelete} KernelSyscallVatstoreDelete
 *
 * @typedef {import('./types-external.js').KernelSyscallDropImports} KernelSyscallDropImports
 *
 * @typedef {import('./types-external.js').KernelSyscallRetireImports} KernelSyscallRetireImports
 *
 * @typedef {import('./types-external.js').KernelSyscallRetireExports} KernelSyscallRetireExports
 *
 * @typedef {import('./types-external.js').KernelSyscallObject} KernelSyscallObject
 *
 * @typedef {import('./types-external.js').KernelSyscallResultOk} KernelSyscallResultOk
 *
 * @typedef {import('./types-external.js').KernelSyscallResultError} KernelSyscallResultError
 *
 * @typedef {import('./types-external.js').KernelSyscallResult} KernelSyscallResult
 *
 * @typedef {import('./types-external.js').DeviceInvocation} DeviceInvocation
 *
 * @typedef {import('./types-external.js').DeviceInvocationResultOk} DeviceInvocationResultOk
 *
 * @typedef {import('./types-external.js').DeviceInvocationResultError} DeviceInvocationResultError
 *
 * @typedef {import('./types-external.js').DeviceInvocationResult} DeviceInvocationResult
 *
 * @typedef {import('./types-external.js').TranscriptEntry} TranscriptEntry
 *
 * @typedef {import('./types-external.js').VatStats} VatStats
 *
 * @typedef {import('./types-external.js').VatKeeper} VatKeeper
 *
 * @typedef {import('./types-external.js').KernelKeeper} KernelKeeper
 *
 * @typedef {import('./types-external.js').XSnap} XSnap
 *
 * @typedef {import('./types-external.js').SlogFinishDelivery} SlogFinishDelivery
 *
 * @typedef {import('./types-external.js').SlogFinishSyscall} SlogFinishSyscall
 *
 * @typedef {import('./types-external.js').KernelSlog} KernelSlog
 *
 * @typedef {import('./types-external.js').VatSlog} VatSlog
 *
 * @typedef {import('./types-external.js').VatManagerFactory} VatManagerFactory
 *
 * @typedef {import('./types-external.js').VatManager} VatManager
 *
 * @typedef {import('./types-external.js').SnapStore} SnapStore
 *
 * @typedef {import('./types-external.js').WaitUntilQuiescent} WaitUntilQuiescent
 */

/**
 * @typedef {import('./types-external.js').SourceSpec} SourceSpec
 *
 * @typedef {import('./types-external.js').BundleSpec} BundleSpec
 *
 * @typedef {import('./types-external.js').BundleRef} BundleRef
 *
 * @typedef {import('./types-external.js').SwingSetConfigProperties} SwingSetConfigProperties
 */

/** @typedef {import('./types-external.js').SwingSetConfigDescriptor} SwingSetConfigDescriptor */

/** @typedef {import('./types-external.js').SwingSetConfig} SwingSetConfig */

/** @typedef {import('./types-external.js').SwingSetKernelConfig} SwingSetKernelConfig */

/** @typedef {import('./types-external.js').SourceOfBundle} SourceOfBundle */
/**
 * @typedef {import('@agoric/swing-store').KVStore} KVStore
 *
 * @typedef {import('@agoric/swing-store').StreamStore} StreamStore
 *
 * @typedef {import('@agoric/swing-store').StreamPosition} StreamPosition
 *
 * @typedef {import('@agoric/swing-store').SwingStore} SwingStore
 *
 * @typedef {import('./types-external.js').HostStore} HostStore
 *
 * @typedef {import('./types-external.js').KVStorePlus} KVStorePlus
 */

/**
 * @typedef {import('./types-external.js').PolicyInputNone} PolicyInputNone
 *
 * @typedef {import('./types-external.js').PolicyInputCreateVat} PolicyInputCreateVat
 *
 * @typedef {import('./types-external.js').PolicyInputCrankComplete} PolicyInputCrankComplete
 *
 * @typedef {import('./types-external.js').PolicyInputCrankFailed} PolicyInputCrankFailed
 *
 * @typedef {import('./types-external.js').PolicyInput} PolicyInput
 *
 * @typedef {import('./types-external.js').PolicyOutput} PolicyOutput
 *
 * @typedef {import('./types-external.js').RunPolicy} RunPolicy
 */

/** @typedef {import('./types-external.js').MeterControl} MeterControl */
