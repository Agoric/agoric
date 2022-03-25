import { assert, details as X } from '@agoric/assert';
import buildCommsDispatch from '../src/vats/comms/index.js';
import { debugState } from '../src/vats/comms/dispatch.js';
import { flipRemoteSlot } from '../src/vats/comms/parseRemoteSlot.js';
import { capargs, makeMessage, makeResolutions } from './util.js';

// This module provides a power tool for testing the comms vat implementation.
// It provides support for injecting events into the comms vat and observing
// what it does in response and comparing that response to what is expected.  It
// manages the grotty details of how messages to and from the comms vat are
// represented, especially when communicating with remote swingsets via the
// comms protocol, including the tricky parts like message sequence numbers and
// acknowledgements and object/promise reference polarity.  NOTE: It is not
// expected that tests implemented using this driver will be testing *those*
// things, at least not directly (of course, those things have to be correct for
// this to work, so it does test them indirectly); rather, these tests wil be
// verifying things like the propagation of promise resolutions, correct
// handling of promise reference cycles, the correctness of promise reference
// retirement, and so on.
//
// All directionality is reckoned from the perspective of the comms vat.  In
// particular, "receive" always refers to things received by the comms vat,
// i.e., inputs from the outside, while "send" or "transmit" always refer to
// things sent by the comms vat, i.e., outputs to the outside.
//
// In the same vein, all object references are from the perspective of the comms
// vat:
//
//   o+NN/p+NN are objects/promises exported by the comms vat to the kernel.
//   ro+NN/rp+NN are objects/promises exported by the comms vat to a remote.
//     These are allocated within the comms vat; it is the task of the vat
//     driver to model this allocation in order to know what to expect when the
//     comms vat outputs things.
//
//   o-NN/p-NN are objects/promises imported into the comms vat from the kernel.
//   ro-NN/rp-NN are objects/promises imported into the comms vat from a remote.
//     These are allocated by the vat driver under the control of the test
//     script.  It is the responsibility of the test author to generate these in
//     the same sequence that the kernel or remote would in order to faithfully
//     subject the comms vat to the same inputs it would receive from a real
//     kernel or remote.
//
// The main workhorse of the vat driver is the `_` function. Each call to the
// `_` function is a script action.
//
// Each action is either an injection, delivering a message or promise
// resolution into the comms vat, or an observation, checking for an expected
// syscall invoked by the comms vat.
//
// Each action has an actor, which is either the kernel or a remote, which is
// the party that would supposedly be the one generating the injected delivery
// or receiving the results of the observed syscall.
//
// The comms vat driver supports up to three remotes, named 'a', 'b', and 'c'.
// However, it is the responsibility of the test script to actually setup the
// remotes and any required egress or ingress objects.  Helper functions are
// provided to do this easily and correctly, however.
//
// The function signature is _(WHAT, ...OTHERSTUFF), where:
//
// WHAT is a string of the form `${who}${dir}${op}`
//   ${who} is the actor: 'k' (kernel) or 'a', 'b', or 'c' (remotes)
//   ${dir} is the direction: '>' (inject), '<' (observe), or ':' (control)
//   ${op} is the operation: 'm' (message), 'r' (resolve), 's' (subscribe), or 'l' (lag)
//
// OTHERSTUFF depends on ${op}:
//
// For ${op} = 'm' (message): TARGET, METHOD, RESULT, ARG...  // 0 or more ARGs
//   TARGET is an object/promise reference designating the message target
//   METHOD is a string naming the method to be invoked
//   RESULT is an object/promise reference designating the result promise, or undefined
//   ARG is an arg VAL (see more on VALs below)
//
// For ${op} = 'r' (resolve): RESOLUTION, RESOLUTION... // 1 or more RESOLUTIONS
//   RESOLUTION is [ TARGET, REJECTED, VAL ]
//   TARGET is a promise reference designating the promise being resolved
//   REJECTED is a boolean indicating whether the promise is rejected or not,
//   VAL is the resolution value
//
// For ${op} = 's' (subscribe): TARGET
//   TARGET is a promise reference string the promise being subscribed to
//   Subscribe is only allowed if ${who} is 'k' and ${dir} is '<'
//
// For ${op} = 'l' (lag): DELAY? //
//   DELAY is the optional number of messages of lag to introduce; defaults to 1 if omitted
//   All subsequent messages injected from the designated remote will be
//     acknowledged DELAY deliveries (messages or resolutions) behind messages
//     sent to the remote.  The lag can be reduced to a lower value.  It can
//     also be turned off again with a DELAY of 0.
//   Lag is only allowed if ${who} is a remote and ${dir} is ':'
//
// Any promise or object reference called for the in API above should be given
// as a string of the form `@REF` or `@REF:IFACE`.  REF is a normal vat vref or
// comms rref of the form `{o|p|ro|rp}{+-}NN`.  IFACE is an optional interface
// name, used when serializing capdata slot references that require one.
//
// A VAL is an arbitrary JSON-encodeable value that will be serialized as a
// capdata object, except that any string beginning with '@' will instead be
// interpreted (as described in previous paragraph) as a vref or rref that will
// be put into the constructed capdata's `slots` array (and referenced
// indirectly) instead of embedded directly into the capdata's `body` string.
// N.b.: the serialization used here is crude and minimal, supporting primitive
// values, arrays, and promise/object references only, as these are sufficient
// for testing.
//
// When comms vat code executes in response to an injected message or resolve,
// syscalls will append corresponding descriptive entries to an internal log
// array.
//
// A '>' (inject) operation will generate a deliver or notify dispatched into
//   the comms vat.  It will be considered a test failure if the log array is
//   not empty at the start of the operation.
//
// A '<' (observe) operation will remove the head of the log array and compare
//   it to the send, resolve, or notify syscall that the `r` parameters
//   describe.  It will be a test failure if these do not match or if the log
//   array is empty.
//
// A ':' (control) operation will alter the behavior of the simulation conducted
//   by the vat driver framework.  Currently the only control operation is 'l',
//   which manipulates the lag of remotes.
//
// The `done()` function should be called at the end of the test, and will fail
// the test if the log array at that point is not empty.
//
// The functions `newImportObject()`, `newImportPromise()`, `newExportObject()`,
// and `newExportPromise()` allocate new instances of the corresponding kind of
// ref string.  More details can be found in the individual descriptions of
// these functions.  In order for '<' (observe) actions to work properly,
// objects and promises being exported should be generated in the same order
// (and at the same point in the stream of script actions) that the comms vat
// will generate them, since the script is attempting to match the syscall
// events it expects the comms vat to issue.  In order for '>' (inject) actions
// to result in an accurate test, objects and promises being imported should be
// generated in the same order (and at the same point in the stream of script
// actions) that the corresponding kernel or remote actions would generate them;
// otherwise, the script may not be provoking comms vat activity as it would be
// provoked in an actual swingset in the case being simulated.

