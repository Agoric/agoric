include "outcome.dfy"

// {:options "--function-syntax:4"} is cargo-cult
// from the dafny hello-world
// https://dafny.org/latest/DafnyRef/DafnyRef#sec-example
module {:options "--function-syntax:4"} ERTP {
  import opened Outcome

  type Amount = nat

  /**
    * Mint maker, transformed to an exo class kit.
    *
    * @param {import('@agoric/zone').Zone} zone
    */
  class Purse {
    const issuer: Issuer
    const ledger: Ledger

    constructor (anIssuer: Issuer, aLedger: Ledger)
      requires anIssuer.ledger == aLedger
      ensures issuer == anIssuer
      ensures ledger == aLedger
      ensures issuer.ledger == ledger
    { issuer := anIssuer; ledger:= aLedger; }

    function getBalance(): Amount reads ledger requires this in ledger.state {
      ledger.get(this).value
    }

    /**
      * @param {bigint} amount
      * @param {unknown} src
      */
    method deposit(amount: Amount, src: object) returns (ret: Outcome<Amount>)
      modifies ledger
    {
      var myBal :- ledger.get(this);
      var srcBal :- ledger.get(src);
      if (amount > srcBal) {
        return Failure("insufficient balance");
      }
      ledger.update(src, srcBal - amount);
      ledger.update(this, myBal + amount);
      return Success(amount);
    }

    method withdraw(amount: Amount) returns (p: Outcome<Purse>)
      requires issuer.ledger == ledger
      modifies ledger
      ensures p.IsFailure() || (p.Extract().issuer == issuer)
    {
      var newPurse := issuer.makeEmptyPurse(); // mintPayment
      assert newPurse.issuer == issuer;
      assert newPurse.ledger == issuer.ledger;
      var a :- newPurse.deposit(amount, this);
      return Success(newPurse);
    }
  }


  class Ledger { // WeakStore
    var state: map<object, Amount>

    constructor() {
      state := map[];
    }

    function get(x: object): Outcome<Amount> reads this {
      if x in state then Success(state[x]) else Failure("key not found")
    }

    method update(x: object, a: Amount)
      modifies this`state
      ensures x in state && state[x] == a
    {
      state := state[x := a];
    }
  }

  class Mint {
    const ledger: Ledger
    const issuer: Issuer
    constructor(s: Ledger, i: Issuer)
      requires i.ledger == s
      ensures ledger == s
      ensures issuer == i
      ensures issuer.ledger == ledger
    {
      ledger := s;
      issuer := i;
    }
    method getIssuer() returns (out: Issuer)
      ensures out == issuer
    {
      return issuer;
    }
    method mintPurse(a: Amount) returns (p: Purse)
      modifies ledger
      requires issuer.ledger == ledger
      ensures p.issuer == issuer && p.ledger == ledger
      ensures p in ledger.state && p.getBalance() == a
    {
      p := new Purse(issuer, ledger);
      ledger.update(p, a);
    }
  }

  class Issuer {
    const ledger: Ledger
    constructor(s: Ledger)
      ensures ledger == s
    {
      ledger := s;
    }
    method makeEmptyPurse() returns (p: Purse)
      modifies ledger
      ensures p.issuer == this
      ensures p.ledger == ledger
      ensures p in ledger.state
      ensures p.getBalance() == 0
    {
      p := new Purse(this, ledger);
      ledger.update(p, 0);
    }
  }


  method makeIssuerKit() returns (mint: Mint, issuer: Issuer)
    ensures mint.issuer == issuer
    ensures mint.ledger == issuer.ledger
  {
    var state := new Ledger();
    issuer := new Issuer(state);
    mint := new Mint(state, issuer);
  }

  method Main() {
    var mint, issuer := makeIssuerKit();
    print mint, issuer, "\n";
    var p1 := mint.mintPurse(10);
    // var p2 := p1.withdraw(3);
    // print mint, issuer, p1, p2, "\n";
  }
}
