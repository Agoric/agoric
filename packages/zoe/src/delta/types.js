// @ts-check

/**
 * @template S
 * @typedef {object} AllocationIncr
 * @property {S} seat
 * @property {AmountKeywordRecord} add
 */

/**
 * @template S
 * @typedef {object} AllocationDecr
 * @property {S} seat
 * @property {AmountKeywordRecord} subtract
 */

/**
 * @template S
 * @typedef {AllocationIncr<S> | AllocationDecr<S>} AllocationDelta
 */

/**
 * @template S
 * @typedef {AllocationDelta<S>[]} AllocationDeltas
 */

/**
 * @template S
 * @typedef {CopyMap<S, Allocation>} SeatAllocations
 */

/**
 * @template S
 * @typedef {object} ZoeSeatMgr
 * @property {(uncleanAllocation: Allocation) => Allocation} cleanAllocation
 * @property {(seat: S) => boolean} hasExited
 * @property {(seat: S) => Allocation} getCurrentAllocation
 * @property {(seat: S, newAllocation: Allocation) => boolean} isOfferSafe
 */

/**
 * @template S
 * @callback ApplyDeltas
 * @param {ZoeSeatMgr<S>} seatMgr
 * @param {AllocationDeltas<S>} uncleanDeltas
 * @returns {SeatAllocations<S>}
 */
