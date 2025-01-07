import { X } from '@endo/errors';
import { Far } from '@endo/marshal';
import { AmountMath } from '@agoric/ertp';

// Eventually will be importable from '@agoric/zoe-contract-support'
import {
  assertIssuerKeywords,
  assertProposalShape,
} from '../../../src/contractSupport/index.js';

/**
 * Give a use object when a payment is escrowed
 *
 * @param {ZCF} zcf
 */
const start = zcf => {
  const {
    brands: { Pixels: pixelBrand },
  } = zcf.getTerms();
  assertIssuerKeywords(zcf, harden(['Pixels']));

  const makeUseObj = seat => {
    assertProposalShape(seat, {
      give: { Pixels: null },
    });
    const useObj = Far('useObj', {
      /**
       * (Pretend to) color some pixels.
       *
       * @param {string} color
       * @param {Amount} [amountToColor]
       */
      colorPixels: (color, amountToColor = undefined) => {
        // Throw if the offer is no longer active, i.e. the user has
        // completed their offer and the assets are no longer escrowed.
        assert(!seat.hasExited(), 'the escrowing offer is no longer active');
        const escrowedAmount = seat.getAmountAllocated('Pixels', pixelBrand);
        // If no amountToColor is provided, color all the pixels
        // escrowed for this offer.
        if (amountToColor === undefined) {
          amountToColor = escrowedAmount;
        }
        assert(amountToColor);
        // Ensure that the amount of pixels that we want to color is
        // covered by what is actually escrowed.
        AmountMath.isGTE(escrowedAmount, amountToColor) ||
          assert.fail(
            X`The pixels to color were not all escrowed. Currently escrowed: ${escrowedAmount}, amount to color: ${amountToColor}`,
          );

        // Pretend to color
        return `successfully colored ${amountToColor.value} pixels ${color}`;
      },
    });
    return useObj;
  };

  const publicFacet = Far('publicFacet', {
    // The only publicFacet method is to make an invitation.
    makeInvitation: async () => zcf.makeInvitation(makeUseObj, 'use object'),
  });

  return harden({ publicFacet });
};

harden(start);
export { start };
