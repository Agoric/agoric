// @ts-check

import { observeNotifier } from '@agoric/notifier';
import { E, Far } from '@endo/far';

/**
 * Wrapper to take the vaultFactory or AMM's creatorFacet, and make a function
 * that will request an invitation and return a promise for a payment.
 *
 * @param {ERef<ZoeService>} zoe
 * @param {{ makeCollectFeesInvitation: () => Promise<Invitation> }} creatorFacet
 */
export function makeFeeCollector(zoe, creatorFacet) {
  /** @type {FeeCollector} */
  return Far('collectFees', {
    collectFees: () => {
      const invitation = E(creatorFacet).makeCollectFeesInvitation();
      const collectFeesSeat = E(zoe).offer(invitation, undefined, undefined);
      return E(collectFeesSeat).getPayout('RUN');
    },
  });
}

/**
 * A distributor of fees from vaultFactory or AMM to the Bank module. Each time
 * the epochTimer signals the end of an Epoch, it will ask the contracts for
 * fees that have been collected to date and send that payment to the depositFacet.
 *
 * @type {BuildFeeDistributor}
 */
export async function buildDistributor(
  contracts,
  feeDepositFacet,
  epochTimer,
  params,
) {
  const {
    // By default, we assume the epochTimer fires once per epoch.
    epochInterval = 1n,
  } = params;

  async function schedulePayments() {
    contracts.map(contract =>
      E(contract)
        .collectFees()
        .then(payment => E(feeDepositFacet).receive(payment)),
    );
  }

  const timeObserver = {
    updateState: _ =>
      schedulePayments().catch(e => {
        console.error('failed with', e);
        throw e;
      }),
    fail: reason => {
      throw Error(`VaultFactory epoch timer failed: ${reason}`);
    },
    finish: done => {
      throw Error(`VaultFactory epoch timer died: ${done}`);
    },
  };

  const epochNotifier = E(epochTimer).makeNotifier(0n, epochInterval);
  return observeNotifier(epochNotifier, timeObserver);
}
