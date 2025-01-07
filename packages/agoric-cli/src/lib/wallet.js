// @ts-check
/* eslint-env node */

import { iterateReverse } from '@agoric/casting';
import { boardSlottingMarshaller } from '@agoric/client-utils';
import { makeWalletStateCoalescer } from '@agoric/smart-wallet/src/utils.js';
import { Fail } from '@endo/errors';
import { execSwingsetTransaction, pollTx } from './chain.js';

/**
 * @import {CurrentWalletRecord} from '@agoric/smart-wallet/src/smartWallet.js';
 * @import {AgoricNamesRemotes} from '@agoric/vats/tools/board-utils.js';
 * @import {MinimalNetworkConfig, VstorageKit} from '@agoric/client-utils';
 */

const marshaller = boardSlottingMarshaller();

/** @type {CurrentWalletRecord} */
const emptyCurrentRecord = {
  purses: [],
  offerToUsedInvitation: [],
  offerToPublicSubscriberPaths: [],
  liveOffers: [],
};

/**
 * @param {string} addr
 * @param {Pick<VstorageKit, 'readPublished'>} io
 * @returns {Promise<import('@agoric/smart-wallet/src/smartWallet.js').CurrentWalletRecord>}
 */
export const getCurrent = async (addr, { readPublished }) => {
  // Partial because older writes may not have had all properties
  // NB: assumes changes are only additions
  let current =
    /** @type {Partial<import('@agoric/smart-wallet/src/smartWallet.js').CurrentWalletRecord> | undefined} */ (
      await readPublished(`wallet.${addr}.current`)
    );
  if (current === undefined) {
    throw Error(`undefined current node for ${addr}`);
  }

  // Repair a type misunderstanding seen in the wild.
  // See https://github.com/Agoric/agoric-sdk/pull/7139
  let offerToUsedInvitation = current.offerToUsedInvitation;
  if (
    offerToUsedInvitation &&
    typeof offerToUsedInvitation === 'object' &&
    !Array.isArray(offerToUsedInvitation)
  ) {
    offerToUsedInvitation = Object.entries(offerToUsedInvitation);
    current = harden({
      ...current,
      offerToUsedInvitation,
    });
  }

  // override full empty record with defined values from published one
  return { ...emptyCurrentRecord, ...current };
};

/**
 * @param {string} addr
 * @param {Pick<VstorageKit, 'readPublished'>} io
 * @returns {Promise<import('@agoric/smart-wallet/src/smartWallet.js').UpdateRecord>}
 */
export const getLastUpdate = async (addr, { readPublished }) => {
  return readPublished(`wallet.${addr}`);
};

/**
 * @param {import('@agoric/smart-wallet/src/smartWallet.js').BridgeAction} bridgeAction
 * @param {Pick<import('stream').Writable,'write'>} [stdout]
 */
export const outputAction = (bridgeAction, stdout = process.stdout) => {
  const capData = marshaller.toCapData(harden(bridgeAction));
  stdout.write(JSON.stringify(capData));
  stdout.write('\n');
};

export const sendHint =
  'Now use `agoric wallet send ...` to sign and broadcast the offer.\n';

/**
 * @param {import('@agoric/smart-wallet/src/smartWallet.js').BridgeAction} bridgeAction
 * @param {{
 *   stdout: Pick<import('stream').Writable,'write'>,
 *   stderr: Pick<import('stream').Writable,'write'>,
 * }} io
 */
export const outputActionAndHint = (bridgeAction, { stdout, stderr }) => {
  outputAction(bridgeAction, stdout);
  stderr.write(sendHint);
};

/**
 * @param {import('@agoric/smart-wallet/src/offers.js').OfferSpec} offer
 * @param {Pick<import('stream').Writable,'write'>} [stdout]
 * @param {Pick<import('stream').Writable,'write'>} [stderr]
 */
export const outputExecuteOfferAction = (
  offer,
  stdout = process.stdout,
  stderr = process.stderr,
) => {
  /** @type {import('@agoric/smart-wallet/src/smartWallet.js').BridgeAction} */
  const spendAction = {
    method: 'executeOffer',
    offer,
  };
  outputAction(spendAction, stdout);
  stderr.write(sendHint);
};

/**
 * @deprecated use `.current` node for current state
 * @param {import('@agoric/casting').Follower<import('@agoric/casting').ValueFollowerElement<import('@agoric/smart-wallet/src/smartWallet.js').UpdateRecord>>} follower
 * @param {Brand<'set'>} [invitationBrand]
 */
export const coalesceWalletState = async (follower, invitationBrand) => {
  // values with oldest last
  const history = [];
  for await (const followerElement of iterateReverse(follower)) {
    if ('error' in followerElement) {
      console.error(
        'Skipping wallet update due to error:',
        followerElement.error,
      );
      continue;
    }
    history.push(followerElement.value);
  }

  const coalescer = makeWalletStateCoalescer(invitationBrand);
  // update with oldest first
  for (const record of history.reverse()) {
    coalescer.update(record);
  }

  return coalescer.state;
};

/**
 * Sign and broadcast a wallet-action.
 *
 * @throws { Error & { code: number } } if transaction fails
 * @param {import('@agoric/smart-wallet/src/smartWallet.js').BridgeAction} bridgeAction
 * @param {MinimalNetworkConfig & {
 *   from: string,
 *   fees?: string,
 *   verbose?: boolean,
 *   keyring?: {home?: string, backend: string},
 *   stdout?: Pick<import('stream').Writable, 'write'>,
 *   execFileSync: typeof import('child_process').execFileSync,
 *   delay: (ms: number) => Promise<void>,
 *   dryRun?: boolean,
 * }} opts
 */
export const sendAction = async (bridgeAction, opts) => {
  const offerBody = JSON.stringify(marshaller.toCapData(harden(bridgeAction)));

  // tryExit should not require --allow-spend
  // https://github.com/Agoric/agoric-sdk/issues/7291
  const spendMethods = ['executeOffer', 'tryExitOffer'];
  const spendArg = spendMethods.includes(bridgeAction.method)
    ? ['--allow-spend']
    : [];

  const act = ['wallet-action', ...spendArg, offerBody];
  const out = execSwingsetTransaction([...act, '--output', 'json'], opts);
  if (opts.dryRun) {
    return;
  }

  assert(out); // not dry run
  const tx = JSON.parse(out);
  if (tx.code !== 0) {
    const err = Error(`failed to send tx: ${tx.raw_log} code: ${tx.code}`);
    // @ts-expect-error XXX how to add properties to an error?
    err.code = tx.code;
    throw err;
  }

  return pollTx(tx.txhash, opts);
};

/**
 * @param {CurrentWalletRecord} current
 * @param {AgoricNamesRemotes} agoricNames
 */
export const findContinuingIds = (current, agoricNames) => {
  // XXX should runtime type-check
  /** @type {{ offerToUsedInvitation: [string, InvitationAmount][]}} */
  const { offerToUsedInvitation: entries } = /** @type {any} */ (current);

  Array.isArray(entries) || Fail`entries must be an array: ${entries}`;

  const keyOf = (obj, val) => {
    const found = Object.entries(obj).find(e => e[1] === val);
    return found && found[0];
  };

  const found = [];
  for (const [offerId, { value }] of entries) {
    /** @type {{ description: string, instance: unknown }[]} */
    const [{ description, instance }] = value;
    if (
      description === 'charter member invitation' ||
      /Voter\d+/.test(description)
    ) {
      const instanceName = keyOf(agoricNames.instance, instance);
      found.push({ instance, instanceName, description, offerId });
    }
  }
  return found;
};