const QCLASS = '@qclass';

const oCommsRoot = '@o+0'; // Always the root of the comms vat

/**
 * Provide a syscall interface that simply logs everything it is told into an array.
 *
 * @param {unknown[]} log The log array.
 * @returns {unknown} A syscall object
 */
function loggingSyscall(log) {
  const fakestore = new Map();
  return harden({
    send(target, method, args, result) {
      // console.log(`<< send ${target}, ${method}, ${JSON.stringify(args)}, ${result}`);
      log.push([target, method, args, result]);
    },
    resolve(resolutions) {
      // console.log(`<< resolve ${JSON.stringify(resolutions)}`);
      log.push(resolutions);
    },
    subscribe(slot) {
      // console.log(`<< subscribe ${slot}`);
      log.push(slot);
    },
    vatstoreGet(key) {
      return fakestore.get(key);
    },
    vatstoreSet(key, value) {
      fakestore.set(key, value);
    },
    vatstoreDelete(key) {
      fakestore.delete(key);
    },
  });
}

/**
 * Extract the vref or rref embedded in a reference string as found in a test
 * script. This will be a string of the form `@${ref}` or `@${ref}:${iface}`.
 * This function extracts the `${ref}` part and returns it.
 *
 * @param {string} scriptRef The string to be parsed
 * @returns {string} The ref embedded within `scriptRef`
 */
