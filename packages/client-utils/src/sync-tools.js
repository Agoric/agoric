/**
 * @file The purpose of this file is to bring together a set of tools that
 * developers can use to synchronize operations they carry out in their tests.
 *
 * These operations include;
 * - Making sure a core-eval resulted in successfully deploying a contract
 * - Making sure a core-eval successfully sent zoe invitations to committee members for governance
 * - Making sure an account is successfully funded with vbank assets like IST, BLD etc.
 *  - operation: query dest account's balance
 *  - condition: dest account has a balance >= sent token
 * - Making sure an offer resulted successfully
 * - Making sure an offer was exited successfully
 * - Make sure an election held by a given committee (see @agoric/governance) turned out as expected
 */

/**
 * @typedef {object} RetryOptions
 * @property {number} [maxRetries]
 * @property {number} [retryIntervalMs]
 * @property {boolean} [reusePromise]
 * @property {(value: unknown) => unknown} [renderResult]
 *
 * @typedef {RetryOptions & {errorMessage: string}} WaitUntilOptions
 *
 * @typedef {object} CosmosBalanceThreshold
 * @property {string} denom
 * @property {number} value
 */

/**
 * From https://github.com/Agoric/agoric-sdk/blob/442f07c8f0af03281b52b90e90c27131eef6f331/multichain-testing/tools/sleep.ts#L10
 *
 * @param {number} ms
 * @param {{log: (message: string) => void, setTimeout: typeof global.setTimeout}} io
 */
export const sleep = async (ms, { log = () => {}, setTimeout }) =>
  new Promise(resolve => {
    log(`Sleeping for ${ms}ms...`);
    setTimeout(resolve, ms);
  });

/**
 * From https://github.com/Agoric/agoric-sdk/blob/442f07c8f0af03281b52b90e90c27131eef6f331/multichain-testing/tools/sleep.ts#L24
 *
 * @template [T=unknown]
 * @param {() => Promise<T>} operation
 * @param {(result: T) => boolean} condition
 * @param {string} message
 * @param {RetryOptions & {log?: typeof console.log, setTimeout: typeof global.setTimeout}} options
 * @returns {Promise<T>}
 */
