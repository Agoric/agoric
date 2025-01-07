/* eslint-env node */
/**
 * @import {Command} from 'commander';
 * @import {OfferSpec} from '@agoric/smart-wallet/src/offers.js';
 * @import {ExecuteOfferAction} from '@agoric/smart-wallet/src/smartWallet.js';
 * @import {USDCProposalShapes} from '../pool-share-math.js';
 */

import {
  fetchEnvNetworkConfig,
  makeSmartWalletKit,
} from '@agoric/client-utils';
import { AmountMath } from '@agoric/ertp';
import {
  assertParsableNumber,
  ceilDivideBy,
  floorDivideBy,
  multiplyBy,
  parseRatio,
} from '@agoric/zoe/src/contractSupport/ratio.js';
import { InvalidArgumentError } from 'commander';
import { outputActionAndHint } from './bridge-action.js';

export const delay = async ms =>
  new Promise(resolve => setTimeout(resolve, ms));

/** @param {string} arg */
const parseDecimal = arg => {
  try {
    assertParsableNumber(arg);
    const n = Number(arg);
    return n;
  } catch {
    throw new InvalidArgumentError('Not a number');
  }
};

/**
 * @param {string} amountString
 * @param {Brand} usdc
 */
const parseUSDCAmount = (amountString, usdc) => {
  const USDC_DECIMALS = 6;
  const unit = AmountMath.make(usdc, 10n ** BigInt(USDC_DECIMALS));
  return multiplyBy(unit, parseRatio(amountString, usdc));
};

/**
 * @param {Command} program
 * @param {{
 *   fetch?: Window['fetch'];
 *    smartWalletKit?: import('@agoric/client-utils').SmartWalletKit;
 *   stdout: typeof process.stdout;
 *   stderr: typeof process.stderr;
 *   env: typeof process.env;
 *   now: typeof Date.now;
 * }} io
 */
export const addLPCommands = (
  program,
  { fetch, smartWalletKit, stderr, stdout, env, now },
) => {
  const loadSwk = async () => {
    if (smartWalletKit) {
      return smartWalletKit;
    }
    assert(fetch);
    const networkConfig = await fetchEnvNetworkConfig({ env, fetch });
    return makeSmartWalletKit({ delay, fetch }, networkConfig);
  };
  /** @type {undefined | ReturnType<typeof loadSwk>} */
  let swkP;

  program
    .command('deposit')
    .description('Deposit USDC into pool')
    .addHelpText(
      'after',
      '\nPipe the STDOUT to a file such as deposit.json, then use the Agoric CLI to broadcast it:\n  agoric wallet send --offer deposit.json --from gov1 --keyring-backend="test"',
    )
    .requiredOption('--amount <number>', 'USDC amount', parseDecimal)
    .option('--offerId <string>', 'Offer id', String, `lpDeposit-${now()}`)
    .action(async opts => {
      swkP ||= loadSwk();
      const swk = await swkP;

      /** @type {Brand<'nat'>} */
      // @ts-expect-error it doesnt recognize usdc as a Brand type
      const usdc = swk.agoricNames.brand.USDC;
      assert(usdc, 'USDC brand not in agoricNames');

      /** @type {Brand<'nat'>} */
      // @ts-expect-error it doesnt recognize FastLP as a Brand type
      const poolShare = swk.agoricNames.brand.FastLP;
      assert(poolShare, 'FastLP brand not in agoricNames');

      const usdcAmount = parseUSDCAmount(opts.amount, usdc);

      /** @type {import('../types.js').PoolMetrics} */
      // @ts-expect-error it treats this as "unknown"
      const metrics = await swk.readPublished('fastUsdc.poolMetrics');
      const fastLPAmount = floorDivideBy(usdcAmount, metrics.shareWorth);

      /** @type {USDCProposalShapes['deposit']} */
      const proposal = {
        give: {
          USDC: usdcAmount,
        },
        want: {
          PoolShare: fastLPAmount,
        },
      };

      /** @type {OfferSpec} */
      const offer = {
        id: opts.offerId,
        invitationSpec: {
          source: 'agoricContract',
          instancePath: ['fastUsdc'],
          callPipe: [['makeDepositInvitation', []]],
        },
        proposal,
      };

      /** @type {ExecuteOfferAction} */
      const bridgeAction = {
        method: 'executeOffer',
        offer,
      };

      outputActionAndHint(bridgeAction, { stderr, stdout }, swk.marshaller);
    });

  program
    .command('withdraw')
    .description("Withdraw USDC from the LP's pool share")
    .addHelpText(
      'after',
      '\nPipe the STDOUT to a file such as withdraw.json, then use the Agoric CLI to broadcast it:\n  agoric wallet send --offer withdraw.json --from gov1 --keyring-backend="test"',
    )
    .requiredOption('--amount <number>', 'USDC amount', parseDecimal)
    .option('--offerId <string>', 'Offer id', String, `lpWithdraw-${now()}`)
    .action(async opts => {
      swkP ||= loadSwk();
      const swk = await swkP;

      /** @type {Brand<'nat'>} */
      // @ts-expect-error it doesnt recognize FastLP as a Brand type
      const poolShare = swk.agoricNames.brand.FastLP;
      assert(poolShare, 'FastLP brand not in agoricNames');

      /** @type {Brand<'nat'>} */
      // @ts-expect-error it doesnt recognize usdc as a Brand type
      const usdc = swk.agoricNames.brand.USDC;
      assert(usdc, 'USDC brand not in agoricNames');

      const usdcAmount = parseUSDCAmount(opts.amount, usdc);

      /** @type {import('../types.js').PoolMetrics} */
      // @ts-expect-error it treats this as "unknown"
      const metrics = await swk.readPublished('fastUsdc.poolMetrics');
      const fastLPAmount = ceilDivideBy(usdcAmount, metrics.shareWorth);

      /** @type {USDCProposalShapes['withdraw']} */
      const proposal = {
        give: {
          PoolShare: fastLPAmount,
        },
        want: {
          USDC: usdcAmount,
        },
      };

      /** @type {OfferSpec} */
      const offer = {
        id: opts.offerId,
        invitationSpec: {
          source: 'agoricContract',
          instancePath: ['fastUsdc'],
          callPipe: [['makeWithdrawInvitation', []]],
        },
        proposal,
      };

      outputActionAndHint(
        { method: 'executeOffer', offer },
        { stderr, stdout },
        swk.marshaller,
      );
    });

  return program;
};