function refOf(scriptRef) {
  assert(
    scriptRef[0] === '@',
    X`expected reference ${scriptRef} to start with '@'`,
  );
  const delim = scriptRef.indexOf(':');
  let ref;
  if (delim < 0) {
    ref = scriptRef.substring(1);
  } else {
    ref = scriptRef.substring(1, delim);
  }
  return ref;
}

function flipRefOf(scriptRef) {
  return flipRemoteSlot(refOf(scriptRef));
}

/**
 * Extract the interface name embedded in a reference string as found in a test
 * script. This will be a string of the form `@${ref}` or `@${ref}:${iface}`.
 * This function extracts the `${iface}` part and returns it, or undefined if
 * it's not there.
 *
 * @param {string} scriptRef The string to be parsed
 * @returns {string | undefined} The ref embedded within `scriptRef`
 */
function ifaceOf(scriptRef) {
  const delim = scriptRef.indexOf(':');
  if (delim < 0) {
    return undefined;
  } else {
    return scriptRef.substring(delim + 1);
  }
}

/**
 * Generate a capdata object from an arbitrary (more or less) value. This is
 * similar to the marshal package's serialize, but (a) knows about scriptRefs
 * and (b) only handles a small subset of types that are needed for testing.
 *
 * @param {unknown} from The value to be serialized.
 * @returns {unknown} A capdata object kinda sorta representing `from`
 */
function capdata(from) {
  const slots = [];

  function encodeValue(value) {
    const typestr = typeof value;
    switch (typestr) {
      case 'object':
        if (value === null) {
          return null;
        } else if (Array.isArray(value)) {
          return value.map(x => encodeValue(x));
        } else {
          assert.fail('cannot use object values in test script');
        }
      case 'string':
        if (value[0] === '@') {
          const ref = refOf(value);
          let index = slots.findIndex(x => x === ref);
          if (index < 0) {
            index = slots.length;
            slots.push(ref);
          }
          const iface = ifaceOf(value);
          return { [QCLASS]: 'slot', iface, index };
        } else {
          return value;
        }
      case 'undefined':
        return { [QCLASS]: 'undefined' };
      case 'boolean':
      case 'number':
        return value;
      default:
        assert.fail(`cannot use ${typestr} values in test script`);
    }
  }

  const bodyObj = encodeValue(from);
  return { body: JSON.stringify(bodyObj), slots };
}

/**
 * Translate a message into the form used by the comms protocol.
 *
 * @param {boolean} doFlip If true, flip the polarity of any rrefs, as would be
 *   done for sending to a remote.
 * @param {string} target Message target rref.
 * @param {string} method Name of the method to be invoked.
 * @param {unknown} args Capdata containing the message arguments
 * @param {string | undefined} result Result promise rref, or undefined to be one-way
 * @returns {string} The message encoded in comms protocol format
 */
function remoteMessage(doFlip, target, method, args, result) {
  const slots = doFlip
    ? args.slots.map(rref => flipRemoteSlot(rref))
    : args.slots;
  let ss = slots.join(':');
  if (ss) {
    ss = `:${ss}`;
  }
  target = doFlip ? flipRemoteSlot(target) : target;
  if (!result) {
    result = '';
  } else {
    result = doFlip ? flipRemoteSlot(result) : result;
  }
  return `deliver:${target}:${method}:${result}${ss};${args.body}`;
}

/**
 * @typedef {[string, boolean, unknown]} Resolution [target, reject, data]
 *   target is the rpid of the promise to resolve reject indicates if the
 *   promise is rejected (true) or fulfilled (false) data is capdata describing
 *   the resolution value
 */

/**
 * Translate an array of promise resolutions into the form used by the comms protocol.
 *
 * @param {boolean} doFlip If true, flip the polarity of any rrefs, as would be
 *   done for sending to a remote.
 * @param {Resolution[]} resolutions The group of resolutions
 * @returns {string} The resolutions encoded in comms protocol format
 */
