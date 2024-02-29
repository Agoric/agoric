/* eslint-disable @jessie.js/safe-await-separator */
import { $, execaCommand } from 'execa';
import { BINARY } from './constants.js';

export const executeCommand = async (command, params, options = {}) => {
  const { stdout } = await execaCommand(
    `${command} ${params.join(' ')}`,
    options,
  );
  return stdout;
};

export const agd = {
  query: async (...params) => {
    const newParams = ['query', ...params, '-o json'];
    const data = await executeCommand(BINARY, newParams);
    return JSON.parse(data);
  },
  tx: async (...params) => {
    const newParams = ['tx', ...params, '-o json'];
    const data = await executeCommand(BINARY, newParams, { shell: true });
    return JSON.parse(data);
  },
  keys: async (...params) => {
    let newParams = ['keys', ...params];
    let shouldParse = true;

    if (params.includes('show')) {
      if (params.includes('-a') || params.includes('-address')) {
        shouldParse = false;
      }
    }

    if (shouldParse) {
      newParams = [...newParams, '--output json'];
    }

    const data = await executeCommand(BINARY, newParams, { input: 'Y' });
    if (!shouldParse) {
      return data;
    }

    return JSON.parse(data);
  },
  export: async (...params) => {
    const newParams = ['export', ...params];
    const data = await executeCommand(BINARY, newParams);
    return JSON.parse(data);
  },
};

export const agoric = {
  follow: async (...params) => {
    let newParams = ['follow', ...params];
    let parseJson = false;

    if (!params.includes('-o')) {
      newParams = [...newParams, '-o json'];
      parseJson = true;
    }
    const data = await executeCommand('agoric', newParams);

    if (parseJson) {
      return JSON.parse(data);
    }

    return data;
  },
  wallet: async (...params) => {
    const newParams = ['wallet', ...params];
    return executeCommand('agoric', newParams);
  },
  run: async (...params) => {
    const newParams = ['run', ...params];
    return executeCommand('agoric', newParams);
  },
};

export const { stdout: agopsLocation } = await $({
  shell: true,
  cwd: '/usr/src/agoric-sdk',
})`yarn bin agops`;

export const agops = {
  vaults: async (...params) => {
    const newParams = ['vaults', ...params];

    const result = await executeCommand(agopsLocation, newParams);

    if (params[0] === 'list') {
      if (result === '') return [];

      return result.split('\n');
    }

    return result;
  },
  ec: async (...params) => {
    const newParams = ['ec', ...params];
    return executeCommand(agopsLocation, newParams);
  },
  oracle: async (...params) => {
    const newParams = ['oracle', ...params];
    return executeCommand(agopsLocation, newParams);
  },
  perf: async (...params) => {
    const newParams = ['perf', ...params];
    return executeCommand(agopsLocation, newParams);
  },
  auctioneer: async (...params) => {
    const newParams = ['auctioneer', ...params];
    return executeCommand(agopsLocation, newParams);
  },
};

export const { stdout: bundleSourceLocation } = await $({
  shell: true,
  cwd: '/usr/src/agoric-sdk',
})`yarn bin bundle-source`;

/**
 * @param {string} filePath
 * @param {string} bundleName
 * @returns {Promise<string>} Returns the filepath of the bundle
 */
export const bundleSource = async (filePath, bundleName) => {
  const output =
    await $`${bundleSourceLocation} --cache-json /tmp ${filePath} ${bundleName}`;
  console.log(output.stderr);
  return `/tmp/bundle-${bundleName}.json`;
};
