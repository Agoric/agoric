// @ts-check
/** global harden */
import { makeSmartWalletKit, LOCAL_CONFIG } from '@agoric/client-utils';
import { assert } from '@endo/errors';
import { E, Far } from '@endo/far';
import { Nat } from '@endo/nat';
import { makePromiseKit } from '@endo/promise-kit';
import { flags, makeAgd, makeCopyFiles } from './agd-lib.js';
import { makeHttpClient, makeAPI } from './makeHttpClient.js';
import { dedup, makeQueryKit, poll } from './queryKit.js';
import { makeVStorage } from './batchQuery.js';
import { makeRetryUntilCondition } from './sleep.js';
import { makeTracer } from '@agoric/internal';

/**
 * @import {OfferSpec} from '@agoric/smart-wallet/src/offers.js';
 * @import {UpdateRecord} from '@agoric/smart-wallet/src/smartWallet.js';
 *
 * @import { EnglishMnemonic } from '@cosmjs/crypto';
 * @import { RetryUntilCondition } from './sleep.js';
 */

const trace = makeTracer('E2ET');

// The default of 6 retries was failing.
const SMART_WALLET_PROVISION_RETRIES = 15;

const BLD = '000000ubld';

export const txAbbr = tx => {
  const { txhash, code, height, gas_used } = tx;

  return { txhash, code, height, gas_used };
};

/**
 * @param {object} io
 * @param {import('@cosmjs/tendermint-rpc').RpcClient} io.rpc
 * @param {(ms: number, info?: unknown) => Promise<void>} io.delay
 */
const makeBlockTool = ({ rpc, delay }) => {
  let id = 1;
  const waitForBootstrap = async (period = 2000, info = {}) => {
    await null;
    for (;;) {
      id += 1;
      const data = await rpc
        .execute({ jsonrpc: '2.0', id, method: 'status', params: [] })
        .catch(_err => {});

      if (!data) throw Error('no data from status');

      if (data.jsonrpc !== '2.0') {
        await delay(period, { ...info, method: 'status' });
        continue;
      }

      const lastHeight = data.result.sync_info.latest_block_height;

      if (lastHeight !== '1') {
        return Number(lastHeight);
      }

      await delay(period, { ...info, lastHeight });
    }
  };

  let last;
  const waitForBlock = async (times = 1, info = {}) => {
    await null;
    for (let time = 0; time < times; time += 1) {
      for (;;) {
        const cur = await waitForBootstrap(2000, { ...info, last });

        if (cur !== last) {
          last = cur;
          break;
        }

        await delay(1000, info);
      }
      time += 1;
    }
  };

  return { waitForBootstrap, waitForBlock };
};
/** @typedef {ReturnType<makeBlockTool>} BlockTool */

/**
 * @param {string} fullPath
 * @param {object} opts
 * @param {string} opts.id
 * @param {import('./agd-lib.js').Agd} opts.agd
 * @param {import('./queryKit.js').QueryTool['follow']} opts.follow
 * @param {(ms: number) => Promise<void>} opts.delay
 * @param {typeof console.log} [opts.progress]
 * @param {string} [opts.chainId]
 * @param {string} [opts.installer]
 * @param {string} [opts.bundleId]
 * @param {RetryUntilCondition} opts.retryUntilCondition
 */
const installBundle = async (fullPath, opts) => {
  const { id, agd, progress = console.log } = opts;
  const {
    chainId = 'agoriclocal',
    installer = 'faucet',
    retryUntilCondition,
  } = opts;
  const from = await agd.lookup(installer);
  // const explainDelay = (ms, info) => {
  //   progress('follow', { ...info, delay: ms / 1000 }, '...');
  //   return delay(ms);
  // };
  // const updates = follow('bundles', { delay: explainDelay });
  // await updates.next();
  const tx = await retryUntilCondition(
    () =>
      agd.tx(['swingset', 'install-bundle', `@${fullPath}`, '--gas', 'auto'], {
        from,
        chainId,
        yes: true,
      }),
    result => !!result?.txhash,
    `install bundle ${fullPath}`,
  );
  assert(tx);

  progress({ id, installTx: tx.txhash, height: tx.height });

  // const { value: confirm } = await updates.next();
  // assert(!confirm.error, confirm.error);
  // assert.equal(confirm.installed, true);
  // if (opts.bundleId) {
  //   assert.equal(`b1-${confirm.endoZipBase64Sha512}`, opts.bundleId);
  // }
  // TODO: return block height at which confirm went into vstorage
  return { tx, confirm: true };
};

