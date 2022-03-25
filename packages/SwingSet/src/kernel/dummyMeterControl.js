// @ts-check
import { assert } from '@agoric/assert';

export function makeDummyMeterControl() {
  let meteringDisabled = 0;

  function isMeteringDisabled() {
    return !!meteringDisabled;
  }

  function assertIsMetered(msg) {
    assert(!meteringDisabled, msg);
  }

  function assertNotMetered(msg) {
    assert(!!meteringDisabled, msg);
  }

  function runWithoutMetering(thunk) {
    meteringDisabled += 1;
    try {
      return thunk();
    } finally {
      meteringDisabled -= 1;
    }
  }

  async function runWithoutMeteringAsync(thunk) {
    meteringDisabled += 1;
    return Promise.resolve()
      .then(() => thunk())
      .finally(() => {
        meteringDisabled -= 1;
      });
  }

  // return a version of f that runs outside metering
  function unmetered(f) {
    function wrapped(...args) {
      return runWithoutMetering(() => f(...args));
    }
    return harden(wrapped);
  }

  /** @type {MeterControl} */
  const meterControl = {
    isMeteringDisabled,
    assertIsMetered,
    assertNotMetered,
    runWithoutMetering,
    runWithoutMeteringAsync,
    unmetered,
  };
  return harden(meterControl);
}
