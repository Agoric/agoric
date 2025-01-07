import { M } from '@endo/patterns';
import { makeDurableZone } from '@agoric/zone/durable.js';
import { prepareOwnable } from '../../../src/contractSupport/prepare-ownable.js';

/**
 * @param {ZCF} zcf
 * @param {{ count: bigint}} privateArgs
 * @param {import('@agoric/vat-data').Baggage} baggage
 */
export const start = async (zcf, privateArgs, baggage) => {
  const zone = makeDurableZone(baggage, 'rootZone');
  const { count: startCount = 0n } = privateArgs;
  assert.typeof(startCount, 'bigint');

  const makeUnderlyingCounterKit = zone.exoClassKit(
    'OwnableCounter',
    {
      counter: M.interface('OwnableCounter', {
        incr: M.call().returns(M.bigint()),
        // required by makePrepareOwnableClass
        getInvitationCustomDetails: M.call().returns(
          harden({
            count: M.bigint(),
          }),
        ),
        toBeAttenuated: M.call().returns(),
      }),
      viewer: M.interface('ViewCounter', {
        view: M.call().returns(M.bigint()),
      }),
    },
    /**
     * @param {bigint} count
     */
    count => ({
      count,
    }),
    {
      counter: {
        incr() {
          const { state } = this;
          state.count += 1n;
          return state.count;
        },
        getInvitationCustomDetails() {
          const { count } = this.state;
          return harden({
            count,
          });
        },
        toBeAttenuated() {},
      },
      viewer: {
        view() {
          const { count } = this.state;
          return count;
        },
      },
    },
  );

  const makeOwnableCounter = prepareOwnable(
    zone,
    async (...args) => zcf.makeInvitation(...args),
    'OwnableCounter',
    /** @type {const} */ (['incr', 'getInvitationCustomDetails']),
  );

  const { counter: underlyingCounter, viewer } =
    makeUnderlyingCounterKit(startCount);

  const ownableCounter = makeOwnableCounter(underlyingCounter);

  return harden({
    creatorFacet: ownableCounter,
    publicFacet: viewer,
  });
};
harden(start);
