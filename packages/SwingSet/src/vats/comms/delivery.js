// @ts-check
/* eslint-disable no-use-before-define */

import { assert, details as X } from '@agoric/assert';
import { parseLocalSlot, insistLocalType } from './parseLocalSlots.js';
import { makeUndeliverableError } from '../../lib/makeUndeliverableError.js';
import { insistCapData } from '../../lib/capdata.js';
import { insistRemoteType } from './parseRemoteSlot.js';
import { insistRemoteID } from './remote.js';

const UNDEFINED = harden({
  body: JSON.stringify({ '@qclass': 'undefined' }),
  slots: [],
});

export function makeDeliveryKit(
  state,
  syscall,
  transmit,
  clistKit,
  gcFromRemote,
) {
  const {
    getRemoteForLocal,
    provideRemoteForLocal,
    provideRemoteForLocalResult,

    getLocalForRemote,
    provideLocalForRemote,
    provideLocalForRemoteResult,
    retireRemotePromiseID,
    beginRemotePromiseIDRetirement,
    retireAcknowledgedRemotePromiseIDs,

    getKernelForLocal,
    provideKernelForLocal,
    provideKernelForLocalResult,
    getLocalForKernel,
    provideLocalForKernel,
    provideLocalForKernelResult,
    retireKernelPromiseID,
  } = clistKit;

  function mapDataToKernel(data) {
    insistCapData(data);
    const kernelSlots = data.slots.map(s => provideKernelForLocal(s));
    const kernelData = harden({ body: data.body, slots: kernelSlots });
    return kernelData;
  }

  function mapDataFromKernel(kdata, doNotSubscribeSet) {
    insistCapData(kdata);
    const slots = kdata.slots.map(slot =>
      provideLocalForKernel(slot, doNotSubscribeSet),
    );
    return harden({ ...kdata, slots });
  }

  // dispatch.deliver from kernel lands here (with message from local vat to
  // remote machine): translate to local, join with handleSend
  function sendFromKernel(ktarget, method, kargs, kresult) {
    const target = getLocalForKernel(ktarget);
    const args = mapDataFromKernel(kargs, null);
    assert(
      state.getObject(target) || state.getPromiseStatus(target),
      X`unknown message target ${target}/${ktarget}`,
    );
    assert(
      method.indexOf(':') === -1 && method.indexOf(';') === -1,
      X`illegal method name ${method}`,
    );
    const result = provideLocalForKernelResult(kresult);
    const localDelivery = harden({ target, method, result, args });
    handleSend(localDelivery);
  }

  // dispatch.notify from kernel lands here (local vat resolving some
  // Promise, we need to notify remote machines): translate to local, join
  // with handleResolutions
  function resolveFromKernel(resolutions) {
    const willBeResolved = new Set();
    const localResolutions = [];
    for (const resolution of resolutions) {
      willBeResolved.add(resolution[0]);
    }
    for (const resolution of resolutions) {
      const [kfpid, rejected, data] = resolution;
      insistCapData(data);
      const lpid = getLocalForKernel(kfpid);

      // I *think* we should never get here for local promises, since the
      // controller only does sendOnly. But if we change that, we need to catch
      // locally-generated promises and deal with them.
      // if (promiseID in localPromises) {
      //  resolveLocal(promiseID, { rejected: false, data });
      // }

      // todo: if we previously held resolution authority for this promise, then
      // transferred it to some local vat, we'll have subscribed to the kernel
      // to hear about it. If we then get the authority back again, we no longer
      // want to hear about its resolution (since we're the ones doing the
      // resolving), but the kernel still thinks of us as subscribing, so we'll
      // get a bogus dispatch.notify. Currently we throw an error, which is
      // currently ignored but might prompt a vat shutdown in the future.

      state.insistPromiseIsUnresolved(lpid);
      state.insistDeciderIsKernel(lpid);
      state.changeDeciderFromKernelToComms(lpid);
      localResolutions.push([
        lpid,
        rejected,
        mapDataFromKernel(data, willBeResolved),
      ]);
    }
    for (const kfpid of willBeResolved) {
      retireKernelPromiseID(kfpid);
    }
    handleResolutions(localResolutions);
  }

  /** @type {(remoteID: string, ackSeqNum: number) => void} */
  function handleAckFromRemote(remoteID, ackSeqNum) {
    retireAcknowledgedRemotePromiseIDs(remoteID, ackSeqNum);
  }

  // dispatch.deliver with msg from vattp lands here, containing a message
  // from some remote machine. figure out whether it's a deliver or a
  // resolve, parse, merge with handleSend/handleResolutions
  /** @type {(remoteID: string, message: string, result?: string) => void} */
  function messageFromRemote(remoteID, message, result) {
    if (result) {
      // TODO: eventually, the vattp vat will be changed to send the 'receive'
      // message as a one-way message.  When that happens, this code should be
      // changed to assert here that the result parameter is null or undefined.
      syscall.resolve([[result, false, UNDEFINED]]);
    }
    // The message is preceded by an optional sequence number followed by the
    // sequence number that the remote end had most recently received from us as
    // of sending the message:
    // `$seqnum:$ackSeqNum:$actualMessage` or `:$ackSeqNum:$actualMessage`
    const delim1 = message.indexOf(':');
    assert(delim1 >= 0, X`received message ${message} lacks seqNum delimiter`);
    const seqNum = message.substring(0, delim1);
    const remote = state.getRemote(remoteID);
    const recvSeqNum = remote.advanceReceivedSeqNum();
    assert(
      seqNum === '' || seqNum === `${recvSeqNum}`,
      X`unexpected recv seqNum ${seqNum}`,
    );

    const delim2 = message.indexOf(':', delim1 + 1);
    assert(
      delim2 >= 0,
      X`received message ${message} lacks ackSeqNum delimiter`,
    );
    const ackSeqNum = parseInt(message.substring(delim1 + 1, delim2), 10);
    handleAckFromRemote(remoteID, ackSeqNum);

    const msgBody = message.substring(delim2 + 1);
    const command = msgBody.split(':', 1)[0];
    if (command === 'deliver') {
      return sendFromRemote(remoteID, msgBody);
    }
    if (command === 'resolve') {
      return resolveFromRemote(remoteID, msgBody);
    }
    if (command === 'gc') {
      return gcFromRemote(remoteID, msgBody, ackSeqNum);
    }
    assert.fail(X`unrecognized '${command}' in received message ${msgBody}`);
  }

  function mapDataFromRemote(remoteID, rdata) {
    insistCapData(rdata);
    const slots = rdata.slots.map(slot =>
      provideLocalForRemote(remoteID, slot),
    );
    return harden({ ...rdata, slots });
  }

  function sendFromRemote(remoteID, message) {
    // deliver:$target:$method:[$result][:$slots..];body
    const sci = message.indexOf(';');
    assert(sci !== -1, X`missing semicolon in deliver ${message}`);
    const fields = message.slice(0, sci).split(':').slice(1);
    // fields: [$target, $method, $result, $slots..]
    const remoteTarget = fields[0];
    const target = getLocalForRemote(remoteID, remoteTarget);
    const method = fields[1];
    const remoteResult = fields[2]; // 'rp-NN' or empty string
    let result;
    if (remoteResult.length) {
      result = provideLocalForRemoteResult(remoteID, remoteResult);
    }
    const slots = fields.slice(3).map(s => provideLocalForRemote(remoteID, s));
    const body = message.slice(sci + 1);
    const args = harden({ body, slots });
    const localDelivery = harden({ target, method, result, args });
    handleSend(localDelivery);
  }

  function parseResolveMessage(message) {
    // message is created by resolveToRemote.  It consists of 1 or more
    // resolutions, separated by newlines, each taking the form of either:
    // `resolve:fulfill:${target}${rmss};${resolution.body}`
    // or
    // `resolve:reject:${target}${rmss};${resolution.body}`
    const subMessages = message.split('\n');
    const resolutions = [];
    for (const submsg of subMessages) {
      const sci = submsg.indexOf(';');
      assert(sci !== -1, X`missing semicolon in resolve ${submsg}`);
      const pieces = submsg.slice(0, sci).split(':');
      assert(pieces[0] === 'resolve');
      const rejected = pieces[1] === 'reject';
      assert(rejected || pieces[1] === 'fulfill');
      const rpid = pieces[2];
      const slots = pieces.slice(3);
      const body = submsg.slice(sci + 1);
      const data = harden({ body, slots });
      resolutions.push([rpid, rejected, data]);
    }
    return resolutions;
  }

  function resolveFromRemote(remoteID, message) {
    const resolutions = parseResolveMessage(message);
    const localResolutions = [];
    for (const resolution of resolutions) {
      const [rpid, rejected, data] = resolution;
      insistCapData(data);
      insistRemoteType('promise', rpid);
      const lpid = getLocalForRemote(remoteID, rpid);
      state.insistPromiseIsUnresolved(lpid);
      state.insistDeciderIsRemote(lpid, remoteID);
      state.changeDeciderFromRemoteToComms(lpid, remoteID);
      localResolutions.push([
        lpid,
        rejected,
        mapDataFromRemote(remoteID, data),
      ]);
    }
    for (const resolution of resolutions) {
      retireRemotePromiseID(remoteID, resolution[0]);
    }
    handleResolutions(localResolutions);
  }

  function extractPresenceIfPresent(data) {
    insistCapData(data);

    const body = JSON.parse(data.body);
    if (
      body &&
      typeof body === 'object' &&
      body['@qclass'] === 'slot' &&
      body.index === 0
    ) {
      if (data.slots.length === 1) {
        const slot = data.slots[0];
        const { type } = parseLocalSlot(slot);
        if (type === 'object') {
          return slot;
        }
      }
    }
    return null;
  }

  // helper function for handleSend(): for each message, either figure out
  // the destination (remote machine or kernel), or reject the result because
  // the destination is a brick wall (undeliverable target)
  function resolveTarget(target, method) {
    const { type } = parseLocalSlot(target);

    if (type === 'object') {
      const remoteID = state.getObject(target);
      if (remoteID === 'kernel') {
        // target lives in some other vat on this machine, send into the kernel
        return { send: target, kernel: true };
      } else {
        // the target lives on a remote machine
        return { send: target, kernel: false, remoteID };
      }
    }

    assert(type === 'promise');
    // the promise might be resolved already
    const status = state.getPromiseStatus(target);
    assert(status);

    if (status !== 'unresolved') {
      const data = state.getPromiseData(target);
      if (status === 'rejected') {
        return { reject: data };
      }
      const targetPresence = extractPresenceIfPresent(data);
      if (targetPresence) {
        return resolveTarget(targetPresence, method);
      } else {
        return { reject: makeUndeliverableError(method) };
      }
    }

    // unresolved
    const remoteID = state.deciderIsRemote(target);
    if (remoteID) {
      return { send: target, kernel: false, remoteID };
    }

    state.insistDeciderIsKernel(target);
    return { send: target, kernel: true };
  }

  function resolutionCollector() {
    const resolutions = [];
    const doneResolutions = new Set();

    function scanSlots(slots) {
      for (const slot of slots) {
        const { type } = parseLocalSlot(slot);
        if (type === 'promise') {
          const status = state.getPromiseStatus(slot);
          assert(status, X`should have a value for ${slot} but didn't`);
          if (status !== 'unresolved' && !doneResolutions.has(slot)) {
            collect(slot);
          }
        }
      }
    }

    function collect(lpid) {
      doneResolutions.add(lpid);
      const status = state.getPromiseStatus(lpid);
      const data = state.getPromiseData(lpid);
      resolutions.push([lpid, status === 'rejected', data]);
      scanSlots(data.slots);
    }

    return {
      forSlots(slots) {
        scanSlots(slots);
        return resolutions;
      },
      getResolutions() {
        return resolutions;
      },
    };
  }

  function handleSend(localDelivery) {
    // { target, method, result, args }
    // where does it go?
    const where = resolveTarget(localDelivery.target, localDelivery.method);

    if (where.send) {
      const auxResolutions = resolutionCollector().forSlots(
        localDelivery.args.slots,
      );
      if (where.kernel) {
        sendToKernel(where.send, localDelivery);
        if (auxResolutions.length > 0) {
          resolveToKernel(auxResolutions);
        }
      } else {
        sendToRemote(where.send, where.remoteID, localDelivery);
        if (auxResolutions.length > 0) {
          resolveToRemote(where.remoteID, auxResolutions);
        }
      }
      return;
    }

    if (where.reject) {
      if (!localDelivery.result) {
        return; // sendOnly, nowhere to send the rejection
      }
      const resolutions = harden([[localDelivery.result, true, where.reject]]);
      handleResolutions(resolutions);
      return;
    }

    assert.fail(X`unknown where ${where}`);
  }

  function sendToKernel(target, delivery) {
    const { method, args: localArgs, result: localResult } = delivery;
    const kernelTarget = getKernelForLocal(target);
    const kernelArgs = mapDataToKernel(localArgs);
    const kernelResult = provideKernelForLocalResult(localResult);
    syscall.send(kernelTarget, method, kernelArgs, kernelResult);
    if (kernelResult) {
      syscall.subscribe(kernelResult);
    }
  }

  function sendToRemote(target, remoteID, localDelivery) {
    assert(remoteID, X`oops ${target}`);
    insistCapData(localDelivery.args);

    const {
      method,
      args: { body, slots: localSlots },
      result: localResult,
    } = localDelivery;

    const remoteTarget = getRemoteForLocal(remoteID, target);
    let remoteResult = '';
    if (localResult) {
      insistLocalType('promise', localResult);
      remoteResult = provideRemoteForLocalResult(remoteID, localResult);
    }
    const remoteSlots = localSlots.map(s => provideRemoteForLocal(remoteID, s));
    let ss = remoteSlots.join(':');
    if (ss) {
      ss = `:${ss}`;
    }

    // now render the transmission. todo: 'method' lives in the transmission
    // for now, but will be moved to 'data'
    const msg = `deliver:${remoteTarget}:${method}:${remoteResult}${ss};${body}`;
    transmit(remoteID, msg);
  }

  function handleResolutions(resolutions) {
    // All promises listed as *targets* in `resolutions` are by definition
    // unresolved when they arrive here: they are being decided by someone else
    // (the kernel, or a remote).  They are either primary (previously known to
    // us) or auxilliary (imported, in an unresolved state, as the resolution
    // data of the batch was translated from whatever kernel/remote sent the
    // batch into our local namespace).  The resolution data in `resolutions`
    // may point to both resolved and unresolved promises, but any cycles
    // (pointers into other targets of `resolutions`) will still point to
    // unresolved promises, because we haven't marked them as resolved quite
    // yet.
    const [[primaryLpid]] = resolutions;
    const { subscribers, kernelIsSubscribed } =
      state.getPromiseSubscribers(primaryLpid);

    // Run the collector *before* we change the state of our promise table.
    const collector = resolutionCollector();
    for (const resolution of resolutions) {
      const [_lpid, _rejected, data] = resolution;
      collector.forSlots(data.slots);
    }

    // The collector now knows about every previously-resolved promise cited by
    // the resolution data of `resolutions`. This will never overlap with the
    // targets of `resolutions`.
    for (const resolution of resolutions) {
      const [lpid, rejected, data] = resolution;
      // rejected: boolean, data: capdata
      insistCapData(data);
      insistLocalType('promise', lpid);
      state.insistPromiseIsUnresolved(lpid);
      state.insistDeciderIsComms(lpid);

      // mark it as resolved in the promise table, so later messages to it will
      // be handled properly
      state.markPromiseAsResolved(lpid, rejected, data);
    }
    // At this point, both the primary and auxillary promises listed as
    // targets in `resolutions` are marked as resolved.

    const auxResolutions = collector.getResolutions();
    if (auxResolutions.length > 0) {
      // Concat because `auxResolutions` and `resolutions` are strictly disjoint
      resolutions = resolutions.concat(auxResolutions);
    }

    // what remotes need to know?
    for (const remoteID of subscribers) {
      insistRemoteID(remoteID);
      resolveToRemote(remoteID, resolutions);
      // TODO: what happens when we tell them about the promise again someday?
      // do we need to remember who we've notified, and never notify them
      // again?
    }

    if (kernelIsSubscribed) {
      resolveToKernel(resolutions);
      // the kernel now forgets this lpid: the p.resolved flag in
      // promiseTable reminds provideKernelForLocal to use a fresh LPID if we
      // ever reference it again in the future
    }
  }

  function resolveToRemote(remoteID, resolutions) {
    const msgs = [];
    const retires = [];
    for (const resolution of resolutions) {
      const [lpid, rejected, data] = resolution;

      const rpid = getRemoteForLocal(remoteID, lpid);
      // rpid should be rp+NN
      insistRemoteType('promise', rpid);
      // assert(parseRemoteSlot(rpid).allocatedByRecipient, rpid); // rp+NN for them
      function mapSlots() {
        const { slots } = data;
        let ss = slots.map(s => provideRemoteForLocal(remoteID, s)).join(':');
        if (ss) {
          ss = `:${ss}`;
        }
        return ss;
      }

      const rejectedTag = rejected ? 'reject' : 'fulfill';
      // prettier-ignore
      msgs.push(`resolve:${rejectedTag}:${rpid}${mapSlots()};${data.body}`);
      retires.push(rpid);
    }
    for (const rpid of retires) {
      beginRemotePromiseIDRetirement(remoteID, rpid);
    }
    transmit(remoteID, msgs.join('\n'));
  }

  function resolveToKernel(localResolutions) {
    const resolutions = [];
    for (const localResolution of localResolutions) {
      const [lpid, rejected, data] = localResolution;
      const kfpid = getKernelForLocal(lpid);
      resolutions.push([kfpid, rejected, mapDataToKernel(data)]);
    }
    for (const resolution of resolutions) {
      retireKernelPromiseID(resolution[0]);
    }
    syscall.resolve(resolutions);
  }

  return harden({
    sendFromKernel,
    resolveFromKernel,
    messageFromRemote,
    mapDataFromKernel,
    resolveToRemote,
  });
}