export const retryUntilCondition = async (
  operation,
  condition,
  message,
  {
    maxRetries = 6,
    retryIntervalMs = 3500,
    reusePromise = false,
    renderResult = x => x,
    // XXX mixes ocaps with configuration options
    log = console.log,
    setTimeout,
  },
) => {
  console.log({ maxRetries, retryIntervalMs, message });

  await null; // separate sync prologue

  const timedOut = Symbol('timed out');
  let retries = 0;
  /** @type {Promise | undefined } */
  let resultP;
  while (retries < maxRetries) {
    try {
      if (!reusePromise || !resultP) {
        resultP = operation();
        const makeCleanup = ref => {
          const cleanup = () => {
            if (resultP === ref) {
              resultP = undefined;
            }
          };
          return cleanup;
        };
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        resultP.finally(makeCleanup(resultP));
      }
      const result = await Promise.race([
        resultP,
        // Overload the retryIntervalMs to apply both *to* and *between* iterations
        sleep(retryIntervalMs, { log() {}, setTimeout }).then(() => timedOut),
      ]);
      if (result === timedOut) {
        log(`Attempt ${retries + 1} timed out`);
        if (!reusePromise) resultP = undefined;
      } else {
        log('RESULT', renderResult(result));
        if (condition(result)) {
          return result;
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        log(`Error: ${error.message}: ${error.stack}`);
      } else {
        log(`Unknown error: ${String(error)}`);
      }
    }

    retries += 1;
    console.log(
      `Retry ${retries}/${maxRetries} - Waiting for ${retryIntervalMs}ms for ${message}...`,
    );
    await sleep(retryIntervalMs, { log, setTimeout });
  }

  throw Error(`${message} condition failed after ${maxRetries} retries.`);
};

/**
 * @param {WaitUntilOptions} options
 * @returns {WaitUntilOptions & {log?: typeof console.log}}
 */
const overrideDefaultOptions = options => {
  const defaultValues = {
    maxRetries: 6,
    retryIntervalMs: 3500,
    errorMessage: 'Error',
    log: console.log,
  };

  return { ...defaultValues, ...options };
};

/// ////////// Making sure a core-eval resulted successfully deploying a contract /////////////

const makeGetInstances = follow => async () => {
  const instanceEntries = await follow(
    '-lF',
    `:published.agoricNames.instance`,
  );

  return Object.fromEntries(instanceEntries);
};

/**
 *
 * @param {string} contractName
 * @param {{ log: (message: string) => void, follow: () => object, setTimeout: typeof global.setTimeout }} ambientAuthority
 * @param {WaitUntilOptions} options
 */
export const waitUntilContractDeployed = async (
  contractName,
  ambientAuthority,
  options,
) => {
  const { follow, setTimeout } = ambientAuthority;
  const getInstances = makeGetInstances(follow);
  const { errorMessage, ...resolvedOptions } = overrideDefaultOptions(options);

  return retryUntilCondition(
    getInstances,
    instanceObject => Object.keys(instanceObject).includes(contractName),
    errorMessage,
    { setTimeout, ...resolvedOptions },
  );
};

/// ////////// Making sure an account is successfully funded with vbank assets like IST, BLD etc. ///////////////

const makeQueryCosmosBalance = queryCb => async dest => {
  const coins = await queryCb('bank', 'balances', dest);
  return coins.balances;
};

/**
 *
 * @param {Array} balances
 * @param {CosmosBalanceThreshold} threshold
 * @returns {boolean}
 */
const checkCosmosBalance = (balances, threshold) => {
  const balance = [...balances].find(({ denom }) => denom === threshold.denom);
  return Number(balance.amount) >= threshold.value;
};

/**
 * @param {string} destAcct
 * @param {{ log?: (message: string) => void, query: () => Promise<object>, setTimeout: typeof global.setTimeout}} io
 * @param {{denom: string, value: number}} threshold
 * @param {WaitUntilOptions} options
 */
export const waitUntilAccountFunded = async (
  destAcct,
  io,
  threshold,
  options,
) => {
  const { query, setTimeout } = io;
  const queryCosmosBalance = makeQueryCosmosBalance(query);
  const { errorMessage, ...resolvedOptions } = overrideDefaultOptions(options);

  return retryUntilCondition(
    async () => queryCosmosBalance(destAcct),
    balances => checkCosmosBalance(balances, threshold),
    errorMessage,
    { setTimeout, ...resolvedOptions },
  );
};

/// ////////// Making sure an offers get results  /////////////

const makeQueryWallet = follow => async (/** @type {string} */ addr) => {
  const update = await follow('-lF', `:published.wallet.${addr}`);

  return update;
};

/**
 *
 * @param {object} offerStatus
 * @param {boolean} waitForPayouts
 * @param {string} offerId
 */
const checkOfferState = (offerStatus, waitForPayouts, offerId) => {
  const { updated, status } = offerStatus;

  if (updated !== 'offerStatus') return false;
  if (!status) return false;
  if (status.id !== offerId) return false;
  if (!status.numWantsSatisfied || status.numWantsSatisfied !== 1) return false;
  if (waitForPayouts && status.payouts) return true;
  if (!waitForPayouts && status.result) return true;

  return false;
};

/**
 *
 * @param {string} addr
 * @param {string} offerId
 * @param {boolean} waitForPayouts
 * @param {{ log?: typeof console.log, follow: () => object, setTimeout: typeof global.setTimeout }} io
 * @param {WaitUntilOptions} options
 */
export const waitUntilOfferResult = async (
  addr,
  offerId,
  waitForPayouts,
  io,
  options,
) => {
  const { follow, setTimeout } = io;
  const queryWallet = makeQueryWallet(follow);
  const { errorMessage, ...resolvedOptions } = overrideDefaultOptions(options);

  return retryUntilCondition(
    async () => queryWallet(addr),
    status => checkOfferState(status, waitForPayouts, offerId),
    errorMessage,
    { reusePromise: true, setTimeout, ...resolvedOptions },
  );
};

/// ////////// Making sure a core-eval successfully sent zoe invitations to committee members for governance /////////////

/**
 *
 * @param {{ updated: string, currentAmount: any }} update
 * @returns {boolean}
 */
const checkForInvitation = update => {
  const { updated, currentAmount } = update;

  if (updated !== 'balance') return false;
  if (!currentAmount || !currentAmount.brand) return false;

  return currentAmount.brand.includes('Invitation');
};

/**
 *
 * @param {string} addr
 * @param {{ follow: () => object, log: typeof console.log, setTimeout: typeof global.setTimeout}} io
 * @param {WaitUntilOptions} options
 */
export const waitUntilInvitationReceived = async (addr, io, options) => {
  const { follow, setTimeout } = io;
  const queryWallet = makeQueryWallet(follow);
  const { errorMessage, ...resolvedOptions } = overrideDefaultOptions(options);

  return retryUntilCondition(
    async () => queryWallet(addr),
    checkForInvitation,
    errorMessage,
    { reusePromise: true, setTimeout, ...resolvedOptions },
  );
};

/// ////////// Making sure an offer was exited successfully /////////////

const makeQueryWalletCurrent = follow => (/** @type {string} */ addr) =>
  follow('-lF', `:published.wallet.${addr}.current`);

/**
 * @param {object} update
 * @param {string} offerId
 * @returns {boolean}
 */
const checkLiveOffers = (update, offerId) => {
  const liveOffers = update.liveOffers;
  if (!liveOffers) {
    return false;
  }
  return !liveOffers.some(element => element.includes(offerId));
};

/**
 * @param {string} addr
 * @param {string} offerId
 * @param {{ follow: () => object, log: typeof console.log, setTimeout: typeof global.setTimeout}} io
 * @param {WaitUntilOptions} options
 */
export const waitUntilOfferExited = async (addr, offerId, io, options) => {
  const { follow, setTimeout } = io;
  const queryWalletCurrent = makeQueryWalletCurrent(follow);
  const { errorMessage, ...resolvedOptions } = overrideDefaultOptions(options);

  return retryUntilCondition(
    async () => queryWalletCurrent(addr),
    update => checkLiveOffers(update, offerId),
    errorMessage,
    { setTimeout, ...resolvedOptions },
  );
};

/// ////////// Make sure an election held by a given committee //////////
/// ////////// (see @agoric/governance) turned out as expected //////////

/**
 * @typedef {{
 *   latestOutcome: {
 *     outcome: string;
 *     question: import('@endo/marshal').RemotableObject
 *   },
 *   latestQuestion: {
 *     closingRule: { deadline: bigint },
 *     questionHandle: import('@endo/marshal').RemotableObject
 *   }
 * }} ElectionResult
 */

/**
 * @param {string} basePath
 * @param {import('./vstorage-kit').VstorageKit} vstorage
 * @returns {Promise<ElectionResult>}
 */
const fetchLatestEcQuestion = async (basePath, vstorage) => {
  const pathOutcome = `${basePath}.latestOutcome`;
  const pathQuestion = `${basePath}.latestQuestion`;

  const [latestOutcome, latestQuestion] = await Promise.all([
    /** @type {Promise<ElectionResult["latestOutcome"]>} */ (
      vstorage.readLatestHead(pathOutcome)
    ),
    /** @type {Promise<ElectionResult["latestQuestion"]>} */ (
      vstorage.readLatestHead(pathQuestion)
    ),
  ]);

  return { latestOutcome, latestQuestion };
};

/**
 *
 * @param {ElectionResult} electionResult
 * @param {{ outcome: string; deadline: bigint }} expectedResult
 * @returns {boolean}
 */
const checkCommitteeElectionResult = (electionResult, expectedResult) => {
  const {
    latestOutcome: { outcome, question },
    latestQuestion: {
      closingRule: { deadline },
      questionHandle,
    },
  } = electionResult;
  const { outcome: expectedOutcome, deadline: expectedDeadline } =
    expectedResult;

  return (
    expectedOutcome === outcome &&
    deadline === expectedDeadline &&
    question === questionHandle
  );
};

/**
 * Depends on "@agoric/governance" package's committee implementation where for a given committee
 * there's two child nodes in vstorage named "latestOutcome" and "latestQuestion" respectively.
 *
 * @param {string} committeePathBase
 * @param {{
 *   outcome: string;
 *   deadline: bigint;
 * }} expectedResult
 * @param {{
 *   vstorage: import('./vstorage-kit').VstorageKit;
 *   log: typeof console.log,
 *   setTimeout: typeof global.setTimeout
 * }} io
 * @param {WaitUntilOptions} options
 */
export const waitUntilElectionResult = async (
  committeePathBase,
  expectedResult,
  io,
  options,
) => {
  const { vstorage, log, setTimeout } = io;

  const { maxRetries, retryIntervalMs, errorMessage } =
    overrideDefaultOptions(options);

  return retryUntilCondition(
    async () => fetchLatestEcQuestion(committeePathBase, vstorage),
    electionResult =>
      checkCommitteeElectionResult(electionResult, expectedResult),
    errorMessage,
    { maxRetries, retryIntervalMs, log, setTimeout },
  );
};
