import makePromise from '@agoric/make-promise';

// Return a function that can wrap an async or sync method, but
// ensures only one of them (in order) is running at a time.
export const makeWithQueue = () => {
  const queue = [];

  // Execute the thunk at the front of the queue.
  const dequeue = () => {
    if (!queue.length) {
      return;
    }
    const [thunk, resolve, reject] = queue[0];
    // Run the thunk in a new turn.
    Promise.resolve()
      .then(thunk)
      // Resolve or reject our caller with the thunk's value.
      .then(resolve, reject)
      // Rerun dequeue() after settling.
      .finally(() => {
        queue.shift();
        if (queue.length) {
          dequeue();
        }
      });
  };

  return function withQueue(inner) {
    return function queueCall(...args) {
      // Curry the arguments into the inner function, and
      // resolve/reject with whatever the inner function does.
      const thunk = _ => inner(...args);
      const pr = makePromise();
      queue.push([thunk, pr.res, pr.rej]);

      if (queue.length === 1) {
        // Start running immediately.
        dequeue();
      }

      // Allow the caller to retrieve our thunk's results.
      return pr.p;
    };
  };
};
