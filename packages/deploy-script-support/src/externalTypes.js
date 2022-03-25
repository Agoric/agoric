/**
 * @callback InstallSaveAndPublish
 * @param {string} resolvedPath
 * @param {Petname} contractPetname
 * @returns {{ installation: Installation; id: string }}
 */

/**
 * @typedef {Object} StartInstanceResultWithDetailsNoInvitation
 * @property {any} creatorFacet
 * @property {any} publicFacet
 * @property {Instance} instance
 * @property {InvitationDetails} creatorInvitationDetails
 * @property {AdminFacet} adminFacet
 */

/**
 * @typedef {Object} OfferHelperConfig
 * @property {ERef<Invitation>} [invitation]
 * @property {Partial<InvitationDetails>} [partialInvitationDetails]
 * @property {Proposal} proposal
 * @property {Record<Keyword, Petname>} paymentsWithPursePetnames
 * @property {Record<Keyword, Petname>} payoutPursePetnames
 */

/**
 * @callback OfferHelper
 * @param {OfferHelperConfig} config
 * @returns {{
 *   seat: Promise<UserSeat>;
 *   deposited: Promise<Promise<Amount>[]>;
 *   invitationDetails: InvitationDetails;
 * }}
 */

/**
 * @callback FindInvitationAmount
 * @param {Record<string, any>} invitationDetailsCriteria
 * @returns {Amount} InvitationAmount
 */

/**
 * @callback DepositInvitation
 * @param {ERef<Invitation>} invitationP
 * @returns {InvitationDetails}
 */

/**
 * @callback SaveIssuerHelper
 * @param {ERef<Issuer>} issuer
 * @param {Petname} brandPetname
 * @param {Petname} pursePetname
 * @returns {Promise<(Promise)[]}
 */

/**
 * @callback AssertOfferResult
 * @param {ERef<UserSeat>} seat
 * @param {string} expectedOfferResult
 * @returns {Promise<void>}
 */

/**
 * @typedef {string | string[]} Petname A petname can either be a plain string
 *   or a path for which the first element is a petname for the origin, and the
 *   rest of the elements are a snapshot of the names that were first given by
 *   that origin. We are migrating away from using plain strings, for consistency.
 */
