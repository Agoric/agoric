// @ts-check
// @jessie-check

import { M, mustMatch } from '@endo/patterns';
import { BrandShape, RatioShape } from '@agoric/ertp/src/typeGuards.js';
import { makeBoardClient } from '../lib/boardClient.js';
import { makeVstorageQueryService } from '../lib/vstorage.js';
import { formatTimestamp, makeAssetFormatters } from '../lib/format.js';

// XXX push down into @agoric/ERTP?
const NatAmountShape = harden({ brand: BrandShape, value: M.nat() });
const TimeStampShape = {
  timerBrand: M.remotable('timerBrand'),
  absValue: M.nat(),
};

const bidData = harden({
  timestamp: TimeStampShape,
  sequence: M.nat(),
  balance: NatAmountShape,
  wanted: NatAmountShape,
  exitAfterBuy: M.boolean(),
});

const shapeLeaves = harden({
  ScaledBidData: {
    bidScaling: RatioShape,
    ...bidData,
  },

  PricedBidData: {
    price: RatioShape,
    ...bidData,
  },
});

const shape = harden({
  ...shapeLeaves,
  BidDataNotification: M.arrayOf(
    M.or(shapeLeaves.ScaledBidData, shapeLeaves.PricedBidData),
  ),
});

/**
 *
 * @param {unknown} specimen
 * @returns { asserts specimen is BidDataNotification }
 *
 * XXX contract should export this type:
 *
 * @typedef {{
 *   balance: Amount<'nat'>,
 *   exitAfterBuy: boolean,
 *   sequence: bigint,
 *   timestamp: import('@agoric/time').Timestamp,
 *   wanted: Amount<'nat'>,
 * } & ({ price: Ratio } | { bidScaling: Ratio})} BidData1
 * @typedef {BidData1[]} BidDataNotification
 */
const assertBidDataNotification = specimen => {
  mustMatch(specimen, shape.BidDataNotification);
};

/**
 *
 * @param {ScaledBidData | PricedBidData} bid
 * @param {ReturnType<typeof import('../lib/format').makeAssetFormatters>} fmt
 *
 * @typedef {import('@agoric/inter-protocol/src/auction/auctionBook.js').ScaledBidData} ScaledBidData
 * @typedef {import('@agoric/inter-protocol/src/auction/auctionBook.js').PricedBidData} PricedBidData
 */
const fmtBid = (bid, fmt) => {
  const { timestamp, sequence, balance, wanted, exitAfterBuy, ...more } = bid;
  const p = 'price' in bid ? { price: fmt.price(bid.price) } : {};
  const b = 'bidScaling' in bid ? { bidScaling: fmt.rate(bid.bidScaling) } : {};
  const exit = exitAfterBuy ? { exitAfterBuy } : {};
  // @ts-expect-error XXX how to do this?
  const { price: _p, bidScaling: _b, ...rest } = more;
  const info = harden({
    // assume timerBrand gives values in seconds
    timestamp: formatTimestamp(timestamp.absValue),
    sequence: Number(sequence),
    ...p,
    ...b,
    balance: fmt.amount(balance),
    wanted: fmt.amount(wanted),
    ...exit,
    ...rest,
  });
  return info;
};

/**
 *
 * @param {import('commander').Command} interCmd
 * @param {object} io
 * @param {import('../lib/tui').TUI} io.tui
 * @param {() => Promise<ReturnType<import('../lib/vstorage.js').makeBatchQuery>>} io.getBatchQuery
 * @param {() => Promise<import('@cosmjs/tendermint-rpc').RpcClient>} io.makeRpcClient
 *
 * @typedef {import('@cosmjs/tendermint-rpc').RpcClient} RpcClient
 */
export const addBidCommand = (
  interCmd,
  { tui, getBatchQuery, makeRpcClient },
) => {
  const bidCmd = interCmd
    .command('bid')
    .description('Add a Bid command/operation');

  const makeBoard = () => getBatchQuery().then(makeBoardClient);

  bidCmd
    .command('list')
    .description('List Bids operation')
    .option('--book', 'auction book number', Number, 0)
    .action(async (/** @type {{book: number}} */ { book }) => {
      const bidsPart = 'schedule'; // XXX something goofy is going on in the contract
      const [board, queryService] = await Promise.all([
        makeBoard(),
        makeRpcClient().then(makeVstorageQueryService),
      ]);
      const agoricNames = await board.provideAgoricNames();

      const { children: bidKeys } = await queryService.Children({
        path: `published.auction.book${book}.${bidsPart}`,
      });
      const { length: n } = bidKeys;
      const more = n > 3 ? '...' : '';
      console.warn('fetching', n, 'bids:', bidKeys.slice(0, 3), more);

      console.warn('TODO: pagination');
      const bids = await board.readBatch(
        bidKeys.map(k => `published.auction.book${book}.${bidsPart}.${k}`),
      );
      assertBidDataNotification(bids);
      const fmt = makeAssetFormatters(agoricNames.vbankAsset);
      for (const bid of bids) {
        tui.show(fmtBid(bid, fmt));
      }
    });

  return bidCmd;
};
