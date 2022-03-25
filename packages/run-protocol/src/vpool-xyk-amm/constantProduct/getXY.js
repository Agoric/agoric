// @ts-check

// This does not support secondary to secondary. That has to happen at
// a higher abstraction

const { details: X } = assert;
/**
 * The caller provides poolAllocation, which has balances for both Central and
 * Secondary, and at least one of amountGiven and amountWanted. getXY treats the
 * amountGiven as the X pool, and amountWanted as Y. It figures out which way to
 * pair up X and Y with Central and Secondary, and returns the pool balances as
 * X and Y and given and wanted as deltaX and deltaY { X, Y, deltaX, deltaY }.
 *
 * @type {GetXY}
 */
export const getXY = ({ amountGiven, poolAllocation, amountWanted }) => {
  // Regardless of whether we are specifying the amountIn or the
  // amountOut, the xBrand is the brand of the amountIn.
  const xBrand = amountGiven && amountGiven.brand;
  const yBrand = amountWanted && amountWanted.brand;
  const secondaryBrand = poolAllocation.Secondary.brand;
  const centralBrand = poolAllocation.Central.brand;
  assert(
    amountGiven || amountWanted,
    X`At least one of ${amountGiven} and ${amountWanted} must be specified`,
  );

  const deltas = {
    deltaX: amountGiven,
    deltaY: amountWanted,
  };

  if (secondaryBrand === xBrand || centralBrand === yBrand) {
    // @ts-ignore at least one of amountGiven and amountWanted is non-null
    return harden({
      x: poolAllocation.Secondary,
      y: poolAllocation.Central,
      ...deltas,
    });
  }
  if (centralBrand === xBrand || secondaryBrand === yBrand) {
    // @ts-ignore at least one of amountGiven and amountWanted is non-null
    return harden({
      x: poolAllocation.Central,
      y: poolAllocation.Secondary,
      ...deltas,
    });
  }
  assert.fail(`brand ${xBrand} was not recognized as Central or Secondary`);
};
