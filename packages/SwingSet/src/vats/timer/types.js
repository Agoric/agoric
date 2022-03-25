// @ts-check

/**
 * @typedef {Object} TimerService Gives the ability to get the current time,
 *   schedule a single wake() call, create a repeater that will allow scheduling
 *   of events at regular intervals, or remove scheduled calls.
 * @property {() => Timestamp} getCurrentTimestamp Retrieve the latest timestamp
 * @property {(baseTime: Timestamp, waker: ERef<TimerWaker>) => Timestamp} setWakeup
 *   Return value is the time at which the call is scheduled to take place
 * @property {(waker: ERef<TimerWaker>) => Timestamp[]} removeWakeup Remove the
 *   waker from all its scheduled wakeups, whether produced by
 *   `timer.setWakeup(h)` or `repeater.schedule(h)`.
 * @property {(delay: RelativeTime, interval: RelativeTime) => TimerRepeater} makeRepeater
 *   Create and return a repeater that will schedule `wake()` calls repeatedly at
 *   times that are a multiple of interval following delay. Interval is the
 *   difference between successive times at which wake will be called. When
 *   `schedule(w)` is called, `w.wake()` will be scheduled to be called after
 *   the next multiple of interval from the base. Since times can be
 *   coarse-grained, the actual call may occur later, but this won't change when
 *   the next event will be called.
 * @property {(
 *   delay: RelativeTime,
 *   interval: RelativeTime,
 * ) => Notifier<Timestamp>} makeNotifier
 *   Create and return a Notifier that will deliver updates repeatedly at times
 *   that are a multiple of interval following delay.
 * @property {(delay: RelativeTime) => Promise<Timestamp>} delay Create and
 *   return a promise that will resolve after the relative time has passed.
 */

/**
 * @typedef {bigint} Timestamp An absolute individual stamp returned by a
 *   TimerService. Note that different timer services may have different
 *   interpretations of actual Timestamp values.
 *
 * @typedef {bigint} RelativeTime Difference between two Timestamps. Note that
 *   different timer services may have different interpretations of actual
 *   RelativeTime values.
 */

/**
 * @typedef {Object} TimerWaker
 * @property {(timestamp: Timestamp) => void} wake The timestamp passed to
 *   `wake()` is the time that the call was scheduled to occur.
 */

/**
 * @typedef {Object} TimerRepeater
 * @property {(waker: ERef<TimerWaker>) => Timestamp} schedule Returns the time
 *   scheduled for the first call to `E(waker).wake()`. The waker will continue
 *   to be scheduled every interval until the repeater is disabled.
 * @property {() => void} disable Disable this repeater, so `schedule(w)` can't
 *   be called, and wakers already scheduled with this repeater won't be
 *   rescheduled again after `E(waker).wake()` is next called on them.
 */
