/**
 * @callback ManualTimerTick
 * @param {string} [msg]
 * @returns {Promise<void>}
 */

/**
 * @typedef {Object} ManualTimerAdmin
 * @property {ManualTimerTick} tick
 */

/** @typedef {ManualTimerAdmin & TimerService} ManualTimer */
