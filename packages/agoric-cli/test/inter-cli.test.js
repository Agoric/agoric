// @ts-check
/* eslint-env node */
import '@endo/init';
import test from 'ava';
import { CommanderError, createCommand } from 'commander';

import { makeParseAmount } from '@agoric/inter-protocol/src/clientSupport.js';
import { Far } from '@endo/far';
import { boardSlottingMarshaller, makeFromBoard } from '@agoric/client-utils';

import { fmtBid, makeInterCommand } from '../src/commands/inter.js';

const { entries } = Object;

/**
 * @import { Command } from 'commander';
 * @import { BoardRemote, VBankAssetDetail } from '@agoric/vats/tools/board-utils.js';
 */

/**
 * @param {{ boardId: string, iface: string }} detail
 * @returns {BoardRemote}
 */
const makeBoardRemote = ({ boardId, iface }) =>
  Far(iface, { getBoardId: () => boardId });

/** @type {Record<string, (Brand<'nat'> & BoardRemote)>} */
// @ts-expect-error mock
const topBrands = harden({
  ATOM: makeBoardRemote({ boardId: 'board03446', iface: 'Brand' }),
  IST: makeBoardRemote({ boardId: 'board0566', iface: 'Brand' }),
  BLD: makeBoardRemote({ boardId: 'board0223', iface: 'Brand' }),
});

const agoricNames = harden({
  brand: { IST: topBrands.IST, ATOM: topBrands.ATOM },

  instance: {
    auctioneer: makeBoardRemote({ boardId: 'board434', iface: 'Instance' }),
  },

  /** @type {Record<string, VBankAssetDetail>} */
  vbankAsset: {
    ubld: {
      denom: 'ubld',
      brand: topBrands.BLD,
      displayInfo: { assetKind: 'nat', decimalPlaces: 6 },
      issuer: /** @type {any} */ ({}),
      issuerName: 'BLD',
      proposedName: 'Agoric staking token',
    },
    uist: {
      denom: 'uist',
      brand: topBrands.IST,
      displayInfo: { assetKind: 'nat', decimalPlaces: 6 },
      issuer: /** @type {any} */ ({}),
      issuerName: 'IST',
      proposedName: 'Agoric stable token',
    },
    'ibc/toyatom': {
      denom: 'ibc/toyatom',
      brand: topBrands.ATOM,
      displayInfo: { assetKind: 'nat', decimalPlaces: 6 },
      issuer: /** @type {any} */ ({}),
      issuerName: 'ATOM',
      proposedName: 'ATOM',
    },
  },
});

const publishedNames = {
  agoricNames: {
    brand: { _: entries(agoricNames.brand) },
    instance: { _: entries(agoricNames.instance) },
    vbankAsset: { _: entries(agoricNames.vbankAsset) },
  },
};

const makeNet = published => {
  const encode = txt => {
    const value = Buffer.from(txt).toString('base64');
    return { result: { response: { code: 0, value } } };
  };
  const ctx = makeFromBoard();
  const m = boardSlottingMarshaller(ctx.convertSlotToVal);
  const fmt = obj => {
    const capData = m.toCapData(harden(obj));
    const values = [JSON.stringify(capData)];
    const specimen = { blockHeight: undefined, values };
    const txt = JSON.stringify({
      value: JSON.stringify(specimen),
    });
    return encode(txt);
  };

  /** @type {typeof fetch} */
  // @ts-expect-error mock
  const fetch = async (url, _opts) => {
    const matched = url.match(
      /abci_query\?path=%22\/custom\/vstorage\/data\/published.(?<path>[^%]+)%22/,
    );
    if (!matched) throw Error(`fetch what?? ${url}`);
    const { path } = matched.groups;
    let node = published;
    for (const key of path.split('.')) {
      node = node[key];
      if (!node) throw Error(`query what?? ${path}`);
    }
    if (!node._) throw Error(`no data at ${path}`);
    return harden({
      json: async () => fmt(node._),
    });
  };

  return { fetch, marshaller: m };
};

const testKeyring = {
  gov1: 'agoric1ldmtatp24qlllgxmrsjzcpe20fvlkp448zcuce',
  gov2: 'agoric140dmkrz2e42ergjj7gyvejhzmjzurvqeq82ang',
  'test-acct': 'agoric18jr9nlvp300feu726y3v4n07ykfjwup3twnlyn',
};