/**
 * @param {string} address
 * @param {Record<string, number | bigint>} balances
 * @param {{
 *   agd: import('./agd-lib.js').Agd;
 *   blockTool: BlockTool;
 *   lcd: import('./makeHttpClient.js').LCD;
 *   delay: (ms: number) => Promise<void>;
 *   retryUntilCondition: RetryUntilCondition;
 *   chainId?: string;
 *   whale?: string;
 *   progress?: typeof console.log;
 *   q?: import('./queryKit.js').QueryTool;
 * }} opts
 */
export const provisionSmartWallet = async (
  address,
  balances,
  {
    agd,
    blockTool,
    lcd,
    delay,
    chainId = 'agoriclocal',
    whale = 'faucet',
    progress = console.log,
    q = makeQueryKit(makeVStorage(lcd)).query,
    retryUntilCondition,
  },
) => {
  // TODO: skip this query if balances is {}
  const vbankEntries = await q.queryData('published.agoricNames.vbankAsset');
  const byName = Object.fromEntries(
    // reverse entries, so we get the latest view on the denom since there are
    // multiple entries in the testing environment
    [...vbankEntries].reverse().map(([_, info]) => {
      return [info.issuerName, info];
    }),
  );
  progress({ send: balances, to: address });

  /**
   * @param {string} denom
   * @param {bigint} value
   */
  const sendFromWhale = async (denom, value) => {
    const amount = `${value}${denom}`;
    progress({ amount, to: address });
    // TODO: refactor agd.tx to support a per-sender object
    // that enforces one-tx-per-block so this
    // ad-hoc waitForBlock stuff is not necessary.
    await agd.tx(['bank', 'send', whale, address, amount], {
      chainId,
      from: whale,
      yes: true,
    });
    await blockTool.waitForBlock(1, { step: 'bank send' });
  };

  for await (const [name, qty] of Object.entries(balances)) {
    const info = byName[name];
    if (!info) {
      throw Error(`${name} not found in vbank assets`);
    }
    const { denom, displayInfo } = info;
    const { decimalPlaces } = displayInfo;
    const value = Nat(Number(qty) * 10 ** decimalPlaces);
    await sendFromWhale(denom, value);
  }

  progress({ provisioning: address });
  await agd.tx(
    ['swingset', 'provision-one', 'my-wallet', address, 'SMART_WALLET'],
    { chainId, from: address, yes: true },
  );

  const info = await retryUntilCondition(
    () => q.queryData(`published.wallet.${address}.current`),
    result => !!result,
    `wallet in vstorage ${address}`,
    {
      log: () => {}, // suppress logs as this is already noisy
      maxRetries: SMART_WALLET_PROVISION_RETRIES,
    },
  );
  progress({
    provisioned: address,
    purses: info.purses.length,
    used: info.offerToUsedInvitation.length,
  });

  /** @param {import('@agoric/smart-wallet/src/smartWallet.js').BridgeAction} bridgeAction */
  const sendAction = async bridgeAction => {
    // eslint-disable-next-line no-undef
    const capData = q.toCapData(harden(bridgeAction));
    const offerBody = JSON.stringify(capData);
    const txInfo = await agd.tx(
      ['swingset', 'wallet-action', offerBody, '--allow-spend'],
      { from: address, chainId, yes: true },
    );
    return txInfo;
  };

  /** @param {OfferSpec} offer */
  async function* executeOffer(offer) {
    /** @type {AsyncGenerator<UpdateRecord, void, void>} */
    const updates = q.follow(`published.wallet.${address}`, { delay });
    const txInfo = await sendAction({ method: 'executeOffer', offer });
    console.debug('spendAction', txInfo);
    for await (const update of updates) {
      trace('update', address, update);
      if (update.updated !== 'offerStatus' || update.status.id !== offer.id) {
        continue;
      }
      yield update;
    }
  }

  // XXX  /** @type {import('../test/wallet-tools.js').MockWallet['offers']} */
  const offers = Far('Offers', {
    executeOffer,
    /** @param {OfferSpec} offer */
    executeOfferTx: offer => sendAction({ method: 'executeOffer', offer }),
    /** @param {string | number} offerId */
    tryExit: offerId => sendAction({ method: 'tryExitOffer', offerId }),
  });

  // XXX  /** @type {import('../test/wallet-tools.js').MockWallet['deposit']} */
  const deposit = Far('DepositFacet', {
    getAddress: () => address,
    receive: async payment => {
      const brand = await E(payment).getAllegedBrand();
      const asset = vbankEntries.find(([_denom, a]) => a.brand === brand);
      if (!asset) throw Error(`unknown brand`);
      /** @type {Issuer<'nat'>} */
      const issuer = asset.issuer;
      const amt = await E(issuer).getAmountOf(payment);
      await sendFromWhale(asset.denom, amt.value);
      return amt;
    },
  });

  const { stringify: lit } = JSON;
  /**
   * @returns {Promise<{
   *   balances: Coins;
   *   pagination: unknown;
   * }>}
   *
   * @typedef {{ denom: string; amount: string }[]} Coins
   */
  const getCosmosBalances = () =>
    lcd.getJSON(`/cosmos/bank/v1beta1/balances/${address}`);
  const cosmosBalanceUpdates = () =>
    dedup(poll(getCosmosBalances, { delay }), (a, b) => lit(a) === lit(b));

  async function* vbankAssetBalanceUpdates(denom, brand) {
    for await (const { balances: haystack } of cosmosBalanceUpdates()) {
      for (const candidate of haystack) {
        if (candidate.denom === denom) {
          // eslint-disable-next-line no-undef
          const amt = harden({ brand, value: BigInt(candidate.amount) });
          yield amt;
        }
      }
    }
  }

  async function* purseUpdates(brand) {
    const brandAssetInfo = Object.values(byName).find(a => a.brand === brand);
    await null;
    if (brandAssetInfo) {
      yield* vbankAssetBalanceUpdates(brandAssetInfo.denom, brand);
      return;
    }
    const updates = q.follow(`published.wallet.${address}`, { delay });
    for await (const update of updates) {
      if (update.updated !== 'balance') {
        // console.log('skip: not balance', update.updated, address);
        continue;
      }
      /** @type {Amount} */
      const amt = update.currentAmount;
      if (amt.brand !== brand) {
        // console.log('brand expected', brand, 'got', amt.brand, address);
        continue;
      }
      yield amt;
    }
  }

  // @ts-expect-error FIXME no type
  /** @type {import('../test/wallet-tools.js').MockWallet['peek']} */
  const peek = Far('Peek', { purseUpdates });

  return { offers, deposit, peek, query: q };
};

