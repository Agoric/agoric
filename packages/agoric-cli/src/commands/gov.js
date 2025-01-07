// @ts-check
/* eslint-disable func-names */
/* eslint-env node */
import {
  fetchEnvNetworkConfig,
  makeAgoricNames,
  makeVstorageKit,
} from '@agoric/client-utils';
import { execFileSync as execFileSyncAmbient } from 'child_process';
import { Command, CommanderError } from 'commander';
import { normalizeAddressWithOptions, pollBlocks } from '../lib/chain.js';
import {
  findContinuingIds,
  getCurrent,
  getLastUpdate,
  outputActionAndHint,
  sendAction,
} from '../lib/wallet.js';

/**
 * @import {OfferSpec} from '@agoric/smart-wallet/src/offers.js';
 * @import {AgoricNamesRemotes} from '@agoric/vats/tools/board-utils.js';
 * @import {CurrentWalletRecord} from '@agoric/smart-wallet/src/smartWallet.js';
 * @import {VstorageKit} from '@agoric/client-utils';
 */

const collectValues = (val, memo) => {
  memo.push(val);
  return memo;
};

const defaultKeyring = process.env.AGORIC_KEYRING_BACKEND || 'test';

const networkConfig = await fetchEnvNetworkConfig({ env: process.env, fetch });

/**
 * @param {import('anylogger').Logger} _logger
 * @param {{
 *   env?: Record<string, string|undefined>,
 *   fetch?: typeof window.fetch,
 *   stdout?: Pick<import('stream').Writable, 'write'>,
 *   stderr?: Pick<import('stream').Writable, 'write'>,
 *   execFileSync?: typeof execFileSyncAmbient,
 *   delay?: (ms: number) => Promise<void>,
 * }} [io]
 */
