// @ts-check
import '@endo/init';
import { Far } from '@endo/far';

import test from 'ava';
import { testProp, fc } from '@fast-check/ava';
import { makeAssetFormatters } from '../src/lib/format.js';

const { values, fromEntries } = Object;

/** @type {Record<string, import('../src/lib/boardClient').VBankAssetDetail>} */
const someTokens = Object.fromEntries(
  [
    { denom: 'ubld', name: 'BLD', decimals: 6 },
    { denom: 'uist', name: 'IST', decimals: 6 },
    { denom: 'ibc/toyatom', name: 'ATOM', decimals: 6 },
    { denom: 'ibc/toystar', name: 'STAR', decimals: 6 },
    { denom: 'ibc/toydaiwei', name: 'DAI', decimals: 18 },
  ].map(info => [
    info.name,
    {
      denom: info.denom,
      issuerName: info.name,
      proposedName: info.name,
      displayInfo: { assetKind: 'nat', decimalPlaces: info.decimals },
      brand: /** @type {Brand<'nat'>} */ (Far(`${info.name} Brand`)),
      issuer: /** @type {Issuer<'nat'>} */ (Far(`${info.name} Issuer`)),
    },
  ]),
);

const optToken = fc.constantFrom(...Object.values(someTokens), undefined);

/** @type {import('fast-check').Arbitrary<DisplayInfo>} */
const arbNatDisplayInfo = fc.record({
  assetKind: fc.constant('nat'),
  decimalPlaces: fc.oneof(fc.nat({ max: 24 }), fc.constant(undefined)),
});

const arbKeyword = fc
  .string({ maxLength: 32 })
  .filter(s => /^[A-Z][a-zA-Z0-9_]+$/.test(s));

/** @type {import('fast-check').Arbitrary<Brand<'nat'>>} */
const arbNatBrand = arbKeyword.map(kw => Far(`${kw} Brand`));

/** @type {import('fast-check').Arbitrary<Issuer<'nat'>>} */
const arbNatIssuer = arbKeyword.map(kw => Far(`${kw} Issuer`));

/** @type {import('fast-check').Arbitrary<import('../src/lib/boardClient').VBankAssetDetail>} */
const arbAsset = optToken.chain(tok =>
  fc.record({
    denom: tok ? fc.constant(tok.denom) : fc.string(),
    brand: tok ? fc.constant(tok.brand) : arbNatBrand,
    issuer: tok ? fc.constant(tok.issuer) : arbNatIssuer,
    displayInfo: tok ? fc.constant(tok.displayInfo) : arbNatDisplayInfo,
    issuerName: tok ? fc.constant(tok.issuerName) : arbKeyword,
    proposedName: tok
      ? fc.constant(tok.proposedName)
      : fc.string({ maxLength: 100 }),
  }),
);

const arbAssets = fc
  .array(arbAsset, { minLength: 2 })
  .map(assets => fromEntries(assets.map(a => [a.issuerName, a])));

testProp(
  'makeAssetFormatters handles all nat amounts, ratios',
  // @ts-expect-error something odd about fc.ArbitraryTuple
  [
    fc.record({
      assets: arbAssets,
      nb: fc.nat(),
      db: fc.nat(),
      nv: fc.nat().map(BigInt),
      dv: fc
        .nat()
        .filter(n => n > 0)
        .map(BigInt),
    }),
  ],
  (t, { assets, nb, db, nv, dv }) => {
    const fmt = makeAssetFormatters(assets);

    const pickBrand = n => values(assets)[n % values(assets).length].brand;
    const ratio = {
      numerator: { brand: pickBrand(nb), value: nv },
      denominator: { brand: pickBrand(db), value: dv },
    };

    const top = fmt.amount(ratio.numerator);
    t.regex(top, /^[0-9]+(\.[0-9]+)? \w+$/);

    fc.pre(fmt.hasBrand(ratio.denominator.brand));
    const bot = fmt.amount(ratio.denominator);
    const price = fmt.price(ratio);
    const rate =
      ratio.numerator.brand === ratio.denominator.brand
        ? fmt.rate(ratio)
        : 'N/A';
    'skip this log' ||
      t.log({
        _1_top: top,
        _2_bot: bot,
        price,
        rate,
        assets: Object.keys(assets),
      });
    if (/e[+-]/.test(price)) {
      return;
    }
    t.regex(price, /^[0-9]+(\.[0-9]+)?( \w+\/\w+)?$/);
  },
);

test.failing('format price > 1e20', t => {
  const fmt = makeAssetFormatters(someTokens);
  const { DAI, BLD } = someTokens;
  const ratio = {
    numerator: { brand: DAI.brand, value: 1000000000n },
    denominator: { brand: BLD.brand, value: 1n },
  };
  const price = fmt.price(ratio);
  t.regex(price, /^[0-9]+(\.[0-9]+)?( \w+\/\w+)?$/);
});

test.todo('prices truncate at 4 decimal places');
