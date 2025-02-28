module {:options "--function-syntax:4"} Counter {

  class Counter {
    var cur: nat
    var sekret: string

    constructor(init: nat) {
      cur := init;
      sekret := "xyzzy";
    }

    method incr() returns (n: nat)
      modifies this`cur
    {
      cur := cur + 1;
      return cur;
    }

    method decr() returns (n: nat) modifies this`cur
    {
      if cur > 0 { cur := cur - 1; }
      return cur;
    }
  }

  method Main() {
    var c1 := new Counter(3);
    var x := c1.incr();
    print x, "\n";
  }
}
