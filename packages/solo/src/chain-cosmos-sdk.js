/* global setTimeout Buffer */
import path from 'path';
import fs from 'fs';
import { execFile } from 'child_process';
import { open as tempOpen } from 'temp';

import WebSocket from 'ws';

import anylogger from 'anylogger';
import { makeNotifierKit } from '@agoric/notifier';
import { makePromiseKit } from '@endo/promise-kit';

import { assert, details as X } from '@agoric/assert';
import {
  DEFAULT_BATCH_TIMEOUT_MS,
  makeBatchedDeliver,
} from '@agoric/vats/src/batched-deliver.js';

const console = anylogger('chain-cosmos-sdk');

// the `agd` tool in our repo is built by 'cd golang/cosmos &&
// make'. It lives in the build tree along with `bin/ag-solo`, in case there are
// multiple checkouts of `agoric-sdk`.
export const HELPER = new URL(
  '../../../golang/cosmos/build/agd',
  import.meta.url,
).pathname;

const FAUCET_ADDRESS =
  'the appropriate faucet channel on Discord (https://agoric.com/discord)';

// Transaction simulation should be an accurate measure of gas.
const GAS_ADJUSTMENT = '1.2';

const adviseEgress = egressAddr =>
  `\


Send:

  !faucet client ${egressAddr}

to ${FAUCET_ADDRESS}`;

// Retry if our latest message failed.
const INITIAL_SEND_RETRY_DELAY_MS = 1_000;
const MAXIMUM_SEND_RETRY_DELAY_MS = 15_000;

const exponentialBackoff = backoff => backoff * 2;

const MAX_BUFFER_SIZE = 10 * 1024 * 1024;

// How much of each delay to leave to randomness.
const RANDOM_SCALE = 0.1;

// Tradeoff:
// true: clear out messages from mailbox when we are waiting for more activity.
// Costs an extra tx per string of messages.
//
// false: leave acknowledged messages in mailbox until we have something else to
// send.  Costs more mailbox space over time.
const SEND_EMPTY_ACKS = false;

const randomizeDelay = delay =>
  Math.ceil(delay + delay * RANDOM_SCALE * Math.random());

