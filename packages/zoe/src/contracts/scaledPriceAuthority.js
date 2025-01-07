import { M, prepareExo } from '@agoric/vat-data';
import {
  ceilDivideBy,
  ceilMultiplyBy,
  floorDivideBy,
  floorMultiplyBy,
} from '../contractSupport/index.js';
import { makeInitialTransform } from '../contractSupport/priceAuthorityInitial.js';
import { makePriceAuthorityTransform } from '../contractSupport/priceAuthorityTransform.js';
import { provideQuoteMint } from '../contractSupport/priceAuthorityQuoteMint.js';

/**
 * @import {PriceAuthority, PriceDescription, PriceQuote, PriceQuoteValue, PriceQuery,} from '@agoric/zoe/tools/types.js';
 */

/**
 * @typedef {object} ScaledPriceAuthorityOpts
 * @property {ERef<PriceAuthority>} sourcePriceAuthority
 * @property {Ratio} scaleIn - sourceAmountIn:targetAmountIn
 * @property {Ratio} scaleOut - sourceAmountOut:targetAmountOut
 * @property {Ratio} [initialPrice] - targetAmountIn:targetAmountOut
 */

/**
 * A contract that scales a source price authority to a target price authority
 * via ratios.
 *
 * No durable state. Because it only transforms there's nothing important to save.
 * However that also means that the contract terms cannot be modified and should
 * a `sourcePriceAuthority` reference sever this contract will break. A future version
 * could allow changing that term through privateArgs or governance.
 *
 * @param {ZCF<ScaledPriceAuthorityOpts>} zcf
 * @param {object} privateArgs
 * @param {import('@agoric/vat-data').Baggage} baggage
 */
// 'prepare' is deprecated but still supported
export const prepare = async (zcf, privateArgs, baggage) => {
  const quoteMint = provideQuoteMint(baggage);

  const { sourcePriceAuthority, scaleIn, scaleOut, initialPrice } =
    zcf.getTerms();

  const {
    numerator: { brand: sourceBrandIn },
    denominator: { brand: actualBrandIn },
  } = scaleIn;
  const {
    numerator: { brand: sourceBrandOut },
    denominator: { brand: actualBrandOut },
  } = scaleOut;

  const priceAuthority = makePriceAuthorityTransform({
    quoteMint,
    // If the priceAuthority is overridden in privateArgs, use that version
    sourcePriceAuthority:
      privateArgs?.newPriceAuthority || sourcePriceAuthority,
    sourceBrandIn,
    sourceBrandOut,
    actualBrandIn,
    actualBrandOut,
    // It's hard to make a good guess as to the best rounding strategy for this
    // transformation, but we make sure that the amount in is generous and the
    // amount out is conservative.
    makeSourceAmountIn: amountIn => ceilMultiplyBy(amountIn, scaleIn),
    makeSourceAmountOut: amountOut => floorMultiplyBy(amountOut, scaleOut),
    transformSourceAmountIn: amountIn => ceilDivideBy(amountIn, scaleIn),
    transformSourceAmountOut: amountOut => floorDivideBy(amountOut, scaleOut),
  });

  const withInitial = initialPrice
    ? priceAuthority.then(pa =>
        makeInitialTransform(
          initialPrice,
          pa,
          quoteMint,
          actualBrandIn,
          actualBrandOut,
        ),
      )
    : priceAuthority;

  const publicFacet = prepareExo(
    baggage,
    'ScaledPriceAuthority public',
    M.interface('ScaledPriceAuthority public', {
      getPriceAuthority: M.call().returns(M.promise()),
    }),
    {
      getPriceAuthority: async () => withInitial,
    },
  );
  return harden({ publicFacet });
};
harden(prepare);
