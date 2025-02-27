import fs from 'fs';
import process from 'process';
import Readlines from 'n-readlines';
import yargs from 'yargs';

import { Fail } from '@endo/errors';

function usage() {
  console.error('usage message goes here');
}

function fail(message, printUsage) {
  console.error(message);
  if (printUsage) {
    usage();
  }
  process.exit(1);
}

export function main() {
  const argv = yargs(process.argv.slice(2))
    .string('out')
    .default('out', undefined, '<STDOUT>')
    .describe('out', 'File to output to')
    .string('annotations')
    .alias('annotations', 'annot')
    .describe('annotations', 'Annotations file')
    .boolean('summarize')
    .describe('summarize', 'Output summary report at end')
    .boolean('vatspace')
    .describe('vatspace', "Show object refs in their vat's namespace")
    .boolean('kernelspace')
    .describe(
      'kernelspace',
      'Show object refs in the kernel namespace (default)',
    )
    .conflicts('vatspace', 'kernelspace')
    .boolean('crankbreaks')
    .default('crankbreaks', true)
    .describe('crankbreaks', 'Output labeled breaks between cranks')
    .boolean('clist')
    .default('clist', true)
    .describe('clist', 'Show C-list change events')
    .boolean('usesloggertags')
    .describe(
      'usesloggertags',
      'Display slogger events using full slogger tags',
    )
    .boolean('timing')
    .describe(
      'timing',
      'Show execution time information in crank and syscall summaries',
    )
    .boolean('nonoise')
    .describe(
      'nonoise',
      `Skip displaying lines not normally useful for debugging`,
    )
    .boolean('novatstore')
    .describe(
      'novatstore',
      'Skip displaying lines describing vatstore operations',
    )
    .number('bigwidth')
    .default('bigwidth', 200)
    .describe(
      'bigwidth',
      'Length above which long value strings display as "<BIG>"',
    )
    .strict()
    .usage('$0 [OPTIONS...] SLOGFILE')
    .version(false)
    .parse();

  const terse = !argv.usesloggertags;
  const kernelSpace = argv.kernelspace || !argv.vatspace;
  let bigWidth = argv.bigwidth;

  let out;
  if (argv.out) {
    out = fs.createWriteStream(argv.out);
  } else {
    out = process.stdout;
    out.on('error', e => {
      if (e.code === 'EPIPE') {
        process.exit(0);
      }
    });
  }

  // prettier-ignore
  const handlers = {
    'bundle-kernel-finish': handleBundleKernelFinish,
    'bundle-kernel-start': handleBundleKernelStart,
    'kernel-init-finish': handleKernelInitFinish,
    'kernel-init-start': handleKernelInitStart,
    'clist': handleCList,
    'console': handleConsole,
    'cosmic-swingset-after-commit-stats': handleCosmicSwingsetAfterCommitStats,
    'cosmic-swingset-begin-block': handleCosmicSwingsetBeginBlock,
    'cosmic-swingset-bootstrap-block-finish': handleCosmicSwingsetBootstrapBlockFinish,
    'cosmic-swingset-bootstrap-block-start': handleCosmicSwingsetBootstrapBlockStart,
    'cosmic-swingset-bridge-inbound': handleCosmicSwingsetBridgeInbound,
    'cosmic-swingset-commit-block-finish': handleCosmicSwingsetCommitBlockFinish,
    'cosmic-swingset-commit-block-start': handleCosmicSwingsetCommitBlockStart,
    'cosmic-swingset-deliver-inbound': handleCosmicSwingsetDeliverInbound,
    'cosmic-swingset-end-block-finish': handleCosmicSwingsetEndBlockFinish,
    'cosmic-swingset-end-block-start': handleCosmicSwingsetEndBlockStart,
    'crank-finish': handleCrankFinish,
    'crank-start': handleCrankStart,
    'create-vat': handleCreateVat,
    'deliver': handleDeliver,
    'deliver-result': handleDeliverResult,
    'finish-replay': handleFinishReplay,
    'heap-snapshot-load': handleHeapSnapshotLoad,
    'heap-snapshot-save': handleHeapSnapshotSave,
    'import-kernel-finish': handleImportKernelFinish,
    'import-kernel-start': handleImportKernelStart,
    'kernel-stats': handleKernelStats,
    'replay-transcript-finish': handleReplayTranscriptFinish,
    'replay-transcript-start': handleReplayTranscriptStart,
    'slogger-confused': handleSloggerConfused,
    'start-replay': handleStartReplay,
    'syscall': handleSyscall,
    'syscall-result': handleSyscallResult,
    'terminate': handleTerminate,
    'vat-startup-finish': handleVatStartupFinish,
    'vat-startup-start': handleVatStartupStart,
  };

  const slogFile = argv._[0];
  let lines;
  try {
    lines = new Readlines(slogFile);
  } catch (e) {
    fail(`unable to open slog file ${slogFile}`);
  }

  const summary = {};
  let inCrank = false;
  let startEntry;
  let currentVat;
  let currentSyscallName;
  let currentSyscallString;
  let importKernelStartTime = 0;
  let bundleKernelStartTime = 0;
  let kernelInitStartTime = 0;
  let crankStartTime = 0;
  let crankTotalSyscallTime = 0;
  let crankSyscallCount = 0;
  const crankReportItems = [];
  let syscallStartTime = 0;
  let vatStartupStartTime = 0;
  let vatStartupVat;
  let replayTranscriptStartTime = 0;
  let replayTranscriptVat;
  let replayStartTime = 0;
  let replayVat;
  let cosmicSwingsetBeginBlockTime = 0;
  let cosmicSwingsetEndBlockStartTime = 0;
  let cosmicSwingsetCommitBlockStartTime = 0;
  let cosmicSwingsetBlockTime;
  let cosmicSwingsetBlockHeight;
  let cosmicSwingsetBootstrapBlockStartTime = 0;
  let cosmicSwingsetBootstrapBlockStartBlockTime = 0;

  const vatNames = new Map();
  const crankLabels = new Map();
  const kernelRefs = new Map();
  const vatRefs = new Map();

  function p(str) {
    if (inCrank) {
      crankReportItems.push(str);
    } else {
      out.write(str);
      out.write('\n');
    }
  }

  function ptime(t) {
    return `${(t * 1000_000).toFixed(0)}µs`;
  }

  function pct(n) {
    return `${(n * 100).toFixed(2)}%`;
  }

  function outputCrankReport() {
    !inCrank || Fail`outputCrankReport called from inside crank`;
    if (crankReportItems.length > 0) {
      p(crankReportItems.join('\n'));
      crankReportItems.length = 0;
    }
  }

  if (argv.annotations) {
    let annotations;
    try {
      annotations = JSON.parse(fs.readFileSync(argv.annotations));
    } catch (e) {
      fail(`unable to read annotations file ${argv.annotations}: ${e.message}`);
    }
    if (annotations.comment) {
      p(`// ${annotations.comment}`);
      p('');
    }
    if (annotations.vatNames) {
      for (const [id, name] of Object.entries(annotations.vatNames)) {
        vatNames.set(id, name);
      }
    }
    if (annotations.crankLabels) {
      for (const [id, name] of Object.entries(annotations.crankLabels)) {
        crankLabels.set(id, name);
      }
    }
    if (annotations.kernelRefs) {
      for (const [ref, name] of Object.entries(annotations.kernelRefs)) {
        kernelRefs.set(ref, name);
      }
    }
    if (annotations.vatRefs) {
      for (const [vat, table] of Object.entries(annotations.vatRefs)) {
        for (const [ref, name] of Object.entries(table)) {
          let subTable = vatRefs.get(vat);
          if (!subTable) {
            subTable = new Map();
            vatRefs.set(vat, subTable);
          }
          subTable.set(ref, name);
        }
      }
    }
    if (annotations.bigWidth) {
      bigWidth = annotations.bigWidth;
    }
  }

  if (argv.crankbreaks) {
    p('// startup');
  }
  let line = lines.next();
  let lineNumber = 0;
  let skipCrank = -1;
  while (line) {
    lineNumber += 1;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch (err) {
      p(`// JSON.parse error on line ${lineNumber}`);
      throw err;
    }
    const type = entry.type;
    if (type === 'crank-start') {
      if (entry.crankType === 'routing' && argv.nonoise) {
        skipCrank = entry.crankNum;
      }
      startEntry = entry;
    }
    if (summary[type]) {
      summary[type] += 1;
    } else {
      summary[type] = 1;
    }
    if (entry.crankNum !== skipCrank) {
      const handler = handlers[type] || defaultHandler;
      try {
        handler(entry);
      } catch (err) {
        p(`// handler problem on line ${lineNumber}`);
        throw err;
      }
    }
    line = lines.next();
  }
  if (argv.crankbreaks) {
    p('');
    p('// end of slog');
  }

  if (argv.summarize) {
    p('summary:');
    for (const [type, count] of Object.entries(summary)) {
      p(`  ${type}: ${count}`);
    }
  }

  function defaultHandler(entry) {
    p(`@ ${entry.type}: ${JSON.stringify(entry)}`);
  }

  function vatLabel(vatID) {
    return vatNames.get(vatID) || '<no name>';
  }

  function handleSloggerConfused(_entry) {}

  function handleKernelStats(entry) {
    const stats = Object.entries(entry.stats)
      .map(([key, value]) => `${key}:${value}`)
      .join(', ');
    p(`kernel-stats: ${stats}`);
  }

  function handleCreateVat(entry) {
    if (entry.name) {
      vatNames.set(entry.vatID, entry.name);
    }
    // prettier-ignore
    p(`create-vat: ${entry.vatID} ${vatLabel(entry.vatID)} ${entry.dynamic ? 'dynamic' : 'static'} "${entry.description}"`);
  }

  function pref(ref, ks = kernelSpace) {
    let name;
    if (ks) {
      name = kernelRefs.get(ref);
    } else {
      const subTable = vatRefs.get(currentVat);
      name = subTable && subTable.get(ref);
    }
    return name ? `<${name}>` : `@${ref}`;
  }

  function legibilizeValue(val, slots, smallcaps) {
    let result;
    try {
      if (Array.isArray(val)) {
        result = '[';
        for (const elem of val) {
          if (result.length !== 1) {
            result += ', ';
          }
          result += legibilizeValue(elem, slots, smallcaps);
        }
        result += ']';
      } else if (val && typeof val === 'object' && val.constructor === Object) {
        const qClass = val['@qclass'];
        if (qClass && !smallcaps) {
          switch (qClass) {
            case 'undefined':
            case 'NaN':
            case 'Infinity':
            case '-Infinity':
              result = qClass;
              break;
            case 'bigint':
              result = val.digits;
              break;
            case 'slot':
              result = pref(slots[val.index]);
              break;
            case 'error':
              result = `new ${val.name}('${val.message}')`;
              break;
            default:
              Fail`unknown qClass ${qClass} in legibilizeValue`;
              break;
          }
        }
        result = '{';
        for (const prop of Object.getOwnPropertyNames(val)) {
          if (result.length !== 1) {
            result += ', ';
          }
          // prettier-ignore
          result += `${String(prop)}: ${legibilizeValue(val[prop], slots, smallcaps)}`;
        }
        result += '}';
      } else if (val && typeof val === 'string' && smallcaps) {
        const prefix = val.charAt(0);
        const rest = val.substring(1);
        switch (prefix) {
          case '!':
            result = `"${rest}"`;
            break;
          case '%':
            result = `[${rest}]`;
            break;
          case '#':
          case '+':
          case '-':
            result = rest;
            break;
          case '$':
          case '&': {
            const end = rest.indexOf('.');
            const idx = Number(rest.slice(0, end < 0 ? rest.length : end));
            result = pref(slots[idx]);
            break;
          }
          default:
            result = JSON.stringify(val) || '<unintelligible value>';
            break;
        }
      } else {
        result = JSON.stringify(val) || '<unintelligible value>';
      }
    } catch {
      result = '<unintelligible value>';
    }
    return result.length > bigWidth ? '<BIG>' : result;
  }

  function legibilizeMethod(method, smallcaps) {
    try {
      if (typeof method === 'string') {
        if (!smallcaps) {
          return method;
        }
        const prefix = method.charAt(0);
        const rest = method.substring(1);
        switch (prefix) {
          case '%':
            return `[${rest}]`;
          case '#':
            if (rest === 'undefined') {
              return '<funcall>';
            } else {
              return '<unintelligible method>';
            }
          case '!':
            return rest;
          case '+':
          case '-':
          case '$':
          case '&':
            return '<unintelligible method>';
          default:
            return method;
        }
      } else if (method === undefined) {
        return '<funcall>';
      } else if (typeof method === 'object') {
        if (smallcaps) {
          return '<unintelligible method>';
        }
        const qclass = method['@qclass'];
        if (qclass === 'undefined') {
          return '<funcall>';
        } else {
          return '<invalid method type>';
        }
      } else {
        return '<unintelligible method>';
      }
    } catch {
      return '<unintelligible method>';
    }
  }

  function legibilizeMessageArgs(methargsCapdata) {
    try {
      let smallcaps = false;
      let bodyString = methargsCapdata.body;
      if (bodyString.charAt(0) === '#') {
        smallcaps = true;
        bodyString = bodyString.substring(1);
      }
      const methargs = JSON.parse(bodyString);
      const [method, args] = methargs;
      const methodStr = legibilizeMethod(method, smallcaps);
      const argsStrs = args.map(arg =>
        legibilizeValue(arg, methargsCapdata.slots, smallcaps),
      );
      return [methodStr, argsStrs.join(', ')];
    } catch {
      return '<unintelligible message args>';
    }
  }

  function pmethargs(methargs) {
    const [method, ...args] = legibilizeMessageArgs(methargs);
    return [method.replaceAll('"', ''), args.join(', ')];
  }

  function legibilizeCallArgs(argsCapdata) {
    try {
      let smallcaps = false;
      let bodyString = argsCapdata.body;
      if (bodyString.charAt(0) === '#') {
        smallcaps = true;
        bodyString = bodyString.substring(1);
      }
      const args = JSON.parse(bodyString);
      const argsStrs = args.map(arg =>
        legibilizeValue(arg, argsCapdata.slots, smallcaps),
      );
      return argsStrs;
    } catch {
      return '<unintelligible call args>';
    }
  }

  function pcallargs(args) {
    return legibilizeCallArgs(args).join(', ');
  }

  function pdata(data) {
    let smallcaps = false;
    let bodyString = data.body;
    if (bodyString.charAt(0) === '#') {
      smallcaps = true;
      bodyString = bodyString.substring(1);
    }
    return legibilizeValue(JSON.parse(bodyString), data.slots, smallcaps);
  }

  function doDeliverMessage(delivery, prefix = '') {
    const target = delivery[1];
    const msg = delivery[2];
    const [method, args] = pmethargs(msg.methargs);
    // prettier-ignore
    p(`${prefix}deliver: ${pref(target)} <- ${method}(${args}): ${pref(msg.result)}`);
  }

  function doDeliverNotify(delivery, prefix = '') {
    const resolutions = delivery[1];
    let idx = 0;
    const single = resolutions.length === 1;
    for (const resolution of resolutions) {
      const [target, value] = resolution;
      let state;
      let data;
      // 'delivery' records for notifications have annoyingly different shapes
      // for the kernel ('kd') and vat ('vd') resolution records.
      // 'start-replay-delivery' records use the vat shape.
      //
      // The kernel resolution shape is:
      //   [TARGET, {state:STATESTR, refCount:REFCOUNT, data: { body: BODYSTR, slots: [...SLOTS]}}]
      // where STATESTR is 'fulfilled' or 'rejected'
      //
      // The vat resolution shape is:
      //   [TARGET, REJECTED, { body: BODYSTR, slots: [...SLOTS]}]
      // where REJECTED is false for fulfilled and true for rejected.
      //
      // We figure out which shape we're dealing with by checking to see if the
      // second element of the array is a boolean.
      if (typeof value === 'boolean') {
        state = value ? 'rejected' : 'fulfilled';
        data = resolution[2];
      } else {
        state = value.state;
        data = value.data;
      }
      const tag = terse ? state : `notify ${state}`;
      switch (state) {
        case 'fulfilled':
        case 'rejected':
          if (single) {
            p(`${prefix}${tag}: ${pref(target)} := ${pdata(data)}`);
          } else {
            p(`${prefix}${tag}: ${idx} ${pref(target)} := ${pdata(data)}`);
          }
          break;
        default:
          p(`notify: unknown state "${state}"`);
          break;
      }
      idx += 1;
    }
  }

  function doDeliverStartVat(delivery, prefix = '') {
    // prettier-ignore
    p(`${prefix}startVat: ${pdata(delivery[1])}`);
  }

  function doDeliverDropRetire(delivery, prefix = '') {
    // prettier-ignore
    p(`${prefix}recv-${delivery[0]}: [${delivery[1].map(r => pref(r)).join(' ')}]`);
  }

  function doDeliver(delivery, prefix) {
    switch (delivery[0]) {
      case 'message':
        doDeliverMessage(delivery, prefix);
        break;
      case 'notify':
        doDeliverNotify(delivery, prefix);
        break;
      case 'dropExports':
      case 'retireExports':
      case 'retireImports':
        doDeliverDropRetire(delivery, prefix);
        break;
      case 'startVat':
        doDeliverStartVat(delivery, prefix);
        break;
      default:
        p(`deliver: unknown deliver type "${delivery[0]}"`);
        break;
    }
  }

  function handleDeliver(entry) {
    doDeliver(kernelSpace ? entry.kd : entry.vd);
  }

  function handleDeliverResult(entry) {
    const [status, problem] = entry.dr;
    if (status !== 'ok') {
      p(`deliver-result: ${status} ${problem}`);
    }
  }

  function doSyscallSend(tag, entry) {
    const target = entry[1];
    let methargs;
    let result;
    // annoying asymmetry that's too hard to fix on the originating end
    if (kernelSpace) {
      methargs = entry[2].methargs;
      result = entry[2].result;
    } else {
      methargs = entry[2];
      result = entry[3];
    }
    const [method, args] = pmethargs(methargs);
    return `${tag}: ${pref(target)} <- ${method}(${args}): ${pref(result)}`;
  }

  function doSyscallResolve(tag, entry) {
    let idx = 0;
    const resolutions = kernelSpace ? entry[2] : entry[1];
    const single = resolutions.length === 1;
    const resultElems = [];
    for (const resolution of resolutions) {
      const [target, rejected, value] = resolution;
      const rejTag = rejected ? 'reject' : 'fulfill';
      if (single) {
        resultElems.push(
          `${tag} ${rejTag}: ${pref(target)} := ${pdata(value)}`,
        );
      } else {
        resultElems.push(
          `${tag} ${idx} ${rejTag}: ${pref(target)} := ${pdata(value)}`,
        );
      }
      idx += 1;
    }
    return resultElems.join('\n');
  }

  function doSyscallInvoke(tag, entry) {
    return `${tag}: ${pref(entry[1])}.${entry[2]}(${pcallargs(entry[3])})`;
  }

  function doSyscallSubscribe(tag, entry) {
    return `${tag}: ${pref(kernelSpace ? entry[2] : entry[1])}`;
  }

  function doSyscallVatstoreDeleteOrGet(tag, entry) {
    const key = kernelSpace ? entry[2] : entry[1];
    return `${tag}: '${key}'`;
  }

  function doSyscallVatstoreGetNextKey(tag, entry) {
    const priorKey = kernelSpace ? entry[2] : entry[1];
    return `${tag}: '${priorKey}'`;
  }

  function doSyscallVatstoreSet(tag, entry) {
    const key = kernelSpace ? entry[2] : entry[1];
    const value = kernelSpace ? entry[3] : entry[2];
    /*
      const data = JSON.parse(value);
      if (key.startsWith('ws')) {
      p(`${tag}: '${key}' (${pref(key, false)}) = ${pdata(data)}`);
      } else {
      const interp = {};
      for (const [id, val] of Object.entries(data)) {
      interp[id] = pdata(val);
      }
      p(`${tag}: '${key}' (${pref(key, false)}) = ${JSON.stringify(interp)}`);
      }
    */
    return `${tag}: '${key}' := '${value}'`;
  }

  function doSyscallDropRetire(tag, entry) {
    return `send-${tag}: [${entry[1].map(r => pref(r)).join(' ')}]`;
  }

  function doSyscallExit(tag, entry) {
    const failure = kernelSpace ? entry[2] : entry[1];
    const value = kernelSpace ? entry[3] : entry[2];
    return `${tag}: (${failure ? 'failure' : 'success'}) ${pdata(value)}`;
  }

  function doSyscall(syscall) {
    currentSyscallName = syscall[0];
    const tag = terse ? currentSyscallName : `syscall ${currentSyscallName}`;
    switch (currentSyscallName) {
      case 'exit':
        return doSyscallExit(tag, syscall);
      case 'resolve':
        return doSyscallResolve(tag, syscall);
      case 'invoke':
        return doSyscallInvoke(tag, syscall);
      case 'send':
        return doSyscallSend(tag, syscall);
      case 'subscribe':
        return doSyscallSubscribe(tag, syscall);
      case 'vatstoreDelete':
      case 'vatstoreGet':
        return doSyscallVatstoreDeleteOrGet(tag, syscall);
      case 'vatstoreSet':
        return doSyscallVatstoreSet(tag, syscall);
      case 'vatstoreGetNextKey':
        return doSyscallVatstoreGetNextKey(tag, syscall);
      case 'dropImports':
      case 'retireExports':
      case 'retireImports':
        return doSyscallDropRetire(tag, syscall);
      default:
        return `syscall: unknown syscall ${currentSyscallName}`;
    }
  }

  function handleHeapSnapshotLoad(entry) {
    p(`heap-snapshot-load ${entry.vatID} ${entry.snapshotID}`);
  }

  function handleHeapSnapshotSave(entry) {
    // prettier-ignore
    p(`heap-snapshot-save ${entry.vatID} ${entry.snapshotID} at ${entry.endPosition.itemCount}`);
  }

  function handleImportKernelStart(entry) {
    importKernelStartTime = entry.time;
  }

  function handleImportKernelFinish(entry) {
    p(`kernel-import: ${ptime(entry.time - importKernelStartTime)}`);
  }

  function handleCrankStart(entry) {
    inCrank = true;
    if (!argv.nonoise) {
      p(`crank-start: ${entry.crankType} crank ${entry.crankNum}`);
    }
    currentVat = entry.vatID || entry.message.vatID;
    crankStartTime = entry.time;
    crankTotalSyscallTime = 0;
    crankSyscallCount = 0;
  }

  function handleCrankFinish(entry) {
    const crankTime = entry.time - crankStartTime;
    if (!argv.nonoise) {
      p(`crank-finish: ${ptime(crankTime)} crank ${entry.crankNum}`);
    }
    inCrank = false;
    if (entry.crankNum !== skipCrank) {
      if (argv.crankbreaks) {
        let timingStr = '';
        if (argv.timing) {
          const total = crankTime;
          const local = crankTime - crankTotalSyscallTime;
          const localFraction = local / total;
          const syscall = crankTotalSyscallTime;
          const syscallFraction = syscall / total;
          // prettier-ignore
          timingStr = ` [total:${ptime(total)} local:${ptime(local)} ${pct(localFraction)} syscall:${ptime(syscall)} ${pct(syscallFraction)}] ${crankSyscallCount} syscalls`;
        }
        p('');
        if (startEntry.crankType === 'routing') {
          if (argv.timing) {
            timingStr = ` ${ptime(crankTime)}`;
          }
          p(`// crank ${startEntry.crankNum}: routing${timingStr}`);
        } else {
          let vatName;
          if (startEntry.message.type === 'create-vat') {
            vatName = startEntry.message?.dynamicOptions?.name;
          }
          if (!vatName) {
            vatName = vatLabel(currentVat);
          }
          const crankLabel = crankLabels.get(`${startEntry.crankNum}`);
          const crankTag = crankLabel ? ` --- ${crankLabel}` : '';
          // prettier-ignore
          p(`// crank ${startEntry.crankNum}: ${currentVat} ${vatName}${crankTag}${timingStr}`);
        }
      }
    }
    outputCrankReport();
  }

  function handleBundleKernelStart(entry) {
    bundleKernelStartTime = entry.time;
  }

  function handleBundleKernelFinish(entry) {
    p(`bundle-kernel: ${ptime(entry.time - bundleKernelStartTime)}`);
  }

  function handleKernelInitStart(entry) {
    kernelInitStartTime = entry.time;
  }

  function handleKernelInitFinish(entry) {
    p(`kernel-init: ${ptime(entry.time - kernelInitStartTime)}`);
  }

  function handleVatStartupStart(entry) {
    vatStartupStartTime = entry.time;
    vatStartupVat = entry.vatID;
  }

  function handleVatStartupFinish(entry) {
    // prettier-ignore
    if (entry.vatID !== vatStartupVat) {
      p(`vat-startup-finish vat ${entry.vatID} doesn't match vat-startup-start vat ${vatStartupVat}`);
    } else {
      p(`vat-startup: ${entry.vatID} ${ptime(entry.time - vatStartupStartTime)}`);
    }
  }

  function handleReplayTranscriptStart(entry) {
    replayTranscriptStartTime = entry.time;
    replayTranscriptVat = entry.vatID;
    p(`replay-transcript-start: ${entry.vatID}`);
  }

  function handleReplayTranscriptFinish(entry) {
    // prettier-ignore
    if (entry.vatID !== replayTranscriptVat) {
      p(`replay-transcript-finish vat ${entry.vatID} doesn't match replay-transcript-start vat ${replayTranscriptVat}`);
    } else {
      p(`replay-transcript-finish: ${entry.vatID} ${ptime(entry.time - replayTranscriptStartTime)}`);
    }
  }

  function handleStartReplay(entry) {
    replayStartTime = entry.time;
    replayVat = entry.vatID;
    p(`start-replay: ${entry.vatID} ${entry.deliveries}`);
  }

  function handleFinishReplay(entry) {
    // prettier-ignore
    if (entry.vatID !== replayVat) {
      p(`finish-replay vat ${entry.vatID} doesn't match start-replay vat ${replayVat}`);
    } else {
      p(`finish-replay ${entry.vatID} ${ptime(entry.time - replayStartTime)}`);
    }
  }

  function handleCosmicSwingsetBootstrapBlockStart(entry) {
    cosmicSwingsetBootstrapBlockStartTime = entry.time;
    cosmicSwingsetBootstrapBlockStartBlockTime = entry.blockTime;
  }

  function handleCosmicSwingsetBootstrapBlockFinish(entry) {
    // prettier-ignore
    if (entry.blockTime !== cosmicSwingsetBootstrapBlockStartBlockTime) {
      p(`cosmic-swingset-bootstrap-block-finish time ${entry.blockTime} doesn't match cosmic-swingset-bootstrap-block-start time ${cosmicSwingsetBootstrapBlockStartBlockTime}`);
    } else {
      p(`cosmic-swingset-bootstrap-block: ${ptime(entry.time - cosmicSwingsetBootstrapBlockStartTime)}`);
    }
  }

  function handleCosmicSwingsetBeginBlock(entry) {
    cosmicSwingsetBeginBlockTime = entry.time;
    cosmicSwingsetBlockTime = entry.blockTime;
    cosmicSwingsetBlockHeight = entry.blockHeight;
    p(`cosmic-swingset-begin-block: ${entry.blockHeight} ${entry.blockTime}`);
  }

  function handleCosmicSwingsetEndBlockStart(entry) {
    cosmicSwingsetEndBlockStartTime = entry.time;
    // prettier-ignore
    if (entry.blockTime !== cosmicSwingsetBlockTime) {
      p(`cosmic-swingset-end-block-start time ${entry.blockTime} doesn't match cosmic-swingset-begin-block time ${cosmicSwingsetBlockTime}`);
    } else if (entry.blockHeight !== cosmicSwingsetBlockHeight) {
      p(`cosmic-swingset-end-block-start height ${entry.blockHeight} doesn't match cosmic-swingset-begin-block height ${cosmicSwingsetBlockHeight}`);
    } else {
      p(`cosmic-swingset-end-block-start`);
    }
  }

  function handleCosmicSwingsetEndBlockFinish(entry) {
    // prettier-ignore
    if (entry.blockTime !== cosmicSwingsetBlockTime) {
      p(`cosmic-swingset-end-block-finish time ${entry.blockTime} doesn't match cosmic-swingset-begin-block time ${cosmicSwingsetBlockTime}`);
    } else if (entry.blockHeight !== cosmicSwingsetBlockHeight) {
      p(`cosmic-swingset-end-block-finish height ${entry.blockHeight} doesn't match cosmic-swingset-begin-block height ${cosmicSwingsetBlockHeight}`);
    } else {
      p(`cosmic-swingset-end-block:  ${entry.blockHeight} ${entry.blockTime} ${ptime(cosmicSwingsetEndBlockStartTime - cosmicSwingsetBeginBlockTime)}+${ptime(entry.time - cosmicSwingsetEndBlockStartTime)}`);
    }
  }

  function handleCosmicSwingsetCommitBlockStart(entry) {
    cosmicSwingsetCommitBlockStartTime = entry.time;
    // prettier-ignore
    if (entry.blockTime !== cosmicSwingsetBlockTime) {
      p(`cosmic-swingset-commit-block-start time ${entry.blockTime} doesn't match cosmic-swingset-begin-block time ${cosmicSwingsetBlockTime}`);
    } else if (entry.blockHeight !== cosmicSwingsetBlockHeight) {
      p(`cosmic-swingset-commit-block-start height ${entry.blockHeight} doesn't match cosmic-swingset-begin-block height ${cosmicSwingsetBlockHeight}`);
    } else {
      p(`cosmic-swingset-commit-block-start`);
    }
  }

  function handleCosmicSwingsetAfterCommitStats(_entry) {
    p(`cosmic-swingset-after-commit-stats`);
  }

  function handleCosmicSwingsetCommitBlockFinish(entry) {
    // prettier-ignore
    if (entry.blockTime !== cosmicSwingsetBlockTime) {
      p(`cosmic-swingset-commit-block-finish time ${entry.blockTime} doesn't match cosmic-swingset-begin-block time ${cosmicSwingsetBlockTime}`);
    } else if (entry.blockHeight !== cosmicSwingsetBlockHeight) {
      p(`cosmic-swingset-commit-block-finish height ${entry.blockHeight} doesn't match cosmic-swingset-begin-block height ${cosmicSwingsetBlockHeight}`);
    } else {
      p(`cosmic-swingset-commit-block:  ${entry.blockHeight} ${entry.blockTime} ${cosmicSwingsetCommitBlockStartTime - cosmicSwingsetBeginBlockTime}+${ptime(entry.time - cosmicSwingsetCommitBlockStartTime)}`);
    }
  }

  function handleCosmicSwingsetBridgeInbound(entry) {
    p(`cosmic-swingset-bridge-inbound: ${entry.source}`);
  }

  function handleCosmicSwingsetDeliverInbound(entry) {
    p(`cosmic-swingset-deliver-inbound: ${entry.count} ${entry.sender}`);
  }

  function handleSyscall(entry) {
    syscallStartTime = entry.time;
    crankSyscallCount += 1;
    currentSyscallString = doSyscall(kernelSpace ? entry.ksc : entry.vsc);
  }

  function handleSyscallResult(entry) {
    const syscallTime = entry.time - syscallStartTime;
    crankTotalSyscallTime += syscallTime;
    const [status, value] = kernelSpace ? entry.ksr : entry.vsr;
    const tag = terse ? 'result' : `syscall-result ${currentSyscallName}`;
    if (status !== 'ok') {
      p(`${tag}: ${status} ${value}`);
    }
    let toPrint;
    switch (currentSyscallName) {
      case 'exit':
      case 'resolve':
      case 'send':
      case 'dropImports':
      case 'retireExports':
      case 'retireImports':
        if (value !== null) {
          toPrint = `${currentSyscallString}: unexpected result ${value}`;
        } else {
          toPrint = currentSyscallString;
        }
        break;
      case 'subscribe':
        if (value !== null) {
          toPrint = `${currentSyscallString}: unexpected result ${value}`;
        } else if (!argv.nonoise) {
          toPrint = currentSyscallString;
        }
        break;
      case 'vatstoreDelete':
      case 'vatstoreSet':
        if (value !== null) {
          toPrint = `${currentSyscallString}: unexpected result ${value}`;
        } else if (!argv.vatstore) {
          toPrint = currentSyscallString;
        }
        break;
      case 'invoke':
        toPrint = `${currentSyscallString}: ${pdata(value)}`;
        break;
      case 'vatstoreGet':
      case 'vatstoreGetNextKey':
        if (!argv.novatstore) {
          toPrint = `${currentSyscallString} : '${value}'`;
        }
        break;
      default:
        toPrint = `syscall-result missing start of syscall`;
        break;
    }
    if (toPrint) {
      if (argv.timing) {
        p(`${toPrint} (${ptime(syscallTime)})`);
      } else {
        p(toPrint);
      }
    }
  }

  function handleConsole(entry) {
    const { state, level, args } = entry;
    const tag = terse ? level : `console ${level} (${state})`;
    p(`${tag}: ${args.join(' ')}`);
  }

  function handleCList(entry) {
    currentVat = currentVat || entry.vatID;
    if (argv.clist && !argv.nonoise) {
      const { mode, vatID, kobj, vobj } = entry;
      const tag = terse ? mode : `clist ${mode}`;
      p(`${tag}: ${vatID}:${pref(vobj, false)} :: ${pref(kobj, true)}`);
    }
  }

  function handleTerminate(entry) {
    const { shouldReject, info } = entry;
    const reject = terse ? '!' : ' reject';
    const noReject = terse ? '' : ' no reject';
    const suffix = shouldReject ? reject : noReject;
    p(`terminate${suffix}: ${pdata(info)}`);
  }
}
