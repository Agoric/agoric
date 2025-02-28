module Outcome {
  datatype Outcome<T> = // is this still failure-compatible with (00)?
    | Success(value: T)
    | Failure(error: string)
  {
    predicate IsFailure() {
      this.Failure?
    }
    function PropagateFailure<U>(): Outcome<U>
      requires IsFailure()
    {
      Failure(this.error) // this is Outcome<U>.Failure(...)
    }
    function Extract(): T
      requires !IsFailure()
    {
      this.value
    }
  }
}
