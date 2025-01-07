import { isVow } from '@agoric/vow/src/vow-utils.js';
import { heapVowE } from '@agoric/vow/vat.js';
import { throwLabeled } from '@endo/common/throw-labeled.js';
import { Fail, X, b, makeError, q } from '@endo/errors';
import { E } from '@endo/eventual-send';
import { getMethodNames } from '@endo/eventual-send/utils.js';
import { Far, Remotable, getInterfaceOf } from '@endo/pass-style';
import { makeConvertKit } from './convert.js';
import { makeEquate } from './equate.js';

/**
 * @import {PromiseKit} from '@endo/promise-kit';
 * @import {RemotableBrand} from '@endo/eventual-send';
 * @import {Callable, Passable, PassableCap} from '@endo/pass-style';
 * @import {Vow, VowTools, VowKit} from '@agoric/vow';
 * @import {LogStore} from '../src/log-store.js';
 * @import {Bijection} from '../src/bijection.js';
 * @import {Host, HostVow, LogEntry, Outcome} from '../src/types.js';
 */

const { fromEntries, defineProperties, assign } = Object;

/**
 * @param {object} arg
 * @param {LogStore} arg.log
 * @param {Bijection} arg.bijection
 * @param {VowTools} arg.vowTools
 * @param {(vowish: Promise | Vow) => void} arg.watchWake
 * @param {(problem: Error) => never} arg.panic
 */
export const makeReplayMembrane = arg => {
  const noDunderArg = /** @type {typeof arg} */ (
    Object.fromEntries(Object.entries(arg).filter(([k]) => !k.startsWith('__')))
  );
  return makeReplayMembraneForTesting(noDunderArg);
};

/**
 * @param {object} arg
 * @param {LogStore} arg.log
 * @param {Bijection} arg.bijection
 * @param {VowTools} arg.vowTools
 * @param {(vowish: Promise | Vow) => void} arg.watchWake
 * @param {(problem: Error) => never} arg.panic
 * @param {boolean} [arg.__eventualSendForTesting] CAVEAT: Only for async-flow tests
 */