function remoteResolutions(doFlip, resolutions) {
  const msgs = [];
  for (const resolution of resolutions) {
    const [target, rejected, data] = resolution;
    const rtarget = doFlip ? flipRemoteSlot(target) : target;
    const slots = doFlip
      ? data.slots.map(rref => flipRemoteSlot(rref))
      : data.slots;
    let ss = slots.join(':');
    if (ss) {
      ss = `:${ss}`;
    }
    const rejectedTag = rejected ? 'reject' : 'fulfill';
    msgs.push(`resolve:${rejectedTag}:${rtarget}${ss};${data.body}`);
  }
  return msgs.join('\n');
}

/**
 * Construct and return a new comms vat driver.
 *
 * @param {unknown} t Ava assertions object
 * @param {[boolean]} verbose If true (defaults false), output messages to the
 *   console describing scripted events as they happen.
 * @returns {unknown} A new vat driver instance
 */
export function commsVatDriver(t, verbose = false) {
  const log = [];
  const syscall = loggingSyscall(log);
  const dispatch = buildCommsDispatch(syscall, 'fakestate', 'fakehelpers');
  dispatch(['startVat', capargs()]);
  const { state } = debugState.get(dispatch);

  const remotes = new Map();

  /**
   * Generate args for a 'transmit' message delivering a comms protocol message
   * to a remote.
   *
   * @param {unknown} remote The remote the message will be transmitted to.
   * @param {string} msg The comms protocol formatted message itself
   * @returns {unknown} A capdata representation of `msg` (with the appropriate
   *   sequence numbers attached) for delivery to `remote`.
   */
  function prepareTransmit(remote, msg) {
    // prettier-ignore
    const encodedMsg = [`${remote.sendFromSeqNum}:${remote.lastToSeqNum}:${msg}`];
    if (verbose) {
      console.log(`${remote.lastFromSeqNum} | ${remote.name} < ${encodedMsg}`);
    }
    if (remote.delay > 0) {
      remote.delay -= 1;
      remote.lag += 1;
    }
    remote.lastFromSeqNum = remote.sendFromSeqNum;
    remote.sendFromSeqNum += 1;
    return {
      body: JSON.stringify(encodedMsg),
      slots: [],
    };
  }

  /**
   * Generate args for a 'receive' message delivering a comms protocol message
   * from a remote.
   *
   * @param {unknown} remote The remote the message will be received from.
   * @param {string} msg The comms protocol formatted message itself
   * @returns {unknown} A capdata representation of `msg` (with the appropriate
   *   sequence numbers attached) for delivery from `remote`.
   */
  function prepareReceive(remote, msg) {
    const encodedMsg = [
      `${remote.sendToSeqNum}:${remote.lastFromSeqNum - remote.lag}:${msg}`,
    ];
    if (verbose) {
      // prettier-ignore
      console.log(`${remote.lastFromSeqNum} | ${remote.name} > ${encodedMsg}  (lag is ${remote.lag}, delay is ${remote.delay})`);
    }
    remote.lastToSeqNum = remote.sendToSeqNum;
    remote.sendToSeqNum += 1;
    return {
      body: JSON.stringify(encodedMsg),
      slots: [],
    };
  }

  /**
   * Deliver a message into the comms vat. It will be a test failure if the log
   * is not empty at the beginning of this operation.
   *
   * @param {string} who Indicator of who is sending the message: 'k', the
   *   kernel, or 'a', b', or 'c', one of the remotes.
   * @param {string} target Scriptref of the object or promise that is the
   *   target of the message.
   * @param {string} method The name of the method being invoked.
   * @param {unknown} args Capdata object containing the message arguments.
   * @param {string | undefined} result Scriptref of the result promise or
   *   undefined to indicate a one-way message.
   */
  function injectSend(who, target, method, args, result) {
    t.deepEqual(log, []);
    if (who === 'k') {
      dispatch(makeMessage(target, method, args, result));
    } else {
      const remote = remotes.get(who);
      const msg = prepareReceive(
        remote,
        remoteMessage(false, target, method, args, result),
      );
      dispatch(makeMessage(remote.receiver, 'receive', msg));
    }
  }

  /**
   * Observe a message sent by the comms vat via a send syscall. It will be a
   * test failure if the next entry in the log does not describe this message.
   *
   * @param {string} who Indicator of where the message is being directed: 'k',
   *   the kernel, or 'a', b', or 'c', one of the remotes.
   * @param {string} target Scriptref of the object or promise that is the
   *   target of the message.
   * @param {string} method The name of the method being invoked.
   * @param {unknown} args Capdata object containing the message arguments.
   * @param {string | undefined} result Scriptref of the result promise or
   *   undefined to indicate a one-way message.
   */
  function observeSend(who, target, method, args, result) {
    if (who === 'k') {
      t.deepEqual(log.shift(), [target, method, args, result]);
    } else {
      const remote = remotes.get(who);
      const msg = prepareTransmit(
        remote,
        remoteMessage(true, target, method, args, result),
      );
      t.deepEqual(log.shift(), [
        remote.transmitter,
        'transmit',
        msg,
        undefined,
      ]);
    }
  }

  /**
   * Deliver a group of promise resolutions into the comms vat. It will be a
   * test failure if the log is not empty at the beginning of this operation.
   *
   * @param {string} who Indicator of who is doing the resolution message: 'k',
   *   the kernel, or 'a', b', or 'c', one of the remotes.
   * @param {Resolution[]} resolutions Array of resolutions
   */
  function injectResolutions(who, resolutions) {
    t.deepEqual(log, []);
    if (who === 'k') {
      dispatch(makeResolutions(resolutions));
    } else {
      const remote = remotes.get(who);
      const msg = prepareReceive(remote, remoteResolutions(false, resolutions));
      dispatch(makeMessage(remote.receiver, 'receive', msg));
    }
  }

  /**
   * Observe a group of promise resolutions originating in the comms vat via a
   * notify or send syscall. It will be a test failure if the next entry in the
   * log does not describe this group of resolutions.
   *
   * @param {string} who Indicator of where the resolution is directed: 'k', the
   *   kernel, or 'a', b', or 'c', one of the remotes.
   * @param {Resolution[]} resolutions Array of resolutions
   */
  function observeResolutions(who, resolutions) {
    if (who === 'k') {
      t.deepEqual(log.shift(), resolutions);
    } else {
      const remote = remotes.get(who);
      const msg = prepareTransmit(remote, remoteResolutions(true, resolutions));
      t.deepEqual(log.shift(), [
        remote.transmitter,
        'transmit',
        msg,
        undefined,
      ]);
    }
  }

  /**
   * Observe the comms vat subscribing to a promise. This is always directed to
   * the kernel. It will be a test failure if the next entry in the log does not
   * describe this subscription.
   *
   * @param {string} target Vref of the promise being subscribed to
   */
  function observeSubscribe(target) {
    t.deepEqual(log.shift(), target);
  }

  /**
   * Inject a message acknowledgement lag into the simulation of traffic between
   * comms vat and one of the remotes. Message acknowledgements from the
   * indicated remote will not advance until they are `lag` messages behind the
   * most recent message sent to that remote, at which point they will advance
   * by one with each successive message, always `lag` messages behind. If a lag
   * is currently in effect and `lag` is any value less than that (including 0),
   * the lag will immediately be reduced to the new setting and the next
   * acknowledgement sent by the remote will "catch up".
   *
   * @param {string} who Indicator of which remote is being subjected to the
   *   lag:'a', b', or 'c'.
   * @param {number} lag How much lag the remote will be subjected to.
   */
  function injectLag(who, lag = 1) {
    assert(typeof lag === 'number' && lag >= 0);
    const remote = remotes.get(who);
    if (lag > remote.lag) {
      remote.delay += lag - remote.lag;
    } else {
      remote.lag = lag;
    }
  }

  /**
   * Generate a new remote and add it to the table of remotes.
   *
   * @param {string} name The name of the remote (typically 'a', 'b', or 'c')
   * @param {string} transmitter Scriptref of the transmitter object to send to
   *   the other end
   * @param {string} receiver Scriptref of the receiver objec that will be sent
   *   to by the other end
   */
  function makeNewRemote(name, transmitter, receiver) {
    remotes.set(name, {
      transmitter: refOf(transmitter),
      receiver: refOf(receiver),
      sendToSeqNum: 1,
      sendFromSeqNum: 1,
      lastToSeqNum: 0,
      lastFromSeqNum: 0,
      delay: 0,
      lag: 0,
      name,
    });
  }

  function insistProperActor(who) {
    assert(who === 'k' || who === 'a' || who === 'b' || who === 'c');
  }

  const importPromiseCounter = { k: 10, a: 40, b: 40, c: 40 };
  /**
   * Allocate a new scriptref for an imported promise.
   *
   * @param {string} from Who the promise is being imported from ('k', 'a', 'b', or 'c')
   * @returns {string} A scriptref ('@p-NN' or '@rp-NN' as appropriate) for an
   *   imported promise
   */
  function newImportPromise(from) {
    insistProperActor(from);
    if (from === 'k') {
      const result = `@p-${importPromiseCounter.k}`;
      importPromiseCounter.k += 1;
      return result;
    } else {
      const result = `@rp-${importPromiseCounter[from]}`;
      importPromiseCounter[from] += 1;
      return result;
    }
  }

  const exportPromiseCounter = { k: 40, a: 40, b: 1040, c: 2040 };
  /**
   * Allocate a new scriptref for an exported promise.
   *
   * @param {string} to Who the promise is being exported from ('k', 'a', 'b', or 'c')
   * @returns {string} A scriptref ('@p+NN' or '@rp+NN' as appropriate) for an
   *   exported promise
   */
  function newExportPromise(to) {
    insistProperActor(to);
    if (to === 'k') {
      const result = `@p+${exportPromiseCounter.k}`;
      exportPromiseCounter.k += 1;
      return result;
    } else {
      const result = `@rp+${exportPromiseCounter[to]}`;
      exportPromiseCounter[to] += 1;
      return result;
    }
  }

  const importObjectCounter = { k: 60, a: 160, b: 160, c: 160 };
  /**
   * Allocate a new scriptref for an imported object.
   *
   * @param {string} from Who the object is being imported from ('k', 'a', 'b', or 'c')
   * @returns {string} A scriptref ('@o-NN' or '@ro-NN' as appropriate) for an
   *   imported object
   */
  function newImportObject(from) {
    insistProperActor(from);
    if (from === 'k') {
      const result = `@o-${importObjectCounter.k}`;
      importObjectCounter.k += 1;
      return result;
    } else {
      const result = `@ro-${importObjectCounter[from]}`;
      importObjectCounter[from] += 1;
      return result;
    }
  }

  const exportObjectCounter = { k: 30, a: 20, b: 1020, c: 2020 };
  /**
   * Allocate a new scriptref for an exported object.
   *
   * @param {string} to Who the object is being exported to ('k', 'a', 'b', or 'c')
   * @param {[string]} iface Optional interface name for the object
   * @returns {string} A scriptref ('@o+NN', '@o+NN:IFACE', '@ro+NN', or
   *   '@ro+NN:IFACE' as appropriate) for an exported object
   */
  function newExportObject(to, iface) {
    insistProperActor(to);
    if (to === 'k') {
      const result = `@o+${exportObjectCounter.k}`;
      exportObjectCounter.k += 1;
      return iface ? `${result}:${iface}` : result;
    } else {
      const result = `@ro+${exportObjectCounter[to]}`;
      exportObjectCounter[to] += 1;
      return result;
    }
  }

  /**
   * Indicate that the test is completed. At this point it is a test failure if
   * the log is not empty (i.e., if there are any unobserved syscalls remaining.
   */
  function done() {
    t.deepEqual(log, []);
  }

  function _(what, ...params) {
    if (verbose) {
      console.log(`---- ${what} ${params}`);
    }
    const [who, dir, op] = what;
    insistProperActor(who);
    assert(dir === '>' || dir === '<' || dir === ':');
    assert(op === 'm' || op === 'r' || op === 's' || op === 'l');

    switch (op) {
      case 'm': {
        assert(dir === '<' || dir === '>');
        const target = refOf(params[0]);
        const method = params[1];
        const result = params[2] ? refOf(params[2]) : undefined;
        const args = capdata(params.slice(3));
        if (dir === '>') {
          injectSend(who, target, method, args, result);
        } else {
          observeSend(who, target, method, args, result);
        }
        break;
      }
      case 'r': {
        assert(dir === '<' || dir === '>');
        const resolutions = [];
        for (const resolution of params) {
          const target = refOf(resolution[0]);
          const status = resolution[1];
          const value = capdata(resolution[2]);
          resolutions.push([target, status, value]);
        }
        if (dir === '>') {
          injectResolutions(who, resolutions);
        } else {
          observeResolutions(who, resolutions);
        }
        break;
      }
      case 's': {
        // The 's' (subscribe) op is only allowed as a kernal observation
        assert(who === 'k' && dir === '<');
        const target = refOf(params[0]);
        observeSubscribe(target);
        break;
      }
      case 'l': {
        // The 'l' (lag) op is only allowed as a control operation
        assert(who !== 'k' && dir === ':');
        injectLag(who, params[0]);
        break;
      }
      default: {
        assert.fail(`illegal op ${op}`);
      }
    }
  }

  /**
   * Setup a new remote. This will install a new entry in the remotes table and
   * perform the necessary message exchanges with the comms vat so that it knows
   * about the new remote and imagines it can communicate with it.
   *
   * @param {string} remoteName Name for the new remote. Currently, for the new
   *   remote to work, other parts of the test driver require this to be 'a',
   *   'b', or 'c', but there's nothing in the mechanism here that requires this.
   */
  function setupRemote(remoteName) {
    // objects from ersatz, hypothetical vattp vat:
    const oXmit = newImportObject('k'); // transmitter for sends to the remote
    const oSetRecv = newImportObject('k'); // object to inform remote about receiver to send to local
    // objects from comms vat:
    const oRecv = newExportObject('k'); // the receiver for remote to send to

    const pResult = newImportPromise('k');
    _('k>m', oCommsRoot, 'addRemote', pResult, remoteName, oXmit, oSetRecv);
    _('k<m', oSetRecv, 'setReceiver', undefined, oRecv);
    _('k<r', [pResult, false, undefined]);

    makeNewRemote(remoteName, oXmit, oRecv);
  }

  /**
   * Import a notional object from a remote into the local swingset.
   *
   * @param {string} remoteName Name of the remote from which the object is being imported
   * @param {number} index Index number on the remote of the object to be imported
   * @param {string} iface Name of the (alleged) interface presented by the
   *   imported object
   * @returns {[string, string]} A pair of scriptrefs. The first is the vref for
   *   the object as it will be known to the kernel, the second is for the rref
   *   by which it will be referred when talking to the remote (the latter is
   *   needed to correctly observe message sends to the remote).
   */
  function importFromRemote(remoteName, index, iface) {
    const oRef = newExportObject('k', iface);
    const pResult = newImportPromise('k');
    _('k>m', oCommsRoot, 'addIngress', pResult, remoteName, index, iface);
    _('k<r', [pResult, false, oRef]);
    const orRef = `@ro-${index}`;
    return [oRef, orRef];
  }

  /**
   * Export an object from the local swingset to a remote.
   *
   * @param {string} remoteName Name of the remote to which the object is being exported
   * @param {number} index Index number in the comms vat of the object to be exported
   * @param {string} objRef Scriptref of the object in the local swingset
   */
  function exportToRemote(remoteName, index, objRef) {
    const pResult = newImportPromise('k');
    _('k>m', oCommsRoot, 'addEgress', pResult, remoteName, index, objRef);
    _('k<r', [pResult, false, undefined]);
    return `@ro+${index}`;
  }

  return {
    _,
    state,
    done,
    setupRemote,
    importFromRemote,
    exportToRemote,
    newImportObject,
    newExportObject,
    newImportPromise,
    newExportPromise,
    refOf,
    flipRefOf,
  };
}
