/** @file test that chain policies match data from a requirements-gathering spreadsheet */
import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import { ChainPolicies } from '../../src/utils/chain-policies.js';
import { type ChainPolicy } from '../../src/types.js';

/** Spreadsheet header becomes a tuple type with column names used as tags */
type PolicyRow = [
  chainName: string,
  avgBlockTime_s: number,
  confirmations: number,
  maxAmountPerBlockWindow: Money,
  blockWindow: number,
  maxPerTX: Money,
];

/** data rows with light editing for JS syntax */
const policies: PolicyRow[] = [
  ['Arbitrum', 0.25, 96, '$50,000', 480, '$20,000'],
  ['Base', 2, 12, '$50,000', 60, '$20,000'],
  ['Ethereum', 12, 2, '$50,000', 10, '$20,000'],
  ['Optimism', 2, 12, '$50,000', 60, '$20,000'],
  ['Polygon', 2, 12, '$50,000', 60, '$20,000'],
];

type Money = string;
const value = (amt: Money) => BigInt(amt.replace(/[,$]/g, '')) * 1_000_000n;

test('MAINNET chain config matches spreadsheet', t => {
  for (const row of policies) {
    t.log(row.map(x => `${x}`).join(' '));
    const [name, _tAvg, confs, windowMax, blockWindowSize, txMax] = row;
    const actual: ChainPolicy = ChainPolicies.MAINNET[name];
    t.is(actual.confirmations, confs, `${name} confirmations`);
    t.deepEqual(
      actual.rateLimits,
      {
        blockWindowSize,
        tx: value(txMax),
        blockWindow: value(windowMax),
      },
      `${name} rate limits`,
    );
  }
});
