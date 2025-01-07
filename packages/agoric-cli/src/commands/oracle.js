// @ts-check
/* eslint-disable func-names */
/* eslint-env node */
import {
  fetchEnvNetworkConfig,
  makeAgoricNames,
  makeVstorageKit,
  makeWalletUtils,
  storageHelper,
} from '@agoric/client-utils';
import { Offers } from '@agoric/inter-protocol/src/clientSupport.js';
import { oracleBrandFeedName } from '@agoric/inter-protocol/src/proposals/utils.js';
import { Fail } from '@endo/errors';
import { Nat } from '@endo/nat';
import * as cp from 'child_process';
import { Command } from 'commander';
import { inspect } from 'util';
import { normalizeAddressWithOptions } from '../lib/chain.js';
import { bigintReplacer } from '../lib/format.js';
import {
  getCurrent,
  outputAction,
  sendAction,
  sendHint,
} from '../lib/wallet.js';

/** @import {PriceAuthority, PriceDescription, PriceQuote, PriceQuoteValue, PriceQuery,} from '@agoric/zoe/tools/types.js'; */

// XXX support other decimal places
const COSMOS_UNIT = 1_000_000n;
const scaleDecimals = num => BigInt(num * Number(COSMOS_UNIT));

/**
 * Prints JSON output to stdout and diagnostic info (like logs) to stderr
 *
 * @param {import('anylogger').Logger} logger
 * @param {{
 *   delay?: (ms: number) => Promise<void>,
 *   execFileSync?: typeof import('child_process').execFileSync,
 *   env?: Record<string, string | undefined>,
 *   stdout?: Pick<import('stream').Writable,'write'>,
 * }} [io]
 */
