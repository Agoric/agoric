/**
 * @file Inter Protocol Liquidation Bidding CLI
 * @see {makeInterCommand} for main function
 */

// @ts-check
import { fetchEnvNetworkConfig, makeWalletUtils } from '@agoric/client-utils';
import { makeOfferSpecShape } from '@agoric/inter-protocol/src/auction/auctionBook.js';
import { Offers } from '@agoric/inter-protocol/src/clientSupport.js';
import { objectMap } from '@agoric/internal';
import { M, matches } from '@endo/patterns';
import { CommanderError, InvalidArgumentError } from 'commander';
import { normalizeAddressWithOptions, pollBlocks } from '../lib/chain.js';
import {
  asBoardRemote,
  bigintReplacer,
  makeAmountFormatter,
} from '../lib/format.js';
import { getCurrent, outputActionAndHint, sendAction } from '../lib/wallet.js';

const { values } = Object;

const bidInvitationShape = harden({
  source: 'agoricContract',
  instancePath: ['auctioneer'],
  callPipe: [['makeBidInvitation', M.any()]],
});

/** @import {VBankAssetDetail} from '@agoric/vats/tools/board-utils.js'; */
/** @import {TryExitOfferAction} from '@agoric/smart-wallet/src/smartWallet.js'; */
/** @import {OfferSpec as BidSpec} from '@agoric/inter-protocol/src/auction/auctionBook.js' */
/** @import {ScheduleNotification} from '@agoric/inter-protocol/src/auction/scheduler.js' */
/** @import {BookDataNotification} from '@agoric/inter-protocol/src/auction/auctionBook.js' */

/**
 * Format amounts, prices etc. based on brand board Ids, displayInfo
 *
 * @param {VBankAssetDetail[]} assets
 */
const makeFormatters = assets => {
  const r4 = x => Math.round(x * 10_000) / 10_000;

  const br = asBoardRemote;
  const fmtAmtTuple = makeAmountFormatter(assets);

  /** @param {Amount} amt */
  const amount = amt => (([l, m]) => `${m} ${l}`)(fmtAmtTuple(br(amt)));
  /** @param {Record<string, Amount> | undefined} r */
  const record = r => (r ? objectMap(r, amount) : undefined);
  /** @param {Ratio} r */
  const price = r => {
    const [nl, nm] = fmtAmtTuple(br(r.numerator));
    const [dl, dm] = fmtAmtTuple(br(r.denominator));
    return `${r4(Number(nm) / Number(dm))} ${nl}/${dl}`;
  };
  /** @param {Ratio} r */
  const discount = r =>
    r4(100 - (Number(r.numerator.value) / Number(r.denominator.value)) * 100);

  // XXX real TimeMath.absValue requires real Remotable timerBrand
  /** @param {import('@agoric/time').Timestamp} ts */
  const absValue = ts => (typeof ts === 'bigint' ? ts : ts.absValue);

  /** @param {import('@agoric/time').Timestamp} tr */
  const absTime = tr => new Date(Number(absValue(tr)) * 1000).toISOString();
  /** @param {import('@agoric/time').RelativeTimeRecord} tr */
  const relTime = tr =>
    new Date(Number(tr.relValue) * 1000).toISOString().slice(11, 19);

  /** @param {bigint} bp */
  const basisPoints = bp => `${(Number(bp) / 100).toFixed(2)}%`;

  /**
   * @template T
   * @param {(_: T) => string} f
   * @returns { (x: T | null | undefined ) => string | undefined }
   */
  const maybe = f => x => (x ? f(x) : undefined);

  return {
    amount,
    amountOpt: maybe(amount),
    record,
    price,
    priceOpt: maybe(price),
    discount,
    absTime,
    absTimeOpt: maybe(absTime),
    relTime,
    basisPoints,
  };
};

/**
 * Dynamic check that an OfferStatus is also a BidSpec.
 *
 * @param {import('@agoric/smart-wallet/src/offers.js').OfferStatus} offerStatus
 * @param {import('@agoric/vats/tools/board-utils.js').AgoricNamesRemotes} agoricNames
 * @param {typeof console.warn} warn
 * returns null if offerStatus is not a BidSpec
 */
const coerceBid = (offerStatus, agoricNames, warn) => {
  const { offerArgs } = offerStatus;
  /** @type {unknown} */
  const collateralBrand = /** @type {any} */ (offerArgs)?.maxBuy?.brand;
  if (!collateralBrand) {
    warn('mal-formed bid offerArgs', offerStatus.id, offerArgs);
    return null;
  }
  const bidSpecShape = makeOfferSpecShape(
    // @ts-expect-error XXX AssetKind narrowing?
    agoricNames.brand.IST,
    collateralBrand,
  );
  if (!matches(offerStatus.offerArgs, bidSpecShape)) {
    warn('mal-formed bid offerArgs', offerArgs);
    return null;
  }

  /**
   * @type {import('@agoric/smart-wallet/src/offers.js').OfferStatus &
   *        { offerArgs: BidSpec}}
   */
  // @ts-expect-error dynamic cast
  const bid = offerStatus;
  return bid;
};

