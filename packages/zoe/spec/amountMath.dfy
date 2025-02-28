include "relation.dfy"

// cribbed from test-amountProperties.js 229708b Jan 9, 2023
// https://github.com/Agoric/agoric-sdk/blob/master/packages/ERTP/test/unitTests/test-amountProperties.js
module {:options "--function-syntax:4"} M0 {
  abstract module AmountMath {
    import R = Relation

    type Amount(!new)
    function makeEmpty(): Amount // hm. function of brand, which is not (!new)
    function isEqual(x: Amount, y: Amount): bool
    function isGTE(x: Amount, y: Amount): bool

    ghost predicate obeys() {
      // isEqual is a (total) equivalence relation
      R.equivalence(isEqual) &&

      // isGTE is a partial order with empty as minimum
      R.minimum(makeEmpty(), isGTE) &&
      R.reflexive(isGTE) &&
      R.antisymmetric(isGTE, isEqual)
    }
  }
}
