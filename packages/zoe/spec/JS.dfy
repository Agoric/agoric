include "outcome.dfy"

module {:options "--function-syntax:4"} JS {
  import opened Outcome

  function exp(b: nat, e: nat): nat
    requires b > 0
    ensures exp(b, e) >= 1
  { if e == 0 then 1 else b * exp(b, e - 1) }
  const MAX_SAFE_INT := exp(10, 53)
  function Abs(x: int): nat { if x < 0 then -x else x }
  type SafeInt = x: int | Abs(x) < MAX_SAFE_INT witness 1

  // Rather than deal with floats, we stick to SafeInt
  // is String colliding with something?
  datatype Primitive = Undefined | Boolean(b: bool) | Number(x: SafeInt) |
                       Str(s: string) | Symbol(sym: string) | Bigint(i: int)
  datatype Value = Prim(p: Primitive) | Obj(o: object)
  function undefined(): Value { Prim(Undefined) }
  function strVal(s: string): Value { Prim(Str(s)) }
  function okStr(s: string): Outcome<Value> { Success(Prim(Str(s))) }

  function typeof(v: Value): string {
    match v {
      case Prim(p) => match p {
        case Undefined() => "undefined"
        case Boolean(_) => "boolean"
        case Number(_) => "number"
        case Str(_) => "string"
        case Symbol(_) => "symbol"
        case Bigint(_) => "bigint"
      }
      case Obj(x) => if x is Function then "function" else "object"
    }
  }

  // :termination false means open to extension in other modules?
  trait {:termination false} JsObj {
    method Get(property: string) returns (out: Outcome<Value>)
    method Call(args: seq<Value>) returns (out: Outcome<Value>)
    // static method Construct(args: seq<Value>) returns (out: Outcome<Value>)
    static  method fail(n: string, m: string) returns (out: Outcome<Value>) {
      var err := new Error(n, m);
      out := Failure(err);
    }
    static  method typeError(m: string) returns (out: Outcome<Value>) {
      out := fail("TypeError", m);
    }
  }

  trait NoProperties extends JsObj {
    method Get(property: string) returns (out: Outcome<Value>) {
      return Success(undefined());
    }
  }

  class Error extends JsObj {
    const name: string
    const message: string
    constructor(n: string, m: string)
      ensures name == n && message == m
    {
      name, message := n, m;
    }

    method Get(property: string) returns (out: Outcome<Value>) {
      match property {
        case "message" => return okStr(message);
        case _ => return Success(undefined());
      }
    }

    method Call(args: seq<Value>) returns (out: Outcome<Value>) {
      out := typeError("not a function");
    }
  }

  trait Function extends JsObj {
    function check(specimen: Value): bool {
      match specimen {
        case Obj(o) => o is Function
        case _ => false
      }
    }
  }

  datatype State = Pending | Fulfilled | Rejected
  class Promise extends JsObj {
    const executor: Function
    var state: State
    constructor(executor_: Function)
      ensures state == Pending
    {
      state, executor := Pending, executor_;
    }
    method Get(property: string) returns (out: Outcome<Value>) {
      match property {
        case "then" =>
          out := fail("TODO", "@@@");
        case _ => return Success(undefined());
      }
    }
    method Call(args: seq<Value>) returns (out: Outcome<Value>) {
      out := typeError("not a function");
    }
  }

  class Resolver extends Function, NoProperties {
    const next: Function
    constructor(next_: Function) {
      next := next_;
    }
    method Call(args: seq<Value>) returns (out: Outcome<Value>) {
      var res := if |args| > 0 then args[0] else undefined();
      var args : seq<Value> := [Obj(next)];
      out := next.Call(args); // termination?!
    }
  }
}