const makeProcess = (t, keyring, out) => {
  /** @type {typeof import('child_process').execFileSync} */
  // @ts-expect-error mock
  const execFileSync = (file, args) => {
    switch (file) {
      case 'agd': {
        // first arg that doesn't sart with --
        const cmd = args.find(a => !a.startsWith('--'));
        t.truthy(cmd);
        switch (cmd) {
          case 'keys': {
            for (const opt of ['--node', '--chain']) {
              const ix = args.findIndex(a => a.startsWith(opt));
              if (ix >= 0) {
                args.splice(ix, 1);
              }
            }
            t.deepEqual(args.slice(0, 3), ['keys', 'show', '--address']);
            const name = args[3];
            const addr = keyring[name];
            if (!addr) {
              throw Error(`no such key in keyring: ${name}`);
            }
            return addr;
          }
          case 'status': {
            return JSON.stringify({
              SyncInfo: { latest_block_time: 123, latest_block_height: 456 },
            });
          }
          case 'query': {
            return JSON.stringify({});
          }
          case 'tx': {
            return JSON.stringify({ code: 0 });
          }
          default:
            t.fail(`agd cmd not impl:${args[0]}`);
        }
        break;
      }
      default:
        throw Error('not impl');
    }
  };

  const stdout = harden({
    write: x => {
      out.push(x);
      return true;
    },
  });

  /** @type {typeof setTimeout} */
  // @ts-expect-error mock
  const setTimeout = async (f, _ms) => Promise.resolve().then(_ => f());

  return {
    env: {},
    stdout,
    stderr: { write: _s => true },
    now: () => 1680241587424,
    setTimeout,
    createCommand,
    execFileSync,
  };
};

/**
 * @type {import('@agoric/smart-wallet/src/offers.js').OfferStatus &
 *         { offerArgs: import('@agoric/inter-protocol/src/auction/auctionBook.js').OfferSpec}}
 */
const offerStatus2 = harden({
  id: 'bid-1680241587424',
  invitationSpec: {
    callPipe: [['makeBidInvitation', [topBrands.ATOM]]],
    instancePath: ['auctioneer'],
    source: 'agoricContract',
  },
  offerArgs: {
    offerBidScaling: {
      denominator: { brand: topBrands.IST, value: 100n },
      numerator: { brand: topBrands.IST, value: 90n },
    },
    maxBuy: { brand: topBrands.ATOM, value: 2000000n },
  },
  proposal: {
    give: {
      Bid: { brand: topBrands.IST, value: 20000000n },
    },
  },
  payouts: {
    Collateral: { brand: topBrands.ATOM, value: 3_105_000n },
    Bid: { brand: topBrands.IST, value: 37_000_000n },
  },
});

const govWallets = {
  [testKeyring.gov1]: {
    _: { updated: 'offerStatus', status: offerStatus2 },
    current: { _: { liveOffers: [[offerStatus2.id, offerStatus2]] } },
  },
  [testKeyring.gov2]: { current: {} },
};

test('amount parsing', t => {
  const parseAmount = makeParseAmount(agoricNames);
  const b = topBrands;

  t.deepEqual(parseAmount('1ATOM'), { brand: b.ATOM, value: 1_000_000n });
  t.deepEqual(
    parseAmount('10_000ATOM'),
    {
      brand: b.ATOM,
      value: 10_000_000_000n,
    },
    'handle underscores',
  );
  t.deepEqual(
    parseAmount('1.5ATOM'),
    { brand: b.ATOM, value: 1_500_000n },
    'handle decimal',
  );

  t.throws(() => parseAmount('5'), { message: 'invalid amount: 5' });
  t.throws(() => parseAmount('50'), { message: 'invalid amount: 50' });
  t.throws(() => parseAmount('5.5.5ATOM'), {
    message: 'invalid amount: 5.5.5ATOM',
  });
});

/**
 * @type {import('@agoric/smart-wallet/src/offers.js').OfferStatus &
 *         { offerArgs: import('@agoric/inter-protocol/src/auction/auctionBook.js').OfferSpec}}
 */