/** @typedef {Awaited<ReturnType<typeof provisionSmartWallet>>} WalletDriver */

/**
 * @param {{
 *   agd: import('./agd-lib.js').Agd;
 *   blockTool: BlockTool;
 *   validator?: string;
 *   chainId?: string;
 * }} opts
 * @returns {Promise<{
 *   proposal_id: string;
 *   voting_end_time: unknown;
 *   status: string;
 * }>}
 */
const voteLatestProposalAndWait = async ({
  agd,
  blockTool,
  chainId = 'agoriclocal',
  validator = 'genesis',
}) => {
  await blockTool.waitForBlock(1, { before: 'get latest proposal' });
  const proposalsData = await agd.query(['gov', 'proposals']);
  const lastProposal = proposalsData.proposals.at(-1);
  const lastProposalId = lastProposal.id || lastProposal.proposal_id;

  await blockTool.waitForBlock(1, {
    before: 'deposit',
    on: lastProposalId,
  });

  const deposit = '50000000ubld';
  const sigOpts = { from: validator, chainId, yes: true };
  await agd.tx(['gov', 'deposit', lastProposalId, deposit], sigOpts);

  await blockTool.waitForBlock(1, { before: 'vote', on: lastProposalId });

  await agd.tx(['gov', 'vote', lastProposalId, 'yes'], sigOpts);

  let info = {};
  for (
    ;
    info.status !== 'PROPOSAL_STATUS_REJECTED' &&
    info.status !== 'PROPOSAL_STATUS_PASSED';
    await blockTool.waitForBlock(1, { step: `voting`, on: lastProposalId })
  ) {
    info = await agd.query(['gov', 'proposal', lastProposalId]);
    trace(
      `Waiting for proposal ${lastProposalId} to pass (status=${info.status})`,
    );
  }

  // @ts-expect-error cast
  return { ...info, proposal_id: lastProposalId };
};

