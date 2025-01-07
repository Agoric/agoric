// @ts-check
/* eslint-env node */
import { fetchEnvNetworkConfig, makeWalletUtils } from '@agoric/client-utils';
import { Fail } from '@endo/errors';
import { CommanderError } from 'commander';
import { normalizeAddressWithOptions } from '../lib/chain.js';
import { bigintReplacer } from '../lib/format.js';
import { sendAction } from '../lib/wallet.js';

/**
 * Make commands for testing.
 *
 * @param {{
 *   env: Partial<Record<string, string>>,
 *   stdout: Pick<import('stream').Writable,'write'>,
 *   stderr: Pick<import('stream').Writable,'write'>,
 *   now: () => number,
 *   createCommand: // Note: includes access to process.stdout, .stderr, .exit
 *     typeof import('commander').createCommand,
 *   execFileSync: typeof import('child_process').execFileSync,
 *   setTimeout: typeof setTimeout,
 * }} process
 * @param {{ fetch: typeof window.fetch }} net
 */
export const makeTestCommand = (
  { env, stdout, now, setTimeout, execFileSync, createCommand },
  { fetch },
) => {
  /** @param {number} ms */
  const delay = async ms => new Promise(resolve => setTimeout(resolve, ms));
  const show = (info, indent = false) =>
    stdout.write(
      `${JSON.stringify(info, bigintReplacer, indent ? 2 : undefined)}\n`,
    );

  const tryMakeUtils = async () => {
    await null;
    try {
      // XXX pass fetch to getNetworkConfig() explicitly
      // await null above makes this await safe
      const networkConfig = await fetchEnvNetworkConfig({ env, fetch });
      return makeWalletUtils({ fetch, delay }, networkConfig);
    } catch (err) {
      // CommanderError is a class constructor, and so
      // must be invoked with `new`.
      throw new CommanderError(1, 'RPC_FAIL', err.message);
    }
  };

  const testCmd = createCommand('test').description('test operations');

  testCmd
    .command('upgrade-contract')
    .description('make simple offer to upgrade-contract')
    .option('--home <dir>', 'agd CosmosSDK application home directory')
    .option(
      '--keyring-backend <os|file|test>',
      `keyring's backend (os|file|test) (default "${
        env.AGORIC_KEYRING_BACKEND || 'os'
      }")`,
      env.AGORIC_KEYRING_BACKEND,
    )
    .option('--offer-id <string>', 'Offer id', String, `my-${now()}`)
    .requiredOption(
      '--from <address>',
      'wallet address literal or name',
      literalOrName =>
        normalizeAddressWithOptions(literalOrName, testCmd.opts(), {
          execFileSync,
        }),
    )
    .action(async opts => {
      const { agoricNames, networkConfig, pollOffer } = await tryMakeUtils();
      const { from } = opts;
      const { home, keyringBackend: backend } = testCmd.opts();

      const io = { ...networkConfig, execFileSync, delay, stdout };
      /** @type {import('@agoric/smart-wallet/src/offers.js').OfferSpec} */
      const offer = {
        id: opts.offerId,
        invitationSpec: {
          source: 'contract',
          instance: agoricNames.instance.myInstance || Fail`no myInstance`,
          publicInvitationMaker: 'makeInvitation',
        },
        proposal: {
          want: {
            Tokens: {
              // @ts-expect-error BoardRemote not a Brand object
              brand: agoricNames.brand.GoodStuff,
              value: 32n,
            },
          },
        },
      };
      const result = await sendAction(
        {
          method: 'executeOffer',
          offer,
        },
        { keyring: { home, backend }, from, verbose: false, ...io },
      );
      if (result?.code !== 0) {
        throw result;
      }
      show({ height: result?.height, txhash: result?.txhash });
      const found = await pollOffer(from, offer.id, result.height, true);
      show(found, true);
      const numWantsSatisfied = found.numWantsSatisfied || 0;
      if (numWantsSatisfied < 1) {
        process.exit(2);
      }
    });

  return testCmd;
};
