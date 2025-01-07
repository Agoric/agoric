import process from 'node:process';
import anylogger from 'anylogger';

const console = anylogger('shutdown');

export const makeFreshShutdown = (verbose = true) => {
  const shutdownThunks = new Set();

  let shuttingDown = false;
  /** @type {NodeJS.SignalsListener & NodeJS.BeforeExitListener} */
  const shutdown = code => {
    const sig = typeof code === 'string' && code.startsWith('SIG');
    const isSigInt = code === 'SIGINT';
    if (sig) {
      process.exitCode = 98;
    }
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    // Allow an explicit exit to terminate the process.
    process.off('SIGINT', shutdown);
    process.off('SIGTERM', shutdown);
    process.off('beforeExit', shutdown);
    process.off('uncaughtException', uncaughtShutdown);
    verbose && console.error(`Shutting down cleanly...`);
    const shutdowners = [...shutdownThunks.keys()];
    shutdownThunks.clear();
    Promise.allSettled(
      [...shutdowners].map(async t => Promise.resolve(isSigInt).then(t)),
    )
      .then(statuses => {
        for (const status of statuses) {
          if (status.status === 'rejected') {
            verbose && console.warn(status.reason);
          }
        }
        verbose && console.warn('Process terminated!');
      })
      .catch(error => verbose && console.warn('Error shutting down', error))
      .finally(() => {
        // Let `beforeExit` exit cleanly
        if (!(code >= 0)) {
          process.exit();
        }
      });
  };

  const uncaughtShutdown = e => {
    console.error(e);
    shutdown(-1);
  };

  // gracefully shut down the thunks on process exit
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  process.on('beforeExit', shutdown);
  process.on('uncaughtException', uncaughtShutdown);

  return {
    registerShutdown: thunk => {
      shutdownThunks.add(thunk);
      return () => {
        shutdownThunks.delete(thunk);
      };
    },
  };
};

let cachedShutdown = null;
export const makeCachedShutdown = (...args) => {
  // It's possible our caller has specified different arguments.
  // Since they control verbosity only, first-one-wins is acceptable.
  if (!cachedShutdown) {
    cachedShutdown = makeFreshShutdown(...args);
  }
  return cachedShutdown;
};

export { makeCachedShutdown as makeShutdown };