/**
 * @param {typeof console.log} log
 * @param {{
 *   evals: { permit: string; code: string }[];
 *   title: string;
 *   description: string;
 * }} info
 * @param {{
 *   agd: import('./agd-lib.js').Agd;
 *   blockTool: BlockTool;
 *   proposer?: string;
 *   deposit?: string;
 *   chainId?: string;
 * }} opts
 */
const runCoreEval = async (
  log,
  { evals, title, description },
  {
    agd,
    blockTool,
    chainId = 'agoriclocal',
    proposer = 'genesis',
    deposit = `1${BLD}`,
  },
) => {
  const from = await agd.lookup(proposer);
  const info = { title, description };
  log('submit proposal', title);

  // TODO? double-check that bundles are loaded

  const evalPaths = evals.map(e => [e.permit, e.code]).flat();
  log(evalPaths);
  trace('await tx', evalPaths);
  const result = await agd.tx(
    [
      'gov',
      'submit-proposal',
      'swingset-core-eval',
      ...evalPaths,
      ...flags({ ...info, deposit }),
    ],
    { from, chainId, yes: true },
  );
  log(txAbbr(result));
  // FIXME TypeError#1: unrecognized details 0
  // assert(result.code, 0);

  trace('await voteLatestProposalAndWait', evalPaths);
  const detail = await voteLatestProposalAndWait({ agd, blockTool });
  log(detail.proposal_id, detail.voting_end_time, detail.status);

  // TODO: how long is long enough? poll?
  await blockTool.waitForBlock(5, {
    step: 'run',
    proposal: detail.proposal_id,
  });

  assert(detail.status, 'PROPOSAL_STATUS_PASSED');
  return detail;
};

/**
 * @deprecated use `@agoric/client-utils` instead
 *
 * @param {typeof console.log} log
 * @param {import('@agoric/swingset-vat/tools/bundleTool.js').BundleCache} bundleCache
 * @param {object} io
 * @param {typeof import('child_process').execFileSync} io.execFileSync
 * @param {typeof import('child_process').execFile} io.execFile
 * @param {typeof window.fetch} io.fetch
 * @param {typeof window.setTimeout} io.setTimeout
 * @param {string} [io.bundleDir]
 * @param {string} [io.rpcAddress]
 * @param {string} [io.apiAddress]
 * @param {(...parts: string[]) => string} [io.join]
 * @param {RetryUntilCondition} [io.retryUntilCondition]
 */
