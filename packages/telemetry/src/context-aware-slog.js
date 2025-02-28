/* eslint-env node */

/**
 * @typedef {Partial<{
 *    'block.height': Slog['blockHeight'];
 *    'block.time': Slog['blockTime'];
 *    'crank.deliveryNum': Slog['deliveryNum'];
 *    'crank.num': Slog['crankNum'];
 *    'crank.type': Slog['crankType'];
 *    'crank.vatID': Slog['vatID'];
 *    init: boolean;
 *    replay: boolean;
 *    'run.id': string;
 *    'run.num': string | null;
 *    'run.trigger.blockHeight': Slog['blockHeight'];
 *    'run.trigger.msgIdx': number;
 *    'run.trigger.sender': Slog['sender'];
 *    'run.trigger.source': Slog['source'];
 *    'run.trigger.bundleHash': Slog['endoZipBase64Sha512'];
 *    'run.trigger.time': Slog['blockTime'];
 *    'run.trigger.txHash': string;
 *    'run.trigger.type': string;
 *  }>
 * } Context
 *
 * @typedef {{
 *  'crank.syscallNum'?: Slog['syscallNum'];
 *  'process.uptime': Slog['monotime'];
 * } & Context} LogAttributes
 *
 * @typedef {{
 *  blockHeight?: number;
 *  blockTime?: number;
 *  crankNum?: bigint;
 *  crankType?: string;
 *  deliveryNum?: bigint;
 *  inboundNum?: string;
 *  monotime: number;
 *  remainingBeans?: bigint;
 *  replay?: boolean;
 *  runNum?: number;
 *  sender?: string;
 *  source?: string;
 *  endoZipBase64Sha512?: string;
 *  syscallNum?: number;
 *  time: number;
 *  type: string;
 *  vatID?: string;
 * }} Slog
 */

export const SLOG_TYPES = {
  CLIST: 'clist',
  CONSOLE: 'console',
  COSMIC_SWINGSET: {
    AFTER_COMMIT_STATS: 'cosmic-swingset-after-commit-stats',
    BEGIN_BLOCK: 'cosmic-swingset-begin-block',
    BOOTSTRAP_BLOCK: {
      FINISH: 'cosmic-swingset-bootstrap-block-finish',
      START: 'cosmic-swingset-bootstrap-block-start',
    },
    COMMIT: {
      FINISH: 'cosmic-swingset-commit-block-finish',
      START: 'cosmic-swingset-commit-block-start',
    },
    END_BLOCK: {
      FINISH: 'cosmic-swingset-end-block-finish',
      START: 'cosmic-swingset-end-block-start',
    },
    // eslint-disable-next-line no-restricted-syntax
    RUN: {
      FINISH: 'cosmic-swingset-run-finish',
      START: 'cosmic-swingset-run-start',
    },
    UPGRADE: {
      FINISH: 'cosmic-swingset-upgrade-finish',
      START: 'cosmic-swingset-upgrade-start',
    },
  },
  COSMIC_SWINGSET_TRIGGERS: {
    BRIDGE_INBOUND: 'cosmic-swingset-bridge-inbound',
    DELIVER_INBOUND: 'cosmic-swingset-deliver-inbound',
    TIMER_POLL: 'cosmic-swingset-timer-poll',
    INSTALL_BUNDLE: 'cosmic-swingset-install-bundle',
  },
  CRANK: {
    FINISH: 'crank-finish',
    START: 'crank-start',
  },
  DELIVER: 'deliver',
  DELIVER_RESULT: 'deliver-result',
  KERNEL: {
    INIT: {
      FINISH: 'kernel-init-finish',
      START: 'kernel-init-start',
    },
  },
  REPLAY: {
    FINISH: 'finish-replay',
    START: 'start-replay',
  },
  SYSCALL: 'syscall',
  SYSCALL_RESULT: 'syscall-result',
};

/**
 * @template {Record<string, any>} [T={}]
 * @param {T} [staticContext]
 * @param {Partial<{ persistContext: (context: Context) => void; restoreContext: () => Context | null; }>} [persistenceUtils]
 */
