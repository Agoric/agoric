
module PassStyle {
  datatype Primitive = Undefined | Boolean | Number | String | Symbol | Bigint
  datatype PassStyle = Prim(t: Primitive) | PSRemotable | PSPromise | PSError | PSCopyArray | PSCopyMap | PSTagged
  trait Passable {
    const passStyle: PassStyle // TODO: Repr set instead or something
  }
  class CopyArray extends Passable {
    const value: array<Passable>
    constructor (items: array<Passable>) {
      passStyle, value := PSCopyArray, items;
    }
  }
  class CopyMap extends Passable {
    const value: map<Passable, Passable>
    constructor (entries: map<Passable, Passable>) {
      passStyle, value := PSCopyMap, entries;
    }
  }

  // :termination false means open to extension in other modules?
  trait {:termination false} TaggedT extends Passable {
    const tag: string
    const payload: Passable
  }
  class Tagged extends TaggedT {
    constructor (t: string, p: Passable) {
      passStyle, tag, payload := PSTagged, t, p; }
  }
  // TODO: extend to object using Repr set
  function passStyleOf(x: Passable): PassStyle reads x {
    x.passStyle
  }
}

module Patterns {
  import PS = PassStyle
  class CopyBag extends PS.TaggedT {
    constructor (e: PS.CopyMap) {
      passStyle, tag, payload := PS.PSTagged, "copyBag", e;
    }
  }

  function keyEq(x: PS.Passable, y: PS.Passable): bool
    reads x, y
    decreases x
  {
    PS.passStyleOf(x) == PS.passStyleOf(y) &&
    if
      x is PS.Tagged && y is PS.Tagged then
      var xt := x as PS.Tagged;
      var yt := y as PS.Tagged;
      xt.tag == yt.tag && keyEq(xt.payload, yt.payload)
    else false // TODO

  }
}