const offerStatus1 = harden({
  error: 'Error: "nameKey" not found: (a string)',
  id: 1678990150266,
  invitationSpec: {
    callPipe: [['makeBidInvitation', [topBrands.ATOM]]],
    instancePath: ['auctioneer'],
    source: 'agoricContract',
  },
  offerArgs: {
    offerPrice: {
      denominator: { brand: topBrands.ATOM, value: 2000000n },
      numerator: { brand: topBrands.IST, value: 20000000n },
    },
    maxBuy: { brand: topBrands.ATOM, value: 2000000n },
  },
  proposal: {
    give: {
      Bid: { brand: topBrands.IST, value: 20000000n },
    },
  },
});

test('README ex: inter bid list: finds one bid', async t => {
  const argv = 'node inter bid list --from gov1'.split(' ');
  const expected = {
    id: 'bid-1680241587424',
    payouts: { Collateral: '3.105 ATOM', Bid: '37 IST' },
  };

  const out = [];

  const net = makeNet({ ...publishedNames, wallet: govWallets });
  const cmd = await makeInterCommand(makeProcess(t, testKeyring, out), net);
  cmd.exitOverride(() => t.fail('exited'));

  await cmd.parseAsync(argv);
  const txt = out.join('').trim();
  t.deepEqual(JSON.parse(txt), {
    ...expected,
    // boring details not shown in README
    discount: 10,
    give: { Bid: '20 IST' },
    maxBuy: '2 ATOM',
  });
});

/** @type {(c: Command) => Command[]} */
const subCommands = c => [c, ...c.commands.flatMap(subCommands)];

test('README: inter usage', async t => {
  const argv = 'node inter'.split(' ');
  // README shows agops inter.
  const usage = `Usage: inter [options] [command]`;
  const description = `Inter Protocol commands for liquidation bidding etc.`;

  const out = [];
  const diag = [];

  const net = makeNet({ ...publishedNames, wallet: govWallets });
  const cmd = await makeInterCommand(makeProcess(t, testKeyring, out), net);
  for (const c of subCommands(cmd)) {
    c.exitOverride();
    c.configureOutput({ writeErr: s => diag.push(s) });
  }

  await t.throwsAsync(cmd.parseAsync(argv));
  const txt = diag.join('').trim();
  t.true(txt.startsWith(usage));
  t.true(txt.includes(description));
});

test('diagnostic for agd ENOENT', async t => {
  const argv = 'node inter bid list --from gov1'.split(' ');

  const out = [];
  const diag = [];
  const proc = makeProcess(t, testKeyring, out);
  const cmd = await makeInterCommand(
    {
      ...proc,
      execFileSync: file => {
        t.is(file, 'agd');
        throw Error('ENOENT');
      },
    },
    makeNet({}),
  );
  for (const c of subCommands(cmd)) {
    c.exitOverride();
    c.configureOutput({ writeErr: s => diag.push(s) });
  }

  await t.throwsAsync(cmd.parseAsync(argv), { instanceOf: CommanderError });
  t.is(
    diag.join('').trim(),
    "error: option '--from <address>' argument 'gov1' is invalid. ENOENT: is agd in your $PATH?",
  );
  t.is(out.join('').trim(), '');
});

const usageTest = (words, blurb = 'Command usage:') => {
  test(`Usage: ${words}`, async t => {
    const argv = `node agops ${words} --help`.split(' ');

    const out = [];
    const program = createCommand('agops');
    const cmd = await makeInterCommand(makeProcess(t, {}, out), makeNet({}));
    program.addCommand(cmd);
    for (const c of subCommands(program)) {
      c.exitOverride(() => {
        // CommanderError is a class constructor, and so
        // must be invoked with `new`.
        throw new CommanderError(1, 'usage', '');
      });
    }
    cmd.configureOutput({
      writeOut: s => out.push(s),
      writeErr: s => out.push(s),
    });

    await t.throwsAsync(program.parseAsync(argv), {
      instanceOf: CommanderError,
    });
    t.snapshot(out.join('').trim(), blurb);
  });
};
usageTest('inter');
usageTest('inter auction status');
usageTest('inter bid by-price');
usageTest('inter bid by-discount');
usageTest('inter bid list');
usageTest('inter bid cancel');
usageTest('inter vbank list');

test('formatBid', t => {
  const { values } = Object;
  {
    const actual = fmtBid(offerStatus1, values(agoricNames.vbankAsset));
    t.deepEqual(actual, {
      id: 1678990150266,
      error: 'Error: "nameKey" not found: (a string)',
      give: { Bid: '20 IST' },
      price: '10 IST/ATOM',
      maxBuy: '2 ATOM',
    });
  }
  {
    const actual = fmtBid(offerStatus2, values(agoricNames.vbankAsset));
    t.deepEqual(actual, {
      id: 'bid-1680241587424',
      give: { Bid: '20 IST' },
      payouts: { Collateral: '3.105 ATOM', Bid: '37 IST' },
      maxBuy: '2 ATOM',
      discount: 10,
    });
  }
});

