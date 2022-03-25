// @ts-check

import { makeIssuerKit, AssetKind, AmountMath } from '@agoric/ertp';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';

import '../../exported.js';
import { assert } from '@agoric/assert';

/**
 * This contract mints non-fungible tokens and creates a selling contract
 * instance to sell the tokens in exchange for some sort of money.
 *
 * StartInstance() returns a creatorFacet which is a ticketMaker with a
 * `.sellTokens()` method. `.sellTokens()` takes a specification of what is
 * being sold, such as: { customValueProperties: { ...arbitrary }, count: 3n,
 * moneyIssuer: moolaIssuer, sellItemsInstallationHandle, pricePerItem:
 * AmountMath.make(moolaBrand, 20n), } The payouts are returned as an
 * offerResult in the `outcome`, and an API that allows selling the tickets that
 * were produced. You can reuse the ticket maker to mint more tickets (e.g. for
 * a separate show.)
 *
 * @param {ZCF<{
 *   tokenName: string;
 * }>} zcf
 */
const start = zcf => {
  const { tokenName = 'token' } = zcf.getTerms();
  // Create the internal token mint
  const { issuer, mint, brand } = makeIssuerKit(tokenName, AssetKind.SET);

  const zoeService = zcf.getZoeService();

  /**
   * @param {object} obj
   * @param {Installation<import('./sellItems.js').start>} obj.sellItemsInstallation
   * @param {any} obj.customValueProperties
   * @param {number} obj.count
   * @param {any} obj.moneyIssuer
   * @param {any} obj.pricePerItem
   */
  const sellTokens = ({
    customValueProperties,
    count,
    moneyIssuer,
    sellItemsInstallation,
    pricePerItem,
  }) => {
    const tokenAmount = AmountMath.make(
      brand,
      harden(
        Array(count)
          .fill(undefined)
          .map((_, i) => {
            const tokenNumber = i + 1;
            return {
              ...customValueProperties,
              number: tokenNumber,
            };
          }),
      ),
    );
    const tokenPayment = mint.mintPayment(harden(tokenAmount));
    // Note that the proposal `want` is empty
    // This is due to a current limitation in proposal
    // expressiveness:
    // https://github.com/Agoric/agoric-sdk/issues/855
    // It's impossible to know in advance how many tokens will be
    // sold, so it's not possible to say `want: moola(3*22)`
    // In a future version of Zoe, it will be possible to express:
    // "I want n times moolas where n is the number of sold tokens"
    const proposal = harden({
      give: { Items: tokenAmount },
    });
    const paymentKeywordRecord = harden({ Items: tokenPayment });

    const issuerKeywordRecord = harden({
      Items: issuer,
      Money: moneyIssuer,
    });

    const sellItemsTerms = harden({
      pricePerItem,
    });
    // FIXME EProxy types, startInstance is any
    const instanceRecordP = E(zoeService).startInstance(
      sellItemsInstallation,
      issuerKeywordRecord,
      sellItemsTerms,
    );
    return instanceRecordP.then(
      ({ creatorInvitation, creatorFacet, instance, publicFacet }) => {
        assert(creatorInvitation);
        return E(zoeService)
          .offer(creatorInvitation, proposal, paymentKeywordRecord)
          .then(sellItemsCreatorSeat => {
            return harden({
              sellItemsCreatorSeat,
              sellItemsCreatorFacet: creatorFacet,
              sellItemsInstance: instance,
              sellItemsPublicFacet: publicFacet,
            });
          });
      },
    );
  };

  /** @type {MintAndSellNFTCreatorFacet} */
  const creatorFacet = Far('creatorFacet', {
    sellTokens,
    getIssuer: () => issuer,
  });

  return harden({ creatorFacet });
};

harden(start);
export { start };
