/* eslint-disable no-continue */
// @ts-check

import { pipeline } from 'stream';

// [PlantUML \- Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml)

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
 * @param {AsyncIterable<SlogEntry>} entries
 *
 * @typedef {{time: number}} TimedEvent
 * @typedef {{blockTime: number} | DInfo} Arrival
 * @typedef {DeliveryInfo | NotifyInfo} DInfo
 * @typedef {{
 *   type: 'deliver',
 *   elapsed: number,
 *   crankNum: number,
 *   deliveryNum: number,
 *   vatID: string,
 *   target: unknown,
 *   method: string,
 *   argSize: number,
 *   compute?: number,
 * }} DeliveryInfo
 * @typedef {{
 *   type: 'deliver',
 *   elapsed: number,
 *   vatID: string,
 *   target: unknown,
 *   state: unknown,
 *   compute?: number,
 * }} NotifyInfo
 * @typedef {{
 *   type: 'syscall',
 *   vatID: string,
 *   target?: string,
 *   method?: string,
 * } | {
 *   type: 'resolve',
 *   vatID: string,
 * }} Departure
 *
 * @typedef {['deliver-result', {
 *   time: number, type: 'deliver-result', vatID: string
 * }]} DeliverResult
 */
async function slogSummary(entries) {
  /** @type { Map<string, SlogCreateVatEntry> } */
  const vatInfo = new Map();
  /** @type { Map<number | string | {}, TimedEvent & Arrival>} */
  const arrival = new Map();
  /** @type { Map<string | {}, TimedEvent & Departure>} */
  const departure = new Map();
  // track end-of-delivery for deactivating actors
  /** @type {DeliverResult[]} */
  const deliverResults = [];

  /** @type {number|undefined} */
  let tBlock;
  /** @type {number} */
  let blockHeight;
  /** @type { TimedEvent & DInfo | undefined } */
  let dInfo;

  const seen = {
    type: new Set(),
    deliver: new Set(),
    syscall: new Set(),
  };

  for await (const entry of entries) {
    // handle off-chain use, such as in unit tests
    if (!tBlock) {
      tBlock = entry.time;
    }
    switch (entry.type) {
      case 'create-vat':
        vatInfo.set(entry.vatID, entry);
        break;
      case 'cosmic-swingset-end-block-start':
        tBlock = entry.time;
        blockHeight = entry.blockHeight;
        arrival.set(blockHeight, {
          time: entry.time,
          blockTime: entry.blockTime,
        });
        break;
      case 'deliver': {
        const { kd } = entry;
        if (!vatInfo.has(entry.vatID))
          vatInfo.set(entry.vatID, {
            type: 'create-vat',
            time: entry.time,
            vatID: entry.vatID,
          });
        switch (kd[0]) {
          case 'startVat': {
            const [_tag, vatParams] = kd;
            dInfo = {
              type: entry.type,
              time: entry.time,
              elapsed: entry.time - tBlock,
              crankNum: entry.crankNum,
              deliveryNum: entry.deliveryNum,
              vatID: entry.vatID,
              method: '!startVat',
            };
            arrival.set({}, dInfo);
            break;
          }
          case 'message': {
            const [
              _tag,
              target,
              {
                methargs: { body },
                result,
              },
            ] = kd;
            const [method] = JSON.parse(body);
            dInfo = {
              type: entry.type,
              time: entry.time,
              elapsed: entry.time - tBlock,
              crankNum: entry.crankNum,
              deliveryNum: entry.deliveryNum,
              vatID: entry.vatID,
              target,
              method,
              argSize: body.length,
            };
            arrival.set(result || {}, dInfo);
            break;
          }
          case 'notify': {
            const [_tag, resolutions] = kd;
            for (const [kp, { state }] of resolutions) {
              dInfo = {
                type: entry.type,
                time: entry.time,
                elapsed: entry.time - tBlock,
                vatID: entry.vatID,
                state,
                target: kp,
              };
              arrival.set(`R${kp}`, dInfo);
            }
            break;
          }
          default:
            if (!seen.deliver.has(kd[0])) {
              console.warn('delivery tag unknown:', kd[0]);
              seen.deliver.add(kd[0]);
            }
            break;
        }
        break;
      }
      case 'deliver-result': {
        // track end-of-delivery for deactivating actors
        deliverResults.push([
          entry.type,
          { time: entry.time, type: entry.type, vatID: entry.vatID },
        ]);
        // supplement deliver entry with compute meter
        const { dr } = entry;
        if (dr[2] && 'compute' in dr[2]) {
          if (!dInfo) {
            console.warn('no dInfo???', dr[2]);
            break;
          }
          const { compute } = dr[2];
          dInfo.compute = compute;
        }
        break;
      }
      case 'syscall': {
        switch (entry.ksc[0]) {
          case 'send': {
            const {
              ksc: [_, target, { method, result }],
            } = entry;
            departure.set(result, {
              type: entry.type,
              time: entry.time,
              vatID: entry.vatID,
              target,
              method,
            });
            break;
          }
          case 'resolve': {
            const {
              ksc: [_, _thatVat, parts],
            } = entry;
            for (const [kp, _rejected, _args] of parts) {
              departure.set(`R${kp}`, {
                type: entry.type,
                time: entry.time,
                vatID: entry.vatID,
              });
            }
            break;
          }
          default:
            if (!seen.syscall.has(entry.ksc[0])) {
              console.warn('syscall tag unknown:', entry.ksc[0]);
              seen.syscall.add(entry.ksc[0]);
            }
            // skip
            break;
        }
        break;
      }
      default:
        if (!seen.type.has(entry.type)) {
          console.warn('type unknown:', entry.type);
          seen.type.add(entry.type);
        }
        break;
    }
  }

  return { vatInfo, arrival, departure, deliverResults };
}

