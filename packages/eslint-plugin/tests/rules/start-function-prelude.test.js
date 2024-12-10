import { RuleTester } from 'eslint';
import rule from '../../src/rules/start-function-prelude.js';

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
});

ruleTester.run('start-function-prelude', rule, {
  valid: [
    {
      code: `
        export async function start() {
          //#region synchronous prelude
          const x = 1;
          const y = 2;
          //#endregion
          
          await something();
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        export async function start() {
          await something();
          //#region synchronous prelude
          const x = 1;
          //#endregion
        }
      `,
      errors: [
        {
          message:
            'await expressions are not allowed before or within the synchronous prelude region',
        },
      ],
    },
    {
      code: `
        export async function start() {
          const x = 1;
        }
      `,
      errors: [
        {
          message:
            'start function must contain #region synchronous prelude and #endregion markers',
        },
      ],
    },
    {
      code: `
        export async function start() {
          //#region synchronous prelude
          await something();
          const x = 1;
          //#endregion
        }
      `,
      errors: [
        {
          message:
            'await expressions are not allowed before or within the synchronous prelude region',
        },
      ],
    },
  ],
});
