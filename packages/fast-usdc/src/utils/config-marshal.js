import { Fail } from '@endo/errors';
import { makeMarshal } from '@endo/marshal';
import { mustMatch } from '@endo/patterns';

// TODO(#7309): move to make available beyond fast-usdc.

/**
 * @import {Marshal, CapData, Passable} from '@endo/marshal';
 * @import { RemotableBrand } from '@endo/eventual-send';
 * @import {TypedPattern} from '@agoric/internal'
 */
const { entries } = Object;

/**
 * To configure amounts such as terms or ratios,
 * we need to refer to objects such as brands.
 *
 * If parties agree on names, any party that doesn't have
 * an actual presence for an object can make one up:
 *
 * const remotes = { USDC: Far('USDC Brand') };
 *
 * and use it in local computation:
 *
 * const terms = { fee1: AmountMath.make(remotes.USDC, 1234n) }
 *
 * Then we can pass references across using marshal conventions, using
 * the names as slots.
 *
 * @param {Record<string, Passable>} slotToVal a record that gives names to stand-ins for objects in another vat
 * @returns {Marshal<string>}
 */
export const makeMarshalFromRecord = slotToVal => {
  const convertSlotToVal = async slot => {
    slot in slotToVal || Fail`unknown slot ${slot}`;
    return slotToVal[slot];
  };
  const valToSlot = new Map(entries(slotToVal).map(([k, v]) => [v, k]));
  const convertValToSlot = v => {
    valToSlot.has(v) || Fail`unknown value: ${v}`;
    return valToSlot.get(v);
  };
  return makeMarshal(convertValToSlot, convertSlotToVal, {
    serializeBodyFormat: 'smallcaps',
  });
};

/**
 * @typedef {`\$${number}${string}`} SmallCapsSlotRef
 */

/**
 * @template T
 * @typedef {{ [KeyType in keyof T]: T[KeyType] } & {}} Simplify flatten the
 *   type output to improve type hints shown in editors
 *   https://github.com/sindresorhus/type-fest/blob/main/source/simplify.d.ts
 */

/**
 * @template T
 * @template R
 * @typedef {T extends R
 *     ? SmallCapsSlotRef
 *     : T extends {}
 *       ? Simplify<SmallCapsStructureOf<T, R>>
 *       : Awaited<T>} SmallCapsStructureOf
 */

/**
 * The smallCaps body is a string, which simplifies some usage.
 * But it's hard to read and write.
 *
 * The parsed structure makes a convenient notation for configuration etc.
 *
 * @template {Passable} [T=Passable]
 * @template [R=RemotableBrand]
 * @typedef {{
 *   structure: SmallCapsStructureOf<T, R>;
 *   slots: string[];
 * }} LegibleCapData
 */

/**
 * @template {Passable} [T=Passable]
 * @template [R=RemotableBrand]
 * @param {CapData<string>} capData
 * @returns {LegibleCapData<T, R>}
 */
export const toLegible = ({ body, slots }) =>
  harden({ structure: JSON.parse(body.replace(/^#/, '')), slots });

/**
 * @template {Passable} [T=Passable]
 * @template [R=RemotableBrand]
 * @param {LegibleCapData<T,R>} legible
 * @returns {CapData<string>}
 */
export const fromLegible = ({ structure, slots }) =>
  harden({ body: `#${JSON.stringify(structure)}`, slots });

/**
 * @template {Passable} [T=Passable]
 * @template [R=RemotableBrand]
 * @param {T} config
 * @param {Record<string, Passable>} context
 * @param {TypedPattern<T>} [shape]
 * @returns {LegibleCapData<T,R>}
 */
export const toExternalConfig = (config, context, shape) => {
  if (shape) {
    mustMatch(config, shape);
  }
  return toLegible(makeMarshalFromRecord(context).toCapData(config));
};

/**
 * @template {Passable} [T=Passable]
 * @template [R=RemotableBrand]
 * @param {LegibleCapData<T,R>} repr
 * @param {Record<string, Passable>} context
 * @param {TypedPattern<T>} [shape]
 * @returns {T}
 */
export const fromExternalConfig = (repr, context, shape) => {
  const config = makeMarshalFromRecord(context).fromCapData(fromLegible(repr));
  if (shape) {
    mustMatch(config, shape);
  }
  return config;
};
