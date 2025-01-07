import { E } from '@endo/eventual-send';
import { observeNotifier } from '@agoric/notifier';
import { makePromiseKit } from '@endo/promise-kit';

export const DEFAULT_TIMER_SERVICE_POLL_INTERVAL = 60_000n;
export const DEFAULT_TIMER_DEVICE_SCALE = 1;

// Make a function that returns the latest polled time.
// This only provides as high resolution as the timer device.
export const makeTimerDeviceDateNow =
  (D, timerDevice, timerDeviceScale = DEFAULT_TIMER_DEVICE_SCALE) =>
  () => {
    const stamp = D(timerDevice).getLastPolled();
    const lastPolledStamp = parseInt(`${stamp}`, 10) * timerDeviceScale;
    return lastPolledStamp;
  };

// Make a function that returns the latest polled time.  This only provides as
// high resolution as the timer service poll interval.
export const makeTimerServiceDateNow = async (
  timerService,
  timerPollInterval = DEFAULT_TIMER_SERVICE_POLL_INTERVAL,
) => {
  let lastPolledStamp = NaN;
  const dateNow = () => lastPolledStamp;

  /** @type {PromiseRecord<typeof dateNow>} */
  const dateNowPK = makePromiseKit();

  // Observe the timer service regularly.
  const observeTimer = async () => {
    const observer = {
      updateState(stamp) {
        lastPolledStamp = parseInt(`${stamp}`, 10);
        dateNowPK.resolve(dateNow);
      },
    };

    // Check the current timestamp.
    const stamp = await E(timerService).getCurrentTimestamp();
    observer.updateState(stamp);

    // Subscribe to a notifier that will poll the local timer service
    // regularly.
    const timerNotifier = E(timerService).makeNotifier(0n, timerPollInterval);

    // Begin observing the notifier.
    await observeNotifier(timerNotifier, observer);
  };

  observeTimer().catch(e => dateNowPK.reject(e));

  // Return the dateNow function after the notifier fires at least once.
  return dateNowPK.promise;
};
