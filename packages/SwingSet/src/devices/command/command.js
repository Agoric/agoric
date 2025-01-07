import { Fail } from '@endo/errors';
import { makePromiseKit } from '@endo/promise-kit';
import { Nat } from '@endo/nat';

export default function buildCommand(broadcastCallback) {
  broadcastCallback || Fail`broadcastCallback must be provided.`;
  let inboundCallback;
  const srcPath = new URL('device-command.js', import.meta.url).pathname;
  let nextCount = 0n;
  const responses = new Map();

  async function inboundCommand(obj) {
    // deliver the JSON-serializable object to the registered handler, and
    // return a promise that fires with a JSON-serializable object in
    // response
    const { promise, resolve, reject } = makePromiseKit();
    const count = nextCount;
    nextCount += 1n;
    responses.set(count, { resolve, reject });
    inboundCallback || Fail`inboundCommand before registerInboundCallback`;
    try {
      inboundCallback(count, JSON.stringify(obj));
    } catch (e) {
      console.error(`error running inboundCallback:`, e);
    }
    return promise;
  }

  function sendBroadcast(kBodyString) {
    const obj = JSON.parse(`${kBodyString}`);
    broadcastCallback(obj);
  }

  function registerInboundCallback(cb) {
    !inboundCallback || Fail`registerInboundCallback called more than once`;
    inboundCallback = cb;
  }

  function deliverResponse(kCount, kIsReject, kResponseString) {
    const count = Nat(kCount);
    const isReject = Boolean(kIsReject);
    let obj;
    // TODO: Start Compartment globals are tamed, no longer need this
    // sanitization
    if (kResponseString !== undefined) {
      obj = JSON.parse(`${kResponseString}`);
    }
    // TODO this might not qualify as an error, it needs more thought
    // See https://github.com/Agoric/agoric-sdk/pull/2406#discussion_r575561554
    responses.has(count) || Fail`unknown response index ${count}`;
    const { resolve, reject } = responses.get(count);
    if (isReject) {
      reject(obj);
    } else {
      resolve(obj);
    }
  }

  return {
    srcPath,
    endowments: { registerInboundCallback, deliverResponse, sendBroadcast },
    inboundCommand, // for external access
  };
}
