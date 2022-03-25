// @ts-check
import {
  createMachine,
  guard,
  immediate,
  reduce as rawReduce,
  state,
  transition,
} from 'robot3';

/**
 * @typedef {Object} Context
 * @property {any | null} error
 * @property {string | null} location
 * @property {Record<string, any>} connectionParams
 */

/**
 * @type {(
 *   fn: import('robot3').ReduceFunction<Context, any>,
 * ) => import('robot3').Reducer<Context, any>}
 */
const reduce = rawReduce;

/** @returns {Context} */
const initialContext = () => ({
  error: null,
  location: null,
  connectionParams: {},
});

const common = [
  // Allow the 'reset' event to go back to the 'idle' state.
  transition('reset', 'idle', reduce(initialContext)),
  // Make the 'error' event go to the 'error' state.
  transition(
    'error',
    'error',
    reduce((ctx, ev) => ({ ...ctx, error: ev.error })),
  ),
];

/** Create a state machine for the wallet connection. */
export const makeConnectionMachine = () =>
  createMachine(
    {
      idle: state(
        ...common,
        transition(
          'locate',
          'locating',
          reduce((ctx, ev) => ({
            ...ctx,
            connectionParams: ev.connectionParams,
          })),
        ),
        transition('connect', 'connecting'),
      ),
      locating: state(
        ...common,
        immediate(
          'connecting',
          guard(({ location }) => !!location),
        ),
        transition(
          'located',
          'connecting',
          reduce((ctx, ev) => ({ ...ctx, location: ev.href })),
        ),
      ),
      connecting: state(...common, transition('connected', 'bridged')),
      bridged: state(...common, transition('needDappApproval', 'approving')),
      approving: state(
        ...common,
        transition('needDappApproval', 'approving'),
        transition('dappApproved', 'bridged'),
      ),
      error: state(...common),
    },
    initialContext,
  );
