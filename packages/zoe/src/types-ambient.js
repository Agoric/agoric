// @jessie-check

/// <reference types="ses"/>

/**
 * @template {string} H - the name of the handle
 * @typedef {H & import("@endo/marshal").Remotable} Handle A type constructor for an opaque type
 * identified by the H string. This uses an intersection type
 * ('MyHandle' & {}) to tag the handle's type even though the actual
 * value is just an empty object.
 */

/**
 * @typedef {string} Keyword
 * @typedef {Handle<'Invitation'>} InvitationHandle - an opaque handle for an invitation
 * @typedef {Record<Keyword, Issuer<any>>} IssuerKeywordRecord
 * @typedef {Record<Keyword, ERef<Issuer<any>>>} IssuerPKeywordRecord
 * @typedef {Record<Keyword, Brand<any>>} BrandKeywordRecord
 */

/**
 * @typedef {object} StandardTerms
 * @property {IssuerKeywordRecord} issuers - record with
 * keywords keys, issuer values
 * @property {BrandKeywordRecord} brands - record with keywords
 * keys, brand values
 *
 * @typedef {StandardTerms & Record<string, any>} AnyTerms
 *
 * @typedef {object} InstanceRecord
 * @property {Installation} installation
 * @property {import("./zoeService/utils.js").Instance<any>} instance
 * @property {AnyTerms} terms - contract parameters
 */

/**
 * @template {AssetKind} [K=AssetKind]
 * @typedef {object} IssuerRecord
 * @property {Brand<K>} brand
 * @property {Issuer<K>} issuer
 * @property {K} assetKind
 * @property {DisplayInfo<K>} [displayInfo]
 *
 * @typedef {AmountKeywordRecord} Allocation
 */

/**
 * @template {object} [R=unknown] Offer result
 * @template {object} [A=never] Offer args
 * @typedef {Payment<'set'>} Invitation
 */
