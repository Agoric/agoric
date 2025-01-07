/* eslint-env node */
/**
 * @import {Command} from 'commander';
 * @import {OfferSpec} from '@agoric/smart-wallet/src/offers.js';
 * @import {ExecuteOfferAction} from '@agoric/smart-wallet/src/smartWallet.js';
 * @import {OperatorKit} from '../exos/operator-kit.js';
 */

import {
  fetchEnvNetworkConfig,
  makeSmartWalletKit,
} from '@agoric/client-utils';
import { mustMatch } from '@agoric/internal';
import { Nat } from '@endo/nat';
import { InvalidArgumentError } from 'commander';
import { INVITATION_MAKERS_DESC } from '../exos/transaction-feed.js';
import { CctpTxEvidenceShape } from '../type-guards.js';
import { outputActionAndHint } from './bridge-action.js';

export const delay = async ms =>
  new Promise(resolve => setTimeout(resolve, ms));

/** @param {string} arg */
const parseNat = arg => {
  const n = Nat(BigInt(arg));
  return n;
};

/** @param {string} arg */
const parseHex = arg => {
  if (!arg.startsWith('0x')) throw new InvalidArgumentError('not a hex string');
  return arg;
};

/**
 * @param {Command} program
 * @param {{
 *   fetch: Window['fetch'];
 *   stdout: typeof process.stdout;
 *   stderr: typeof process.stderr;
 *   env: typeof process.env;
 *   now: typeof Date.now;
 * }} io
 */
export const addOperatorCommands = (
  program,
  { fetch, stderr, stdout, env, now },
) => {
  const operator = program
    .command('operator')
    .description('Oracle operator commands');

  operator
    .command('accept')
    .description('Accept invitation to be an operator')
    .addHelpText(
      'after',
      '\nPipe the STDOUT to a file such as accept.json, then use the Agoric CLI to broadcast it:\n  agoric wallet send --offer accept.json --from gov1 --keyring-backend="test"',
    )
    .option('--offerId <string>', 'Offer id', String, `operatorAccept-${now()}`)
    .action(async opts => {
      const networkConfig = await fetchEnvNetworkConfig({ env, fetch });

      const swk = await makeSmartWalletKit({ delay, fetch }, networkConfig);
      const instance = swk.agoricNames.instance.fastUsdc;
      assert(instance, 'fastUsdc instance not in agoricNames');

      /** @type {OfferSpec} */
      const offer = {
        id: opts.offerId,
        invitationSpec: {
          source: 'purse',
          instance,
          description: INVITATION_MAKERS_DESC,
        },
        proposal: {},
      };

      /** @type {ExecuteOfferAction} */
      const bridgeAction = {
        method: 'executeOffer',
        offer,
      };

      outputActionAndHint(bridgeAction, { stderr, stdout });
    });

  operator
    .command('attest')
    .description('Attest to an observed Fast USDC transfer')
    .addHelpText(
      'after',
      '\nPipe the STDOUT to a file such as attest.json, then use the Agoric CLI to broadcast it:\n  agoric wallet send --offer attest.json --from gov1 --keyring-backend="test"',
    )
    .requiredOption('--previousOfferId <string>', 'Offer id', String)
    .requiredOption('--forwardingChannel <string>', 'Channel id', String)
    .requiredOption('--recipientAddress <string>', 'bech32 address', String)
    .requiredOption('--blockHash <0xhex>', 'hex hash', parseHex)
    .requiredOption('--blockNumber <number>', 'number', parseNat)
    .requiredOption('--chainId <string>', 'chain id', Number)
    .requiredOption('--amount <number>', 'number', parseNat)
    .requiredOption('--forwardingAddress <string>', 'bech32 address', String)
    .requiredOption('--sender <string>', 'Ethereum address initiating', String)
    .requiredOption('--txHash <0xhexo>', 'hex hash', parseHex)
    .option('--offerId <string>', 'Offer id', String, `operatorAttest-${now()}`)
    .action(async opts => {
      const {
        offerId,
        previousOfferId,
        forwardingChannel,
        recipientAddress,
        amount,
        forwardingAddress,
        sender,
        ...flat
      } = opts;

      const evidence = harden({
        aux: { forwardingChannel, recipientAddress },
        tx: { amount, forwardingAddress, sender },
        ...flat,
      });
      mustMatch(evidence, CctpTxEvidenceShape);

      /** @type {OfferSpec} */
      const offer = {
        id: offerId,
        invitationSpec: {
          source: 'continuing',
          previousOffer: previousOfferId,
          /** @type {string & keyof OperatorKit['invitationMakers'] } */
          invitationMakerName: 'SubmitEvidence',
          /** @type {Parameters<OperatorKit['invitationMakers']['SubmitEvidence']> } */
          invitationArgs: [evidence],
        },
        proposal: {},
      };

      outputActionAndHint(
        { method: 'executeOffer', offer },
        { stderr, stdout },
      );
    });

  return operator;
};
