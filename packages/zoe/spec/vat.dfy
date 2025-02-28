include "outcome.dfy"
include "passable.dfy"

abstract module Vat {
  import opened Outcome
  import opened Passable

  type Value = Passable<Dyn, Promise<Passable<Dyn, (), object>>, object>

  trait Dyn {
    method dispatch(verb: string, args: seq<Value>) returns (out: Outcome<Value>)
  }

  trait {:termination false} Thunk<T> {
    method apply(arg1: T)
  }

  trait Executor<T> {
    method apply(resolve: Thunk<T>, reject: Thunk<object>)
  }

  trait Vat {
    method promise<T>(e: Executor<T>) returns (p: Promise<T>) {
      p := new Promise(this, e);
    }
    method join<T>(p: Promise<T>, q: Promise<T>) returns (j: Promise<T>)
    method all<T>(ps: seq<Promise<T>>) returns (p: Promise<T>)
    method race<T>(ps: seq<Promise<T>>) returns (p: Promise<T>)
  }

  class Promise<T>
  {
    const home: Vat
    constructor(home: Vat, e: Executor<T>) { this.home := home; }
    function Home(): Vat { home }
    method Then(thunk: Thunk) returns (next: Promise<T>)
    method Catch(thunk: Thunk) returns (next: Promise<T>)
  }

}
