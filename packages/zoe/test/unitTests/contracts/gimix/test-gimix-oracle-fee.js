/* global setImmediate */
// @ts-check
// eslint-disable-next-line import/order
import { test as anyTest } from '../../../../tools/prepare-test-env-ava.js';

import { fileURLToPath } from 'url';
import { E, Far } from '@endo/far';
import { makeCopyBag } from '@endo/patterns';
import { makePromiseKit } from '@endo/promise-kit';

import { unsafeMakeBundleCache } from '@agoric/swingset-vat/tools/bundleTool.js';
import { AmountMath } from '@agoric/ertp/src/amountMath.js';
// import { makeFakeStorageKit } from '@agoric/internal/src/storage-test-utils.js';
import { makeNameHubKit } from '@agoric/vats';
import centralSupplyBundle from '@agoric/vats/bundles/bundle-centralSupply.js';
import { TimeMath } from '@agoric/time';

import { makeZoeKitForTest } from '../../../../tools/setup-zoe.js';
import buildManualTimer from '../../../../tools/manualTimer.js';
import { mintStablePayment } from './mintStable.js';

const DAY = 24 * 60 * 60 * 1000;
const UNIT6 = 1_000_000n;

const { entries } = Object;

/** @type {<T>(x: T | null | undefined) => T} */
const NonNullish = x => {
  if (x === null || x === undefined) {
    throw Error('null/undefined');
  }
  return x;
};

/** @type {import('ava').TestFn<Awaited<ReturnType<makeTestContext>>>} */
const test = anyTest;

const asset = ref => fileURLToPath(new URL(ref, import.meta.url));

const makeTestContext = async t => {
  const bundleCache = await unsafeMakeBundleCache('bundles/');

  const bundle = await bundleCache.load(
    asset('../../../../src/contracts/gimix/gimix.js'),
    'gimix',
  );

  const eventLoopIteration = () => new Promise(setImmediate);

  const manualTimer = buildManualTimer(
    t.log,
    BigInt((2020 - 1970) * 365.25 * DAY),
    {
      timeStep: BigInt(DAY),
      eventLoopIteration,
    },
  );

  const bootstrap = async () => {
    const { zoeService: zoe, feeMintAccess } = makeZoeKitForTest();

    const { nameHub: namesByAddress, nameAdmin: namesByAddressAdmin } =
      makeNameHubKit();

    const invitationIssuer = await E(zoe).getInvitationIssuer();
    const invitationBrand = await E(invitationIssuer).getBrand();

    const istIssuer = await E(zoe).getFeeIssuer();
    const istBrand = await E(istIssuer).getBrand();
    const centralSupply = await E(zoe).install(centralSupplyBundle);

    /** @type {import('@agoric/time/src/types').TimerService} */
    const chainTimerService = manualTimer;
    const timerBrand = await E(chainTimerService).getTimerBrand();

    // really a namehub...
    const agoricNames = {
      issuer: { IST: istIssuer, Invitation: invitationIssuer },
      brand: { timerBrand, IST: istBrand, Invitation: invitationBrand },
      installation: { centralSupply },
      instance: {},
    };

    const board = new Map(); // sort of

    return {
      agoricNames,
      board,
      chainTimerService,
      feeMintAccess,
      namesByAddress,
      namesByAddressAdmin,
      zoe,
    };
  };

  const powers = await bootstrap();

  const {
    agoricNames: { installation },
  } = powers;
  /** @param {bigint} value */
  const faucet = async value =>
    mintStablePayment(value, {
      centralSupply: installation.centralSupply,
      feeMintAccess: powers.feeMintAccess,
      zoe: powers.zoe,
    });

  return { bundle, faucet, manualTimer, powers };
};

test.before(async t => (t.context = await makeTestContext(t)));

/**
 * TODO: refactor as capabilities
 * @typedef {ReturnType<typeof makeGitHub>} GitHub
 *
 * @typedef {PromiseKit<string> & {
 *   type: 'issue',
 *   num: number,
 *   status: 'open' | 'closed'
 *   assignee?: string
 * }} IssueStatus
 * @typedef {{
 *   type: 'pull',
 *   num: number,
 *   author: string,
 *   fixes: string,
 *   status?: 'merged'
 * }} PRStatus
 */

