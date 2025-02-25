import { q } from '@endo/errors';
import { makeLimitedConsole } from '@agoric/internal/src/ses-utils.js';

/** @import {LimitedConsole} from '@agoric/internal/src/js-utils.js'; */

const IDLE = 'idle';
const STARTUP = 'startup';
const DELIVERY = 'delivery';

const noopFinisher = harden(() => {});

/** @typedef {(...finishArgs: unknown[]) => unknown} AnyFinisher */
/** @typedef {Partial<Record<Exclude<keyof KernelSlog, 'write'>, (methodName: string, args: unknown[], finisher: AnyFinisher) => unknown>>} SlogWrappers */

/**
 * Support composition of asynchronous callbacks that are invoked at the start
 * of an operation and return either a non-function result or a "finisher"
 * function to be invoked upon operation completion.
 * This maker accepts a collection of wrapper functions that receive the same
 * arguments as the method they wrap, along with the result of that method
 * (e.g., its finisher), and are expected to return a finisher of their own that
 * will invoke that wrapped finisher.
 *
 * @param {SlogWrappers} wrappers
 */
function makeFinishersKit(wrappers) {
  const unused = new Set(Object.keys(wrappers));
  return harden({
    /**
     * Robustly wrap a method if a wrapper is defined.
     *
     * @template {(...args: unknown[]) => (Finisher | unknown)} F
     * @template {AnyFinisher} [Finisher=AnyFinisher]
     * @param {string} method name
     * @param {F} impl the original implementation
     * @returns {F} the wrapped method
     */
    wrap(method, impl) {
      unused.delete(method);
      const wrapper = wrappers[method];

      // If there is no registered wrapper, return the implementation directly.
      if (!wrapper) return impl;

      const wrapped = (...args) => {
        const maybeFinisher = /** @type {Finisher} */ (impl(...args));
        try {
          // Allow the callback to observe the call synchronously, and replace
          // the implementation's finisher function, but not to throw an exception.
          const wrapperFinisher = wrapper(method, args, maybeFinisher);
          if (typeof maybeFinisher !== 'function') return wrapperFinisher;

          // We wrap the finisher in the callback's return value.
          return (...finishArgs) => {
            try {
              return /** @type {Finisher} */ (wrapperFinisher)(...finishArgs);
            } catch (e) {
              console.error(`${method} wrapper finisher failed:`, e);
              return maybeFinisher(...finishArgs);
            }
          };
        } catch (e) {
          console.error(`${method} wrapper failed:`, e);
          return maybeFinisher;
        }
      };
      return /** @type {F} */ (wrapped);
    },
    /**
     * Declare that all wrapping is done.
     *
     * @param {string} msg message to display if there are unused wrappers
     */
    done(msg = 'Unused wrappers') {
      if (!unused.size) return;
      console.warn(msg, ...[...unused.keys()].sort().map(q));
    },
  });
}

export const badConsole = makeLimitedConsole(level => () => {
  throw Error(`unexpected use of badConsole.${level}`);
});
export const noopConsole = makeLimitedConsole(_level => () => {});

/**
 * @param {SlogWrappers} slogCallbacks
 * @param {LimitedConsole} [dummyConsole]
 * @returns {KernelSlog}
 */
export function makeDummySlogger(slogCallbacks, dummyConsole = badConsole) {
  const { wrap, done } = makeFinishersKit(slogCallbacks);
  const dummySlogger = harden({
    provideVatSlogger: wrap('provideVatSlogger', () => {
      return harden({ vatSlog: { delivery: () => noopFinisher } });
    }),
    vatConsole: wrap('vatConsole', () => dummyConsole),
    startup: wrap('startup', () => noopFinisher),
    delivery: wrap('delivery', () => noopFinisher),
    syscall: wrap('syscall', () => noopFinisher),
    changeCList: wrap('changeCList', () => noopFinisher),
    terminateVat: wrap('terminateVat', () => noopFinisher),
    write: noopFinisher,
  });
  done('Unused makeDummySlogger slogCallbacks method names');
  return dummySlogger;
}

/**
 * @param {SlogWrappers} slogCallbacks
 * @param {(obj: object) => void} [writeObj]
 * @returns {KernelSlog}
 */