export const makeOracleCommand = (logger, io = {}) => {
  const {
    delay = async ms => new Promise(resolve => setTimeout(resolve, ms)),
    execFileSync = cp.execFileSync,
    env = process.env,
    stdout = process.stdout,
  } = io;
  const oracle = new Command('oracle')
    .description('Oracle commands')
    .usage(
      `
  WALLET=my-wallet
  export AGORIC_NET=ollinet

  # provision wallet if necessary
  agd keys add $WALLET
  # provision with faucet, e.g.
  open https://ollinet.faucet.agoric.net/ # and paste the key and choose client: smart-wallet

  # confirm funds
  agoric wallet list
  agoric wallet show —from $WALLET

  # prepare an offer to send
  # (offerId is optional but best to specify as each must be higher than the last and the default value is a huge number)
  agops oracle accept --offerId 12 > offer-12.json

  # sign and send
  agoric wallet send --from $WALLET --offer offer-12.json
  `,
    )
    .option(
      '--keyring-backend <os|file|test>',
      `keyring's backend (os|file|test) (default "${
        env.AGORIC_KEYRING_BACKEND || 'os'
      }")`,
      env.AGORIC_KEYRING_BACKEND,
    );

  const normalizeAddress = literalOrName =>
    normalizeAddressWithOptions(literalOrName, oracle.opts(), {
      execFileSync,
    });

  const rpcTools = async () => {
    // XXX pass fetch to getNetworkConfig() explicitly
    const networkConfig = await fetchEnvNetworkConfig({
      env: process.env,
      fetch,
    });
    const vsk = makeVstorageKit({ fetch }, networkConfig);
    const agoricNames = await makeAgoricNames(vsk.fromBoard, vsk.vstorage);

    const lookupPriceAggregatorInstance = ([brandIn, brandOut]) => {
      const name = oracleBrandFeedName(brandIn, brandOut);
      const instance = agoricNames.instance[name];
      if (!instance) {
        logger.debug('known instances:', agoricNames.instance);
        throw Error(`Unknown instance ${name}`);
      }
      return instance;
    };

    return { ...vsk, networkConfig, lookupPriceAggregatorInstance };
  };

  oracle
    .command('accept')
    .description('accept invitation to operate an oracle')
    .requiredOption(
      '--pair [brandIn.brandOut]',
      'token pair (brandIn.brandOut)',
      s => s.split('.'),
      ['ATOM', 'USD'],
    )
    .option(
      '--offerId <string>',
      'Offer id',
      String,
      `oracleAccept-${Date.now()}`,
    )
    .action(async function (opts) {
      const { lookupPriceAggregatorInstance } = await rpcTools();
      const instance = lookupPriceAggregatorInstance(opts.pair);

      /** @type {import('@agoric/smart-wallet/src/offers.js').OfferSpec} */
      const offer = {
        id: opts.offerId,
        invitationSpec: {
          source: 'purse',
          instance,
          description: 'oracle invitation',
        },
        proposal: {},
      };

      outputAction({
        method: 'executeOffer',
        offer,
      });

      console.warn(sendHint);
    });

  oracle
    .command('pushPriceRound')
    .description('add a price for a round to a fluxAggregator')
    .option(
      '--offerId <string>',
      'Offer id',
      String,
      `pushPriceRound-${Date.now()}`,
    )
    .requiredOption(
      '--oracleAdminAcceptOfferId <string>',
      'offer that had continuing invitation result',
      String,
    )
    .requiredOption('--price <number>', 'price', Number)
    .option('--roundId <number>', 'round', Number)
    .action(async function (opts) {
      const { offerId } = opts;
      const unitPrice = scaleDecimals(opts.price);
      const roundId = 'roundId' in opts ? Nat(opts.roundId) : undefined;

      const offer = Offers.fluxAggregator.PushPrice(
        {},
        { offerId, unitPrice, roundId },
        opts.oracleAdminAcceptOfferId,
      );

      outputAction({
        method: 'executeOffer',
        offer,
      });

      console.warn(sendHint);
    });

  const findOracleCap = async (instance, from, readPublished) => {
    const current = await getCurrent(from, { readPublished });

    const { offerToUsedInvitation: entries } = /** @type {any} */ (current);
    Array.isArray(entries) || Fail`entries must be an array: ${entries}`;

    for (const [offerId, { value }] of entries) {
      /** @type {{ description: string, instance: unknown }[]} */
      const [{ description, instance: candidate }] = value;
      if (description === 'oracle invitation' && candidate === instance) {
        return offerId;
      }
    }
  };

  oracle
    .command('find-continuing-id')
    .description('print id of specified oracle continuing invitation')
    .requiredOption(
      '--from <address>',
      'wallet address literal or name',
      normalizeAddress,
    )
    .requiredOption(
      '--pair [brandIn.brandOut]',
      'token pair (brandIn.brandOut)',
      s => s.split('.'),
    )
    .action(async opts => {
      const { readPublished, lookupPriceAggregatorInstance } = await rpcTools();
      const instance = lookupPriceAggregatorInstance(opts.pair);

      const offerId = await findOracleCap(instance, opts.from, readPublished);
      if (!offerId) {
        console.error('No continuing ids found');
      }
      console.log(offerId);
    });

  oracle
    .command('query')
    .description('return current aggregated (median) price')
    .requiredOption(
      '--pair [brandIn.brandOut]',
      'token pair (brandIn.brandOut)',
      s => s.split('.'),
      ['ATOM', 'USD'],
    )
    .action(async function (opts) {
      const { pair } = opts;
      const { vstorage, fromBoard } = await rpcTools();

      const capDataStr = await vstorage.readLatest(
        `published.priceFeed.${pair[0]}-${pair[1]}_price_feed`,
      );
      const capDatas = storageHelper.unserializeTxt(capDataStr, fromBoard);

      console.log(inspect(capDatas[0], { depth: 10, colors: true }));
    });

  const show = (info, indent = false) =>
    stdout.write(
      `${JSON.stringify(info, bigintReplacer, indent ? 2 : undefined)}\n`,
    );
  /** @param {bigint} secs */
  const fmtSecs = secs => new Date(Number(secs) * 1000).toISOString();

  oracle
    .command('setPrice')
    .description('set price by pushing from multiple operators')
    .requiredOption(
      '--pair [brandIn.brandOut]',
      'token pair (brandIn.brandOut)',
      s => s.split('.'),
      ['ATOM', 'USD'],
    )
    .requiredOption(
      '--keys [key1,key2,...]',
      'key names of operators (comma separated)',
      s => s.split(','),
      ['gov1', 'gov2'],
    )
    .requiredOption('--price <number>', 'price', Number)
    .action(
      async (
        /**
         * @type {{
         *  pair: [brandIn: string, brandOut: string],
         *  keys: string[],
         *  price: number,
         * }}
         */ { pair, keys, price },
      ) => {
        const {
          readLatestHead,
          readPublished,
          networkConfig,
          lookupPriceAggregatorInstance,
        } = await rpcTools();
        const wutil = await makeWalletUtils({ fetch, delay }, networkConfig);
        const unitPrice = scaleDecimals(price);

        const feedPath = `published.priceFeed.${pair[0]}-${pair[1]}_price_feed`;

        const readPrice = async () =>
          /** @type {Promise<PriceDescription>} */ (
            readLatestHead(feedPath).catch(() => {
              const viewer = `https://vstorage.agoric.net/#${networkConfig.rpcAddrs[0]}|published,published.priceFeed|${feedPath}`;
              console.warn(`no existing price data; see ${viewer}`);
              return undefined;
            })
          );

        const r4 = x => Math.round(x * 10000) / 10000; // XXX 4 decimals arbitrary
        const fmtFeed = ({
          amountIn: { value: valueIn },
          amountOut: { value: valueOut },
          timestamp: { absValue: ts },
        }) => ({
          timestamp: fmtSecs(ts),
          price: r4(Number(valueOut) / Number(valueIn)),
        });
        const before = await readPrice();
        if (before) {
          show(fmtFeed(before));
        }

        const keyOrder = keys.map(normalizeAddress);
        if (before) {
          console.error(
            'Choose lead oracle operator order based on latestRound...',
          );

          const latestRoundP =
            /** @type {Promise<{roundId: number, startedAt: import('@agoric/time').TimestampRecord, startedBy: string}>} */ (
              readLatestHead(
                `published.priceFeed.${pair[0]}-${pair[1]}_price_feed.latestRound`,
              )
            );
          await Promise.race([
            delay(5000),
            latestRoundP.then(round => {
              const { roundId, startedAt, startedBy } = round;
              show({
                startedAt: fmtSecs(startedAt.absValue),
                roundId,
                startedBy,
              });
              if (startedBy === keyOrder[0]) {
                keyOrder.reverse();
              }
            }),
          ]).catch(err => {
            console.warn(err);
          });
        }

        const instance = lookupPriceAggregatorInstance(pair);
        const adminOfferIds = {};
        for await (const from of keyOrder) {
          adminOfferIds[from] = await findOracleCap(
            instance,
            from,
            readPublished,
          );
          if (!adminOfferIds[from]) {
            console.error(
              `Failed to find an offer accepting oracle invitation for ${from}. Accept and try again:`,
            );
            console.error(
              `    agops oracle accept > accept.json; agoric wallet send --from ${from} --offer accept.json`,
            );
          }
        }
        assert(
          Object.values(adminOfferIds).every(x => x),
          'Missing oracle admin offer ids',
        );

        console.error('pushPrice from each:', keyOrder);
        for await (const from of keyOrder) {
          const oracleAdminAcceptOfferId = adminOfferIds[from];
          show({ from, oracleAdminAcceptOfferId });
          const offerId = `pushPrice-${Date.now()}`;
          const offer = Offers.fluxAggregator.PushPrice(
            {},
            { offerId, unitPrice },
            oracleAdminAcceptOfferId,
          );

          const { home, keyringBackend: backend } = oracle.opts();
          const tools = { ...networkConfig, execFileSync, delay, stdout };
          const result = await sendAction(
            { method: 'executeOffer', offer },
            { keyring: { home, backend }, from, verbose: false, ...tools },
          );
          assert(result); // Not dry-run
          const { timestamp, txhash, height } = result;
          console.error('pushPrice', price, 'offer broadcast');
          show({ timestamp, height, offerId: offer.id, txhash });
          const found = await wutil.pollOffer(from, offer.id, result.height);
          console.error('pushPrice', price, 'offer satisfied');
          show(found);
        }

        const after = await readPrice();
        if (after) {
          console.error('price set:');
          show(fmtFeed(after));
        }
      },
    );
  return oracle;
};