const makeGitHub = _log => {
  /** @type {Map<string, IssueStatus | PRStatus>} */
  const status = new Map();

  const notifyIssue = (issue, pr) => {
    const st = NonNullish(status.get(issue));
    assert(st.type === 'issue');
    const { resolve } = st;
    resolve(pr);
  };

  const self = Far('github', {
    /**
     * @param {object} opts
     * @param {string} opts.owner
     * @param {string} opts.repo
     */
    openIssue: ({ owner, repo }) => {
      const num = status.size + 1;
      const issueURL = `https://github.com/${owner}/${repo}/issues/${num}`;
      const pk = makePromiseKit();
      status.set(issueURL, { ...pk, type: 'issue', num, status: 'open' });
      return issueURL;
    },
    assignIssue: (issueURL, name) => {
      const st = NonNullish(status.get(issueURL));
      assert(st.type === 'issue');
      status.set(issueURL, { ...st, assignee: name });
    },
    /** @param {string} issueURL */
    getIssuePromise: issueURL => {
      const st = NonNullish(status.get(issueURL));
      assert(st.type === 'issue');
      return st.promise;
    },
    /** @param {string} issueURL */
    closeIssue: issueURL => {
      const st = NonNullish(status.get(issueURL));
      assert(st.type === 'issue');
      status.set(issueURL, { ...st, status: 'closed' });
      // log('closed', issueURL);
    },

    /**
     * @param {object} opts
     * @param {string} opts.owner
     * @param {string} opts.repo
     * @param {string} opts.author - TODO refator as capability
     * @param {string} opts.fixes issue URL
     */
    openPR: ({ owner, repo, author, fixes }) => {
      const num = status.size + 1;
      const prURL = `https://github.com/${owner}/${repo}/pull/${num}`;
      // const pk = makePromiseKit();
      status.set(prURL, { type: 'pull', num, author, fixes });
      notifyIssue(fixes, prURL);
      return prURL;
    },
    /** @param {string} prURL */
    mergePR: prURL => {
      const st = NonNullish(status.get(prURL));
      assert(st.type === 'pull');
      status.set(prURL, { ...st, status: 'merged' });
      const { fixes } = st;
      self.closeIssue(fixes);
    },
    /** @param {string} prURL */
    queryPR: prURL => {
      const pull = NonNullish(status.get(prURL));
      assert(pull.type === 'pull');
      const issue = NonNullish(status.get(pull.fixes));
      assert(issue.type === 'issue');
      const { promise: _p, resolve: _r1, reject: _r2, ...issueData } = issue;
      return harden({ pull, issue: issueData });
    },
  });
  return self;
};

