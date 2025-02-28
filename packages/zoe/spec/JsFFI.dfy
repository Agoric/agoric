module JsFFI {
  const MAX_SAFE_INTEGER := 0x20 * 0x1000000000000 - 1 // 2^53
  function Abs(x: int): nat { if x < 0 then -x else x }
  type SafeInt = x: int | Abs(x) < MAX_SAFE_INTEGER witness 1

  datatype TypeTag = Undefined | Boolean | Number |
                     Str | Function | Object | Symbol | Bigint
  function typeName(t: TypeTag): string {
    match t {
      case Undefined => "undefined"
      case Boolean => "boolean"
      case Number => "number"
      case Str => "string"
      case Function => "function"
      case Object => "object"
      case Symbol => "symbol"
      case Bigint => "bigint"
    }
  }
  function fmap<T, U>(f: T->U, xs: seq<T>): seq<U> {
    if |xs| == 0 then [] else [f(xs[0])] + fmap(f, xs[1..])
  }
  ghost function typeNames(): seq<string> {
    fmap(typeName, [Undefined , Boolean , Number ,
                    Str , Function , Object , Symbol , Bigint])
  }

  method {:extern} valueOf(x: object) returns (o: object)
  method {:extern} BigInt(i: SafeInt) returns (o: object)
  method {:extern} typeof(x: object) returns (s: string)
    ensures s in typeNames()

  method Main() {
    var i := BigInt(123);
    var ty := typeof(i);
    print ty;
  }
}