import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const pkg = JSON.parse(
  fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);

// Import rules
import dollarSign from './rules/dollar-sign.js';
import startFunctionPrelude from './rules/start-function-prelude.js';

const plugin = {
  meta: {
    name: pkg.name,
    version: pkg.version,
  },

  // Rule definitions
  rules: {
    'dollar-sign': dollarSign,
    'start-function-prelude': startFunctionPrelude,
  },

  // Recommended config
  configs: {
    recommended: [
      {
        plugins: {
          // @ts-expect-error used before declaration
          '@agoric': plugin,
        },
        rules: {
          '@agoric/dollar-sign': 'error',
          '@agoric/start-function-prelude': 'error',
        },
      },
    ],
  },
};

export default plugin;
