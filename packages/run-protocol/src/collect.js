// @ts-check

const { entries, fromEntries, keys, values } = Object;

/**
 * @type {<T, U>(
 *   obj: Record<string, T>,
 *   f: (t: T) => U,
 * ) => Record<string, U>}
 */
export const mapValues = (obj, f) =>
  harden(fromEntries(entries(obj).map(([p, v]) => [p, f(v)])));

/** @type {<X, Y>(xs: X[], ys: Y[]) => [X, Y][]} */
export const zip = (xs, ys) => harden(xs.map((x, i) => [x, ys[+i]]));

/** @type {<V>(obj: Record<string, ERef<V>>) => Promise<Record<string, V>>} */
export const allValues = async obj => {
  const resolved = await Promise.all(values(obj));
  return harden(fromEntries(zip(keys(obj), resolved)));
};
