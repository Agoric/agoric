// @ts-check

import { AmountMath } from '@agoric/ertp';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { observeNotifier } from '@agoric/notifier';

import { makeOnewayPriceAuthorityKit } from '@agoric/zoe/src/contractSupport/index.js';

export const makePriceAuthority = (
  getOutputForGivenInput,
  getInputForWantedOutput,
  actualBrandIn,
  actualBrandOut,
  timer,
  zcf,
  notifier,
  quoteIssuerKit,
) => {
  const { brand, issuer: quoteIssuer } = quoteIssuerKit;

  /** @param {PriceQuoteValue} quote */
  const authenticateQuote = quote => {
    const quoteAmount = AmountMath.make(brand, harden(quote));
    const quotePayment = quoteIssuerKit.mint.mintPayment(quoteAmount);
    return harden({ quoteAmount, quotePayment });
  };

  // called by createQuote for each trigger to compare price to trigger level
  const calcAmountOut = amountIn =>
    getOutputForGivenInput(amountIn, actualBrandOut).amountOut;
  const calcAmountIn = amountOut =>
    getInputForWantedOutput(actualBrandIn, amountOut).amountIn;

  /**
   * @param {PriceQuery} priceQuery
   * @returns {ERef<PriceQuote>}
   */
  function createQuote(priceQuery) {
    const quote = priceQuery(calcAmountOut, calcAmountIn);
    if (!quote) {
      return undefined;
    }

    const { amountIn, amountOut } = quote;
    return E(timer)
      .getCurrentTimestamp()
      .then(now =>
        authenticateQuote([{ amountIn, amountOut, timer, timestamp: now }]),
      );
  }

  const priceAuthorityOptions = harden({
    timer,
    createQuote,
    actualBrandIn,
    actualBrandOut,
    quoteIssuer,
    notifier,
  });

  const {
    priceAuthority,
    adminFacet: { fireTriggers },
  } = makeOnewayPriceAuthorityKit(priceAuthorityOptions);

  // An observer on a notifier that gets updated every time the pool's balances
  // change via swap or liquidity operations. It checks the comparison predicate
  // for each active trigger.
  const priceObserver = Far('priceObserver', {
    updateState: () => {
      fireTriggers(createQuote);
    },
  });

  observeNotifier(notifier, priceObserver);

  return priceAuthority;
};
