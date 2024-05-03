import test from 'ava';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import url from 'url';

const dirname = url.fileURLToPath(new URL('.', import.meta.url));

function rimraf(dirPath) {
  try {
    // Node.js 16.8.0 warns:
    // In future versions of Node.js, fs.rmdir(path, { recursive: true }) will
    // be removed. Use fs.rm(path, { recursive: true }) instead
    if (fs.rmSync) {
      fs.rmSync(dirPath, { recursive: true });
    } else {
      fs.rmdirSync(dirPath, { recursive: true });
    }
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }
}

/**
 * @param {import("ava").ExecutionContext<unknown>} t
 * @param {{flags: string, dbdir?: string}} input
 */
async function innerTest(t, { flags, dbdir }) {
  await new Promise(resolve => {
    const appDir = 'demo/encouragementBot';
    if (dbdir) {
      dbdir = `${appDir}/${dbdir}`;
      flags += ` --dbdir ${dbdir}`;
    }
    const proc = spawn(`node bin/runner ${flags} run ${appDir}`, {
      cwd: path.resolve(dirname, '..'),
      shell: true,
      stdio: ['ignore', 'pipe', 'inherit'],
    });
    let output = '';
    proc.stdout.addListener('data', data => {
      output += data;
    });
    proc.addListener('exit', code => {
      t.log(output);
      t.is(code, 0, 'exits successfully');
      const uMsg = 'user vat is happy';
      t.true(output.includes(`\n${uMsg}\n`), `'${uMsg}' not in '${output}'`);
      const bMsg = 'bot vat is happy';
      t.true(output.includes(`\n${bMsg}\n`), `'${bMsg}' not in '${output}'`);
      resolve(undefined);
      if (dbdir) {
        rimraf(dbdir);
      }
    });
  });
}

test('run encouragmentBot demo with memdb', innerTest, {
  flags: '--memdb',
});

test('run encouragmentBot demo with sqlite', innerTest, {
  flags: '--sqlite',
  dbdir: 'sqlitetest',
});

test('run encouragmentBot demo with default', innerTest, {
  flags: '',
  dbdir: 'defaulttest',
});

test('run encouragmentBot demo with indirectly loaded vats', innerTest, {
  flags: '--indirect',
  dbdir: 'indirecttest',
});
