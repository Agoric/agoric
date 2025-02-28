include "amountMath.dfy"
include "elib.dfy"
include "outcome.dfy"

module Far {
  function E<T>(rx: T): T { rx }
}

abstract module ERTP {
  import ELib
  import A = M0.AmountMath
  import O = Outcome

  trait Brand extends ELib.Callable {
    function isMyIssuer(i: Issuer): bool reads this
  }
  trait Issuer extends ELib.Callable {
    function getBrand(): Brand reads this
    method makeEmptyPurse() returns (p: Purse)
        modifies this.reach
        ensures p.reach == this.reach + { p }
  }

  trait Purse extends ELib.Callable {
    function getAllegedBrand(): Brand reads this
    method deposit(amount: A.Amount, srcPurse: Purse) returns (ret: O.Outcome<A.Amount>)
        // modifies this.reach, srcPurse.reach
  }
}

module AsyncJS {
  import O = Outcome
  type PromiseT<T> = T
  function awaitO<T>(po: O.Outcome<T>): O.Outcome<T> { po }
  function await<T>(p: PromiseT<T>): O.Outcome<T> { O.Success(p) }
  class Promise {
    static function all<T, U>(ps: (PromiseT<T>, PromiseT<U>)): O.Outcome<(T, U)> { O.Success(ps) }
    static function race<T>(ps: seq<PromiseT<T>>): O.Outcome<T> {
      if |ps| > 0 then O.Success(ps[0]) else O.Failure("empty race")
    }

  }
}

module Q {
  import O = Outcome
  import opened AsyncJS

  method join<T(==)>(a: PromiseT<T>, b: PromiseT<T>) returns (ret: O.Outcome<T>) {
    var abr: (T, T) :- awaitO(Promise.all((a, b)));
    var ar, br := abr.0, abr.1;
    if (ar != br) {
      return O.Failure("join failed");
    }
    return O.Success(ar);
  }
}

abstract module Escrow {
  import opened M0.AmountMath
  import opened ERTP
  import ELib
  import opened Passable
  import opened Far
  import opened AsyncJS
  import O = Outcome
  import Q

  type Result<T> = O.Outcome<T>

  class EscrowVat extends ELib.E {
    var issuer0: Issuer // TODO set/seq of issuers

    constructor(i0: Issuer) {
      var reason := new ELib.Fail("BROKEN");
      theBroken := new ELib.UnconnectedRef(reason);
      issuer0 := i0;
    }

    method transfer(decisionP: O.Outcome<()>, srcPurseP: PromiseT<Purse>, dstPurseP: PromiseT<Purse>, amount: Amount)
      returns (ret: O.Outcome<Amount>)
      requires srcPurseP.CapOK()
      modifies srcPurseP.reach, dstPurseP.reach
      modifies issuer0.reach
    {
      var srcBrandP := Q.join(E(srcPurseP).getAllegedBrand(), E(dstPurseP).getAllegedBrand());
      var srcBrand :- awaitO(srcBrandP);
      if (srcBrand != issuer0.getBrand()) {
        return O.Failure("brand / issuer mismatch");
      }
      var escrowPurseP := E(issuer0).makeEmptyPurse();

      // OK to do phase 1 before phase 2?
      ret := E(escrowPurseP).deposit(amount, srcPurseP); // phase 1

      // setup phase 2
      match await(decisionP) {
        case Success(_) => {
          var ignore := E(dstPurseP).deposit(amount, escrowPurseP);
        }
        case Failure(_) => {
          var ignore := E(srcPurseP).deposit(amount, escrowPurseP);
        }
      }
    }
  }
}