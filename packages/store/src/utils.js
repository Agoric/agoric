// @ts-check
import { E } from '@endo/eventual-send';
import { isPromise } from '@endo/promise-kit';

// TODO https://github.com/Agoric/agoric-sdk/issues/5992
// Many of the utilities accumulating in this module really have nothing
// to do with the store package. Follow #5992 and migrate them, or perhaps
// the entire utils.js module, to that independent sdk-internal package
// that we will need to create.

/** @typedef {import('@endo/marshal/src/types').Remotable} Remotable */

const { getPrototypeOf, create, entries, fromEntries } = Object;
const { ownKeys, apply } = Reflect;

const { details: X } = assert;

/**
 * By analogy with how `Array.prototype.map` will map the elements of
 * an array to transformed elements of an array of the same shape,
 * `objectMap` will do likewise for the string-named own enumerable
 * properties of an object.
 *
 * Typical usage applies `objectMap` to a CopyRecord, i.e.,
 * an object for which `passStyleOf(original) === 'copyRecord'`. For these,
 * none of the following edge cases arise. The result will be a CopyRecord
 * with exactly the same property names, whose values are the mapped form of
 * the original's values.
 *
 * When the original is not a CopyRecord, some edge cases to be aware of
 *    * No matter how mutable the original object, the returned object is
 *      hardened.
 *    * Only the string-named enumerable own properties of the original
 *      are mapped. All other properties are ignored.
 *    * If any of the original properties were accessors, `Object.entries`
 *      will cause its `getter` to be called and will use the resulting
 *      value.
 *    * No matter whether the original property was an accessor, writable,
 *      or configurable, all the properties of the returned object will be
 *      non-writable, non-configurable, data properties.
 *    * No matter what the original object may have inherited from, and
 *      no matter whether it was a special kind of object such as an array,
 *      the returned object will always be a plain object inheriting directly
 *      from `Object.prototype` and whose state is only these new mapped
 *      own properties.
 *
 * With these differences, even if the original object was not a CopyRecord,
 * if all the mapped values are Passable, then the returned object will be
 * a CopyRecord.
 *
 * @template {string} K
 * @template T
 * @template U
 * @param {Record<K,T>} original
 * @param {(value: T, key?: string) => U} mapFn
 * @returns {Record<K,U>}
 */
export const objectMap = (original, mapFn) => {
  const ents = entries(original);
  const mapEnts = ents.map(([k, v]) => [k, mapFn(v, k)]);
  return /** @type {Record<K, U>} */ (harden(fromEntries(mapEnts)));
};
harden(objectMap);

export const listDifference = (leftNames, rightNames) => {
  const rightSet = new Set(rightNames);
  return leftNames.filter(name => !rightSet.has(name));
};
harden(listDifference);

/**
 * @param {Error} innerErr
 * @param {string|number} label
 * @param {ErrorConstructor=} ErrorConstructor
 * @returns {never}
 */
export const throwLabeled = (innerErr, label, ErrorConstructor = undefined) => {
  if (typeof label === 'number') {
    label = `[${label}]`;
  }
  const outerErr = assert.error(
    `${label}: ${innerErr.message}`,
    ErrorConstructor,
  );
  assert.note(outerErr, X`Caused by ${innerErr}`);
  throw outerErr;
};
harden(throwLabeled);

/**
 * @template A,R
 * @param {(...args: A[]) => R} func
 * @param {A[]} args
 * @param {string|number} [label]
 * @returns {R}
 */
export const applyLabelingError = (func, args, label = undefined) => {
  if (label === undefined) {
    return func(...args);
  }
  let result;
  try {
    result = func(...args);
  } catch (err) {
    throwLabeled(err, label);
  }
  if (isPromise(result)) {
    // @ts-expect-error If result is a rejected promise, this will
    // return a promise with a different rejection reason. But this
    // confuses TypeScript because it types that case as `Promise<never>`
    // which is cool for a promise that will never fulfll.
    // But TypeScript doesn't understand that this will only happen
    // when `result` was a rejected promise. In only this case `R`
    // should already allow `Promise<never>` as a subtype.
    return E.when(result, undefined, reason => throwLabeled(reason, label));
  } else {
    return result;
  }
};
harden(applyLabelingError);

const compareStringified = (left, right) => {
  left = String(left);
  right = String(right);
  // eslint-disable-next-line no-nested-ternary
  return left < right ? -1 : left > right ? 1 : 0;
};

/**
 * @param {object} obj
 * @returns {(string|symbol)[]}
 */
export const getMethodNames = obj => {
  const result = [];
  while (obj !== null && obj !== Object.prototype) {
    const mNames = ownKeys(obj).filter(name => typeof obj[name] === 'function');
    result.push(...mNames);
    obj = getPrototypeOf(obj);
  }
  result.sort(compareStringified);
  return harden(result);
};
harden(getMethodNames);

/**
 * TODO This function exists only to ease the
 * https://github.com/Agoric/agoric-sdk/pull/5970 transition, from all methods
 * being own properties to methods being inherited from a common prototype.
 * This transition breaks two patterns used in prior code: autobinding,
 * and enumerating methods by enumerating own properties. For both, the
 * preferred repairs are
 *    * autobinding: Replace, for example,
 *      `foo(obj.method)` with `foo(arg => `obj.method(arg))`. IOW, stop relying
 *      on expressions like `obj.method` to extract a method still bound to the
 *      state of `obj` because, for virtual and durable objects,
 *      they no longer will after #5970.
 *    * method enumeration: Replace, for example
 *      `Reflect.ownKeys(obj)` with `getMethodNames(obj)`.
 *
 * Once all problematic cases have been converted in this manner, this
 * `bindAllMethods` hack can and TODO should be deleted. However, we currently
 * have no reliable static way to track down and fix all autobinding sites.
 * For those objects that have not yet been fully repaired by the above two
 * techniques, `bindAllMethods` creates an object that acts much like the
 * pre-#5970 objects, with all their methods as instance-bound own properties.
 * It does this by making a new object inheriting from `obj` where the new
 * object has bound own methods overridding all the methods it would have
 * inherited from `obj`.
 *
 * @param {Remotable} obj
 * @returns {Remotable}
 */
export const bindAllMethods = obj =>
  harden(
    create(
      obj,
      fromEntries(
        getMethodNames(obj).map(name => [
          name,
          {
            value: (...args) => apply(obj[name], obj, args),
          },
        ]),
      ),
    ),
  );
harden(bindAllMethods);
