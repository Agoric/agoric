// @ts-check

import { E } from '@agoric/eventual-send';
import { Far } from '@endo/marshal';
import { AmountMath } from '@agoric/ertp';
import { daysForVoting } from './bootstrap';
import { ONE_DAY } from '../setup';

const { details: X, quote: q } = assert;

/**
 *
 * @param {(msg: any)=> void} log
 * @param {ZoeService} zoe
 * @param {Brand[]} brands
 * @param {Payment[]} payments
 * @param {ManualTimer} timer configured to tick one day (@see setup.js)
 * @returns {Promise<{startTest: Function}>}
 */
const build = async (log, zoe, brands, payments, timer) => {
  const [moolaBrand] = brands;
  const [moolaPayment] = payments;

  /**
   * @param {import('../../test-vaultFactory').VaultFactoryPublicFacet} vaultFactory
   */
  const oneLoanWithInterest = async vaultFactory => {
    log(`=> alice.oneLoanWithInterest called`);

    const runIssuer = await E(vaultFactory).getRunIssuer();
    const runBrand = await E(runIssuer).getBrand();

    /** @type {UserSeat<VaultKit>} */
    const loanSeat = await E(zoe).offer(
      E(vaultFactory).makeLoanInvitation(),
      harden({
        give: { Collateral: AmountMath.make(moolaBrand, 100n) },
        want: { RUN: AmountMath.make(runBrand, 500000n) },
      }),
      harden({
        Collateral: moolaPayment,
      }),
    );

    const { assetNotifier, vault } = await E(loanSeat).getOfferResult();

    const timeLog = async msg =>
      log(
        `at ${(await E(timer).getCurrentTimestamp()) / ONE_DAY} days: ${msg}`,
      );

    timeLog(`Alice owes ${q(await E(vault).getCurrentDebt())}`);

    // accrue one day of interest at initial rate
    await E(timer).tick();
    timeLog(`Alice owes ${q(await E(vault).getCurrentDebt())}`);

    // advance time enough that governance updates the interest rate
    await Promise.all(new Array(daysForVoting).fill(E(timer).tick()));
    timeLog('vote ready to close');
    timeLog(`Alice owes ${q(await E(vault).getCurrentDebt())}`);

    await E(timer).tick();
    timeLog('vote closed');
    timeLog(`Alice owes ${q(await E(vault).getCurrentDebt())}`);

    const uiDescription = async () => {
      const current = await E(assetNotifier).getUpdateSince();
      return `assetNotifier update #${current.updateCount} has interestRate.numerator ${current.value.interestRate.numerator.value}`;
    };

    timeLog(`1 day after votes cast, ${await uiDescription()}`);
    await E(timer).tick();
    timeLog(`2 days after votes cast, ${await uiDescription()}`);
    timeLog(`Alice owes ${q(await E(vault).getCurrentDebt())}`);
  };

  return Far('build', {
    /**
     * @param {string} testName
     * @param {import('../../test-vaultFactory').VaultFactoryPublicFacet} vaultFactory
     * @returns {Promise<void>}
     */
    startTest: async (testName, vaultFactory) => {
      switch (testName) {
        case 'oneLoanWithInterest': {
          return oneLoanWithInterest(vaultFactory);
        }
        default: {
          assert.fail(X`testName ${testName} not recognized`);
        }
      }
    },
  });
};

/** @type {BuildRootObjectForTestVat} */
export function buildRootObject(vatPowers) {
  return Far('root', {
    build: (zoe, brands, payments, timer) =>
      build(vatPowers.testLog, zoe, brands, payments, timer),
  });
}