const { freeze } = Object;

/**
 * ref: https://plantuml.com/sequence-diagram
 */
const fmtPlantUml = freeze({
  /** @param {string} name */
  start: name => `@startuml ${name}\n`,
  /** @type {() => string} */
  end: () => '@enduml\n',
  /** @type {(l: string, v: string) => string} */
  participant: (label, vatID) => `control ${label} as ${vatID}\n`,
  /** @type {(s: string, t: string) => string} */
  note: (side, text) => `note ${side}\n${text}\nend note\n`,
  /** @param {string} text */
  delay: text => `... ${text} ...\n`,
  /** @param {number} x */
  autonumber: x => `autonumber ${x}\n`,
  /** @type {(d: string, msg: string, m?: boolean) => string} */
  incoming: (dest, msg, missing) =>
    `[${missing ? 'o' : ''}-> ${dest} : ${msg}\n`,
  /** @type {(s: string, d: string, msg: string) => string} */
  send: (src, dest, label) => `${src} -> ${dest} : ${label}\n`,
  /** @type {(s: string, d: string, msg: string) => string} */
  response: (src, dest, label) => `${src} --> ${dest} : ${label}\n`,
});

/**
 * ref: https://mermaid-js.github.io/mermaid/
 */
const fmtMermaid = freeze({
  /** @param {string} _name */
  start: _name =>
    `\`\`\`mermaid\nsequenceDiagram\n  autonumber\n  participant Incoming\n`,
  end: () => '```\n',
  /** @type {(l: string, v: string) => string} */
  participant: (label, vatID) => `  participant ${vatID} as ${label}\n`,
  /** @type {(s: string, t: string) => string} */
  note: (side, text) => `  note ${side} of XXXActor ${text}\n`,
  /** @param {string} text */
  delay: text => `  %% TODO: delay ... ${text} ...\n`,
  /** @param {number} _x */
  autonumber: _x => '',
  /** @type {(d: string, msg: string, m?: boolean) => string} */
  incoming: (dest, msg, _missing) => `  Incoming ->> ${dest} : ${msg}\n`,
  /** @type {(s: string, d: string, msg: string) => string} */
  send: (src, dest, label) => `  ${src} -) ${dest} : ${label}\n`,
  /** @type {(s: string, d: string, msg: string) => string} */
  response: (src, dest, label) => `  ${src} -->> ${dest} : ${label}\n`,
});