test('execute work agreement', async t => {
  /**
   * @param {Promise<DepositFacet>} oracleDepositP
   * @param {PromiseKit<unknown>} oracleInvitedPK
   */
  const coreEval = async (oracleDepositP, oracleInvitedPK) => {
    const { powers, bundle } = t.context;
    const { agoricNames, board, chainTimerService, namesByAddress, zoe } =
      powers;

    // const id = await E(board).getId(chainTimerService);
    board.set('board123', chainTimerService);

    /** @type {Installation<import('../../../../src/contracts/gimix/gimix').prepare>} */
    const installation = await E(zoe).install(bundle);

    const { creatorFacet, instance: gimixInstance } = await E(
      zoe,
    ).startInstance(
      installation,
      { Stable: agoricNames.issuer.IST },
      { namesByAddress, timer: chainTimerService },
    );
    const { brands, issuers } = await E(zoe).getTerms(gimixInstance);

    const oracleInvitation = await E(creatorFacet).makeOracleInvitation();
    void E(oracleDepositP)
      .receive(oracleInvitation)
      .then(amt => {
        return oracleInvitedPK.resolve(amt);
      });

    // really a namehub...
    const withGiMix = {
      ...agoricNames,
      brand: { ...agoricNames.brand, GimixOracle: brands.GimixOracle },
      issuer: { ...agoricNames.issuer, GimixOracle: issuers.GimixOracle },
      installation: { ...agoricNames.installation, gimix: installation },
      instance: { ...agoricNames.instance, gimix: gimixInstance },
    };
    return { agoricNames: withGiMix, board };
  };

  const sync = {
    /** @type {PromiseKit<{jobID: string, issue: string}>} */
    assignIssue: makePromiseKit(),
    /** @type {PromiseKit<DepositFacet>} */
    oracleDeposit: makePromiseKit(),
    /** @type {PromiseKit<Amount>} */
    oracleInvited: makePromiseKit(),
    /** @type {PromiseKit<string>} */
    deliverInvitationSent: makePromiseKit(),
    /** @type {PromiseKit<string>} */
    oracleCollectedFee: makePromiseKit(),
  };
  const { agoricNames, board } = await coreEval(
    sync.oracleDeposit.promise,
    sync.oracleInvited,
  );

  /**
   * @param {ERef<GitHub>} gitHub
   * @param {SmartWallet} wallet
   * @param {PromiseKit<{jobID: string, issue: string}>} assignIssuePK
   * @param {bigint} [dur]
   * @param {string} [timerBoardId]
   * @param {bigint} [bounty]
   * @param {bigint} [fee]
   */
  const alice = async (
    gitHub,
    wallet,
    assignIssuePK,
    dur = 21n,
    timerBoardId = 'board123',
    bounty = 12n,
    fee = 1n,
  ) => {
    const { make } = AmountMath;
    const { brand: wkBrand, instance, issuer: wkIssuer } = agoricNames;
    const timer = board.get(timerBoardId);

    // eslint-disable-next-line no-use-before-define
    const gpf = await E(zoe).getPublicFacet(instance.gimix);

    const issue = await E(gitHub).openIssue({
      owner: 'alice',
      repo: 'project1',
    });

    const give = {
      Acceptance: make(wkBrand.IST, bounty * UNIT6),
      Fee: make(wkBrand.IST, fee * UNIT6),
    };
    t.log('alice offers to give', give);
    const want = {
      Stamp: make(wkBrand.GimixOracle, makeCopyBag([[`Fixed ${issue}`, 1n]])),
    };

    const t0 = await E(timer).getCurrentTimestamp();
    const deadline = TimeMath.addAbsRel(
      t0,
      TimeMath.relValue(
        harden({
          timerBrand: t0.timerBrand,
          relValue: dur,
        }),
      ),
    );
    const exit = { afterDeadline: { deadline, timer } };

    const toMakeAgreement = await E(gpf).makeWorkAgreementInvitation(issue);
    const { seat, result: jobID } = await wallet.offers.executeOffer(
      toMakeAgreement,
      { give, want, exit },
    );

    t.log('alice offer result job id', jobID);
    t.deepEqual(typeof jobID, 'bigint');

    const assignee = 'bob';
    await E(gitHub).assignIssue(issue, assignee);
    assignIssuePK.resolve({ jobID, issue });
    t.log('alice assigns to', assignee, 'and waits for news on', issue, '...');
    const pr = await E(gitHub).getIssuePromise(issue);
    t.log('alice merges', pr);
    await E(gitHub).mergePR(pr);

    const issuers = {
      Stamp: wkIssuer.GimixOracle,
      Acceptance: wkIssuer.IST,
      Fee: wkIssuer.IST,
    };
    const payouts = await E(seat).getPayouts();
    const amts = {};
    for await (const [kw, pmtP] of Object.entries(payouts)) {
      const pmt = await pmtP;
      const amt = await E(issuers[kw]).getAmountOf(pmt);
      t.log('alice payout', kw, amt);
      amts[kw] = amt;
    }
    t.deepEqual(amts, {
      Acceptance: make(wkBrand.IST, 0n),
      Stamp: want.Stamp,
      Fee: make(wkBrand.IST, 0n),
    });
  };

  /**
   * @param {import('@agoric/vats').NameAdmin} namesByAddressAdmin
   * @param {ERef<ZoeService>} zoe
   * @typedef {string} Address
   *
   * @typedef {{
   *   id: {
   *     getAddress: () => Address;
   *   };
   *   depositFacet: DepositFacet,
   *   offers: {
   *     getPurseForBrand: (brand: Brand) => Promise<Purse>,
   *     executeOffer: (invitation: Invitation, proposal: Proposal, offerArgs?: any) => Promise<{seat: UserSeat, result: any}>
   *   }
   * }} SmartWallet
   */
  const makeWalletFactory = (namesByAddressAdmin, zoe) => {
    // /** @type {Map<Address, SmartWallet>} */
    // const wallets = new Map();

    /**
     * @param {Address} address
     * @param {(amt: Amount) => void} [onDeposit]
     */
    const provideWallet = (address, onDeposit = () => {}) => {
      const purses = new Map();
      const getPurseForBrand = async brand => {
        if (purses.has(brand)) {
          return purses.get(brand);
        }
        for (const [name, candidate] of entries(agoricNames.brand)) {
          if (candidate === brand) {
            const purse = E(agoricNames.issuer[name]).makeEmptyPurse();
            purses.set(brand, purse);
            return purse;
          }
        }
        throw Error('brand not found');
      };

      /** @type {DepositFacet} */
      // @ts-expect-error callWhen
      const depositFacet = Far('deposit', {
        receive: async pmt => {
          const brand = await E(pmt).getAllegedBrand();
          const purse = await getPurseForBrand(brand);
          const amt = await E(purse).deposit(pmt);
          void onDeposit(amt);
          return amt;
        },
      });

      const offers = Far('offers', {
        getPurseForBrand,
        /**
         * @param {Invitation} invitation
         * @param {Proposal} proposal
         * @param {unknown} [offerArgs]
         */
        executeOffer: async (invitation, proposal, offerArgs) => {
          /** @type {Record<string, Payment>} */
          const payments = {};
          for await (const [kw, amt] of entries(proposal.give || {})) {
            const purse = await getPurseForBrand(amt.brand);
            const pmt = await E(purse).withdraw(amt);
            payments[kw] = pmt;
          }
          const seat = await E(zoe).offer(
            invitation,
            proposal,
            payments,
            offerArgs,
          );
          const result = await E(seat).getOfferResult();
          return { seat, result };
        },
      });

      const id = Far('id', { getAddress: () => address });

      const my = makeNameHubKit();
      my.nameAdmin.update('depositFacet', depositFacet);
      namesByAddressAdmin.update(address, my.nameHub);
      /** @type {SmartWallet} */
      const sw = { id, depositFacet, offers };
      return sw;
    };

    return Far('WalletFactory', { provideWallet });
  };

  /**
   * @param {SmartWallet} wallet
   * @param {ERef<GitHub>} gitHub
   * @param {Promise<Amount>} oracleInvited
   * @param {PromiseKit<string>} reported
   * @param {PromiseKit<string>} oracleCollectedFee
   * @typedef {{
   *   deliver: (pr: string, jobID: string, deliverDepositAddr: string) => Promise<boolean>,
   * }} Oracle
   */
  const githubOracle = async (
    wallet,
    gitHub,
    oracleInvited,
    reported,
    oracleCollectedFee,
  ) => {
    const offerResults = new Map();

    const acceptId = 'oracleAccept1';

    const reportJobDone = async ({
      jobID,
      issueURL,
      prURL,
      deliverDepositAddr,
    }) => {
      t.log('oralce makes JobReport', { jobID, issueURL, deliverDepositAddr });
      const reporter = NonNullish(offerResults.get(acceptId));
      const { brand: wkBrand, issuer: wkIssuer } = agoricNames;
      const { make } = AmountMath;
      const feeAmount = make(wkBrand.IST, 1n * UNIT6);
      const toReport = await E(reporter.invitationMakers).JobReport(
        {
          deliverDepositAddr,
          issueURL,
          jobID,
          prURL,
        },
        feeAmount,
      );
      // const details = await E(zoe).getInvitationDetails(toReport);
      // t.deepEqual(details, {});
      const { seat } = await E(wallet.offers).executeOffer(
        toReport,
        {
          want: {
            Fee: feeAmount,
          },
        },
        { issueURL, deliverDepositAddr },
      );
      const issuers = {
        Fee: wkIssuer.IST,
      };
      const payoutsP = E(seat).getPayouts();
      void E.when(payoutsP, async payouts => {
        const amts = {};
        for await (const [kw, pmtP] of Object.entries(payouts)) {
          const pmt = await pmtP;
          const amt = await E(issuers[kw]).getAmountOf(pmt);
          t.log('oracle payout', kw, amt);
          amts[kw] = amt;
        }
        t.deepEqual(amts, {
          Fee: make(wkBrand.IST, 1n * UNIT6),
        });
        oracleCollectedFee.resolve('collected');
      });
      reported.resolve(jobID);
    };

    // oracle operator does this
    const setup = async amt => {
      t.log('oracle received invitation', amt);
      /** @type {Promise<Purse<'set'>>} */
      // @ts-expect-error assetkind
      const invitationPurse = wallet.offers.getPurseForBrand(amt.brand);
      const invitation = await E(invitationPurse).withdraw(amt);
      const { result: reporter } = await wallet.offers.executeOffer(
        invitation,
        { give: {}, want: {} },
      );
      t.log('oracle offer result', reporter);
      offerResults.set(acceptId, reporter);
    };

    /** @type {Oracle} */
    const it = Far('OracleWebSvc', {
      /**
       * @param {string} prURL
       * @param {string} jobID
       * @param {string} deliverDepositAddr
       */
      deliver: async (prURL, jobID, deliverDepositAddr) => {
        const { pull, issue } = await E(gitHub).queryPR(prURL);
        t.log('oracle evaluates delivery claim', jobID, { pull, issue });
        const ok =
          pull.author === issue.assignee &&
          pull.status === 'merged' &&
          issue.status === 'closed';
        if (ok) {
          await reportJobDone({
            jobID,
            prURL,
            issueURL: pull.fixes,
            deliverDepositAddr,
          });
        }
        return ok;
      },
    });

    return oracleInvited.then(async amt => {
      await setup(amt);
      return it;
    });
  };

  /**
   * @param {ERef<GitHub>} gitHub
   * @param {SmartWallet} wallet
   * @param {Promise<{jobID: string, issue: string}>} assignIssueP - issue publication
   * @param {Promise<string>} reportedP - issue reported
   * @param {ERef<Oracle>} oracle
   */
  const bob = async (gitHub, wallet, assignIssueP, reportedP, oracle) => {
    const { issue, jobID } = await assignIssueP;
    const deliverDepositAddr = wallet.id.getAddress();
    const pr = await E(gitHub).openPR({
      author: 'bob',
      owner: 'alice',
      repo: 'project1',
      fixes: issue,
    });
    t.log('bob opens PR', pr);
    await null; // XXX wait for alice to close. FRAGILE
    const ok = await E(oracle).deliver(pr, jobID, deliverDepositAddr);
    t.truthy(ok);
    await reportedP;
    /** @type {Purse<'set'>} */
    // @ts-expect-error assetkind
    const invitationPurse = await E(wallet.offers).getPurseForBrand(
      agoricNames.brand.Invitation,
    );
    const invitationsAmt = await E(invitationPurse).getCurrentAmount();
    t.log('bob invitation balance', invitationsAmt);

    const ipmt = await E(invitationPurse).withdraw(invitationsAmt);
    const { make } = AmountMath;
    const { brand } = agoricNames;
    const want = { Acceptance: make(brand.IST, 12n * UNIT6) };
    const { seat, result } = await E(wallet.offers).executeOffer(ipmt, {
      give: {},
      want,
    });
    t.log('bob accepts deliver invitation', seat, result);

    const { issuer: wkIssuer } = agoricNames;
    const issuers = { Acceptance: wkIssuer.IST };
    const payouts = await E(seat).getPayouts();
    const amts = {};
    for await (const [kw, pmtP] of Object.entries(payouts)) {
      const pmt = await pmtP;
      const amt = await E(issuers[kw]).getAmountOf(pmt);
      t.log('bob payout', kw, amt);
      amts[kw] = amt;
    }
    t.deepEqual(amts, want);
  };

  // const { rootNode, data } = makeFakeStorageKit('X');

  const gitHub = Promise.resolve(makeGitHub(t.log));
  const {
    faucet,
    powers: { zoe, namesByAddressAdmin },
  } = t.context;
  const wf = makeWalletFactory(namesByAddressAdmin, zoe);

  const wallet = {
    alice: wf.provideWallet('agoric1alice'),
    oracle: wf.provideWallet('agoric1oracle'),
    bob: wf.provideWallet('agoric1bob'),
  };
  sync.oracleDeposit.resolve(wallet.oracle.depositFacet);
  wallet.alice.depositFacet.receive(await faucet(25n * UNIT6));
  const oracleSvc = githubOracle(
    wallet.oracle,
    gitHub,
    sync.oracleInvited.promise,
    sync.deliverInvitationSent,
    sync.oracleCollectedFee,
  );
  await Promise.all([
    alice(gitHub, wallet.alice, sync.assignIssue),
    bob(
      gitHub,
      wallet.bob,
      sync.assignIssue.promise,
      sync.deliverInvitationSent.promise,
      oracleSvc,
    ),
    sync.oracleCollectedFee.promise,
  ]);
  t.log('done');
  t.pass();
});

test.todo('make work agreement at wallet bridge / vstorage level');
