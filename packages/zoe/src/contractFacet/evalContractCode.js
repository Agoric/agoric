// @jessie-check

// NB: cannot import, breaks bundle building
/* global globalThis */

import { importBundle } from '@endo/import-bundle';
import { handlePWarning } from '../handleWarning.js';

const evalContractBundle = async (bundle, additionalEndowments = {}) => {
  // Make the console more verbose.
  const louderConsole = {
    ...console,
    log: console.info,
  };

  const defaultEndowments = {
    console: louderConsole,
    // See https://github.com/Agoric/agoric-sdk/issues/9515
    assert: globalThis.assert,
    VatData: globalThis.VatData,
  };

  const fullEndowments = Object.create(null, {
    ...Object.getOwnPropertyDescriptors(defaultEndowments),
    ...Object.getOwnPropertyDescriptors(additionalEndowments),
  });

  // Evaluate the export function, and use the resulting
  // module namespace as our installation.

  const installation = importBundle(bundle, {
    endowments: fullEndowments,
  });
  handlePWarning(installation);
  return installation;
};

export { evalContractBundle };
