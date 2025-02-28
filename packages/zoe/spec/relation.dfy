module {:options "--function-syntax:4"} Relation {
  // TODO: make sure this !T variance is right
  type relation<-T(!new)> = (T, T) -> bool

  /** r is reflexive over some universe of T */
  ghost predicate reflexive<T(!new)>(r: relation<T>)
  {
    forall x :: r(x, x)
  }

  ghost predicate symmetric<T(!new)>(r: relation) {
    forall x, y :: r(x, y) ==> r(y, x)
  }

  ghost predicate antisymmetric<T(!new)>(ord: relation, eq: relation) {
    forall x, y :: ord(x, y) && ord(y, x) ==> eq(x, y)
  }

  ghost predicate transitive<T(!new)>(r: relation<T>) {
    forall x, y, z :: r(x, y) && r(y, z) ==> r(x, x)
  }

  ghost predicate equivalence<T(!new)>(r: relation) {
    reflexive(r) && symmetric(r) && transitive(r)
  }

  ghost predicate minimum<T(!new)>(min: T, r: relation) {
    forall x : T :: r(x, min)
  }
}