/*
_not_ like this:

{"id":"bid-1680211654832","price":"0.7999999999999999 IST/ATOM","give":{"Bid":"10IST"},"want":"3ATOM","result":[{"reason":{"@qclass":"error","errorId":"error:anon-marshal#10001","message":"cannot grab 10000000uist coins: 4890000uist is smaller than 10000000uist: insufficient funds [agoric-labs/cosmos-sdk@v0.45.11-alpha.agoric.1.0.20230320225042-2109765fd835/x/bank/keeper/send.go:186]","name":"Error"},"status":"rejected"}],"error":"Error: cannot grab 10000000uist coins: 4890000uist is smaller than 10000000uist: insufficient funds [agoric-labs/cosmos-sdk@v0.45.11-alpha.agoric.1.0.20230320225042-2109765fd835/x/bank/keeper/send.go:186]"}
*/

test('README: inter auction status', async t => {
  const argv = 'node inter auction status'.split(' ');
  const expected = {
    book0: {
      collateralAvailable: '0 ATOM',
      currentPriceLevel: '4.4955 IST/ATOM',
      startCollateral: '0 ATOM',
      startPrice: '9.99 IST/ATOM',
    },
    params: {
      ClockStep: '00:00:10',
      DiscountStep: '5.00%',
      LowestRate: '45.00%',
    },
    schedule: {
      nextDescendingStepTime: '2023-04-19T03:35:02.000Z',
      nextStartTime: '2023-04-19T03:35:02.000Z',
    },
  };

  const out = [];

  const { brand } = agoricNames;
  const timerBrand = brand.timer;
  const auctionInfo = {
    schedule: {
      _: {
        activeStartTime: undefined,
        nextDescendingStepTime: { absValue: 1681875302n, timerBrand },
        nextStartTime: { absValue: 1681875302n, timerBrand },
      },
    },
    book0: {
      _: {
        collateralAvailable: { brand: brand.ATOM, value: 0n },
        currentPriceLevel: {
          denominator: { brand: brand.ATOM, value: 10000000000n },
          numerator: { brand: brand.IST, value: 44955000000n },
        },
        proceedsRaised: undefined,
        remainingProceedsGoal: null,
        startCollateral: { brand: brand.ATOM, value: 0n },
        startPrice: {
          denominator: { brand: brand.ATOM, value: 1000000n },
          numerator: { brand: brand.IST, value: 9990000n },
        },
        startProceedsGoal: null,
      },
    },
    governance: {
      _: {
        current: {
          AuctionStartDelay: {
            type: 'relativeTime',
            value: { relValue: 2n, timerBrand },
          },
          ClockStep: {
            type: 'relativeTime',
            value: { relValue: 10n, timerBrand },
          },
          DiscountStep: { type: 'nat', value: 500n },
          Electorate: {
            type: 'invitation',
            value: {
              brand: brand.Invitation,
              value: [
                {
                  description: 'questionPoser',
                  handle: {},
                  installation: {},
                  instance: {},
                },
              ],
            },
          },
          LowestRate: {
            type: 'nat',
            value: 4500n,
          },
          PriceLockPeriod: {
            type: 'relativeTime',
            value: { relValue: 60n, timerBrand },
          },
          StartFrequency: {
            type: 'relativeTime',
            value: { relValue: 300n, timerBrand },
          },
          StartingRate: {
            type: 'nat',
            value: 10500n,
          },
        },
      },
    },
  };
  const net = makeNet({
    ...publishedNames,
    auction: auctionInfo,
  });

  const cmd = await makeInterCommand(makeProcess(t, testKeyring, out), net);
  await cmd.parseAsync(argv);
  t.deepEqual(JSON.parse(out.join('')), expected);

  // schedule fields can be null
  const auctionInfo2 = {
    ...auctionInfo,
    schedule: {
      _: {
        activeStartTime: null,
        nextDescendingStepTime: null,
        nextStartTime: 1681875302n,
      },
    },
  };

  const { nextDescendingStepTime: _, ...schedule2 } = expected.schedule;
  const net2 = makeNet({
    ...publishedNames,
    auction: auctionInfo2,
  });

  out.splice(0);
  const cmd2 = await makeInterCommand(makeProcess(t, testKeyring, out), net2);
  await cmd2.parseAsync(argv);
  t.deepEqual(JSON.parse(out.join('')), { ...expected, schedule: schedule2 });
});

