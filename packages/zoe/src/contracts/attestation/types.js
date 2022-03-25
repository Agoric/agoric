/** @typedef {string} Address */

/**
 * @callback GetAttMaker
 * @param {Address} address
 * @returns {AttMaker}
 */

/**
 * @typedef AttMaker
 * @property {(amountToLien: Amount) => Promise<Payment>} makeAttestation
 * @property {MakeReturnAttInvitation} makeReturnAttInvitation
 */

/**
 * @callback MakeAttMaker
 * @param {Address} address
 * @returns {AttMaker}
 */

/**
 * @callback Max Return the greater of two Amounts.
 * @param {Amount} x
 * @param {Amount} y
 * @returns {Amount}
 */

/**
 * @callback GetLienAmount
 * @param {Address} address
 * @param {Timestamp} currentTime
 * @returns {Amount}
 */

/**
 * @callback GetReturnableLienAmount
 * @param {Address} address
 * @returns {Amount}
 */

/**
 * @callback AddReturnableLien Given an address string and an Amount to put a
 *   lien on, record that the Amount is "liened", and mint an attestation
 *   payment for the amount liened. Return the payment.
 * @param {Address} address
 * @param {Amount} amount
 * @returns {Promise<Payment>}
 */

/**
 * @typedef {Object} ReturnableAttElem
 * @property {Address} address
 * @property {Amount} amountLiened
 */

/**
 * @callback ReturnAttestation
 * @param {ZCFSeat} seat
 * @returns {void}
 */

/**
 * @callback DisallowExtensions
 * @param {Address} address
 * @returns {void}
 */

/**
 * @callback Slashed On slashing, we disallow any extensions. We do not reduce the liens.
 * @param {Address[]} addresses
 * @param {Timestamp} currentTime
 * @returns {void}
 */

/**
 * @callback MakeReturnAttInvitation Make an invitation for returning a
 *   returnable attestation.
 * @returns {Promise<Invitation>}
 */

/**
 * @callback GetLiened Get the amount currently liened for the address and brand.
 * @param {Address} addresses
 * @param {Timestamp} currentTime
 * @param {Brand} brand
 * @returns {Amount}
 */

/**
 * @typedef {{
 *   getTime: () => Timestamp;
 *   updateTime: (currentTime: Timestamp) => void;
 * }} StoredTime
 */

/**
 * @typedef {Object} StakingAuthority
 * @property {(address: string, brand: Brand) => ERef<AccountState>} getAccountState
 *
 * @typedef {Object} AccountState
 * @property {Amount} bonded
 * @property {Amount} liened
 * @property {Amount} locked
 * @property {Amount} total
 * @property {Amount} unbonding
 * @property {bigint} currentTime
 */