export function makeSlogger(slogCallbacks, writeObj) {
  const safeWrite = writeObj
    ? obj => {
        try {
          writeObj(obj);
        } catch (err) {
          console.error('WARNING: slogger write error', err);
        }
      }
    : () => {};

  const vatSlogs = new Map(); // vatID -> vatSlog

  function makeVatSlog(vatID) {
    let state = IDLE; // or STARTUP or DELIVERY
    let crankNum;
    let deliveryNum;
    let syscallNum;
    let replay = false;

    function checkOldState(exp, msg) {
      if (state !== exp) {
        console.error(
          `WARNING: slogger state confused: vat ${vatID} in ${state}, not ${exp}: ${msg}`,
        );
        safeWrite({ type: 'slogger-confused', vatID, state, exp, msg });
      }
    }

    function vatConsole(sourcedConsole) {
      return makeLimitedConsole(level => (source, ...args) => {
        // Don't duplicate stale output.
        if (replay) return;

        // Write to the console, then to the slog.
        sourcedConsole[level](source, ...args);
        // TODO: Just use "liveslots" rather than "ls"?
        if (source === 'ls') source = 'liveslots';
        const when = { state, crankNum, vatID, deliveryNum };
        safeWrite({ type: 'console', source, ...when, level, args });
      });
    }

    function startup() {
      // provide a context for console calls during startup
      checkOldState(IDLE, 'did startup get called twice?');
      state = STARTUP;
      safeWrite({ type: 'vat-startup-start', vatID });
      function finish() {
        checkOldState(STARTUP, 'startup-finish called twice?');
        state = IDLE;
        safeWrite({ type: 'vat-startup-finish', vatID });
      }
      return harden(finish);
    }

    // kd: kernelDelivery, vd: vatDelivery
    function delivery(newCrankNum, newDeliveryNum, kd, vd, inReplay = false) {
      checkOldState(IDLE, 'reentrant delivery?');
      state = DELIVERY;
      crankNum = newCrankNum;
      deliveryNum = newDeliveryNum;
      replay = inReplay;
      const when = { crankNum, vatID, deliveryNum, replay };
      safeWrite({ type: 'deliver', ...when, kd, vd });
      syscallNum = 0;

      // dr: deliveryResult
      function finish(dr) {
        checkOldState(DELIVERY, 'delivery-finish called twice?');
        safeWrite({ type: 'deliver-result', ...when, dr });
        state = IDLE;
      }
      return harden(finish);
    }

    // ksc: kernelSyscallObject, vsc: vatSyscallObject
    function syscall(ksc, vsc) {
      checkOldState(DELIVERY, 'syscall invoked outside of delivery');
      const when = { crankNum, vatID, deliveryNum, syscallNum, replay };
      safeWrite({ type: 'syscall', ...when, ksc, vsc });
      syscallNum += 1;

      // ksr: kernelSyscallResult, vsr: vatSyscallResult
      function finish(ksr, vsr) {
        checkOldState(DELIVERY, 'syscall finished after delivery?');
        safeWrite({ type: 'syscall-result', ...when, ksr, vsr });
      }
      return harden(finish);
    }

    // mode: 'import' | 'export' | 'drop'
    function changeCList(crank, mode, kobj, vobj) {
      safeWrite({ type: 'clist', crankNum: crank, mode, vatID, kobj, vobj });
    }

    function terminateVat(shouldReject, info) {
      safeWrite({ type: 'terminate', vatID, shouldReject, info });
    }

    return harden({
      vatConsole,
      startup,
      delivery,
      syscall,
      changeCList,
      terminateVat,
    });
  }

  function provideVatSlogger(
    vatID,
    dynamic,
    description,
    name,
    vatSourceBundle,
    managerType,
    vatParameters,
  ) {
    const found = vatSlogs.get(vatID);
    if (found) {
      return { vatSlog: found, starting: false };
    }
    const vatSlog = makeVatSlog(vatID);
    vatSlogs.set(vatID, vatSlog);
    safeWrite({
      type: 'create-vat',
      vatID,
      dynamic,
      description,
      name,
      managerType,
      vatParameters,
      vatSourceBundle,
    });
    return { vatSlog, starting: true };
  }

  const { wrap, done } = makeFinishersKit(slogCallbacks);
  const slogger = harden({
    provideVatSlogger: wrap('provideVatSlogger', provideVatSlogger),
    vatConsole: wrap('vatConsole', (vatID, ...args) =>
      provideVatSlogger(vatID).vatSlog.vatConsole(...args),
    ),
    startup: wrap('startup', (vatID, ...args) =>
      provideVatSlogger(vatID).vatSlog.startup(...args),
    ),
    delivery: wrap('delivery', (vatID, ...args) =>
      provideVatSlogger(vatID).vatSlog.delivery(...args),
    ),
    syscall: wrap('syscall', (vatID, ...args) =>
      provideVatSlogger(vatID).vatSlog.syscall(...args),
    ),
    changeCList: wrap('changeCList', (vatID, ...args) =>
      provideVatSlogger(vatID).vatSlog.changeCList(...args),
    ),
    terminateVat: wrap('terminateVat', (vatID, ...args) =>
      provideVatSlogger(vatID).vatSlog.terminateVat(...args),
    ),
    write: safeWrite,
  });
  done('Unused makeSlogger slogCallbacks method names');
  return slogger;
}
