/// <reference types="ses"/>

/**
 * @template {string} H - The name of the handle
 * @typedef {H & {}} Handle A type constructor for an opaque type identified by
 *   the H string. This uses an intersection type ('MyHandle' & {}) to tag the
 *   handle's type even though the actual value is just an empty object.
 */

/**
 * @typedef {string} Keyword
 *
 * @typedef {Handle<'Invitation'>} InvitationHandle - An opaque handle for an invitation
 *
 * @typedef {Record<Keyword, Issuer>} IssuerKeywordRecord
 *
 * @typedef {Record<Keyword, ERef<Issuer>>} IssuerPKeywordRecord
 *
 * @typedef {Record<Keyword, Brand>} BrandKeywordRecord
 */

/**
 * @template {AssetKind} [K=AssetKind]
 * @typedef {Object} StandardTerms
 * @property {IssuerKeywordRecord} issuers - Record with keywords keys, issuer values
 * @property {BrandKeywordRecord} brands - Record with keywords keys, brand values
 *
 * @typedef {StandardTerms & Record<string, any>} AnyTerms
 *
 * @typedef {Object} InstanceRecord
 * @property {Installation} installation
 * @property {Instance} instance
 * @property {AnyTerms} terms - Contract parameters
 *
 * @typedef {Object} IssuerRecord
 * @property {Brand<K>} brand
 * @property {Issuer<K>} issuer
 * @property {K} assetKind
 * @property {any} [displayInfo]
 *
 * @typedef {AmountKeywordRecord} Allocation
 *
 * @typedef {Record<Keyword, AmountMath>} AmountMathKeywordRecord
 */

/** @typedef {Payment<'set'>} Invitation */
