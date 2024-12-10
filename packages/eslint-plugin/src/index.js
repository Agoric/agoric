import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const pkg = JSON.parse(
  fs.readFileSync(
    new URL('../package.json', import.meta.url),
    'utf8',
  ),
);

// Import rules
import dollarSign from './rules/dollar-sign.js';

const plugin = {
  meta: {
    name: pkg.name,
    version: pkg.version,
  },
  
  // Rule definitions
  rules: {
    'dollar-sign': dollarSign,
  },

  // Recommended config
  configs: {
    recommended: [{
      plugins: {
        '@agoric': plugin,
      },
      rules: {
        '@agoric/dollar-sign': 'error',
      },
    }],
  },
};

export default plugin;
