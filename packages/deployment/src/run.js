import { Writable } from 'stream';

import { assert, details as X } from '@agoric/assert';

const { freeze } = Object;

export const shellMetaRegexp = /(\s|[[\]'"\\`$;*?{}])/;
export const shellEscape = arg =>
  arg.match(shellMetaRegexp) ? `"${arg.replace(/(["\\])/g, '\\$1')}"` : arg;

export const running = (process, { exec, spawn }) => {
  let SETUP_SILENT = false;
  const it = freeze({
    setSilent: val => {
      SETUP_SILENT = val;
    },
    exec: cmd => {
      const cp = exec(cmd);
      const promise = new Promise((resolve, reject) => {
        cp.addListener('error', reject);
        cp.addListener('exit', code => {
          resolve(code);
        });
      });
      promise.process = cp;
      return promise;
    },

    stdout: process.stdout,
    getStdout: async cmd => {
      const cp = it.exec(cmd);
      let outbuf = '';
      const stdout = new Writable({
        write(data, encoding, callback) {
          outbuf += String(data);
          callback();
        },
      });
      cp.process.stdout.pipe(stdout);
      cp.process.stderr.pipe(process.stderr);

      const code = await cp;
      return { stdout: outbuf, code };
    },

    backtick: async cmd => {
      const ret = await it.getStdout(cmd);
      return ret.stdout;
    },

    needBacktick: async cmd => {
      const ret = await it.getStdout(cmd);
      assert(
        ret.code === 0,
        X`Unexpected ${JSON.stringify(cmd)} exit code: ${ret.code}`,
      );
      return ret.stdout;
    },
    cwd: () => process.cwd(),
    chdir: path => {
      if (!SETUP_SILENT) {
        console.error('$ cd', shellEscape(path));
      }
      return new Promise(resolve => {
        process.chdir(path);
        resolve();
      });
    },

    // Dah-doo-run-run-run, dah-doo-run-run.
    doRun: (cmd, readable, writeCb) => {
      if (!SETUP_SILENT) {
        console.error('$', ...cmd.map(shellEscape));
      }
      const stdio = [
        readable ? 'pipe' : 'inherit',
        writeCb ? 'pipe' : 'inherit',
        'inherit',
      ];
      const proc = spawn(cmd[0], cmd.slice(1), { stdio });
      if (readable) {
        readable.pipe(proc.stdin);
      }
      if (writeCb) {
        const writable = new Writable({
          write(chunk, encoding, callback) {
            try {
              writeCb(chunk, encoding);
            } catch (e) {
              callback(e);
              return;
            }
            callback();
          },
        });
        proc.stdout.pipe(writable);
      }

      return new Promise((resolve, reject) => {
        proc.once('exit', resolve);
        proc.once('error', reject);
      });
    },

    needDoRun: async (cmd, ...opts) => {
      const ret = await it.doRun(cmd, ...opts);
      assert.equal(ret, 0, X`Aborted with exit code ${ret}`);
      return ret;
    },
  });
  return it;
};
