/**
 * TODO: hoist some top level docs
 */

// @ts-check

import { pipeline } from 'stream';

import './types.js';

const { freeze } = Object;

/**
 * @typedef { |
 *  'Event' | 'Got' | 'Sent' | 'Resolved' | 'Fulfilled' | 'Rejected' | 'SentIf' | 'Returned'
 * } LogClassName
 * @typedef { `org.ref_send.log.${LogClassName}` } LogClassT
 */
/** @type { Record<string, LogClassT> } */
const LogClass = freeze({
  Event: 'org.ref_send.log.Event',
  Got: 'org.ref_send.log.Got',
  Sent: 'org.ref_send.log.Sent',
  // Progressed: 'log.ref_send.Progressed',
  Resolved: 'org.ref_send.log.Resolved',
  Fulfilled: 'org.ref_send.log.Fulfilled',
  Rejected: 'org.ref_send.log.Rejected',
  SentIf: 'org.ref_send.log.SentIf',
  Returned: 'org.ref_send.log.Returned',
});

/**
 * uniquely identifies the origin; for example,
 * as message send as the 2nd messaging event from the buyer vat, turn 3
 *
 * @typedef {{
 *   number: number,
 *   turn: {
 *     loop: string, // identifies the vat by a unique string
 *     number: number,
 *   },
 * }} Anchor
 */

/**
 * @typedef {{
 *   anchor: Anchor,
 *   text?: string,
 *   trace?: {
 *     calls: Array<{
 *       name: string,
 *       source: string,
 *       span: Span,
 *     }>
 *   }
 * }} TraceRecord
 *
 * @typedef { TraceRecord & { class: LogClassT[] }} TraceEvent
 *
 * @typedef { [start: Loc] | [start: Loc, end: Loc] } Span
 * @typedef { [line: number] | [line: number, column: number] } Loc
 */

/**
 * An eventual send has two log entries: a `Sent` and its corresponding `Got`.
 *
 * The timestamp field is optional. Currently, Causeway ignores it.
 *
 * ref: http://wiki.erights.org/wiki/Causeway_Platform_Developer
 * cribbed from https://github.com/cocoonfx/causeway/blob/master/src/js/com/teleometry/causeway/purchase_example/workers/makeCausewayLogger.js
 */
const makeCausewayFormatter = () => {
  const self = freeze({
    /**
     * @param {Anchor} anchor
     * @param {string} message a generated string which uniquely identifies a message
     * @param { string } text
     */
    makeGot: (anchor, message, text) =>
      freeze({
        class: [LogClass.Got, LogClass.Event],
        anchor,
        message,
        trace: { calls: [{ name: text, source: '@@' }] },
      }),
    /**
     * @param {Anchor} anchor
     * @param { string } message
     * @param { string } text
     * @param {LogClassT[]} refinement
     */
    makeSent: (anchor, message, text, refinement = []) =>
      freeze({
        class: [...refinement, LogClass.Sent, LogClass.Event],
        anchor,
        message,
        text,
        trace: { calls: [{ name: text, source: '@@' }] },
      }),
    /**
     * @param {Anchor} anchor
     * @param { string } message
     * @param { string } text
     */
    makeReturned: (anchor, message, text) =>
      self.makeSent(anchor, message, text, [LogClass.Returned]),
    /**
     * @param {Anchor} anchor
     * @param { string } message
     * @param { string } condition
     */
    makeSentIf: (anchor, message, condition) =>
      freeze({
        class: [LogClass.SentIf, LogClass.Sent, LogClass.Event],
        anchor,
        message,
        condition,
        // trace: { calls: [{ name: '???@@', source: '@@' }] },
      }),
    /**
     * @param {Anchor} anchor
     * @param { string } condition
     * @param {LogClassT[]} status
     */
    makeResolved: (anchor, condition, status = []) =>
      freeze({
        class: [...status, LogClass.Resolved, LogClass.Event],
        anchor,
        condition,
        // trace: { calls: [{ name: '???@@', source: '@@' }] },
      }),
    /**
     * @param {Anchor} anchor
     * @param { string } condition
     */
    makeFulfilled: (anchor, condition) =>
      self.makeResolved(anchor, condition, [LogClass.Fulfilled]),
    /**
     * @param {Anchor} anchor
     * @param { string } condition
     */
    makeRejected: (anchor, condition) =>
      self.makeResolved(anchor, condition, [LogClass.Rejected]),
  });
  return self;
};

/**
 * @param {AsyncIterable<SlogEntry>} entries
 * @yields { TraceEvent }
 */
