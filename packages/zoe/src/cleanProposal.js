// @ts-check

import { assert, details as X, q } from '@agoric/assert';
import { AmountMath, getAssetKind } from '@agoric/ertp';
import { assertRecord } from '@endo/marshal';
import { assertKey, assertPattern, fit, isKey } from '@agoric/store';
import { ProposalShape } from './typeGuards.js';
import { arrayToObj } from './objArrayConversion.js';

import '../exported.js';
import './internal-types.js';

const { ownKeys } = Reflect;

const firstCapASCII = /^[A-Z][a-zA-Z0-9_$]*$/;

// We adopt simple requirements on keywords so that they do not accidentally
// conflict with existing property names.
// We require keywords to be strings, ascii identifiers beginning with an
// upper case letter, and distinct from the stringified form of any number.
//
// Of numbers, only NaN and Infinity, when stringified to a property name,
// produce an ascii identifier beginning with an upper case letter.
// With this rule, a computed indexing expression like `a[+i]` cannot
// lookup a keyword-named property no matter what `i` is.
export const assertKeywordName = keyword => {
  assert.typeof(keyword, 'string');
  assert(
    firstCapASCII.test(keyword),
    X`keyword ${q(
      keyword,
    )} must be an ascii identifier starting with upper case.`,
  );
  assert(
    keyword !== 'NaN' && keyword !== 'Infinity',
    X`keyword ${q(keyword)} must not be a number's name`,
  );
};

/**
 * @param {{ [name: string]: any }} uncleanKeywordRecord
 * @returns {string[]}
 */
export const cleanKeywords = uncleanKeywordRecord => {
  harden(uncleanKeywordRecord);
  assertRecord(uncleanKeywordRecord, 'keywordRecord');
  const keywords = ownKeys(uncleanKeywordRecord);

  // Assert all names are ascii identifiers starting with
  // an upper case letter.
  keywords.forEach(assertKeywordName);

  return /** @type {string[]} */ (keywords);
};

export const coerceAmountPatternKeywordRecord = (
  allegedAmountKeywordRecord,
  getAssetKindByBrand,
) => {
  const keywords = cleanKeywords(allegedAmountKeywordRecord);

  const amounts = Object.values(allegedAmountKeywordRecord);
  // Check that each value can be coerced using the AmountMath
  // indicated by brand. `AmountMath.coerce` throws if coercion fails.
  const coercedAmounts = amounts.map(amount => {
    if (isKey(amount)) {
      const brandAssetKind = getAssetKindByBrand(amount.brand);
      const assetKind = getAssetKind(amount);
      // TODO: replace this assertion with a check of the assetKind
      // property on the brand, when that exists.
      assert(
        assetKind === brandAssetKind,
        X`The amount ${amount} did not have the assetKind of the brand ${brandAssetKind}`,
      );
      return AmountMath.coerce(amount.brand, amount);
    } else {
      assertPattern(amount);
      return amount;
    }
  });

  // Recreate the amountKeywordRecord with coercedAmounts.
  return harden(arrayToObj(coercedAmounts, keywords));
};

export const coerceAmountKeywordRecord = (
  allegedAmountKeywordRecord,
  getAssetKindByBrand,
) => {
  const result = coerceAmountPatternKeywordRecord(
    allegedAmountKeywordRecord,
    getAssetKindByBrand,
  );
  assertKey(result);
  return result;
};

/**
 * Just checks residual issues after matching ProposalShape. Only known residual
 * issue is verifying that it only has one of the optional properties.
 *
 * @param {ExitRule} exit
 */
const assertExit = exit =>
  assert(ownKeys(exit).length === 1, X`exit ${exit} should only have one key`);

/**
 * Check that keyword is not in both 'want' and 'give'.
 *
 * @param {ProposalRecord['want']} want
 * @param {ProposalRecord['give']} give
 */
const assertKeywordNotInBoth = (want, give) => {
  const wantKeywordSet = new Set(ownKeys(want));
  const giveKeywords = ownKeys(give);

  giveKeywords.forEach(keyword => {
    assert(
      !wantKeywordSet.has(keyword),
      X`a keyword cannot be in both 'want' and 'give'`,
    );
  });
};

/**
 * CleanProposal checks the keys and values of the proposal, including the keys
 * and values of the internal objects. The proposal may have the following keys:
 * `give`, `want`, and `exit`. These keys may be omitted in the `proposal`
 * argument passed to cleanProposal, but anything other than these keys is not
 * allowed. The values of `give` and `want` must be "amountKeywordRecords",
 * meaning that the keys must be keywords and the values must be amounts. The
 * value of `exit`, if present, must be a record of one of the following forms:
 * `{ waived: null }` `{ onDemand: null }` `{ afterDeadline: { timer :Timer,
 * deadline :bigint } }
 *
 * @param {Proposal} proposal
 * @param {GetAssetKindByBrand} getAssetKindByBrand
 * @returns {ProposalRecord}
 */
export const cleanProposal = (proposal, getAssetKindByBrand) => {
  assertRecord(proposal, 'proposal');
  // We fill in the default values if the keys are absent or undefined.
  const {
    want = harden({}),
    give = harden({}),
    exit = harden({ onDemand: null }),
    ...rest
  } = proposal;
  assert(
    ownKeys(rest).length === 0,
    X`${proposal} - Must only have want:, give:, exit: properties: ${rest}`,
  );

  const cleanedWant = coerceAmountPatternKeywordRecord(
    want,
    getAssetKindByBrand,
  );
  const cleanedGive = coerceAmountKeywordRecord(give, getAssetKindByBrand);

  const cleanedProposal = harden({
    want: cleanedWant,
    give: cleanedGive,
    exit,
  });
  fit(cleanedProposal, ProposalShape);
  assertExit(exit);
  assertKeywordNotInBoth(cleanedWant, cleanedGive);
  return cleanedProposal;
};
