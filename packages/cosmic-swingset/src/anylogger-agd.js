/* eslint-env node */
import {
  getEnvironmentOptionsList,
  getEnvironmentOption,
} from '@endo/env-options';
import anylogger from 'anylogger';
import util from 'util';

//#region Golang zerolog-like output affordances
let logFormat = 'plain';
export const setLogFormat = format => {
  logFormat = format;
};

let shortDateTimeFormatter;
const plainTime = d => {
  if (!shortDateTimeFormatter) {
    shortDateTimeFormatter = new Intl.DateTimeFormat(undefined, {
      timeStyle: 'short',
    });
  }
  const shortTime = shortDateTimeFormatter.format(d).replace(/(\d) /, '$1');
  return shortTime;
};

const levelToPlainLevel = {
  error: 'ERR',
  warn: 'WRN',
  info: 'INF',
  log: 'LOG',
  debug: 'DBG',
};

/**
 * @param {Date} d
 * @returns {string}
 */
const jsonTime = d => {
  const pad2 = n => (n < 10 ? `0${n}` : `${n}`);
  const isoDate = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const isoTime = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  const tzo = d.getTimezoneOffset();
  const isoTz = `${tzo < 0 ? '+' : '-'}${pad2(Math.floor(Math.abs(tzo) / 60))}:${pad2(Math.abs(tzo) % 60)}`;
  return `${isoDate}T${isoTime}${isoTz}`;
};

//#endregion

const isVatLogNameColon = nameColon =>
  ['SwingSet:ls:', 'SwingSet:vat:'].some(sel => nameColon.startsWith(sel));

// Turn on debugging output with DEBUG=agoric or DEBUG=agoric:${level}
const DEBUG_LIST = getEnvironmentOptionsList('DEBUG');

let selectedLevel =
  DEBUG_LIST.length || getEnvironmentOption('DEBUG', 'unset') === 'unset'
    ? 'log'
    : 'info';
for (const selector of DEBUG_LIST) {
  const parts = selector.split(':');
  if (parts[0] !== 'agoric') {
    continue;
  }
  if (parts.length > 1) {
    selectedLevel = parts[1];
  } else {
    selectedLevel = 'debug';
  }
}
const selectedCode = anylogger.levels[selectedLevel];
const globalCode = selectedCode === undefined ? -Infinity : selectedCode;

const oldExt = anylogger.ext;
anylogger.ext = logger => {
  const l = oldExt(logger);
  l.enabledFor = lvl => globalCode >= anylogger.levels[lvl];

  const prefix = l.name.replace(/:/g, ': ');

  const nameColon = `${l.name}:`;
  const logBelongsToVat = isVatLogNameColon(nameColon);

  // If this is a vat log, then it is enabled by a selector in DEBUG_LIST.
  const logMatchesSelector =
    !logBelongsToVat ||
    DEBUG_LIST.some(selector => {
      const selectorColon = `${selector}:`;
      return nameColon.startsWith(selectorColon);
    });

  for (const [level, code] of Object.entries(anylogger.levels)) {
    if (logMatchesSelector && globalCode >= code) {
      // Enable the printing with a prefix.
      const doLog = l[level];
      if (doLog) {
        const plainLevel = levelToPlainLevel[level];
        l[level] = (...args) => {
          // Add a timestamp.
          const now = new Date();
          switch (logFormat) {
            case 'plain': {
              doLog(`${plainTime(now)} ${plainLevel} ${prefix}:`, ...args);
              break;
            }

            case 'json':
            default: {
              const message = [`${prefix}:`, ...args]
                .map(a => (typeof a === 'string' ? a : util.inspect(a)))
                .join(' ');
              doLog(JSON.stringify({ level, time: jsonTime(now), message }));
              break;
            }
          }
        };
      } else {
        l[level] = () => {};
      }
    } else {
      // Disable printing.
      l[level] = () => {};
    }
  }
  return l;
};
