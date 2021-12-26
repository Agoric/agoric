// @ts-check

// eslint-disable-next-line import/no-extraneous-dependencies
import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { AssetKind } from '@agoric/ertp';
import { cleanProposal } from '../../src/cleanProposal.js';
import { setup } from './setupBasicMints.js';
import buildManualTimer from '../../tools/manualTimer.js';

test('cleanProposal test', t => {
  const { moola, simoleans } = setup();

  const proposal = harden({
    give: { Asset: simoleans(1n) },
    want: { Price: moola(3n) },
  });

  const expected = harden({
    give: { Asset: simoleans(1n) },
    want: { Price: moola(3n) },
    exit: { onDemand: null },
  });

  const getAssetKind = _brand => AssetKind.NAT;

  const actual = cleanProposal(proposal, getAssetKind);

  t.deepEqual(actual, expected);
});

test('cleanProposal - all empty', t => {
  const proposal = harden({
    give: harden({}),
    want: harden({}),
    exit: { waived: null },
  });

  const expected = harden({
    give: harden({}),
    want: harden({}),
    exit: { waived: null },
  });

  const getAssetKind = _brand => AssetKind.NAT;

  // cleanProposal no longer fills in empty keywords
  t.deepEqual(cleanProposal(proposal, getAssetKind), expected);
});

test('cleanProposal - repeated brands', t => {
  t.plan(3);
  const { moola, simoleans } = setup();
  const timer = buildManualTimer(console.log);

  const proposal = harden({
    want: { Asset2: simoleans(1n) },
    give: { Price2: moola(3n) },
    exit: { afterDeadline: { timer, deadline: 100n } },
  });

  const expected = harden({
    want: { Asset2: simoleans(1n) },
    give: { Price2: moola(3n) },
    exit: { afterDeadline: { timer, deadline: 100n } },
  });

  const getAssetKind = _brand => AssetKind.NAT;

  // cleanProposal no longer fills in empty keywords
  const actual = cleanProposal(proposal, getAssetKind);
  t.deepEqual(actual.want, expected.want);
  t.deepEqual(actual.give, expected.give);
  t.deepEqual(actual.exit, expected.exit);
});

test('cleanProposal - wrong assetKind', t => {
  const { moola, simoleans } = setup();
  const timer = buildManualTimer(console.log);

  const proposal = harden({
    want: { Asset2: simoleans(1n) },
    give: { Price2: moola(3n) },
    exit: { afterDeadline: { timer, deadline: 100n } },
  });

  const getAssetKind = _brand => AssetKind.SET;

  t.throws(() => cleanProposal(proposal, getAssetKind), {
    message: /The amount .* did not have the assetKind of the brand .*/,
  });
});

test('cleanProposal - other wrong stuff', t => {
  const { moola, simoleans } = setup();
  const timer = buildManualTimer(console.log);

  const proposeBad = (proposal, assetKind, message) =>
    t.throws(() => cleanProposal(harden(proposal), () => assetKind), {
      message,
    });

  proposeBad(
    { want: { lowercase: simoleans(1n) } },
    'nat',
    /keyword "lowercase" must be an ascii identifier starting with upper case./,
  );
  proposeBad(
    { give: { lowercase: simoleans(1n) } },
    'nat',
    /keyword "lowercase" must be an ascii identifier starting with upper case./,
  );
  proposeBad(
    { want: { 'Not Ident': simoleans(1n) } },
    'nat',
    /keyword "Not Ident" must be an ascii identifier starting with upper case./,
  );
  proposeBad(
    { what: { 'Not Ident': simoleans(1n) } },
    'nat',
    /key "what" was not one of the expected keys \["want","give","exit"\]/,
  );
  proposeBad(
    { [Symbol.for('what')]: { 'Not Ident': simoleans(1n) } },
    'nat',
    /cannot serialize Remotables with non-methods like "Symbol\(what\)" in {}/,
  );
  proposeBad(
    { want: { [Symbol.for('S')]: simoleans(1n) } },
    'nat',
    /cannot serialize Remotables with non-methods like "Symbol\(S\)" in {}/,
  );
  proposeBad(
    { exit: { afterDeadline: { timer, deadline: 3 } } },
    'nat',
    /deadline must be a Nat BigInt/,
  );
  proposeBad(
    { exit: { afterDeadline: { timer, deadline: -3n } } },
    'nat',
    /deadline must be a Nat BigInt/,
  );
  proposeBad({ exit: {} }, 'nat', /exit {} should only have one key/);
  proposeBad(
    { exit: { onDemand: null, waived: null } },
    'nat',
    /exit {"onDemand":null,"waived":null} should only have one key/,
  );
  proposeBad(
    {
      want: { Asset: simoleans(1n) },
      give: { Asset: moola(3n) },
    },
    'nat',
    /a keyword cannot be in both 'want' and 'give'/,
  );
});
