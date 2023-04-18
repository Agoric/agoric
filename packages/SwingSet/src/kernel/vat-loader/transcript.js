// @ts-check

import djson from '../../lib/djson.js';

/** @typedef {import('@agoric/swingset-liveslots').VatSyscallObject} VatSyscallObject */
/** @typedef {import('@agoric/swingset-liveslots').VatSyscallResult} VatSyscallResult */

/** @typedef {Error | undefined} CompareSyscallsResult */
/**
 * @typedef {(
 *     vatId: any,
 *     originalSyscall: VatSyscallObject,
 *     newSyscall: VatSyscallObject,
 *   ) => CompareSyscallsResult
 * } CompareSyscalls
 */

/**
 * @param {any} vatID
 * @param {VatSyscallObject} originalSyscall
 * @param {VatSyscallObject} newSyscall
 */
export function requireIdentical(vatID, originalSyscall, newSyscall) {
  if (djson.stringify(originalSyscall) !== djson.stringify(newSyscall)) {
    console.error(`anachrophobia strikes vat ${vatID}`);
    console.error(`expected:`, djson.stringify(originalSyscall));
    console.error(`got     :`, djson.stringify(newSyscall));
    return new Error(`historical inaccuracy in replay of ${vatID}`);
  }
  return undefined;
}

/**
 * @param {*} vatKeeper
 * @param {*} vatID
 * @param {CompareSyscalls} compareSyscalls
 */
export function makeTranscriptManager(
  vatKeeper,
  vatID,
  compareSyscalls = requireIdentical,
) {
  let weAreInReplay = false;
  let playbackSyscalls;
  let currentEntry;

  function startDispatch(d) {
    currentEntry = {
      d,
      syscalls: [],
    };
  }

  function addSyscall(d, response) {
    if (currentEntry) {
      currentEntry.syscalls.push({ d, response });
    }
  }

  function finishDispatch() {
    if (!weAreInReplay) {
      vatKeeper.addToTranscript(currentEntry);
    }
  }

  // replay

  function startReplay() {
    weAreInReplay = true;
  }

  function startReplayDelivery(syscalls) {
    playbackSyscalls = Array.from(syscalls);
  }

  function inReplay() {
    return weAreInReplay;
  }

  function finishReplay() {
    weAreInReplay = false;
  }

  let replayError;

  /** @param {VatSyscallObject} newSyscall */
  function simulateSyscall(newSyscall) {
    /** @type {{d: VatSyscallObject; response: VatSyscallResult}} */
    const s = playbackSyscalls.shift();
    const newReplayError = compareSyscalls(vatID, s.d, newSyscall);
    if (newReplayError) {
      replayError = newReplayError;
      throw replayError;
    }
    return s.response;
  }

  function finishReplayDelivery(dnum) {
    if (playbackSyscalls.length !== 0) {
      console.log(`anachrophobia strikes vat ${vatID} on delivery ${dnum}`);
      console.log(
        `delivery completed with ${playbackSyscalls.length} expected syscalls remaining`,
      );
      for (const s of playbackSyscalls) {
        console.log(`expected:`, djson.stringify(s.d));
      }
      if (!replayError) {
        replayError = new Error(`historical inaccuracy in replay of ${vatID}`);
      }
      throw replayError;
    }
  }

  function checkReplayError() {
    if (replayError) {
      throw replayError;
    }
  }

  return harden({
    startDispatch,
    addSyscall,
    finishDispatch,
    startReplay,
    startReplayDelivery,
    finishReplay,
    simulateSyscall,
    finishReplayDelivery,
    checkReplayError,
    inReplay,
  });
}