/**
 * @param {typeof fmtPlantUml} fmt
 * @param {Awaited<ReturnType<typeof slogSummary>>} param0
 * @yields {string}
 */
async function* diagramLines(
  fmt,
  { vatInfo, arrival, departure, deliverResults },
) {
  yield fmt.start('slog');

  for (const [vatID, info] of vatInfo) {
    const { name = '???' } = info || {};
    const label = JSON.stringify(`${vatID}:${name}`); // stringify to add ""s
    yield fmt.participant(label, vatID);
  }

  const byTime = [...arrival, ...deliverResults].sort(
    (a, b) => a[1].time - b[1].time,
  );

  let active;
  let blockHeight;

  for (const [
    ref,
    {
      type,
      elapsed,
      vatID: dest,
      crankNum,
      target,
      method,
      state,
      argSize,
      compute,
      blockTime,
    },
  ] of byTime) {
    if (type === 'deliver-result') {
      // failed experiment
      continue;
    }
    if (typeof ref === 'number') {
      blockHeight = ref;
      const dt = new Date(blockTime * 1000).toISOString().slice(0, -5);
      yield fmt.delay(`block ${blockHeight} ${dt}`);
      continue;
    }
    const t = Math.round(elapsed * 1000) / 1000;

    // add note to compute-intensive deliveries
    // const computeNote =
    //   compute && compute > 50000
    //     ? fmt.note(`right`, `${compute.toLocaleString()} compute`)
    //     : undefined;

    const computeNote = crankNum
      ? fmt.note('right', `${crankNum}@${dest}`)
      : undefined;

    // yield `autonumber ${blockHeight}.${t}\n`;
    if (t > 0) {
      yield fmt.autonumber(t);
    } else {
      console.warn('??? t < 0', elapsed);
    }
    const call = `${target}.${method || state}(${argSize || ''})`;
    if (typeof ref === 'object') {
      yield fmt.incoming(dest, `${call}`);
      if (computeNote) yield computeNote;
      continue;
    }
    if (!departure.has(ref)) {
      console.warn('no source for', { ref });
      yield fmt.incoming(dest, `${ref} <- ${call}`, true);
      if (computeNote) yield computeNote;
      continue;
    }
    const { vatID: src } = departure.get(ref);
    const label = method
      ? `${ref} <- ${target}.${method}(${argSize || ''})`
      : `${target}.${state}()`;

    yield method ? fmt.send(src, dest, label) : fmt.response(src, dest, label);

    // show active vat
    if (type === 'deliver' && active !== dest) {
      // yield `activate ${dest}\n`;
      active = dest;
    }

    if (computeNote) yield computeNote;
  }

  yield fmt.end();
}

/**
 * @param {AsyncIterable<SlogEntry>} entries
 * @yields {string}
 */
async function* slogToDiagram(entries) {
  const summary = await slogSummary(entries);
  for await (const line of diagramLines(fmtPlantUml, summary)) {
    yield line;
  }
}

/**
 * @param {{
 *   stdin: typeof process.stdin,
 *   stdout: typeof process.stdout,
 * }} io
 */
const main = async ({ stdin, stdout }) =>
  pipeline(stdin, readJSONLines, slogToDiagram, stdout, err => {
    if (err) throw err;
  });

/* TODO: only call main() if this is from CLI */
/* global process */
main({
  stdin: process.stdin,
  stdout: process.stdout,
}).catch(err => {
  console.error(err);
  process.exit(1);
});
