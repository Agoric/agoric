// @ts-check

/**
 * @typedef {Object} PursesAddedState
 * @property {Purse} purse
 * @property {Brand} brand
 * @property {PurseActions} actions
 */

/** @typedef {PursesJSONState & PursesAddedState} PursesFullState */

/**
 * @typedef {Object} PurseActions
 * @property {(
 *   receiverP: ERef<{ receive: (payment: Payment) => void }>,
 *   valueToSend: AmountValue,
 * ) => Promise<void>} send
 * @property {(payment: Payment) => Promise<Amount>} receive
 * @property {(payment: Payment, amount?: Amount) => Promise<Amount>} deposit
 */

/**
 * @typedef {Object} BrandRecord
 * @property {Brand} brand
 * @property {Issuer} issuer
 * @property {string} issuerBoardId
 */

/**
 * @typedef {Object} Contact
 * @property {string} [depositBoardId]
 */

/**
 * @typedef {Object} DappRecord
 * @property {Promise<void>} [approvalP]
 * @property {Petname} suggestedPetname
 * @property {Petname} petname
 * @property {boolean} enable
 * @property {string} origin
 * @property {DappActions} actions
 */

/**
 * @typedef {Object} DappActions
 * @property {(petname: Petname) => DappActions} setPetname
 * @property {() => DappActions} enable
 * @property {(reason: any) => DappActions} disable
 */

/**
 * @template T
 * @typedef {Object} Mapping
 * @property {(petname: Petname) => string} implode
 * @property {(str: string) => Petname} explode
 * @property {LegacyWeakMap<T, Petname>} valToPetname
 * @property {WeakStore<T, string[][]>} valToPaths TODO What about when
 *   useLegacyMap is true because contact have identity? `T` would be `Contact`.
 *   Shouldn't `valToPaths` be a `LegacyWeakMap`?
 * @property {Store<Petname, T>} petnameToVal
 * @property {(petname: Petname, val: T) => void} addPetname
 * @property {(path: string[], val: T) => void} addPath
 * @property {(petname: Petname, val: T) => void} renamePetname
 * @property {(petname: Petname) => void} deletePetname
 * @property {(petname: Petname, val: T) => Petname} suggestPetname
 * @property {string} kind
 */

/**
 * @typedef {Object} PaymentRecord
 * @property {RecordMetadata} meta
 * @property {Issuer} [issuer]
 * @property {Payment} [payment]
 * @property {Brand} brand
 * @property {'pending' | 'deposited' | 'expired'} [status]
 * @property {PaymentActions} actions
 * @property {Amount} [lastAmount]
 * @property {Amount} [depositedAmount]
 * @property {string} [issuerBoardId]
 *
 * @typedef {Object} PaymentActions
 * @property {(purseOrPetname?: Purse | Petname) => Promise<AmountValue>} deposit
 * @property {() => Promise<boolean>} refresh
 * @property {() => Promise<boolean>} getAmountOf
 */

/**
 * We obtain the WalletAdminFacet from its implementation. Ideally this facet
 * would not be necessary. Once we have clarified and standardized its APIs we
 * would make them part of the WalletUser available as `home.wallet` in the
 * REPL. Then, the Wallet UI could use that instead.
 *
 * @typedef {ReturnType<typeof import('./lib-wallet').makeWallet>['admin']}
 *   WalletAdminFacet
 */
