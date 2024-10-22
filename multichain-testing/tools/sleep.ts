const ambientSetTimeout = globalThis.setTimeout;

type Log = (...values: unknown[]) => void;

type SleepOptions = {
  log?: Log;
  setTimeout?: typeof ambientSetTimeout;
};

export const sleep = (
  ms: number,
  { log = () => {}, setTimeout = ambientSetTimeout }: SleepOptions = {},
) =>
  new Promise(resolve => {
    log(`Sleeping for ${ms}ms...`);
    setTimeout(resolve, ms);
  });

export type RetryOptions = {
  maxRetries?: number;
  retryIntervalMs?: number;
} & SleepOptions;

const retryUntilCondition = async <T>(
  operation: () => Promise<T>,
  condition: (result: T) => boolean,
  message: string,
  {
    maxRetries = 8,
    retryIntervalMs = 3500,
    log = () => {},
    setTimeout = ambientSetTimeout,
  }: RetryOptions = {},
): Promise<T> => {
  console.log({ maxRetries, retryIntervalMs, message });
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const result = await operation();
      if (condition(result)) {
        return result;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        log(`Error: ${error.message}`);
      } else {
        log(`Unknown error: ${String(error)}`);
      }
    }

    retries++;
    console.log(
      `Retry ${retries}/${maxRetries} - Waiting for ${retryIntervalMs}ms for ${message}...`,
    );
    await sleep(retryIntervalMs, { log, setTimeout });
  }

  throw Error(`${message} condition failed after ${maxRetries} retries.`);
};

export const makeRetryUntilCondition = (defaultOptions: RetryOptions = {}) => {
  /**
   * Retry an asynchronous operation until a condition is met.
   * Defaults to maxRetries = 6, retryIntervalMs = 3500
   */
  return <T>(
    operation: () => Promise<T>,
    condition: (result: T) => boolean,
    message: string,
    options?: RetryOptions,
  ) =>
    retryUntilCondition(operation, condition, message, {
      ...defaultOptions,
      ...options,
    });
};
