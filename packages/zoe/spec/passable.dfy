module {:options "--function-syntax:4"} Passable {

  type SafeInteger = n: int | n < 9_007_199_254_740_991 witness 1

  // based on @endo/marshal encodePassable.js
  // https://github.com/endojs/endo/blob/2d3ba1565927ab66922d71d05efc344f9307a709/packages/marshal/src/encodePassable.js
  datatype Passable<R(==), P, E> =
    Null |
    Undefined |
    Bool(b: bool) |
    Double(d: SafeInteger) | // ISSUE: float. idea: stick to Math.isSafeInteger()
    BigInt(i: int) |
    String(s: string) |
    Symbol (name: string) | // ???
    Bytes(bs: seq<bv8>) |
    Remotable(r: R) |
    Error(e: E) |
    Promise(p: P) |
    CopyArray(ca: array<Passable<R, P, E>>) |
    CopyRecord(cr: map<string, Passable<R, P, E>>) |
    Tagged(tag: string, payload: Passable<R, P, E>)

  method Main()
  {
    var aPassable := Passable<(), (), string>.Null;
    print "x", aPassable, "\n";
    print "reals? really? ", 2.0 / 3.0, "\n";
    print "how to do promises?\n";
    print "use classes/traits for passable? or algebraic? maybe both?\n";
  }
}