async function* slogToCauseway(entries) {
  const dest = makeCausewayFormatter();

  /** @type { Map<string, SlogCreateVatEntry> } */
  const vatInfo = new Map();

  /** @type { (tag: string, obj: Record<string, unknown>) => Error } */
  const notImpl = (tag, obj) =>
    Error(`not implemented: ${tag}: ${JSON.stringify(Object.keys(obj))}`);
  /** @type { (result: string, target: string, method: string) => string } */
  // const msgId = (result, target, method) => `${result}<-${target}.${method}`;

  /**
   * @param { SlogVatEntry } entry
   * @returns { Anchor }
   */
  const anchor = entry => {
    const { crankNum, vatID, deliveryNum } = entry;
    const { name } = vatInfo.get(vatID);
    const loop = `${vatID}:${name || '???'}`;
    return freeze({
      number: crankNum,
      turn: { loop, number: deliveryNum },
    });
  };

  /** @type { Map<string, SlogSyscallEntry> } */
  const sent = new Map();
  /** @type { Map<string, SlogDeliveryEntry> } */
  const got = new Map();
  /** @type { Map<string, SlogVatEntry & { rejected: boolean }> } */
  const resolved = new Map();
  /** @type { Map<string, SlogDeliveryEntry> } */
  const notified = new Map();

  for await (const entry of entries) {
    switch (entry.type) {
      case 'create-vat':
        vatInfo.set(entry.vatID, entry);
        break;
      case 'deliver': {
        const { kd } = entry;
        switch (kd[0]) {
          case 'message': {
            const [_tag, _target, { result }] = kd;
            got.set(result, entry);
            break;
          }
          case 'notify': {
            const [_tag, resolutions] = kd;
            for (const [kp] of resolutions) {
              notified.set(`R${kp}`, entry);
            }
            break;
          }
          case 'retireImports':
          case 'retireExports':
          case 'dropExports':
            break; // ignore
          default:
            notImpl(kd[0], { kd });
        }
        break;
      }
      case 'syscall': {
        switch (entry.ksc[0]) {
          case 'send': {
            const {
              ksc: [_tag, _target, { result }],
            } = entry;
            sent.set(result, entry);
            break;
          }
          case 'resolve': {
            const {
              ksc: [_, _thatVat, parts],
            } = entry;
            for (const [kp, rejected, _args] of parts) {
              const { time, crankNum, vatID, deliveryNum } = entry;
              resolved.set(`R${kp}`, {
                time,
                crankNum,
                vatID,
                deliveryNum,
                rejected,
              });
            }
            break;
          }
          case 'invoke':
          case 'exit':
          case 'subscribe':
          case 'vatstoreGet':
          case 'vatstoreSet':
          case 'vatstoreDelete':
          case 'vatstoreGetAfter':
          case 'dropImports':
          case 'retireImports':
          case 'retireExports':
            break; // irrelevant. ignore.
          default:
            throw notImpl(entry.ksc[0], {});
        }
        break;
      }
      case 'deliver-result':
      case 'import-kernel-start':
      case 'import-kernel-finish':
      case 'vat-startup-start':
      case 'vat-startup-finish':
      case 'start-replay':
      case 'finish-replay':
      case 'start-replay-delivery':
      case 'finish-replay-delivery':
      case 'cosmic-swingset-begin-block':
      case 'cosmic-swingset-end-block-start':
      case 'cosmic-swingset-bootstrap-block-start':
      case 'cosmic-swingset-bootstrap-block-finish':
      case 'cosmic-swingset-end-block-finish':
      case 'cosmic-swingset-deliver-inbound':
      case 'syscall-result':
      case 'clist':
      case 'crank-start':
      case 'crank-finish':
      case 'terminate':
        break; // irrelevant. ignore.
      case 'console':
        break; // TODO: log comment
      default:
        throw notImpl(entry.type, entry);
    }
  }

  for (const [kp, src] of sent) {
    // send / sent
    const { ksc } = src;
    if (ksc[0] !== 'send') throw TypeError();
    const [
      _,
      ko,
      {
        method,
        args: { body },
      },
    ] = ksc;
    const label = `${kp} <- ${ko}.${method}(${body.length})`;
    yield dest.makeSent(anchor(src), kp, label);

    // message / got
    if (got.has(kp)) {
      const target = got.get(kp);
      if (target.kd[0] !== 'message') throw TypeError();
      const [_0, t, { method: m }] = target.kd;
      yield dest.makeGot(anchor(target), kp, `${t}.${m}(${body.length})`);
    } else {
      console.warn('no Got for', kp);
      // TODO: check for missing data in the other direction?
    }
  }

  for (const [rkp, src] of resolved) {
    // resolve / resolved
    const status = src.rejected ? 'rejected' : 'resolved';
    yield dest.makeSent(anchor(src), rkp, `${status} ${rkp}`);
    // deliver / returned
    if (notified.has(rkp)) {
      const target = notified.get(rkp);
      yield dest.makeGot(anchor(target), rkp, rkp);
    } else {
      console.warn('no notified for', rkp);
      // TODO: check for missing data in the other direction?
    }
  }
}

/**
 * TODO: refactor as readLines, map JSON.parse
 *
 * @param {AsyncIterable<Buffer>} data
 * @yields { unknown }
 */
async function* readJSONLines(data) {
  let buf = '';
  for await (const chunk of data) {
    buf += chunk;
    for (let pos = buf.indexOf('\n'); pos >= 0; pos = buf.indexOf('\n')) {
      const line = buf.slice(0, pos);
      yield JSON.parse(line);
      buf = buf.slice(pos + 1);
    }
  }
}

/**
 * @param { AsyncIterable<unknown> } items
 * @yields { string }
 */
async function* writeJSONArray(items) {
  yield '[';
  let sep = false;
  for await (const item of items) {
    if (sep) {
      yield ',';
    } else {
      sep = true;
    }
    yield '\n';
    yield `${JSON.stringify(item)}`;
  }
  yield '\n]\n';
}

/**
 * @param {{
 *   stdin: typeof process.stdin,
 *   stdout: typeof process.stdout,
 * }} io
 */
const main = async ({ stdin, stdout }) =>
  pipeline(
    stdin,
    readJSONLines,
    slogToCauseway,
    writeJSONArray,
    stdout,
    err => {
      if (err) throw err;
    },
  );

/* TODO: only call main() if this is from CLI */
/* global process */
main({
  stdin: process.stdin,
  stdout: process.stdout,
}).catch(err => {
  console.error(err);
  process.exit(1);
});
