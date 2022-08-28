/**
 * TODO: share types with other swingset sources.
 *
 * TODO: move delivery-related types and code close together; likewise syscall.
 *
 * TODO: make ignored stuff less noisy.
 *
 * @typedef {{
 *   time: number
 * }} SlogTimedEntry
 * @typedef { SlogTimedEntry & {
 *   crankNum: number,
 *   vatID: string,
 *   deliveryNum: number,
 * }} SlogVatEntry
 *
 * @typedef { SlogVatEntry & {
 *   type: 'deliver',
 *   kd: KernelDelivery,
 * }} SlogDeliveryEntry
 * @typedef { |
 *   [tag: 'message', target: string, msg: Message] |
 *   [tag: 'notify', resolutions: Array<[
 *       kp: string,
 *       desc: { fulfilled: boolean, refCount: number, data: CapData },
 *     ]>] |
 *   [tag: 'retireImports' | 'retireExports' | 'dropExports']
 *   [tag: 'startVat', vatParameters: CapData]
 * } KernelDelivery
 * @typedef {{
 *   method: string,
 *   args: CapData,
 *   result: string,
 * }} Message
 * @typedef {{
 *   body: string,
 *   slots: unknown[],
 * }} CapData
 * @typedef { SlogVatEntry & {
 *   type: 'syscall',
 *   ksc: [tag: 'invoke' | 'subscribe' | 'vatstoreGet'| 'vatstoreSet' | 'vatstoreDelete' |
 *              'dropImports' | 'retireImports' | 'retireExports' ] |
 *        [tag: 'send', target: string, msg: Message] |
 *        [tag: 'resolve', target: string,
 *         resolutions: Array<[kp: string, rejected: boolean, value: CapData]>],
 * }} SlogSyscallEntry
 *
 * @typedef { SlogTimedEntry & {
 *   type: 'create-vat',
 *   vatID: string,
 *   dynamic?: boolean,
 *   description?: string,
 *   name?: string,
 *   managerType?: string,
 *   vatParameters?: Record<string, unknown>,
 *   vatSourceBundle?: unknown,
 * }} SlogCreateVatEntry
 * @typedef { SlogTimedEntry & {
 *   type: 'cosmic-swingset-end-block-start',
 *   blockHeight: number,
 *   blockTime: number,
 * }} SlogEndBlockStartEntry
 * @typedef { SlogTimedEntry & {
 *   type: 'deliver-result',
 *   vatID: string,
 *   dr: [tag: unknown, x: unknown, meter: {}],
 * }} SlogDeliverResultEntry
 * @typedef { SlogTimedEntry & {
 *   type: 'import-kernel-start' | 'import-kernel-finish'
 *       | 'vat-startup-start' | 'vat-startup-finish'
 *       | 'start-replay' | 'finish-replay'
 *       | 'start-replay-delivery' | 'finish-replay-delivery'
 *       | 'cosmic-swingset-begin-block'
 *       | 'cosmic-swingset-end-block-finish'
 *       | 'cosmic-swingset-deliver-inbound'
 *       | 'syscall-result'
 *       | 'clist'
 *       | 'crank-start' | 'crank-finish'
 *       | 'console'
 *       | '@@more TODO'
 * }} SlogToDoEntry
 * @typedef {|
 *  SlogDeliveryEntry | SlogSyscallEntry | SlogCreateVatEntry |
 *  SlogEndBlockStartEntry| SlogDeliverResultEntry |
 *  SlogToDoEntry
 * } SlogEntry
 */
