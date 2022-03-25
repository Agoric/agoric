/* eslint-disable max-classes-per-file */

/**
 * The version identifier for our meter type. TODO Bump this whenever there's a
 * change to metering semantics.
 */
export const METER_TYPE = 'xs-meter-13';

export const ExitCode = {
  E_UNKNOWN_ERROR: -1,
  E_SUCCESS: 0,
  E_BAD_USAGE: 1,
  E_IO_ERROR: 2,
  E_NOT_ENOUGH_MEMORY: 11,
  E_STACK_OVERFLOW: 12,
  E_UNHANDLED_EXCEPTION: 15,
  E_NO_MORE_KEYS: 16,
  E_TOO_MUCH_COMPUTATION: 17,
};

export const ErrorMessage = {
  [ExitCode.E_UNKNOWN_ERROR]: 'unknown error',
  [ExitCode.E_BAD_USAGE]: 'bad argument usage',
  [ExitCode.E_IO_ERROR]: 'I/O error',
  [ExitCode.E_NOT_ENOUGH_MEMORY]: 'not enough memory',
  [ExitCode.E_STACK_OVERFLOW]: 'stack overflow',
  [ExitCode.E_UNHANDLED_EXCEPTION]: 'unhandled exception',
  [ExitCode.E_NO_MORE_KEYS]: 'property (key) name space exhausted',
  [ExitCode.E_TOO_MUCH_COMPUTATION]: 'too much computation',
};

export class ErrorSignal extends Error {
  /**
   * @param {string} signal
   * @param {...(string | undefined)} params
   */
  constructor(signal, ...params) {
    super(...params);
    this.name = 'ExitSignal';
    this.code = signal;
  }
}

export class ErrorCode extends Error {
  /**
   * @param {number} code
   * @param {...(string | undefined)} params
   */
  constructor(code, ...params) {
    super(...params);
    this.name = 'ExitCode';
    this.code = code;
  }
}