export const makeContextualSlogProcessor = (
  staticContext,
  persistenceUtils = {},
) => {
  /** @type Array<Context | null> */
  let [
    blockContext,
    crankContext,
    initContext,
    lastPersistedTriggerContext,
    replayContext,
    triggerContext,
  ] = [null, null, null, null, null, null];

  /**
   * @param {Context} context
   */
  const persistContext = context => {
    lastPersistedTriggerContext = context;
    return persistenceUtils?.persistContext?.(context);
  };

  const restoreContext = () => {
    if (!lastPersistedTriggerContext)
      lastPersistedTriggerContext =
        persistenceUtils?.restoreContext?.() || null;
    return lastPersistedTriggerContext;
  };

  /**
   * @param {Slog} slog
   * @returns {{ attributes: T & LogAttributes, body: Partial<Slog>; time: Slog['time'] }}
   */
  const slogProcessor = ({ monotime, time, ...body }) => {
    const finalBody = { ...body };

    /** @type {{'crank.syscallNum'?: Slog['syscallNum']}} */
    const eventLogAttributes = {};

    /**
     * Add any before report operations here
     * like setting context data
     */
    switch (body.type) {
      case SLOG_TYPES.KERNEL.INIT.START: {
        initContext = { init: true };
        break;
      }
      case SLOG_TYPES.COSMIC_SWINGSET.BEGIN_BLOCK: {
        blockContext = {
          'block.height': finalBody.blockHeight,
          'block.time': finalBody.blockTime,
        };
        break;
      }
      case SLOG_TYPES.COSMIC_SWINGSET.BOOTSTRAP_BLOCK.START: {
        blockContext = {
          'block.height': finalBody.blockHeight || 0,
          'block.time': finalBody.blockTime,
        };
        break;
      }
      case SLOG_TYPES.COSMIC_SWINGSET.END_BLOCK.START:
      case SLOG_TYPES.COSMIC_SWINGSET.END_BLOCK.FINISH:
      case SLOG_TYPES.COSMIC_SWINGSET.BOOTSTRAP_BLOCK.FINISH:
      case SLOG_TYPES.COSMIC_SWINGSET.COMMIT.START:
      case SLOG_TYPES.COSMIC_SWINGSET.COMMIT.FINISH:
      case SLOG_TYPES.COSMIC_SWINGSET.AFTER_COMMIT_STATS: {
        assert(!!blockContext && !triggerContext);
        break;
      }
      case SLOG_TYPES.COSMIC_SWINGSET_TRIGGERS.BRIDGE_INBOUND:
      case SLOG_TYPES.COSMIC_SWINGSET_TRIGGERS.DELIVER_INBOUND: {
        const [blockHeight, txHash, msgIdx] = (
          finalBody.inboundNum || ''
        ).split('-');
        const [, triggerType] =
          /cosmic-swingset-([^-]+)-inbound/.exec(body.type) || [];

        triggerContext = {
          'run.num': undefined,
          'run.id': `${triggerType}-${finalBody.inboundNum}`,
          'run.trigger.type': triggerType,
          'run.trigger.source': finalBody.source,
          'run.trigger.sender': finalBody.sender,
          'run.trigger.blockHeight': Number(blockHeight),
          'run.trigger.txHash': txHash,
          'run.trigger.msgIdx': Number(msgIdx),
        };
        break;
      }
      case SLOG_TYPES.COSMIC_SWINGSET_TRIGGERS.INSTALL_BUNDLE: {
        const [blockHeight, txHash, msgIdx] = (
          finalBody.inboundNum || ''
        ).split('-');

        const triggerType = 'install-bundle';

        triggerContext = {
          'run.num': undefined,
          'run.id': `${triggerType}-${finalBody.inboundNum}`,
          'run.trigger.type': triggerType,
          'run.trigger.bundleHash': finalBody.endoZipBase64Sha512,
          'run.trigger.blockHeight': Number(blockHeight),
          'run.trigger.txHash': txHash,
          'run.trigger.msgIdx': Number(msgIdx),
        };

        break;
      }
      case SLOG_TYPES.COSMIC_SWINGSET_TRIGGERS.TIMER_POLL: {
        const triggerType = 'timer-poll';

        triggerContext = {
          'run.num': undefined,
          'run.id': `${triggerType}-${finalBody.blockHeight}`,
          'run.trigger.type': triggerType,
          'run.trigger.time': finalBody.blockTime,
          'run.trigger.blockHeight': finalBody.blockHeight,
        };

        break;
      }
      // eslint-disable-next-line no-restricted-syntax
      case SLOG_TYPES.COSMIC_SWINGSET.RUN.START: {
        if (!finalBody.runNum) {
          assert(!triggerContext);
          triggerContext = restoreContext(); // Restore persisted context if any
        } else if (!triggerContext) {
          assert(!!blockContext);
          // TODO: add explicit slog events of both timer poll and install bundle
          // https://github.com/Agoric/agoric-sdk/issues/10332
          triggerContext = {
            'run.num': undefined,
            'run.id': `unknown-${finalBody.blockHeight}-${finalBody.runNum}`,
            'run.trigger.type': 'unknown',
            'run.trigger.blockHeight': finalBody.blockHeight,
          };
        }

        if (!triggerContext) triggerContext = {};
        triggerContext['run.num'] = `${finalBody.runNum}`;

        break;
      }
      case SLOG_TYPES.CRANK.START: {
        crankContext = {
          'crank.num': finalBody.crankNum,
          'crank.type': finalBody.crankType,
        };
        break;
      }
      case SLOG_TYPES.CLIST: {
        assert(!!crankContext);
        crankContext['crank.vatID'] = finalBody.vatID;
        break;
      }
      case SLOG_TYPES.REPLAY.START:
      case SLOG_TYPES.REPLAY.FINISH: {
        replayContext = { replay: true, 'crank.vatID': finalBody.vatID };
        break;
      }
      case SLOG_TYPES.DELIVER: {
        if (replayContext) {
          assert(finalBody.replay);
          replayContext = {
            ...replayContext,
            'crank.vatID': finalBody.vatID,
            'crank.deliveryNum': finalBody.deliveryNum,
          };
        } else {
          assert(!!crankContext && !finalBody.replay);
          crankContext = {
            ...crankContext,
            'crank.vatID': finalBody.vatID,
            'crank.deliveryNum': finalBody.deliveryNum,
          };
        }

        delete finalBody.deliveryNum;
        delete finalBody.replay;

        break;
      }
      case SLOG_TYPES.DELIVER_RESULT: {
        delete finalBody.deliveryNum;
        delete finalBody.replay;

        break;
      }
      case SLOG_TYPES.SYSCALL:
      case SLOG_TYPES.SYSCALL_RESULT: {
        eventLogAttributes['crank.syscallNum'] = finalBody.syscallNum;

        delete finalBody.deliveryNum;
        delete finalBody.replay;
        delete finalBody.syscallNum;

        break;
      }
      case SLOG_TYPES.CONSOLE: {
        delete finalBody.crankNum;
        delete finalBody.deliveryNum;

        break;
      }
      default:
        // All other log types are logged as is (using existing contexts) without
        // any change to the slogs or any contributions to the contexts. This also
        // means that any unexpected slog type will pass through. To fix that, add
        // all remaining cases of expected slog types above with a simple break
        // statement and log a warning here
        break;
    }

    const logAttributes = {
      ...staticContext,
      ...initContext, // Optional prelude
      ...blockContext, // Block is the first level of execution nesting
      ...triggerContext, // run and trigger info is nested next
      ...crankContext, // Finally cranks are the last level of nesting
      ...replayContext, // Replay is a substitute for crank context during vat page in
      ...eventLogAttributes,
      'process.uptime': monotime,
    };

    /**
     * Add any after report operations here
     * like resetting context data
     */
    switch (body.type) {
      case SLOG_TYPES.KERNEL.INIT.FINISH: {
        initContext = null;
        break;
      }
      case SLOG_TYPES.COSMIC_SWINGSET.BOOTSTRAP_BLOCK.START: {
        triggerContext = {
          'run.num': undefined,
          'run.id': `bootstrap-${finalBody.blockTime}`,
          'run.trigger.type': 'bootstrap',
          'run.trigger.time': finalBody.blockTime,
        };
        break;
      }
      case SLOG_TYPES.COSMIC_SWINGSET.AFTER_COMMIT_STATS:
      case SLOG_TYPES.COSMIC_SWINGSET.BOOTSTRAP_BLOCK.FINISH: {
        blockContext = null;
        break;
      }
      // eslint-disable-next-line no-restricted-syntax
      case SLOG_TYPES.COSMIC_SWINGSET.RUN.FINISH: {
        assert(!!triggerContext);
        persistContext(
          finalBody.remainingBeans && finalBody.remainingBeans > 0
            ? {}
            : triggerContext,
        );
        triggerContext = null;
        break;
      }
      case SLOG_TYPES.CRANK.FINISH: {
        crankContext = null;
        break;
      }
      case SLOG_TYPES.REPLAY.FINISH: {
        replayContext = null;
        break;
      }
      default:
        break;
    }

    return {
      body: finalBody,
      attributes: /** @type {T & LogAttributes} */ (logAttributes),
      time,
    };
  };

  return slogProcessor;
};
