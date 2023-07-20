// @ts-check
// @jessie-check

/**
 * JSON.stringify replacer to handle bigint
 *
 * @param {unknown} k
 * @param {unknown} v
 */
export const bigintReplacer = (k, v) => (typeof v === 'bigint' ? `${v}` : v);

/**
 * TUI - a Textual User Interface
 *
 * @param {{
 *   stdout: Pick<import('stream').Writable, 'write'>,
 *   logger: Pick<typeof console, 'warn'>,
 * }} io
 * @typedef {ReturnType<makeTUI>} TUI
 */
export const makeTUI = ({ stdout, logger }) => {
  /**
   * write info as JSON
   *
   * @param {unknown} info JSON.strigify()-able data (bigint replaced with string)
   * @param {boolean} [indent] normally false, keeping the JSON on one line
   */
  const show = (info, indent = false) => {
    stdout.write(
      `${JSON.stringify(info, bigintReplacer, indent ? 2 : undefined)}\n`,
    );
  };

  return Object.freeze({
    show,
    /** @type {typeof console.warn} */
    warn: (...args) => logger.warn(...args),
  });
};
