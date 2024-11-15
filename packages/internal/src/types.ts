/* eslint-disable max-classes-per-file */
import type { ERef, RemotableBrand } from '@endo/eventual-send';
import type { Primitive } from '@endo/pass-style';
import type { Pattern } from '@endo/patterns';
import type { Callable } from './ses-utils.ts';

/**
 * A map corresponding with a total function such that `get(key)` is assumed to
 * always succeed.
 */
export type TotalMap<K, V> = Omit<Map<K, V>, 'get'> & {
  /** Returns the element associated with the specified key in the TotalMap. */
  get: (key: K) => V;
};
export type TotalMapFrom<M extends Map<any, any>> =
  M extends Map<infer K, infer V> ? TotalMap<K, V> : never;

export declare class Callback<I extends (...args: any[]) => any> {
  private iface: I;

  public target: any;

  public methodName?: PropertyKey;

  public bound: unknown[];

  public isSync: boolean;
}

export declare class SyncCallback<
  I extends (...args: unknown[]) => any,
> extends Callback<I> {
  private syncIface: I;

  public isSync: true;
}

/**
Returns a boolean for whether the given type is primitive value or primitive type.
 
@example
```
IsPrimitive<'string'>
//=> true
 
IsPrimitive<string>
//=> true
 
IsPrimitive<Object>
//=> false
```
 */
export type IsPrimitive<T> = [T] extends [Primitive] ? true : false;

/** Recursively extract the non-callable properties of T */
export type DataOnly<T> =
  IsPrimitive<T> extends true
    ? T
    : T extends Callable
      ? never
      : { [P in keyof T as T[P] extends Callable ? never : P]: DataOnly<T[P]> };

/**
 * A type that doesn't assume its parameter is local, but is satisfied with both
 * local and remote references. It accepts both near and marshalled references
 * that were returned from `Remotable` or `Far`.
 */
export type Remote<Primary, Local = DataOnly<Primary>> =
  | Primary
  | RemotableBrand<Local, Primary>;

// TODO: Add type tests for FarRef and Remote.
/**
 * Potentially remote promises or settled references.
 */
export type FarRef<Primary, Local = DataOnly<Primary>> = ERef<
  Remote<Primary, Local>
>;

/*
 * Stop-gap until https://github.com/Agoric/agoric-sdk/issues/6160
 * explictly specify the type that the Pattern will verify through a match.
 *
 * TODO move all this pattern typing stuff to @endo/patterns
 */
declare const validatedType: unique symbol;
/**
 * Tag a pattern with the static type it represents.
 */
export type TypedPattern<T> = Pattern & { [validatedType]?: T };

export declare type PatternType<TM extends TypedPattern<any>> =
  TM extends TypedPattern<infer T> ? T : never;

// TODO make Endo's mustMatch do this
/**
 * Returning normally indicates success. Match failure is indicated by
 * throwing.
 *
 * Note: remotables can only be matched as "remotable", not the specific kind.
 *
 * @see {import('@endo/patterns').mustMatch} for the implementation. This one has a type annotation to narrow if the pattern is a TypedPattern.
 */
export declare type MustMatch = <P extends Pattern>(
  specimen: unknown,
  pattern: P,
  label?: string | number,
) => asserts specimen is P extends TypedPattern<any> ? PatternType<P> : unknown;
