import { RuleTester } from 'eslint';
import rule from '../../src/rules/dollar-sign.js';

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
});

ruleTester.run('dollar-sign', rule, {
  valid: [
    { code: 'const myVar = 1;' },
    { code: 'function test() { return true; }' },
  ],
  invalid: [
    {
      code: 'const my$Var = 1;',
      errors: [{ message: 'Avoid using $ in identifiers' }],
    },
  ],
});
