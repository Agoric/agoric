// @ts-check

/**
 * Don't trigger Node.js's UnhandledPromiseRejectionWarning. This does not
 * suppress any error messages.
 *
 * @param {Promise<any>} promise
 * @returns {void}
 */
export const handlePWarning = promise => {
  promise.catch(() => {});
};

/**
 * Don't trigger Node.js's UnhandledPromiseRejectionWarning. This does not
 * suppress any error messages.
 *
 * @param {PromiseRecord<any>} promiseKit
 * @returns {void}
 */
export const handlePKitWarning = promiseKit => {
  handlePWarning(promiseKit.promise);
};
