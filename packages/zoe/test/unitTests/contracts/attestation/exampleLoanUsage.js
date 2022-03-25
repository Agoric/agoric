// @ts-check

/**
 * ** Create loan:
 *
 * Requires an NFT attestation of brand BldAttLoc, and the amount of RUN that
 * can be loaned is about 10% of the value of BLD represented in the attestation
 * value: amount.value[0].value. (We should allow for multiple elements in the
 * value array, not just one, so we need to iterate through amount.value)
 *
 * ** Add more collateral:
 *
 * Escrow more attestations of brand BldAttLoc. Contract must add the internal
 * BLD values (amount.value[0].value) together to get a total sum of liened BLD.
 *
 * ** Withdraw more RUN:
 *
 * Only allowed if more collateral has been added (see above) or the market
 * value of the collateral has risen.
 *
 * ** Withdraw a partial amount of BLD attestation:
 *
 * Must have returned some RUN, or the market value of collateral has risen, or
 * the loan was overcollateralized to start. Contract calls a publicFacet method
 * in the attestation contract that allows it to split an attestation into
 * multiple versions? Would require no offer safety for the collateral, but that
 * would be true already
 *
 * ** Withdraw all BLD attestation:
 *
 * Must pay back the loan. User gets the bld attestation back, needs to make an
 * offer to the attestation contract to turn it back in.
 *
 * A fungible BLD attestation would be better suited to the RUN LoC as we could
 * just reuse vault code (after removing without liquidation). But that would
 * require being incredibly careful to only allow redemptions of attestations to
 * unlien tokens appropriately. In other words, we have to ensure total
 * conservation of funds on the cosmos side (unliening can't create tokens), and
 * we have to ensure at the very least, that if a fungible NFT attestation is
 * transferred and another person returns it, they cannot unlien more than they
 * liened, and the system should not error if that's the case, just disallow it.
 *
 * Michaelfig identified an additional problem with fungible attestation tokens
 * in which redeeming someone else's fungible tokens can make a user's own
 * fungible attestations tokens unredeemable, but with no external indications
 * of this new change in their functionality.
 */
