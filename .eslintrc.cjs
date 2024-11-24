/* eslint-env node */

const deprecatedForLoanContract = [
  ['currency', 'brand, asset or another descriptor'],
  ['blacklist', 'denylist'],
  ['whitelist', 'allowlist'],
  ['RUN', 'IST', '/RUN/'],
];
const allDeprecated = [...deprecatedForLoanContract, ['loan', 'debt']];

const deprecatedTerminology = Object.fromEntries(
  Object.entries({
    all: allDeprecated,
    loanContract: deprecatedForLoanContract,
  }).map(([category, deprecated]) => [
    category,
    deprecated.flatMap(([bad, good, badRgx = `/${bad}/i`]) =>
      [
        ['Literal', 'value'],
        ['TemplateElement', 'value.raw'],
        ['Identifier', 'name'],
      ].map(([selectorType, field]) => ({
        selector: `${selectorType}[${field}=${badRgx}]`,
        message: `Use '${good}' instead of deprecated '${bad}'`,
      })),
    ),
  ]),
);

/**
 * Rules for code that crosses an asyncFlow membrane.
 */
const resumable = [
  {
    // all async function expressions, except `onOpen` and `onClose` when they are properties of `connectionHandler`
    selector:
      'FunctionExpression[async=true]:not(Property[key.name="connectionHandler"] > ObjectExpression > Property[key.name=/^(onOpen|onClose)$/] > FunctionExpression[async=true])',
    message: 'Non-immediate functions must return vows, not promises',
  },
  {
    selector: 'ArrowFunctionExpression[async=true]',
    message: 'Non-immediate functions must return vows, not promises',
  },
  {
    selector: "Identifier[name='callWhen']",
    message:
      'callWhen wraps the function in a promise; instead immediately return a vow',
  },
  {
    selector: "Identifier[name='heapVowE']",
    message:
      'heapVowE shortens vows to promises; instead use `E` from `@endo/far` with `watch` from durable vowTools',
  },
  {
    selector: "Identifier[name='heapVowTools']",
    message:
      'heapVowTools are not durable; instead use `prepareVowTools` with a durable zone',
  },
];

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    projectService: true,
    sourceType: 'module',
    project: [
      './packages/*/tsconfig.json',
      './packages/*/tsconfig.json',
      './packages/wallet/*/tsconfig.json',
      './tsconfig.json',
    ],
    tsconfigRootDir: __dirname,
    extraFileExtensions: ['.cjs'],
  },
  plugins: ['@typescript-eslint', 'prettier', 'require-extensions'],
  extends: [
    '@agoric',
    'plugin:ava/recommended',
    'plugin:require-extensions/recommended',
  ],
  // XXX false positive: Unused eslint-disable directive (no problems were reported from 'max-len')
  reportUnusedDisableDirectives: true,

  rules: {
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        // TODO tighten to 'allow-with-description' (42 unexplained atm)
        'ts-expect-error': false,
        // TODO make this error (start with `src` sans codegen)
        'ts-nocheck': false,
      },
    ],
    '@typescript-eslint/no-floating-promises': 'error',
    // so that floating-promises can be explicitly permitted with void operator
    'no-void': ['error', { allowAsStatement: true }],

    // We allow disabled tests in master
    'ava/no-skip-test': 'off',
    // Contrary to recommendation https://github.com/avajs/ava/blob/main/docs/recipes/typescript.md#typing-tcontext
    'ava/use-test': 'off',

    // The rule is “safe await separator" which implements the architectural
    // goal of “clearly separate an async function's synchronous prelude from
    // the part that runs in a future turn”. That is our architectural rule. It
    // can be trivially satisfied by inserting a non-nested `await null` in an
    // appropriate place to ensure the rest of the async function runs in a
    // future turn.  “sometimes synchronous" is a bug farm for particularly
    // pernicious bugs in which you can combine two correct pieces of code to
    // have emergent incorrect behavior.  It’s absolutely critical for shared
    // service code. That means contracts, but it also means kernel components
    // that are used by multiple clients. So we enable it throughout the repo
    // and aim for no exceptions.
    //
    // The default is 'warn', but we want to enforce 'error'.
    '@jessie.js/safe-await-separator': 'error',

    'jsdoc/check-tag-names': [
      'error',
      {
        // TypeDoc adds tags not otherwise known to JSDoc
        // https://typedoc.org/guides/tags/
        definedTags: [
          'alpha',
          'beta',
          'category',
          'categoryDescription',
          'defaultValue',
          'document',
          'group',
          'groupDescription',
          'internal',
          'privateRemarks',
          'remarks',
        ],
      },
    ],

    // CI has a separate format check but keep this warn to maintain that "eslint --fix" prettifies
    // UNTIL https://github.com/Agoric/agoric-sdk/issues/4339
    'prettier/prettier': 'warn',

    // Not a risk with our coding style
    'no-use-before-define': 'off',
  },
  settings: {
    jsdoc: {
      mode: 'typescript',
    },
  },
  ignorePatterns: [
    'coverage/**',
    '**/bundles/**',
    '**/output/**',
    'bundle-*',
    'dist/**',
    'exported.*',
    'types-*',
    'types.*',
    'examples/**',
    'test262/**',
    '*.html',
    'ava*.config.js',
  ],
  overrides: [
    {
      // Tighten rules for exported code.
      files: [
        'packages/*/src/**/*.js',
        'packages/*/tools/**/*.js',
        'packages/*/*.js',
        'packages/wallet/api/src/**/*.js',
      ],
      rules: {
        'no-restricted-syntax': ['error', ...deprecatedTerminology.all],
      },
    },
    {
      files: [
        'packages/**/demo/**/*.js',
        'packages/*/test/**/*.*s',
        'packages/*/test/**/*.test.*s',
        'packages/wallet/api/test/**/*.js',
      ],
      rules: {
        // sometimes used for organizing logic
        'no-lone-blocks': 'off',

        // NOTE: This rule is enabled for the repository in general.  We turn it
        // off for test code for now.
        '@jessie.js/safe-await-separator': 'off',

        // Like `'ava/no-only-test`, but works with @endo/ses-ava
        'no-restricted-properties': [
          'error',
          {
            object: 'test',
            property: 'only',
            message:
              'Do not commit .only tests - they prevent other tests from running',
          },
        ],
      },
    },
    {
      // These tests use EV() instead of E(), which are easy to confuse.
      // Help by erroring when E() packages are imported.
      files: ['packages/boot/test/**/*.test.*s'],
      rules: {
        'no-restricted-imports': [
          'error',
          { paths: ['@endo/eventual-send', '@endo/far'] },
        ],
      },
    },
    {
      // Modules with exports that must be resumable
      files: ['packages/orchestration/src/exos/**'],
      rules: {
        'no-restricted-syntax': ['error', ...resumable],
      },
    },
    {
      // Allow "loan" contracts to mention the word "loan".
      files: ['packages/zoe/src/contracts/loan/*.js'],
      rules: {
        'no-restricted-syntax': [
          'error',
          ...deprecatedTerminology.loanContract,
        ],
      },
    },
    {
      files: ['*.ts'],
      rules: {
        'jsdoc/require-param-type': 'off',
        // TS has this covered and eslint gets it wrong
        'no-undef': 'off',
      },
    },
    {
      files: ['*.d.ts'],
      rules: {
        // Linter confuses the type declaration with value declaration
        'no-redeclare': 'off',
      },
    },
    {
      // disable type-aware linting in HTML
      files: ['*.html'],
      parserOptions: {
        project: false,
      },
    },
    {
      files: ['a3p-integration/**'],
      extends: ['plugin:@typescript-eslint/disable-type-checked'],
      parserOptions: {
        EXPERIMENTAL_useProjectService: false,
        project: false,
      },
      rules: {
        '@jessie.js/safe-await-separator': 'off',
      },
    },
    {
      // Types files have no promises to lint and that linter chokes on the .d.ts twin.
      // Maybe due to https://github.com/typescript-eslint/typescript-eslint/issues/7435
      files: ['types*.js'],
      rules: {
        // Disabled to prevent:
        //         Error: Error while loading rule '@typescript-eslint/no-floating-promises': You have used a rule which requires parserServices to be generated. You must therefore provide a value for the "parserOptions.project" property for @typescript-eslint/parser.
        // Occurred while linting ~agoric-sdk/packages/vats/src/core/types.js
        //     at Object.getParserServices (~agoric-sdk/node_modules/@typescript-eslint/utils/dist/eslint-utils/getParserServices.js:24:15)
        //     at create (~agoric-sdk/node_modules/@typescript-eslint/eslint-plugin/dist/rules/no-floating-promises.js:77:31)
        //     at Object.create (~agoric-sdk/node_modules/@typescript-eslint/utils/dist/eslint-utils/RuleCreator.js:38:20)
        '@typescript-eslint/no-floating-promises': 'off',
      },
    },
  ],
};