export const makeE2ETools = async (
  log,
  bundleCache,
  {
    execFileSync,
    fetch,
    setTimeout,
    rpcAddress = 'http://localhost:26657',
    apiAddress = 'http://localhost:1317',
    retryUntilCondition = makeRetryUntilCondition({ log, setTimeout }),
  },
) => {
  const agd = makeAgd({ execFileSync }).withOpts({ keyringBackend: 'test' });
  const rpc = makeHttpClient(rpcAddress, fetch);
  const lcd = makeAPI(apiAddress, { fetch });
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  const explainDelay = (ms, info) => {
    if (typeof info === 'object' && Object.keys(info).length > 0) {
      // XXX normally we have the caller pass in the log function
      // later, but the way blockTool is factored, we have to supply it early.
      trace({ ...info, delay: ms / 1000 }, '...');
    }
    return delay(ms);
  };
  const blockTool = makeBlockTool({ rpc, delay: explainDelay });

  const vstorage = makeVStorage(lcd);
  const qt = makeQueryKit(vstorage);

  /**
   * @param {Iterable<string>} fullPaths
   * @param {typeof console.log} progress
   */
  const installBundles = async (fullPaths, progress) => {
    await null;
    // @ts-expect-error FIXME no type
    /** @type {Record<string, import('../test/boot-tools.js').CachedBundle>} */
    const bundles = {};
    // for (const [name, rootModPath] of Object.entries(bundleRoots)) {
    for (const fullPath of fullPaths) {
      const { tx, confirm } = await installBundle(fullPath, {
        id: fullPath,
        agd,
        follow: qt.query.follow,
        progress,
        delay,
        // bundleId: getBundleId(bundle),
        bundleId: undefined,
        retryUntilCondition,
      });
      progress({
        // name,
        id: fullPath,
        installHeight: tx.height,
        // @ts-expect-error confirm is a boolean?
        installed: confirm.installed,
      });
    }
    // eslint-disable-next-line no-undef
    return harden(bundles);
  };

  /**
   * @param {{
   *   name: string;
   *   title?: string;
   *   description?: string;
   *   config?: unknown;
   * } & {
   *   behavior?: Function;
   * }} info
   */
  const buildAndRunCoreEval = async info => {
    if ('builderPath' in info) {
      throw Error('@@TODO: agoric run style');
    }
    const { name, title = name, description = title } = info;
    const eval0 = {
      code: `/tmp/contracts/${name}.js`,
      permit: `/tmp/contracts/${name}-permit.json`,
    };

    const detail = { evals: [eval0], title, description };
    // await runPackageScript('build:deployer', entryFile);
    const proposal = await runCoreEval(log, detail, { agd, blockTool });
    return proposal;
  };

  const copyFiles = makeCopyFiles({ execFileSync, log });

  /**
   * @deprecated use `@agoric/client-utils` instead
   */
  const vstorageClient = makeQueryKit(vstorage).query;

  /** @type {import('@agoric/client-utils').SmartWalletKit} */
  const smartWalletKit = await makeSmartWalletKit(
    {
      fetch,
      delay,
    },
    LOCAL_CONFIG,
  );

  return {
    vstorageClient,
    smartWalletKit,
    installBundles,
    runCoreEval: buildAndRunCoreEval,
    /**
     * @param {string} address
     * @param {Record<string, bigint>} amount - should include BLD to pay for provisioning
     */
    provisionSmartWallet: (address, amount) =>
      provisionSmartWallet(address, amount, {
        agd,
        blockTool,
        lcd,
        delay,
        q: vstorageClient,
        retryUntilCondition,
      }),
    /**
     * @param {string} name
     * @param {EnglishMnemonic | string} mnemonic
     */
    addKey: async (name, mnemonic) =>
      agd.keys.add(
        name,
        // @ts-expect-error XXX
        Array.isArray(mnemonic) ? mnemonic.join(' ') : mnemonic,
      ),
    /** @param {string} name */
    deleteKey: async name => agd.keys.delete(name),
    copyFiles,
    agd,
  };
};

/**
 * Seat-like API from wallet updates
 *
 * @param {AsyncGenerator<import('@agoric/smart-wallet/src/smartWallet.js').UpdateRecord>} updates
 */
export const seatLike = updates => {
  const sync = {
    result: makePromiseKit(),
    /** @type {PromiseKit<AmountKeywordRecord>} */
    payouts: makePromiseKit(),
  };
  (async () => {
    await null;
    try {
      // XXX an error here is somehow and unhandled rejection
      for await (const update of updates) {
        if (update.updated !== 'offerStatus') continue;
        const { result, payouts } = update.status;
        if ('result' in update.status) sync.result.resolve(result);
        if ('payouts' in update.status && payouts) {
          sync.payouts.resolve(payouts);
          console.debug('paid out', update.status.id);
          return;
        }
      }
    } catch (reason) {
      sync.result.reject(reason);
      sync.payouts.reject(reason);
      throw reason;
    }
  })();
  // eslint-disable-next-line no-undef
  return harden({
    getOfferResult: () => sync.result.promise,
    getPayoutAmounts: () => sync.payouts.promise,
  });
};

/** @param {Awaited<ReturnType<typeof provisionSmartWallet>>} wallet */
export const makeDoOffer = wallet => {
  /** @type {(offer: OfferSpec) => Promise<void>} */
  const doOffer = async offer => {
    const updates = wallet.offers.executeOffer(offer);
    // const seat = seatLike(updates);
    // const result = await seat.getOfferResult();
    await seatLike(updates).getPayoutAmounts();
    // return result;
  };

  return doOffer;
};

/** @typedef {Awaited<ReturnType<makeE2ETools>>} E2ETools */
