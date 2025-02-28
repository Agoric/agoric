module {:options "--function-syntax:4"} M {

  class Cell<T>{
    var x: T
    constructor(init: T) { x := init; }
    method get() returns (ret: T) { ret := x; } // TODO: reads x
    method update(val: T) { x:= val; } // TODO: modifies x
  }

  method makeBrandPair<T>(nickname: string) {
    var noObject := new object;
    var shared := new Cell(noObject);
    var makeSealedBox := (obj: T) => (
          // ERROR: expression is not allowed to invoke a method
          var box := map["shareContent" := () => shared.update(obj)
                     ]; box
        );
    var sealer := map["seal" := (obj) => makeSealedBox(obj)];
    //  def unsealer {
    //      to unseal(box) {
    //          shared := noObject
    //          box.shareContent()
    //          if (shared == noObject) {throw("invalid box")}
    //          def contents := shared
    //          shared := noObject
    //          return contents
    //      }
    //  }
    //  return [sealer, unsealer]
  }

  method makeMint () {

  }

  method Main()
  {
    print "reals? really? ", 2.0 / 3.0, "\n";
    print "how to do promises?\n";
  }
}