export const makeReplayMembraneForTesting = ({
  log,
  bijection,
  vowTools,
  watchWake,
  panic,
  __eventualSendForTesting,
}) => {
  const { when, makeVowKit } = vowTools;

  const equate = makeEquate(bijection);

  const guestPromiseMap = new WeakMap();

  let stopped = false;

  const Panic = (template, ...args) => panic(makeError(X(template, ...args)));

  const startGeneration = generation => {
    Number.isSafeInteger(generation) ||
      Fail`generation expected integer; got ${generation}`;
    generation >= 0 ||
      Fail`generation expected non-negative; got ${generation}`;
  };

  // ////////////// Host or Interpreter to Guest ///////////////////////////////

  /**
   * When replaying, this comes from interpreting the log.
   * Otherwise, it is triggered by a watcher watching hostVow,
   * that must also log it.
   *
   * @param {HostVow} hostVow
   * @param {Host} hostFulfillment
   */
  const doFulfill = (hostVow, hostFulfillment) => {
    const guestPromise = hostToGuest(hostVow);
    const status = guestPromiseMap.get(guestPromise);
    if (!status || status === 'settled') {
      Fail`doFulfill should only be called on a registered unresolved promise`;
    }
    const guestFulfillment = hostToGuest(hostFulfillment);
    status.resolve(guestFulfillment);
    guestPromiseMap.set(guestPromise, 'settled');
  };

  /**
   * When replaying, this comes from interpreting the log.
   * Otherwise, it is triggered by a watcher watching hostVow,
   * that must also log it.
   *
   * @param {HostVow} hostVow
   * @param {Host} hostReason
   */
  const doReject = (hostVow, hostReason) => {
    const guestPromise = hostToGuest(hostVow);
    const status = guestPromiseMap.get(guestPromise);
    if (!status || status === 'settled') {
      Fail`doReject should only be called on a registered unresolved promise`;
    }
    const guestReason = hostToGuest(hostReason);
    status.reject(guestReason);
    guestPromiseMap.set(guestPromise, 'settled');
  };

  /**
   * When replaying, after the guest thinks it has called a host method,
   * triggering `checkCall`, that host method emulator consumes one of
   * these entries from the log to return what it is supposed to.
   * It returns an Outcome describing either a throw or return, because we
   * reserve the actual throw channels for replay errors and internal
   * errors.
   *
   * @param {number} callIndex
   * @param {Host} hostResult
   * @returns {Outcome}
   */
  const doReturn = (callIndex, hostResult) => {
    unnestInterpreter(callIndex);
    const guestResult = hostToGuest(hostResult);
    return harden({
      kind: 'return',
      result: guestResult,
    });
  };

  /**
   * When replaying, after the guest thinks it has called a host method,
   * triggering `checkCall`, that host method emulator consumes one of
   * these entries from the log to return what it is supposed to.
   * It returns an Outcome describing either a throw or return, because we
   * reserve the actual throw channels for replay errors and internal
   * errors.
   *
   * @param {number} callIndex
   * @param {Host} hostProblem
   * @returns {Outcome}
   */
  const doThrow = (callIndex, hostProblem) => {
    unnestInterpreter(callIndex);
    const guestProblem = hostToGuest(hostProblem);
    return harden({
      kind: 'throw',
      problem: guestProblem,
    });
  };

  // ///////////// Guest to Host or consume log ////////////////////////////////

  const performCall = (hostTarget, optVerb, hostArgs, callIndex) => {
    let hostResult;
    try {
      hostResult = optVerb
        ? hostTarget[optVerb](...hostArgs)
        : hostTarget(...hostArgs);
      // Try converting here just to route the error correctly
      hostToGuest(hostResult, `converting ${optVerb || 'host'} result`);
    } catch (hostProblem) {
      return logDo(nestDispatch, harden(['doThrow', callIndex, hostProblem]));
    }
    return logDo(nestDispatch, harden(['doReturn', callIndex, hostResult]));
  };

  const guestCallsHost = (guestTarget, optVerb, guestArgs, callIndex) => {
    if (stopped || !bijection.hasGuest(guestTarget)) {
      // This happens in a delayed guest-to-host call from a previous run.
      // In that case, the bijection was reset and all guest caps
      // created in the previous run were unregistered,
      // including guestTarget.
      // Throwing an error back to the old guest caller may cause
      // it to proceed in all sorts of crazy ways. But that old run
      // should now be isolated and unable to cause any observable effects.
      // Well, except for resource exhaustion including infinite loops,
      // which would be a genuine problem.
      //
      // Console logging of unhandled rejections, errors thrown to the top
      // of the event loop, or anything else are not problematic effects.
      // At this level of abstraction, we don't consider console logging
      // activity to be observable. Thus, it is also ok for the guest
      // function, which should otherwise be closed, to
      // capture (lexically "close over") the `console`.
      const extraDiagnostic =
        callStack.length === 0
          ? ''
          : // This case should only happen when the callStack is empty
            ` with non-empty callstack ${q(callStack)};`;
      Fail`Called from a previous run: ${guestTarget}${b(extraDiagnostic)}`;
    }
    /** @type {Outcome} */
    let outcome;
    try {
      const guestEntry = harden([
        'checkCall',
        guestTarget,
        optVerb,
        guestArgs,
        callIndex,
      ]);
      if (log.isReplaying()) {
        const entry = log.nextEntry();
        equate(
          guestEntry,
          entry,
          `replay ${callIndex}:
     ${q(guestEntry)}
  vs ${q(entry)}
    `,
        );
        outcome = /** @type {Outcome} */ (nestInterpreter(callIndex));
      } else {
        const entry = guestToHost(guestEntry);
        log.pushEntry(entry);
        const [_, ...args] = entry;
        nestInterpreter(callIndex);
        outcome = performCall(...args);
      }
    } catch (fatalError) {
      throw panic(fatalError);
    }

    switch (outcome.kind) {
      case 'return': {
        return outcome.result;
      }
      case 'throw': {
        throw outcome.problem;
      }
      default: {
        // @ts-expect-error TS correctly knows this case would be outside
        // the type. But that's what we want to check.
        throw Panic`unexpected outcome kind ${q(outcome.kind)}`;
      }
    }
  };

  // //////////////// Eventual Send ////////////////////////////////////////////

  /**
   * @param {RemotableBrand<PassableCap, Callable>} hostTarget
   * @param {string | undefined} optVerb
   * @param {Passable[]} hostArgs
   */
  const performSendOnly = (hostTarget, optVerb, hostArgs) => {
    try {
      optVerb === undefined
        ? heapVowE.sendOnly(hostTarget)(...hostArgs)
        : heapVowE.sendOnly(hostTarget)[optVerb](...hostArgs);
    } catch (hostProblem) {
      throw Panic`internal: eventual sendOnly synchronously failed ${hostProblem}`;
    }
  };

  /**
   * @param {RemotableBrand<PassableCap, Callable>} hostTarget
   * @param {string | undefined} optVerb
   * @param {Passable[]} hostArgs
   * @param {number} callIndex
   * @param {VowKit} hostResultKit
   * @param {Promise} guestReturnedP
   * @returns {Outcome}
   */
  const performSend = (
    hostTarget,
    optVerb,
    hostArgs,
    callIndex,
    hostResultKit,
    guestReturnedP,
  ) => {
    const { vow, resolver } = hostResultKit;
    try {
      const hostPromise =
        optVerb === undefined
          ? heapVowE(hostTarget)(...hostArgs)
          : heapVowE(hostTarget)[optVerb](...hostArgs);
      resolver.resolve(hostPromise); // TODO does this always work?
    } catch (hostProblem) {
      throw Panic`internal: eventual send synchronously failed ${hostProblem}`;
    }
    try {
      /** @type {LogEntry} */
      const entry = harden(['doReturn', callIndex, vow]);
      log.pushEntry(entry);
      const guestPromise = makeGuestForHostVow(vow, guestReturnedP);
      // Note that `guestPromise` is not registered in the bijection since
      // guestReturnedP is already the guest for vow. Rather, the handler
      // returns guestPromise to resolve guestReturnedP to guestPromise.
      doReturn(callIndex, vow);
      return harden({
        kind: 'return',
        result: guestPromise,
      });
    } catch (problem) {
      throw panic(problem);
    }
  };

  const guestHandler = harden({
    applyMethodSendOnly(guestTarget, optVerb, guestArgs) {
      __eventualSendForTesting ||
        Panic`guest eventual applyMethodSendOnly not yet supported: ${guestTarget}.${b(optVerb)}`;
      // The following code is only intended to be used by tests.
      // TODO: properly support applyMethodSendOnly
      const callIndex = log.getIndex();
      if (stopped || !bijection.hasGuest(guestTarget)) {
        Fail`Sent from a previous run: ${guestTarget}`;
      }
      try {
        const guestEntry = harden([
          'checkSendOnly',
          guestTarget,
          optVerb,
          guestArgs,
          callIndex,
        ]);
        if (log.isReplaying()) {
          const entry = log.nextEntry();
          try {
            equate(guestEntry, entry);
          } catch (equateErr) {
            // TODO consider Richard Gibson's suggestion for a better way
            // to keep track of the error labeling.
            throwLabeled(
              equateErr,
              `replay ${callIndex}:
     ${q(guestEntry)}
  vs ${q(entry)}
    `,
            );
          }
        } else {
          const entry = guestToHost(guestEntry);
          log.pushEntry(entry);
          const [_op, hostTarget, _optVerb, hostArgs, _callIndex] = entry;
          performSendOnly(hostTarget, optVerb, hostArgs);
        }
      } catch (fatalError) {
        throw panic(fatalError);
      }
    },
    applyMethod(guestTarget, optVerb, guestArgs, guestReturnedP) {
      __eventualSendForTesting ||
        Panic`guest eventual applyMethod not yet supported: ${guestTarget}.${b(optVerb)} -> ${b(guestReturnedP)}`;
      // The following code is only intended to be used by tests.
      // TODO: properly support applyMethod
      const callIndex = log.getIndex();
      if (stopped || !bijection.hasGuest(guestTarget)) {
        Fail`Sent from a previous run: ${guestTarget}`;
      }
      const hostResultKit = makeVowKit();
      const g = bijection.unwrapInit(guestReturnedP, hostResultKit.vow);
      g === guestReturnedP ||
        Fail`internal: guestReturnedP should not unwrap: ${g} vs ${guestReturnedP}`;
      /** @type {Outcome} */
      let outcome;
      try {
        const guestEntry = harden([
          'checkSend',
          guestTarget,
          optVerb,
          guestArgs,
          callIndex,
        ]);
        if (log.isReplaying()) {
          const entry = log.nextEntry();
          try {
            equate(guestEntry, entry);
          } catch (equateErr) {
            // TODO consider Richard Gibson's suggestion for a better way
            // to keep track of the error labeling.
            throwLabeled(
              equateErr,
              `replay ${callIndex}:
     ${q(guestEntry)}
  vs ${q(entry)}
    `,
            );
          }
          outcome = /** @type {Outcome} */ (nestInterpreter(callIndex));
        } else {
          const entry = guestToHost(guestEntry);
          log.pushEntry(entry);
          const [_op, hostTarget, _optVerb, hostArgs, _callIndex] = entry;
          nestInterpreter(callIndex);
          outcome = performSend(
            hostTarget,
            optVerb,
            hostArgs,
            callIndex,
            hostResultKit,
            guestReturnedP,
          );
        }
      } catch (fatalError) {
        throw panic(fatalError);
      }

      switch (outcome.kind) {
        case 'return': {
          return outcome.result;
        }
        case 'throw': {
          throw outcome.problem;
        }
        default: {
          // @ts-expect-error TS correctly knows this case would be outside
          // the type. But that's what we want to check.
          throw Panic`unexpected outcome kind ${q(outcome.kind)}`;
        }
      }
    },
    applyFunctionSendOnly(guestTarget, guestArgs) {
      __eventualSendForTesting ||
        Panic`guest eventual applyFunctionSendOnly not yet supported: ${guestTarget}`;
      return guestHandler.applyMethodSendOnly(
        guestTarget,
        undefined,
        guestArgs,
      );
    },
    applyFunction(guestTarget, guestArgs, guestReturnedP) {
      __eventualSendForTesting ||
        Panic`guest eventual applyFunction not yet supported: ${guestTarget} -> ${b(guestReturnedP)}`;
      return guestHandler.applyMethod(
        guestTarget,
        undefined,
        guestArgs,
        guestReturnedP,
      );
    },
    getSendOnly(guestTarget, prop) {
      // TODO: support getSendOnly
      throw Panic`guest eventual getSendOnly not yet supported: ${guestTarget}.${b(prop)}`;
    },
    get(guestTarget, prop, guestReturnedP) {
      // TODO: support get
      throw Panic`guest eventual get not yet supported: ${guestTarget}.${b(prop)} -> ${b(guestReturnedP)}`;
    },
  });

  const makeGuestPresence = (iface, methodEntries) => {
    let guestPresence;
    void new HandledPromise((_res, _rej, resolveWithPresence) => {
      guestPresence = resolveWithPresence(guestHandler);
    }); // no unfulfilledHandler
    if (typeof guestPresence !== 'object') {
      throw Fail`presence expected to be object ${guestPresence}`;
    }
    assign(guestPresence, fromEntries(methodEntries));
    const result = Remotable(iface, undefined, guestPresence);
    result === guestPresence ||
      Fail`Remotable expected to make presence in place: ${guestPresence} vs ${result}`;
    return result;
  };

  /**
   * @returns {PromiseKit<any>}
   */
  const makeGuestPromiseKit = () => {
    let resolve;
    let reject;
    const promise = new HandledPromise((res, rej, _resPres) => {
      resolve = res;
      reject = rej;
    }, guestHandler);
    // @ts-expect-error TS cannot infer that it is a PromiseKit
    return harden({ promise, resolve, reject });
  };

  // //////////////// Converters ///////////////////////////////////////////////

  const makeGuestForHostRemotable = hRem => {
    // Nothing here that captures `hRem` should make any use of it after the
    // `makeGuestForHostRemotable` returns. This invariant enables
    // `makeGuestForHostRemotable` to clear the `hRem` variable just before
    // it returns, so any implementation-level capture of the variable does
    // not inadvertently retain the host remotable which was the original
    // value of the `hRem` variable.
    let gRem;
    /** @param {PropertyKey} [optVerb] */
    const makeGuestMethod = (optVerb = undefined) => {
      const guestMethod = (...guestArgs) => {
        const callIndex = log.getIndex();
        return guestCallsHost(gRem, optVerb, guestArgs, callIndex);
      };
      if (optVerb) {
        defineProperties(guestMethod, {
          name: { value: String(hRem[optVerb].name || optVerb) },
          length: { value: Number(hRem[optVerb].length || 0) },
        });
      } else {
        defineProperties(guestMethod, {
          name: { value: String(hRem.name || 'anon') },
          length: { value: Number(hRem.length || 0) },
        });
      }
      return guestMethod;
    };
    const iface = String(getInterfaceOf(hRem) || 'remotable');
    const guestIface = `${iface} guest wrapper`; // just for debugging clarity
    if (typeof hRem === 'function') {
      // NOTE: Assumes that a far function has no "static" methods. This
      // is the current marshal design, but revisit this if we change our
      // minds.
      gRem = Remotable(guestIface, undefined, makeGuestMethod());
      // NOTE: If we ever do support that, probably all we need
      // to do is remove the following `throw Fail` line.
      throw Fail`host far functions not yet passable`;
    } else {
      const methodNames = getMethodNames(hRem);
      const guestMethods = methodNames.map(name => [
        name,
        makeGuestMethod(name),
      ]);
      gRem = makeGuestPresence(guestIface, guestMethods);
    }
    // See note at the top of the function to see why clearing the `hRem`
    // variable is safe, and what invariant the above code needs to maintain so
    // that it remains safe.
    hRem = undefined;
    return gRem;
  };
  harden(makeGuestForHostRemotable);

  /**
   * @param {Vow} hVow
   * @param {Promise} [promiseKey]
   *   If provided, use this promise as the key in the guestPromiseMap
   *   rather than the returned promise. This only happens when the
   *   promiseKey ends up forwarded to the returned promise anyway, so
   *   associating it with this resolve/reject pair is not incorrect.
   *   It is needed when `promiseKey` is also entered into the bijection
   *   paired with hVow.
   * @returns {Promise}
   */
  const makeGuestForHostVow = async (hVow, promiseKey = undefined) => {
    isVow(hVow) || Fail`vow expected ${hVow}`;
    const { promise, resolve, reject } = makeGuestPromiseKit();
    promiseKey ??= promise;
    guestPromiseMap.set(promiseKey, harden({ resolve, reject }));

    watchWake(hVow);

    // The replay membrane is the only component inserting entries into
    // the log. In particular, the flow's vow durable watcher does not log the
    // settlement outcome, and instead it's the responsibility of the
    // membrane's ephemeral handler. Because of this, the membrane's handler
    // must be careful to:
    // - Be added to the vow if the settlement has not yet been recorded in
    //   the log.
    // - Insert a single settlement outcome in the log for the given vow.
    //
    // In practice the former is accomplished by a handler always being
    // added to the host vow when creating a guest promise, and the
    // handler checking after replay is complete, whether the guest promise
    // is already settled (by the log replay) or not. The latter is
    // accomplished by checking that the membrane has not been stopped
    // before updating the log.

    void when(
      hVow,
      async hostFulfillment => {
        await log.promiseReplayDone(); // should never reject
        if (!stopped && guestPromiseMap.get(promiseKey) !== 'settled') {
          /** @type {LogEntry} */
          const entry = harden(['doFulfill', hVow, hostFulfillment]);
          log.pushEntry(entry);
          try {
            interpretOne(topDispatch, entry);
          } catch {
            // interpretOne does its own try/catch/panic, so failure would
            // already be registered. Here, just return to avoid the
            // Unhandled rejection.
          }
        }
      },
      async hostReason => {
        await log.promiseReplayDone(); // should never reject
        if (!stopped && guestPromiseMap.get(promiseKey) !== 'settled') {
          /** @type {LogEntry} */
          const entry = harden(['doReject', hVow, hostReason]);
          log.pushEntry(entry);
          try {
            interpretOne(topDispatch, entry);
          } catch {
            // interpretOne does its own try/catch/panic, so failure would
            // already be registered. Here, just return to avoid the
            // Unhandled rejection.
          }
        }
      },
    );
    return promise;
  };
  harden(makeGuestForHostVow);

  const { guestToHost, hostToGuest } = makeConvertKit(
    bijection,
    makeGuestForHostRemotable,
    makeGuestForHostVow,
  );

  // /////////////////////////////// Interpreter ///////////////////////////////

  /**
   * These are the only ones that are driven from the top level interpreter loop
   */
  const topDispatch = harden({
    startGeneration,
    doFulfill,
    doReject,
    // doCall, // unimplemented in the current plan
  });

  /**
   * These are the only ones that are driven from the nested interpreter loop
   */
  const nestDispatch = harden({
    doReturn,
    doThrow,
    // doCall, // unimplemented in the current plan
  });

  const interpretOne = (dispatch, [op, ...args]) => {
    try {
      op in dispatch ||
        // separate line so I can set a breakpoint
        Fail`unexpected dispatch op: ${q(op)}`;
      return dispatch[op](...args);
    } catch (problem) {
      throw panic(problem);
    }
  };

  const logDo = (dispatch, entry) => {
    log.pushEntry(entry);
    return interpretOne(dispatch, entry);
  };

  const callStack = [];

  let unnestFlag = false;

  /**
   * @param {number} callIndex
   * @returns {Outcome | undefined}
   */
  const nestInterpreter = callIndex => {
    callStack.push(callIndex);
    while (log.isReplaying() && !stopped) {
      const entry = log.nextUnfilteredEntry();
      const optOutcome = interpretOne(nestDispatch, entry);
      if (unnestFlag) {
        optOutcome ||
          // separate line so I can set a breakpoint
          Fail`only unnest with an outcome: ${q(entry[0])}`;
        unnestFlag = false;
        return optOutcome;
      }
    }
    unnestFlag = false;
  };

  /**
   * @param {number} callIndex
   */
  const unnestInterpreter = callIndex => {
    !stopped ||
      Fail`This membrane stopped. Restart with new membrane ${replayMembrane}`;
    callStack.length >= 1 ||
      // separate line so I can set a breakpoint
      Fail`Unmatched unnest: ${q(callIndex)}`;
    const i = callStack.pop();
    i === callIndex ||
      // separate line so I can set a breakpoint
      Fail`Unexpected unnest: ${q(callIndex)} vs ${q(i)}`;
    unnestFlag = true;
    if (callStack.length === 0) {
      void E.when(undefined, wake);
    }
  };

  const wake = () => {
    while (log.isReplaying() && !stopped) {
      callStack.length === 0 ||
        Fail`wake only with empty callStack: ${q(callStack)}`;
      const entry = log.peekEntry();
      const op = entry[0];
      if (!(op in topDispatch)) {
        return;
      }
      void log.nextUnfilteredEntry();
      interpretOne(topDispatch, entry);
    }
  };

  const stop = () => {
    stopped = true;
  };

  const replayMembrane = Far('replayMembrane', {
    hostToGuest,
    guestToHost,
    wake,
    stop,
  });
  return replayMembrane;
};
harden(makeReplayMembrane);

/** @typedef {ReturnType<makeReplayMembrane>} ReplayMembrane */