const makeTempFile = async (prefix, contents) => {
  const tmpInfo = await new Promise((resolve, reject) => {
    tempOpen({ prefix }, (err, info) => {
      if (err) {
        return reject(err);
      }
      return resolve(info);
    });
  });

  try {
    await new Promise((resolve, reject) => {
      fs.write(tmpInfo.fd, contents, err => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  } finally {
    await new Promise((resolve, reject) => {
      fs.close(tmpInfo.fd, e => {
        if (e) {
          return reject(e);
        }
        return resolve();
      });
    });
  }
  return tmpInfo;
};

export async function connectToChain(
  basedir,
  GCI,
  rpcAddresses,
  helperAddr,
  inbound,
  chainID,
) {
  // Each time we read our mailbox from the chain's state, and each time we
  // send an outbound message to the chain, we shell out to a one-shot copy
  // of 'agd', the swingset-flavored cosmos-sdk CLI tool.

  // We originally thought we could use the tool's "rest-server" mode, leave
  // it running for the duration of our process, but it turns out that the
  // rest-server cannot sign transactions (that ability was removed as a
  // security concern in https://github.com/cosmos/cosmos-sdk/issues/3641)

  // A better approach I'm hopeful we can achieve is an FFI binding to the
  // same golang code that powers agd, so we can call the
  // query/tx functions directly without the overhead of spawning a
  // subprocess and encoding everything as strings over stdio.

  const rpcHrefs = rpcAddresses.map(rpcAddr =>
    // Don't remove explicit port numbers from the URL, because the Cosmos
    // `--node=xxx` flag requires them (it doesn't just assume that
    // `--node=https://testnet.rpc.agoric.net` is the same as
    // `--node=https://testnet.rpc.agoric.net:443`)
    rpcAddr.includes('://') ? rpcAddr : `http://${rpcAddr}`,
  );

  // Shuffle our rpcHrefs, to help distribute load.
  // Modern version of Fisher-Yates shuffle algorithm (in-place).
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
  }
  shuffle(rpcHrefs);

  const helperDir = path.join(basedir, 'ag-cosmos-helper-statedir');

  const readOrDefault = (file, dflt) =>
    fs.promises
      .readFile(file, { encoding: 'utf-8' })
      .catch(e => {
        if (e.code === 'ENOENT') {
          return dflt;
        }
        throw e;
      })
      .then(str => str.trim());

  // The helper account may only have the authority to send messages on behalf
  // of the client, which has been set up by the client with something like:
  //
  // agd tx authz grant $(cat ag-cosmos-helper-address) \
  // generic --msg-type=/agoric.swingset.MsgDeliverInbound \
  // --from=$(cat cosmos-client-account)
  const clientAddr = await readOrDefault(
    path.join(basedir, 'cosmos-client-account'),
    helperAddr,
  );

  // The helper address may not have a token balance, and instead uses a
  // separate fee account, set up with something like:
  //
  // agd tx feegrant grant --period=5 --period-limit=200000urun \
  // $(cat cosmos-fee-account) $(cat ag-cosmos-helper-address)
  const feeAccountAddr = await readOrDefault(
    path.join(basedir, 'cosmos-fee-account'),
    '',
  );

  let lastGoodRpcHrefIndex = 0;
  async function retryRpcHref(tryOnce) {
    let rpcHrefIndex = lastGoodRpcHrefIndex;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const thisRpcHref = rpcHrefs[rpcHrefIndex];

      // tryOnce will either throw if cancelled (which rejects this promise),
      // eslint-disable-next-line no-await-in-loop
      const ret = await tryOnce(thisRpcHref);
      if (ret !== undefined) {
        // Or returns non-undefined, which we should resolve.
        lastGoodRpcHrefIndex = rpcHrefIndex;
        return ret;
      }

      // It was undefined, so wait, then retry.
      // eslint-disable-next-line no-await-in-loop
      await new Promise(resolve => setTimeout(resolve, 5000));
      rpcHrefIndex = (rpcHrefIndex + 1) % rpcHrefs.length;
    }
  }

  let goodRpcHref = rpcHrefs[0];
  const runHelper = (args, stdin = undefined) => {
    const fullArgs = [
      ...args,
      `--chain-id=${chainID}`,
      `--node=${goodRpcHref}`,
      `--home=${helperDir}`,
    ];
    console.debug(HELPER, ...fullArgs);
    return new Promise(resolve => {
      const proc = execFile(
        HELPER,
        fullArgs,
        { maxBuffer: MAX_BUFFER_SIZE },
        (_error, stdout, stderr) => {
          resolve({ stdout, stderr });
        },
      );
      if (stdin) {
        proc.stdin.write(stdin);
        proc.stdin.end();
      }
    });
  };

  const captureHelperOutput = async (txArgs, dstFile) => {
    // Just run the helper as usual.
    const { stdout, stderr } = await runHelper(txArgs);
    if (stderr) {
      throw Error(`Error capturing helper output: ${stderr}`);
    }

    // This is a separate step in case the dstFile is used as input for the
    // runHelper command.
    await fs.promises.writeFile(dstFile, stdout);
  };

  // Validate that our chain egress exists.
  let hasEgress = false;

  // We need one subscription-type thing
  // to tell us that a new block exists, then we can use a different
  // query-type tool to retrieve the outbox, but we want to know that the
  // outbox is correctly traced to the block header, and that the block
  // header is a legitimate descendant of our previously-validated state.

  // FIXME: We currently don't use the persistent light client functionality.
  // We hope to move to CosmJS with our own IBC implementation for all our light
  // client + transaction needs.  For now, it's simple enough to notice when
  // blocks happen an just to issue mailbox queries.

  let currentTxHashPK = makePromiseKit();
  let postponedTxHash;
  const postponedWaitForTxHash = txHash => {
    postponedTxHash = txHash;
    return currentTxHashPK.promise;
  };
  let waitForTxHash = postponedWaitForTxHash;

  /**
   * Get a notifier that announces every time a block lands.
   *
   * @returns {Notifier<any>}
   */
  const getMailboxNotifier = () => {
    const { notifier, updater } = makeNotifierKit();
    retryRpcHref(async rpcHref => {
      // Every time we enter this function, we are establishing a
      // new websocket to a potentially different RPC server.
      //
      // We use the same notifier, though... it's a stable identity.
      goodRpcHref = rpcHref;

      // This promise is for when we're ready to retry.
      const retryPK = makePromiseKit();

      // Find the websocket corresponding to the current RPC server.
      const rpcWsURL = new URL('/websocket', rpcHref);
      // We translate `https:` to `wss:` and `http:` to `ws:`.
      rpcWsURL.protocol = rpcWsURL.protocol.replace(/^http/, 'ws');

      // Open the WebSocket.
      const ws = new WebSocket(rpcWsURL.href);
      ws.addEventListener('error', e => {
        console.debug('WebSocket error', e);
      });

      // We have a new instance of the map and id per connection.
      let lastId = 0;
      const idToCallback = new Map();
      const clearCallback = id => idToCallback.delete(id);
      const setCallback = (id, cb) => idToCallback.set(id, cb);

      const sendRPC = (method, params) => {
        lastId += 1;
        const id = lastId;
        const fullObj = {
          jsonrpc: '2.0',
          id,
          method,
          params,
        };
        ws.send(JSON.stringify(fullObj));
        return id;
      };

      const subscribeToTxHash = (txHash, cb) => {
        const txQuery = `tm.event = 'Tx' and tx.hash = '${txHash}'`;

        const b64Hash = Buffer.from(txHash, 'hex').toString('base64');
        const txSubscriptionId = sendRPC('subscribe', { query: txQuery });
        const queryId = sendRPC('tx', { hash: b64Hash });
        const cleanup = () => {
          clearCallback(txSubscriptionId);
          clearCallback(queryId);
          sendRPC('unsubscribe', { query: txQuery });
        };

        const handleResult = obj => {
          // console.log('got', txHash, obj);
          if (obj.error) {
            if (obj.error.code === -32603) {
              // This is the error we expect when the transaction is not found.
              return;
            }
            cleanup();
            cb(obj.error);
            return;
          }
          if (!obj.result) {
            return;
          }
          let txResult;
          const { data, tx_result: rawTxResult } = obj.result;
          if (data) {
            txResult = data.value.TxResult.result;
          } else {
            txResult = rawTxResult;
          }
          if (!txResult) {
            return;
          }
          cleanup();
          cb(null, txResult);
        };
        setCallback(txSubscriptionId, handleResult);
        setCallback(queryId, handleResult);
        return cleanup;
      };

      const subscribeToStorage = (storagePath, cb) => {
        let lastHeight = 0n;

        // This takes care of BeginBlock/EndBlock events.
        const blockQuery = `tm.event = 'NewBlockHeader' AND storage.path = '${storagePath}'`;
        // We need a separate query for events raised by transactions.
        const txQuery = `tm.event = 'Tx' and storage.path = '${storagePath}'`;

        // console.info('subscribeToStorage', blockQuery);
        const blockSubscriptionId = sendRPC('subscribe', { query: blockQuery });
        const txSubscriptionId = sendRPC('subscribe', { query: txQuery });
        const queryId = sendRPC('abci_query', {
          path: `/custom/swingset/storage/${storagePath}`,
        });

        const cleanup = () => {
          // console.info('Unsubscribing from', blockSubscriptionId);
          clearCallback(blockSubscriptionId);
          clearCallback(txSubscriptionId);
          clearCallback(queryId);
          sendRPC('unsubscribe', { query: blockQuery });
          sendRPC('unsubscribe', { query: txQuery });
        };

        const guardedCb = (height, value) => {
          if (height < lastHeight) {
            return;
          }
          lastHeight = height;
          cb(null, value);
        };

        // Query for our initial value.
        setCallback(queryId, obj => {
          // console.info(`got ${storagePath} query`, obj);
          if (obj.result && obj.result.response && obj.result.response.value) {
            // Decode the layers up to the actual storage value.
            const { value: b64JsonStorage, height: heightString } =
              obj.result.response;
            const jsonStorage = Buffer.from(b64JsonStorage, 'base64').toString(
              'utf8',
            );
            const { value: storageValue } = JSON.parse(jsonStorage);
            guardedCb(BigInt(heightString), storageValue);
          } else if (
            obj.result &&
            obj.result.response &&
            obj.result.response.code === 6
          ) {
            // No need to try again, just a missing value that our subscription
            // will pick up.
            const { height: heightString } = obj.result.response;
            guardedCb(BigInt(heightString), null);
          } else {
            // Unexpected error.
            cb(obj, null);
          }
          clearCallback(queryId);
        });

        const handleSubscription = obj => {
          // console.info(`got ${storagePath} subscription`, obj);
          if (obj.error) {
            cleanup();
            cb(obj.error, null);
            return;
          }

          const events = obj.result.events;
          if (!events) {
            return;
          }

          let height = 0n;
          // Get the height from the 'Tx' subscription.
          if (obj.result.events['tx.height']) {
            const txHeight = BigInt(obj.result.events['tx.height'][0]);
            if (txHeight > height) {
              height = txHeight;
            }
          }

          // Get the header from 'NewBlockHeader' or 'NewBlock' subscriptions.
          const blockValue = obj.result.data.value;
          if (blockValue) {
            const blockHeader = blockValue.block
              ? blockValue.block.header
              : blockValue.header;
            if (blockHeader) {
              const blockHeaderHeight = BigInt(blockHeader.height);
              if (blockHeaderHeight > height) {
                height = blockHeaderHeight;
              }
            }
          }

          const paths = events['storage.path'];
          const values = events['storage.value'];

          // Find only the latest value in the events.
          let storageValue;
          paths.forEach((key, i) => {
            if (key === storagePath) {
              storageValue = values[i];
            }
          });
          if (storageValue === undefined) {
            // No matching events found.
            return;
          }

          guardedCb(height, storageValue);
        };

        setCallback(blockSubscriptionId, handleSubscription);
        setCallback(txSubscriptionId, handleSubscription);

        return cleanup;
      };

      const followMailbox = () => {
        // Tell the sender to go.
        updater.updateState(undefined);

        // Initialize the txHash subscription.
        const subscribeAndWaitForTxHash = txHash => {
          const thisPK = currentTxHashPK;
          postponedTxHash = undefined;
          currentTxHashPK = makePromiseKit();
          const unsubscribe = subscribeToTxHash(txHash, (err, txResult) => {
            // console.info('received subscription for', txHash, err, txEvent);
            unsubscribe();
            if (err) {
              thisPK.reject(err);
            } else {
              thisPK.resolve(txResult);
            }
            postponedTxHash = undefined;
          });
          return thisPK.promise;
        };

        waitForTxHash = subscribeAndWaitForTxHash;
        if (postponedTxHash) {
          subscribeAndWaitForTxHash(postponedTxHash);
        }

        subscribeToStorage(`mailbox.${clientAddr}`, (err, storageValue) => {
          if (err) {
            console.error(`Error subscribing to mailbox`, err);
            ws.close();
            return;
          }
          if (!storageValue) {
            return;
          }
          const mb = JSON.parse(storageValue);
          updater.updateState(mb);
        });
      };

      ws.addEventListener('open', _ => {
        if (hasEgress) {
          // No need to requery egress, we already have it.
          followMailbox();
          return;
        }

        const stopEgress = subscribeToStorage(
          `egress.${clientAddr}`,
          (err, storageValue) => {
            if (err) {
              console.error(`Error subscribing to egress`, err);
              ws.close();
              return;
            }
            if (!storageValue) {
              console.error(`
=============
${chainID} chain does not yet know of address ${clientAddr}${adviseEgress(
                clientAddr,
              )}
=============
`);
              return;
            }
            // Found egress.
            hasEgress = true;

            followMailbox();
            stopEgress();
          },
        );
      });

      ws.addEventListener('message', ev => {
        // We received a message.
        // console.info('got message', ev.data);
        const obj = JSON.parse(ev.data);
        const cb = idToCallback.get(obj.id);
        if (cb) {
          cb(obj);
        }
      });

      ws.addEventListener('close', _ => {
        // The value `undefined` as the resolution of this retry
        // tells the caller to retry again with a different RPC server.
        retryPK.resolve(undefined);
        waitForTxHash = postponedWaitForTxHash;
      });
      // Return an unresolved promise that resolves to `undefined`
      // when the WebSocket is closed.
      return retryPK.promise;
    });

    return notifier;
  };

  // Begin the mailbox notifier cycle.
  const mbNotifier = getMailboxNotifier();

  const { notifier: sendNotifier, updater: sendUpdater } = makeNotifierKit();

  /**
   * @typedef {bigint} SeqNum
   * @type {[SeqNum, any][]} Ordered By seqnum
   */
  let messagePool = [];

  // Atomically add to the message pool, ensuring the pool is sorted by unique
  // sequence number.
  const addToMessagePool = newMessages => {
    // Add the new messages.
    const bigPool = messagePool.concat(newMessages);

    // Sort the big pool by sequence number.
    const sortedPool = bigPool.sort((a, b) => a[0] - b[0]);

    // Only keep messages that have a unique sequence number.
    const uniquePool = sortedPool.filter(
      (a, i) =>
        // Index 0 is always kept.
        i === 0 ||
        // Others are only kept if not the same as the prior sequence.
        a[0] !== sortedPool[i - 1][0],
    );

    // Replace the old message pool.
    messagePool = uniquePool;
  };

  const removeAckedFromMessagePool = ack => {
    // Remove all messages sent at earlier acks.
    messagePool = messagePool.filter(m => m[0] > ack);
  };

  let totalDeliveries = 0;
  let highestAck = -1;
  let sequenceNumber = 0n;
  const sendFromMessagePool = async () => {
    let tmpInfo;

    const messages = messagePool;

    try {
      totalDeliveries += 1;
      console.log(
        `delivering to chain (trips=${totalDeliveries})`,
        GCI,
        messages,
        highestAck,
      );

      // TODO: remove this JSON.stringify: change 'deliverMailboxReq' to have
      // more structure than a single string, and have the CLI handle variable
      // args better
      tmpInfo = await makeTempFile(
        'ag-solo-cosmos-deliver.',
        JSON.stringify([messages, highestAck]),
      );

      // Deliver message over file, as it could be big.
      let txArgs = ['tx', 'swingset', 'deliver', `@${tmpInfo.path}`];

      // Is our helper different from the SwingSet client address?
      if (clientAddr !== helperAddr) {
        // Get the encoded message into our file.
        await captureHelperOutput(
          [...txArgs, '--generate-only', `--from=${clientAddr}`],
          tmpInfo.path,
        );

        // Indirect the transaction broadcasting through the `authz` module.
        txArgs = ['tx', 'authz', 'exec', tmpInfo.path];
      }

      // Now add the arguments to actually sign and broadcast the transaction.
      txArgs.push(
        '--keyring-backend=test',
        '--gas=auto',
        `--gas-adjustment=${GAS_ADJUSTMENT}`,
        '--from=ag-solo',
        '--yes',
        '-ojson',
      );

      // Use the feeAccount for any fees.
      if (feeAccountAddr) {
        txArgs.push(`--fee-account=${feeAccountAddr}`);
      }

      // We just try a single delivery per block.
      let retry = true;
      while (retry) {
        retry = false;
        // eslint-disable-next-line no-await-in-loop
        const { stderr, stdout } = await runHelper([
          ...txArgs,
          `--sequence=${sequenceNumber}`,
        ]);

        const errMsg = stderr.trimRight();
        if (errMsg) {
          const seqMatch = errMsg.match(
            /account sequence mismatch, expected (\d+),/,
          );
          if (seqMatch) {
            // Try to resync our sequence number before sending more.
            console.info(
              `Resynchronizing ${GCI} sequence number from ${sequenceNumber} to ${seqMatch[1]}`,
            );
            sequenceNumber = BigInt(seqMatch[1]);
            retry = true;
          } else {
            console.error(errMsg);
          }
        }

        if (!retry) {
          console.debug(`helper said: ${stdout}`);
          const out = JSON.parse(stdout);

          assert.equal(
            out.code,
            0,
            X`Unexpected output: ${out.raw_log || stdout.trimRight()}`,
          );

          // Wait for the transaction to be included in a block.
          const txHash = out.txhash;

          waitForTxHash(txHash).then(txResult => {
            // The result had an error code (not 0 or undefined for success).
            if (txResult.code) {
              // eslint-disable-next-line no-use-before-define
              failedSend(
                assert.error(X`Error in tx processing: ${txResult.log}`),
              );
            }
          });

          // We submitted the transaction to the mempool successfully.
          // Preemptively increment our sequence number to avoid needing to
          // retry next time.
          sequenceNumber += 1n;
        }
      }
    } finally {
      if (tmpInfo) {
        await fs.promises.unlink(tmpInfo.path);
      }
    }
  };

  /**
   * This function is entered at most the same number of times as the
   * mailboxNotifier announces a new mailbox.
   *
   * It then delivers the mailbox to inbound. There are no optimisations.
   *
   * @param {number} [lastMailboxUpdate]
   */
  const recurseEachMailboxUpdate = async (lastMailboxUpdate = undefined) => {
    const { updateCount, value: mailbox } = await mbNotifier.getUpdateSince(
      lastMailboxUpdate,
    );
    assert(updateCount, X`${GCI} unexpectedly finished!`);
    if (mailbox) {
      const { outbox, ack } = mailbox;
      // console.info('have mailbox', mailbox);
      inbound(GCI, outbox, ack);
      removeAckedFromMessagePool(ack);
    }

    recurseEachMailboxUpdate(updateCount).catch(e =>
      console.error(`Failed to fetch ${GCI} mailbox:`, e),
    );
  };

  // Begin the mailbox consumer.
  recurseEachMailboxUpdate().catch(e =>
    console.error(`Failed to fetch first ${GCI} mailbox:`, e),
  );

  // Retry sending, but no more than one pending retry at a time.
  let retryPending;
  let retryBackoff;
  const successfulSend = () => {
    // Reset the backoff period.
    retryBackoff = randomizeDelay(INITIAL_SEND_RETRY_DELAY_MS);
  };
  const failedSend = (e = undefined) => {
    if (e) {
      console.error(`Error sending`, e);
    }
    if (retryPending !== undefined) {
      return;
    }

    retryPending = setTimeout(() => {
      retryPending = undefined;
      sendUpdater.updateState(true);
    }, retryBackoff);

    // This is where we naively implement exponential backoff with a maximum.
    retryBackoff = randomizeDelay(
      Math.min(exponentialBackoff(retryBackoff), MAXIMUM_SEND_RETRY_DELAY_MS),
    );
  };

  // This function ensures we only have one outgoing send operation at a time.
  const recurseEachSend = async (lastSendUpdate = undefined) => {
    // See when there is another requested send since our last time.
    const { updateCount } = await sendNotifier.getUpdateSince(lastSendUpdate);
    assert(updateCount, X`Sending unexpectedly finished!`);

    await sendFromMessagePool().then(successfulSend, failedSend);
    recurseEachSend(updateCount);
  };

  // Begin the sender when we get the first (empty) mailbox update.
  mbNotifier.getUpdateSince().then(() => recurseEachSend());

  async function deliver(newMessages, acknum) {
    let doSend = false;
    if (acknum > highestAck) {
      highestAck = acknum;
      // We never send just an ack without messages.  But if we did, the
      // following line would do it:
      doSend = SEND_EMPTY_ACKS;
    }
    if (newMessages.length) {
      addToMessagePool(newMessages);
      doSend = true;
    }

    if (doSend) {
      sendUpdater.updateState(true);
    }
  }

  // Now that we've started consuming blocks, tell our caller how to deliver
  // messages.
  return makeBatchedDeliver(deliver, Math.min(DEFAULT_BATCH_TIMEOUT_MS, 2000));
}
