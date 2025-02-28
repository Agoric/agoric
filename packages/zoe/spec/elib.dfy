include "passable.dfy"

module ELib {
  import opened Passable

  trait Result {
    predicate IsFailure()
    function PropagateFailure(): Result
      requires IsFailure()
    function Extract(): Value
      requires !IsFailure()
  }
  trait Error extends Result {
    const message: string
  }
  class Fail extends Error {
    constructor(msg: string) ensures message == msg { message := msg; }
    predicate IsFailure() { true }
    function PropagateFailure(): Result { this }
    function Extract(): Value { Undefined }
  }
  type Value = Passable<Callable, Ref, Error>

  trait Cap {
    /** "only connectivity begets connectivity" */
    ghost function CapOK(): bool reads this
    ghost var reach: set<object>
  }

  trait {:termination false} Callable extends Cap {
    method callAll(verb: string, args: seq<Value>) returns (ret: Result)
      requires CapOK()
      ensures CapOK()
  }

  trait Resolver {
    method resolve(target: Value) returns (ok: bool) modifies this
  }

  class LocalResolver extends Resolver {
    var ref: Opt<Ref>
    var buf: Opt<FlexList<Message>>
    constructor (ref: Ref, buf: FlexList<Message>) { this.ref, this.buf := Some(ref), Some(buf); }
    method resolve(target: Value) returns (ok: bool)
      modifies this
    {
      match ref {
        case None => return false;
        case Some(r) => {
          // r.setTarget(Ref.toRef(target))
          // r.commit();
          // deliverall in buf
          ref, buf := None, None;
          return true;
        }
      }
    }
  }

  type Message = (Resolver?, string, seq<Value>)

  class FlexList<T> {
    var items: seq<T>
    constructor() { items := []; }
    method push(item: T) modifies this {
      items := items + [item];
    }
  }

  trait Ref extends Callable, Result {
    static method promise() returns (ref: Ref, resolver: Resolver)
    {
      var buf := new FlexList();
      ref := new BufferingRef(buf);
      resolver := new LocalResolver(ref, buf);
    }

    method sendAll(verb: string, args: seq<Value>) returns (ret: Ref) requires CapOK() modifies reach
    method MoveNext() returns (out: Result)
  }

  class UnconnectedRef extends Ref {
    const reason: Error
    constructor(reason: Error) ensures CapOK() { this.reason := reason; reach := {this, reason}; }
    ghost function CapOK(): bool reads this { true }
    predicate IsFailure() { true }
    function PropagateFailure(): Result { reason }
    function Extract(): Value { Undefined }
    method callAll(verb: string, args: seq<Value>) returns (out: Result) {
      return new Fail("not synchronously callable:" + verb);
    }

    method sendAll(verb: string, args: seq<Value>) returns (out: Ref) {
      // doBreakage
      return this;
    }
    method MoveNext() returns (out: Result) {
      return new Fail("TODO");
    }
  }

  class BufferingRef extends Ref {
    predicate IsFailure() { false }
    function PropagateFailure(): Result { this } // impossible
    function Extract(): Value { String("TODO") } // EVENTUAL. function of state?

    var msgs: Opt<FlexList<Message>> // when is this set to None?
    ghost function CapOK(): bool reads this { msgs == None || msgs.value in reach }
    constructor(buffer: FlexList<Message>)
      ensures CapOK()
    {
      this.msgs := Some(buffer);
      reach := { this, buffer };
    }

    method callAll(verb: string, args: seq<Value>) returns (out: Result) {
      return new Fail("not synchronously callable:" + verb);
    }

    method sendAll(verb: string, args: seq<Value>) returns (result: Ref)
      requires CapOK()
      modifies reach
      ensures CapOK()
    {
      match msgs {
        case Some(m) => {
          var result, resolver := Ref.promise();
          m.push((resolver, verb, args));
          return result;
        }
        case None => {
          return this;
        }
      }
    }

    method MoveNext() returns (out: Result) {
      return new Fail("TODO");
    }
  }

  datatype Opt<T> = None | Some(value: T)
  function optAsSet<T>(x: Opt<T>): set<T> { match x {
      case None => {}
      case Some(v) => {v}
    }}

  datatype Delivery = Pending(vat: Vat, rec: object, res: Resolver, verb: string, args: seq<Value>)

  trait Runner {
    method enqueue(d: Delivery) // TODO: can fail?
    {
      print "TODO\n";
    }
  }

  trait {:termination false} Vat extends Runner {
    method qSendAll(rec: object, verb: string, args: seq<Value>, resolver: Resolver) // can fail?
    {
      var pe := Pending(this, rec, resolver, verb, args);
      enqueue(pe);
    }
    method sendAll3(rec: object, verb: string, args: seq<Value>) returns (ret: Ref) {
      var promise, resolver := Ref.promise();
      qSendAll(rec, verb, args, resolver); // TODO: check error?
      ret := promise;
    }
  }

  trait {:termination false} E extends Vat {
    const theBroken: Ref
    function broken(): Ref { theBroken }

    /**
    ref https://github.com/kpreid/e-on-java/blob/master/src/jsrc/org/erights/e/elib/prim/E.java
     */
    method callAll(rec: object, verb: string, args: seq<Value>) returns (ret: Result)
      requires !(rec is Callable) || (rec as Callable).CapOK()
    {
      if (!(rec is Callable)) {
        return new Fail("not Callable");
      }
      ret := (rec as Callable).callAll(verb, args);
    }

    method sendAll(rec: object, verb: string, args: seq<Value>) returns (ret: Ref)
      requires !(rec is Ref) || (rec as Ref).CapOK()
      modifies if (rec is Ref) then (rec as Ref).reach else {}
    {
      if (rec is Ref) {
        ret := (rec as Ref).sendAll(verb, args);
      } else {
        ret := sendAll3(rec, verb, args);
      }
    }
  }
}