export const makeGovCommand = (_logger, io = {}) => {
  const {
    // Allow caller to provide access explicitly, but
    // default to conventional ambient IO facilities.
    stdout = process.stdout,
    stderr = process.stderr,
    fetch = global.fetch,
    execFileSync = execFileSyncAmbient,
    delay = async ms => new Promise(resolve => setTimeout(resolve, ms)),
  } = io;

  const cmd = new Command('gov').description('Electoral governance commands');
  // backwards compatibility with less general "ec" command. To make this work
  // the new CLI options default to the values used for Economic Committee
  cmd.alias('ec');
  cmd.option(
    '--keyring-backend <os|file|test>',
    `keyring's backend (os|file|test) (default "${defaultKeyring}")`,
    defaultKeyring,
  );

  /** @param {string} literalOrName */
  const normalizeAddress = literalOrName =>
    normalizeAddressWithOptions(literalOrName, {
      // FIXME does not observe keyring-backend option, which isn't available during arg parsing
      keyringBackend: defaultKeyring,
    });

  /** @type {(info: unknown, indent?: unknown) => boolean } */
  const show = (info, indent) =>
    stdout.write(`${JSON.stringify(info, null, indent ? 2 : undefined)}\n`);

  const abortIfSeen = (instanceName, found) => {
    const done = found.filter(it => it.instanceName === instanceName);
    if (done.length > 0) {
      console.warn(`invitation to ${instanceName} already accepted`, done);
      // CommanderError is a class constructor, and so
      // must be invoked with `new`.
      throw new CommanderError(1, 'EALREADY', `already accepted`);
    }
  };

  /**
   * Make an offer from agoricNames, wallet status; sign and broadcast it,
   * given a sendFrom address; else print it.
   *
   * @param {{
   *   toOffer: (agoricNames: AgoricNamesRemotes, current: CurrentWalletRecord | undefined) => OfferSpec,
   *   sendFrom?: string | undefined,
   *   keyringBackend: string,
   *   instanceName?: string,
   * }} detail
   * @param {VstorageKit} [vsk]
   */
  const processOffer = async function (
    { toOffer, sendFrom, keyringBackend },
    vsk,
  ) {
    await null;
    vsk ||= makeVstorageKit({ fetch }, networkConfig);
    const { readPublished } = vsk;
    const agoricNames = await makeAgoricNames(vsk.fromBoard, vsk.vstorage);

    assert(keyringBackend, 'missing keyring-backend option');

    let current;
    if (sendFrom) {
      current = await getCurrent(sendFrom, { readPublished });
    }

    const offer = toOffer(agoricNames, current);
    if (!sendFrom) {
      outputActionAndHint(
        { method: 'executeOffer', offer },
        { stdout, stderr },
      );
      return;
    }

    const result = await sendAction(
      { method: 'executeOffer', offer },
      {
        keyring: { backend: keyringBackend },
        from: sendFrom,
        verbose: false,
        ...networkConfig,
        execFileSync,
        stdout,
        delay,
      },
    );
    assert(result); // not dry-run
    const { timestamp, txhash, height } = result;
    console.error('wallet action is broadcast:');
    show({ timestamp, height, offerId: offer.id, txhash });
    const checkInWallet = async blockInfo => {
      const [state, update] = await Promise.all([
        getCurrent(sendFrom, { readPublished }),
        getLastUpdate(sendFrom, { readPublished }),
        readPublished(`wallet.${sendFrom}`),
      ]);
      if (update.updated === 'offerStatus' && update.status.id === offer.id) {
        return blockInfo;
      }
      const info = await findContinuingIds(state, agoricNames);
      const done = info.filter(it => it.offerId === offer.id);
      if (!(done.length > 0)) throw Error('retry');
      return blockInfo;
    };
    const blockInfo = await pollBlocks({
      retryMessage: 'offer not yet in block',
      ...networkConfig,
      execFileSync,
      delay,
    })(checkInWallet);
    console.error('offer accepted in block');
    show(blockInfo);
  };

  cmd
    .command('committee')
    .description('accept invitation to join a committee')
    .requiredOption(
      '--name <string>',
      'Committee instance name',
      String,
      'economicCommittee',
    )
    .option('--voter <number>', 'Voter number', Number, 0)
    .option(
      '--offerId <string>',
      'Offer id',
      String,
      `gov-committee-${Date.now()}`,
    )
    .option(
      '--send-from <name-or-address>',
      'Send from address',
      normalizeAddress,
    )
    .action(async function (opts, options) {
      const { name: instanceName } = opts;

      /** @type {Parameters<typeof processOffer>[0]['toOffer']} */
      const toOffer = (agoricNames, current) => {
        const instance = agoricNames.instance[instanceName];
        assert(instance, `missing ${instanceName}`);

        if (current) {
          const found = findContinuingIds(current, agoricNames);
          abortIfSeen(instanceName, found);
        }

        return {
          id: opts.offerId,
          invitationSpec: {
            source: 'purse',
            instance,
            description: `Voter${opts.voter}`,
          },
          proposal: {},
        };
      };

      await processOffer({
        toOffer,
        instanceName,
        sendFrom: opts.sendFrom,
        keyringBackend: options.optsWithGlobals().keyringBackend,
      });
    });

  cmd
    .command('charter')
    .description('accept the charter invitation')
    .requiredOption(
      '--name <string>',
      'Charter instance name',
      'economicCommitteeCharter',
    )
    .option('--offerId <string>', 'Offer id', String, `charter-${Date.now()}`)
    .option(
      '--send-from <name-or-address>',
      'Send from address',
      normalizeAddress,
    )
    .action(async function (opts, options) {
      const { name: instanceName } = opts;

      /** @type {Parameters<typeof processOffer>[0]['toOffer']} */
      const toOffer = (agoricNames, current) => {
        const instance = agoricNames.instance[instanceName];
        assert(instance, `missing ${instanceName}`);

        if (current) {
          const found = findContinuingIds(current, agoricNames);
          abortIfSeen(instanceName, found);
        }

        return {
          id: opts.offerId,
          invitationSpec: {
            source: 'purse',
            instance,
            description: 'charter member invitation',
          },
          proposal: {},
        };
      };

      await processOffer({
        toOffer,
        instanceName,
        sendFrom: opts.sendFrom,
        keyringBackend: options.optsWithGlobals().keyringBackend,
      });
    });

  cmd
    .command('find-continuing-id')
    .description('print id of specified voting continuing invitation')
    .requiredOption(
      '--from <name-or-address>',
      'from address',
      normalizeAddress,
    )
    .requiredOption('--for <string>', 'description of the invitation')
    .action(async opts => {
      const { readPublished, ...vsk } = makeVstorageKit(
        { fetch },
        networkConfig,
      );
      const agoricNames = await makeAgoricNames(vsk.fromBoard, vsk.vstorage);
      const current = await getCurrent(opts.from, { readPublished });

      const known = findContinuingIds(current, agoricNames);
      if (!known) {
        console.error('No continuing ids found');
        return;
      }
      const match = known.find(r => r.description === opts.for);
      if (!match) {
        console.error(`No match found for '${opts.for}'`);
        return;
      }

      console.log(match.offerId);
    });

  cmd
    .command('find-continuing-ids')
    .description('print records of voting continuing invitations')
    .requiredOption(
      '--from <name-or-address>',
      'from address',
      normalizeAddress,
    )
    .action(async opts => {
      const { readPublished, ...vsk } = makeVstorageKit(
        { fetch },
        networkConfig,
      );
      const agoricNames = await makeAgoricNames(vsk.fromBoard, vsk.vstorage);
      const current = await getCurrent(opts.from, { readPublished });

      const found = findContinuingIds(current, agoricNames);
      for (const it of found) {
        show({ ...it, address: opts.from });
      }
    });

  cmd
    .command('vote')
    .description('vote on latest question')
    .requiredOption(
      '--instance <string>',
      'Committee name under agoricNames.instances',
      String,
      'economicCommittee',
    )
    .requiredOption(
      '--pathname <string>',
      'Committee name under published.committees',
      String,
      'Economic_Committee',
    )
    .option('--offerId <number>', 'Offer id', String, `gov-vote-${Date.now()}`)
    .requiredOption(
      '--forPosition <number>',
      'index of one position to vote for (within the question description.positions); ',
      Number,
    )
    .requiredOption(
      '--send-from <name-or-address>',
      'Send from address',
      normalizeAddress,
    )
    .action(async function (opts, options) {
      const vsk = makeVstorageKit({ fetch }, networkConfig);
      const { readPublished } = vsk;

      const questionDesc = await readPublished(
        `committees.${opts.pathname}.latestQuestion`,
      ).catch(err => {
        // CommanderError is a class constructor, and so
        // must be invoked with `new`.
        throw new CommanderError(1, 'VSTORAGE_FAILURE', err.message);
      });

      // TODO support multiple position arguments
      const chosenPositions = [questionDesc.positions[opts.forPosition]];
      assert(chosenPositions, `undefined position index ${opts.forPosition}`);

      /** @type {Parameters<typeof processOffer>[0]['toOffer']} */
      const toOffer = (agoricNames, current) => {
        const cont = current ? findContinuingIds(current, agoricNames) : [];
        const votingRight = cont.find(it => it.instanceName === opts.instance);
        if (!votingRight) {
          console.debug('continuing ids', cont, 'for', current);
          // CommanderError is a class constructor, and so
          // must be invoked with `new`.
          throw new CommanderError(
            1,
            'NO_INVITATION',
            'first, try: agops ec committee ...',
          );
        }
        return {
          id: opts.offerId,
          invitationSpec: {
            source: 'continuing',
            previousOffer: votingRight.offerId,
            invitationMakerName: 'makeVoteInvitation',
            // (positionList, questionHandle)
            invitationArgs: harden([
              chosenPositions,
              questionDesc.questionHandle,
            ]),
          },
          proposal: {},
        };
      };

      await processOffer(
        {
          toOffer,
          sendFrom: opts.sendFrom,
          keyringBackend: options.optsWithGlobals().keyringBackend,
        },
        vsk,
      );
    });

  cmd
    .command('proposePauseOffers')
    .description('propose a vote to pause offers')
    .option(
      '--send-from <name-or-address>',
      'Send from address',
      normalizeAddress,
    )
    .option(
      '--offerId <string>',
      'Offer id',
      String,
      `proposePauseOffers-${Date.now()}`,
    )
    .requiredOption(
      '--instance <string>',
      'name of governed instance in agoricNames',
    )
    .requiredOption(
      '--substring <string>',
      'an offer string to pause (can be repeated)',
      collectValues,
      [],
    )
    .option(
      '--deadline <minutes>',
      'minutes from now to close the vote',
      Number,
      1,
    )
    .action(async function (opts, options) {
      const { instance: instanceName } = opts;

      /** @type {Parameters<typeof processOffer>[0]['toOffer']} */
      const toOffer = (agoricNames, current) => {
        const instance = agoricNames.instance[instanceName];
        assert(instance, `missing ${instanceName}`);
        assert(current, 'missing current wallet');

        const known = findContinuingIds(current, agoricNames);

        assert(known, 'could not find committee acceptance offer id');

        // TODO magic string
        const match = known.find(
          r => r.description === 'charter member invitation',
        );
        assert(match, 'no offer found for charter member invitation');

        return {
          id: opts.offerId,
          invitationSpec: {
            source: 'continuing',
            previousOffer: match.offerId,
            invitationMakerName: 'VoteOnPauseOffers',
            // ( instance, strings list, timer deadline seconds )
            invitationArgs: harden([
              instance,
              opts.substring,
              BigInt(opts.deadline * 60 + Math.round(Date.now() / 1000)),
            ]),
          },
          proposal: {},
        };
      };

      await processOffer({
        toOffer,
        instanceName,
        sendFrom: opts.sendFrom,
        keyringBackend: options.optsWithGlobals().keyringBackend,
      });
    });

  return cmd;
};