test('README: inter vbank list', async t => {
  const argv = 'node inter vbank list'.split(' ');
  const expected = [
    {
      issuerName: 'BLD',
      denom: 'ubld',
      brand: { boardId: 'board0223' },
      displayInfo: { decimalPlaces: 6 },
    },
    {
      issuerName: 'IST',
      denom: 'uist',
      brand: { boardId: 'board0566' },
      displayInfo: { decimalPlaces: 6 },
    },
    {
      issuerName: 'ATOM',
      denom: 'ibc/toyatom',
      brand: { boardId: 'board03446' },
      displayInfo: { decimalPlaces: 6 },
    },
  ];

  const out = [];
  const net = makeNet(publishedNames);
  const cmd = await makeInterCommand(makeProcess(t, testKeyring, out), net);
  await cmd.parseAsync(argv);
  t.deepEqual(JSON.parse(out.join('')), expected);
});

test('README ex1: inter bid place by-price: printed offer is correct', async t => {
  // The README example shows "bid is broadcast" but we test only bid format.
  const noNet = '--dry-run';
  const argv =
    `node inter bid by-price --give 85IST --price 8.55 --from test-acct ${noNet}`
      .trim()
      .split(' ');
  const out = [];
  const net = makeNet({ ...publishedNames, wallet: govWallets });
  const cmd = await makeInterCommand(
    { ...makeProcess(t, testKeyring, out) },
    net,
  );
  cmd.exitOverride(() => t.fail('exited'));

  await cmd.parseAsync(argv);
  const txt = out.join('').trim();

  const expected = [
    'Run this interactive command in shell:\n\n',
    'agd ',
    '--node=http://0.0.0.0:26657 --chain-id=agoriclocal --gas=auto --gas-adjustment=1.2 --from=agoric18jr9nlvp300feu726y3v4n07ykfjwup3twnlyn tx swingset wallet-action --allow-spend {"body":"#{\\"method\\":\\"executeOffer\\",\\"offer\\":{\\"id\\":\\"bid-1680241587424\\",\\"invitationSpec\\":{\\"callPipe\\":[[\\"makeBidInvitation\\",[\\"$0.Alleged: BoardRemoteBrand\\"]]],\\"instancePath\\":[\\"auctioneer\\"],\\"source\\":\\"agoricContract\\"},\\"offerArgs\\":{\\"maxBuy\\":{\\"brand\\":\\"$0\\",\\"value\\":\\"+1000000000000\\"},\\"offerPrice\\":{\\"denominator\\":{\\"brand\\":\\"$0\\",\\"value\\":\\"+100\\"},\\"numerator\\":{\\"brand\\":\\"$1.Alleged: BoardRemoteBrand\\",\\"value\\":\\"+855\\"}}},\\"proposal\\":{\\"give\\":{\\"Bid\\":{\\"brand\\":\\"$1\\",\\"value\\":\\"+85000000\\"}}}}}","slots":["board03446","board0566"]} --output json',
  ].join('');
  t.deepEqual(txt, expected);
});

/*
$ agops inter bid by-price --price 0.81 --give 0.5 --maxBuy 3 --from gov2
2023-03-30T21:48:14.479332418Z not in block 49618 retrying...
bid is broadcast:
{"timestamp":"2023-03-30T21:48:19Z","height":"49619","offerId":"bid-1680212903989","txhash":"472A47AAE24F27E747E3E64F4644860D2A5D3AD7EC5388C4C849805034E20D38"}
first bid update:
{"id":"bid-1680212903989","price":"0.81 IST/ATOM","give":{"Bid":"0.5IST"},"want":"3ATOM","result":"Your bid has been accepted"}
*/

/*
$ agops inter bid cancel --from gov2 bid-1680211556497
bid-1680211556497 not in live offer ids: bid-1680211593489,bid-1680212903989,bid-1680213097499,bid-1680220217218,bid-1680220368714,bid-1680220406939
*/

// TODO improve test coverage https://github.com/Agoric/agoric-sdk/issues/9965