/**
 * Format amounts etc. in a BidSpec OfferStatus
 *
 * @param {import('@agoric/smart-wallet/src/offers.js').OfferStatus &
 *         { offerArgs: BidSpec}} bid
 * @param {VBankAssetDetail[]} assets
 */
export const fmtBid = (bid, assets) => {
  const fmt = makeFormatters(assets);

  const { offerArgs } = bid;
  /** @type {{ price: string } | { discount: number }} */
  const spec =
    'offerPrice' in offerArgs
      ? { price: fmt.price(offerArgs.offerPrice) }
      : { discount: fmt.discount(offerArgs.offerBidScaling) };

  const {
    id,
    proposal: { give, want },
    offerArgs: { maxBuy },
    payouts,
    result,
    error,
  } = bid;
  const resultProp =
    !error && result && result !== 'UNPUBLISHED' ? { result } : {};
  const props = {
    ...(give ? { give: fmt.record(give) } : {}),
    ...(want ? { give: fmt.record(want) } : {}),
    ...(maxBuy ? { maxBuy: fmt.amount(maxBuy) } : {}),
    ...(payouts ? { payouts: fmt.record(payouts) } : resultProp),
    ...(error ? { error } : {}),
  };
  return harden({ id, ...spec, ...props });
};

/**
 * Make Inter Protocol liquidation bidding commands.
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
export const makeInterCommand = (
  {
    env,
    stdout,
    stderr,
    now,
    setTimeout,
    execFileSync: rawExec,
    createCommand,
  },
  { fetch },
) => {
  const interCmd = createCommand('inter')
    .description('Inter Protocol commands for liquidation bidding etc.')
    .option('--home <dir>', 'agd CosmosSDK application home directory')
    .option(
      '--fees <amount>',
      'set fees for transaction broadcast (e.g. 5000ubld)',
    )
    .option(
      '--keyring-backend <os|file|test>',
      `keyring's backend (os|file|test) (default "${
        env.AGORIC_KEYRING_BACKEND || 'os'
      }")`,
      env.AGORIC_KEYRING_BACKEND,
    );

  /** @type {typeof import('child_process').execFileSync} */
  // @ts-expect-error execFileSync is overloaded
  const execFileSync = (file, args, ...opts) => {
    try {
      return rawExec(file, args, ...opts);
    } catch (err) {
      // InvalidArgumentError is a class constructor, and so
      // must be invoked with `new`.
      throw new InvalidArgumentError(
        `${err.message}: is ${file} in your $PATH?`,
      );
    }
  };

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

  const auctionCmd = interCmd
    .command('auction')
    .description('auction commands');
  auctionCmd
    .command('status')
    .description(
      `show auction status in JSON format

For example:

inter auction status
{
  "schedule": {
    "activeStartTime": "2023-04-19T22:50:02.000Z",
    "nextStartTime": "2023-04-19T23:00:02.000Z",
    "nextDescendingStepTime": "2023-04-19T22:51:02.000Z"
  },
  "book0": {
    "startPrice": "12.34 IST/ATOM",
    "currentPriceLevel": "11.723 IST/ATOM",
    "startCollateral": "0 ATOM",
    "collateralAvailable": "0 ATOM"
  },
  "params": {
    "DiscountStep": "5.00%",
    "ClockStep": "00:00:20",
    "LowestRate": "45.00%"
  }
}
`,
    )
    .option('--book <number>', 'Auction Book', Number, 0)
    .action(
      async (
        /**
         * @type {{
         *   book: number,
         * }}
         */ opts,
      ) => {
        const { agoricNames, readPublished } = await tryMakeUtils();

        const [schedule, book, { current: params }] = await Promise.all([
          readPublished('auction.schedule'),
          readPublished(`auction.book${opts.book}`),
          readPublished('auction.governance'),
        ]);

        const fmt = makeFormatters(Object.values(agoricNames.vbankAsset));
        const info = {
          schedule: {
            activeStartTime: fmt.absTimeOpt(schedule.activeStartTime),
            nextStartTime: fmt.absTimeOpt(schedule.nextStartTime),
            nextDescendingStepTime: fmt.absTimeOpt(
              schedule.nextDescendingStepTime,
            ),
          },
          [`book${opts.book}`]: {
            startPrice: fmt.priceOpt(book.startPrice),
            currentPriceLevel: fmt.priceOpt(book.currentPriceLevel),
            startProceedsGoal: fmt.amountOpt(book.startProceedsGoal),
            remainingProceedsGoal: fmt.amountOpt(book.remainingProceedsGoal),
            proceedsRaised: fmt.amountOpt(book.proceedsRaised),
            startCollateral: fmt.amount(book.startCollateral),
            collateralAvailable: fmt.amountOpt(book.collateralAvailable),
          },
          params: {
            DiscountStep: fmt.basisPoints(params.DiscountStep.value),
            ClockStep: fmt.relTime(params.ClockStep.value),
            LowestRate: fmt.basisPoints(params.LowestRate.value),
          },
        };

        show(info, true);
      },
    );

  const bidCmd = interCmd
    .command('bid')
    .description('auction bidding commands');

  /**
   * @param {string} from
   * @param {import('@agoric/smart-wallet/src/offers.js').OfferSpec} offer
   * @param {Awaited<ReturnType<tryMakeUtils>>} tools
   * @param {boolean | undefined} dryRun
   */
  const placeBid = async (from, offer, tools, dryRun = false) => {
    const { networkConfig, agoricNames, pollOffer } = tools;
    const io = { ...networkConfig, execFileSync, delay, stdout };

    const { home, keyringBackend: backend, fees } = interCmd.opts();
    const result = await sendAction(
      { method: 'executeOffer', offer },
      { keyring: { home, backend }, from, fees, verbose: false, dryRun, ...io },
    );
    if (dryRun) {
      return;
    }

    assert(result); // Not dry-run
    const { timestamp, txhash, height } = result;
    console.error('bid is broadcast:');
    show({ timestamp, height, offerId: offer.id, txhash });
    const found = await pollOffer(from, offer.id, height);
    // TODO: command to wait 'till bid exits?
    const bid = coerceBid(found, agoricNames, console.warn);
    if (!bid) {
      console.warn('malformed bid', found);
      return;
    }
    const info = fmtBid(bid, values(agoricNames.vbankAsset));
    show(info);
  };

  /** @param {string} literalOrName */
  const normalizeAddress = literalOrName =>
    normalizeAddressWithOptions(literalOrName, interCmd.opts(), {
      execFileSync,
    });

  /**
   * @typedef {{
   *   give: string,
   *   maxBuy: string,
   *   wantMinimum?: string,
   *   offerId: string,
   *   from: string,
   *   generateOnly?: boolean,
   *   dryRun?: boolean,
   * }} SharedBidOpts
   */

  /** @param {ReturnType<createCommand>} cmd */
  const withSharedBidOptions = cmd =>
    cmd
      .requiredOption(
        '--from <address>',
        'wallet address literal or name',
        normalizeAddress,
      )
      .requiredOption('--give <amount>', 'IST to bid')
      .option(
        '--maxBuy <amount>',
        'max Collateral wanted',
        String,
        '1_000_000ATOM',
      )
      .option(
        '--wantMinimum <amount>',
        'only transact a bid that supplies this much collateral',
      )
      .option('--offer-id <string>', 'Offer id', String, `bid-${now()}`)
      .option('--generate-only', 'print wallet action only')
      .option('--dry-run', 'dry run only');

  withSharedBidOptions(bidCmd.command('by-price'))
    .description('Place a bid on collateral by price.')
    .requiredOption('--price <number>', 'bid price (IST/Collateral)', Number)
    .action(
      /**
       * @param {SharedBidOpts & {
       *   price: number,
       * }} opts
       */
      async ({ generateOnly, dryRun, ...opts }) => {
        const tools = await tryMakeUtils();

        const offer = Offers.auction.Bid(tools.agoricNames, opts);

        if (generateOnly) {
          outputActionAndHint(
            { method: 'executeOffer', offer },
            { stdout, stderr },
          );
          return;
        }

        await placeBid(opts.from, offer, tools, dryRun);
      },
    );

  /** @param {string} v */
  const parsePercent = v => {
    const p = Number(v);
    if (!(p >= -100 && p <= 100)) {
      // InvalidArgumentError is a class constructor, and so
      // must be invoked with `new`.
      throw new InvalidArgumentError('must be between -100 and 100');
    }
    return p / 100;
  };

  withSharedBidOptions(bidCmd.command('by-discount'))
    .description(
      `Place a bid on collateral based on discount from oracle price.`,
    )
    .requiredOption(
      '--discount <percent>',
      'bid discount (0 to 100) or markup (0 to -100) %',
      parsePercent,
    )
    .action(
      /**
       * @param {SharedBidOpts & {
       *   discount: number,
       * }} opts
       */
      async ({ generateOnly, ...opts }) => {
        const tools = await tryMakeUtils();

        const offer = Offers.auction.Bid(tools.agoricNames, opts);
        if (generateOnly) {
          outputActionAndHint(
            { method: 'executeOffer', offer },
            { stdout, stderr },
          );
          return;
        }
        await placeBid(opts.from, offer, tools);
      },
    );

  bidCmd
    .command('cancel')
    .description('Try to exit a bid offer')
    .argument('id', 'offer id (as from bid list)')
    .requiredOption(
      '--from <address>',
      'wallet address literal or name',
      normalizeAddress,
    )
    .option('--generate-only', 'print wallet action only')
    .action(
      /**
       * @param {string} id
       * @param {{
       *   from: string,
       *   generateOnly?: boolean,
       * }} opts
       */
      async (id, { from, generateOnly }) => {
        /** @type {TryExitOfferAction} */
        const action = { method: 'tryExitOffer', offerId: id };

        if (generateOnly) {
          outputActionAndHint(action, { stdout, stderr });
          return;
        }

        const { networkConfig, readPublished } = await tryMakeUtils();

        const current = await getCurrent(from, { readPublished });
        const liveIds = current.liveOffers.map(([i, _s]) => i);
        if (!liveIds.includes(id)) {
          // InvalidArgumentError is a class constructor, and so
          // must be invoked with `new`.
          throw new InvalidArgumentError(
            `${id} not in live offer ids: ${liveIds}`,
          );
        }

        const io = { ...networkConfig, execFileSync, delay, stdout };

        const { home, keyringBackend: backend } = interCmd.opts();
        const result = await sendAction(action, {
          keyring: { home, backend },
          from,
          verbose: false,
          ...io,
        });
        assert(result); // not dry-run
        const { timestamp, txhash, height } = result;
        console.error('cancel action is broadcast:');
        show({ timestamp, height, offerId: id, txhash });

        const checkGone = async blockInfo => {
          const pollResult = await getCurrent(from, { readPublished });
          const found = pollResult.liveOffers.find(([i, _]) => i === id);
          if (found) throw Error('retry');
          return blockInfo;
        };
        const blockInfo = await pollBlocks({
          retryMessage: 'offer still live in block',
          ...networkConfig,
          execFileSync,
          delay,
        })(checkGone);
        console.error('bid', id, 'is no longer live');
        show(blockInfo);
      },
    );

  bidCmd
    .command('list')
    .description(
      `Show status of bid offers.

For example:

$ inter bid list --from my-acct
{"id":"bid-1679677228803","price":"9 IST/ATOM","give":{"Bid":"50IST"},"want":"5ATOM"}
{"id":"bid-1679677312341","discount":10,"give":{"Bid":"200IST"},"want":"1ATOM"}
`,
    )
    .requiredOption(
      '--from <address>',
      'wallet address literal or name',
      normalizeAddress,
    )
    .option('--all', 'show exited bids as well')
    .action(
      /**
       * @param {{
       *   from: string,
       *   all?: boolean,
       * }} opts
       */
      async opts => {
        const { agoricNames, readPublished, storedWalletState } =
          await tryMakeUtils();

        const [current, state] = await Promise.all([
          getCurrent(opts.from, { readPublished }),
          storedWalletState(opts.from),
        ]);
        const entries = opts.all
          ? state.offerStatuses.entries()
          : current.liveOffers;
        for (const [id, spec] of entries) {
          const offerStatus = state.offerStatuses.get(id) || spec;
          harden(offerStatus); // coalesceWalletState should do this
          // console.debug(offerStatus.invitationSpec);
          if (!matches(offerStatus.invitationSpec, bidInvitationShape))
            continue;

          const bid = coerceBid(offerStatus, agoricNames, console.warn);
          if (!bid) continue;

          const info = fmtBid(bid, values(agoricNames.vbankAsset));
          show(info);
        }
      },
    );

  const assetCmd = interCmd
    .command('vbank')
    .description('vbank asset commands');
  assetCmd
    .command('list')
    .description('list registered assets with decimalPlaces, boardId, etc.')
    .action(async () => {
      const { agoricNames } = await tryMakeUtils();
      const assets = Object.values(agoricNames.vbankAsset).map(a => {
        return {
          issuerName: a.issuerName,
          denom: a.denom,
          brand: { boardId: a.brand.getBoardId() },
          displayInfo: { decimalPlaces: a.displayInfo.decimalPlaces },
        };
      });
      show(assets, true);
    });

  return interCmd;
};
