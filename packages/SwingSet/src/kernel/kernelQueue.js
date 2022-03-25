// @ts-check
import { insistKernelType, parseKernelSlot } from './parseKernelSlots.js';
import { insistCapData } from '../lib/capdata.js';
import { insistMessage } from '../lib/message.js';
import { insistVatID } from '../lib/id.js';

/**
 * @param {Object} tools
 * @param {KernelKeeper} tools.kernelKeeper Kernel keeper managing persistent kernel state
 * @param {(problem: unknown, err?: Error) => void} [tools.panic]
 */
export function makeKernelQueueHandler(tools) {
  const {
    kernelKeeper,
    panic = (problem, err) => {
      throw err || new Error(`kernel panic ${problem}`);
    },
  } = tools;

  function notify(vatID, kpid) {
    const m = harden({ type: 'notify', vatID, kpid });
    kernelKeeper.incrementRefCount(kpid, `enq|notify`);
    kernelKeeper.addToAcceptanceQueue(m);
  }

  function doSubscribe(vatID, kpid) {
    insistVatID(vatID);
    const p = kernelKeeper.getKernelPromise(kpid);
    if (p.state === 'unresolved') {
      kernelKeeper.addSubscriberToPromise(kpid, vatID);
    } else {
      // otherwise it's already resolved, you probably want to know how
      notify(vatID, kpid);
    }
  }

  function doResolve(vatID, resolutions) {
    if (vatID) {
      insistVatID(vatID);
    }
    for (const resolution of resolutions) {
      const [kpid, rejected, data] = resolution;
      insistKernelType('promise', kpid);
      insistCapData(data);
      const p = kernelKeeper.getResolveablePromise(kpid, vatID);
      const { subscribers } = p;
      for (const subscriber of subscribers) {
        if (subscriber !== vatID) {
          notify(subscriber, kpid);
        }
      }
      kernelKeeper.resolveKernelPromise(kpid, rejected, data);
      const tag = rejected ? 'rejected' : 'fulfilled';
      if (p.policy === 'logAlways' || (rejected && p.policy === 'logFailure')) {
        console.log(
          `${kpid}.policy ${p.policy}: ${tag} ${JSON.stringify(data)}`,
        );
      } else if (rejected && p.policy === 'panic') {
        panic(`${kpid}.policy panic: ${tag} ${JSON.stringify(data)}`);
      }
    }
  }

  function resolveToError(kpid, errorData, expectedDecider) {
    doResolve(expectedDecider, [[kpid, true, errorData]]);
  }

  function doSend(target, msg) {
    parseKernelSlot(target);
    insistMessage(msg);
    const m = harden({ type: 'send', target, msg });
    kernelKeeper.incrementRefCount(target, `enq|msg|t`);
    if (msg.result) {
      kernelKeeper.incrementRefCount(msg.result, `enq|msg|r`);
    }
    let idx = 0;
    for (const argSlot of msg.args.slots) {
      kernelKeeper.incrementRefCount(argSlot, `enq|msg|s${idx}`);
      idx += 1;
    }
    kernelKeeper.addToAcceptanceQueue(m);
  }

  /**
   * Enqueue a message to some kernel object, as if the message had been sent by
   * some other vat. This requires a kref as a target.
   *
   * @param {string} kref Target of the message
   * @param {string} method The message verb
   * @param {any} args The message arguments
   * @param {ResolutionPolicy} [policy] How the kernel should handle an eventual
   *   resolution or rejection of the message's result promise. Should be one of
   *   'none' (don't even create a result promise), 'ignore' (do nothing),
   *   'logAlways' (log the resolution or rejection), 'logFailure' (log only
   *   rejections), or 'panic' (panic the kernel upon a rejection).
   * @returns {string | undefined} The kpid of the sent message's result promise, if any
   */
  function queueToKref(kref, method, args, policy = 'ignore') {
    // queue a message on the end of the queue, with 'absolute' krefs.
    // Use 'step' or 'run' to execute it
    insistCapData(args);
    args.slots.forEach(s => parseKernelSlot(s));
    let resultKPID;
    if (policy !== 'none') {
      resultKPID = kernelKeeper.addKernelPromise(policy);
    }
    // Should we actually increment these stats in this case?
    kernelKeeper.incStat('syscalls');
    kernelKeeper.incStat('syscallSend');
    const msg = harden({ method, args, result: resultKPID });
    doSend(kref, msg);
    return resultKPID;
  }

  return harden({
    doSend,
    doSubscribe,
    doResolve,
    notify,
    resolveToError,
    queueToKref,
  });
}
