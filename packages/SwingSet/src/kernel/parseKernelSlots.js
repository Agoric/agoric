import { Nat } from '@endo/nat';
import { assert, Fail } from '@agoric/assert';

// Object/promise references (in the kernel) contain a two-tuple of (type,
// index). All object references point to entries in the kernel Object
// Table, which records the vat that owns the actual object. In that vat,
// the object reference will be expressed as 'o+NN', and the NN was
// allocated by that vat when they first exported the reference into the
// kernel. In all other vats, if/when they are given a reference to this
// object, they will receive 'o-NN', with the NN allocated by the kernel
// clist for the recipient vat.

/**
 * Parse a kernel slot reference string into a kernel slot object:
 *   {
 *      type: STRING, // 'object', 'device', or 'promise'
 *      id: Nat
 *   }
 *
 * @param {string} s  The string to be parsed, as described above.
 *
 * @returns {{type: 'object' | 'device' | 'promise', id: bigint}} a kernel slot object corresponding to the parameter.
 *
 * @throws {Error} if the given string is syntactically incorrect.
 */
export function parseKernelSlot(s) {
  assert.typeof(s, 'string');
  /** @type {'object' | 'device' | 'promise' | undefined} */
  let type;
  let idSuffix;
  if (s.startsWith('ko')) {
    type = 'object';
    idSuffix = s.slice(2);
  } else if (s.startsWith('kd')) {
    type = 'device';
    idSuffix = s.slice(2);
  } else if (s.startsWith('kp')) {
    type = 'promise';
    idSuffix = s.slice(2);
  } else {
    throw Fail`invalid kernelSlot ${s}`;
  }
  const id = Nat(BigInt(idSuffix));
  return { type, id };
}

/**
 * Generate a kernel slot reference string given a type and id.
 *
 * @param {'object' | 'device' | 'promise'} type  The type
 * @param {bigint | number} id    The id, a Nat.
 *
 * @returns {string} the corresponding kernel slot reference string.
 *
 * @throws {Error} if type is not one of the above known types.
 */
export function makeKernelSlot(type, id) {
  if (type === 'object') {
    return `ko${Nat(id)}`;
  }
  if (type === 'device') {
    return `kd${Nat(id)}`;
  }
  if (type === 'promise') {
    return `kp${Nat(id)}`;
  }
  throw Fail`unknown type ${type}`;
}

/**
 * Assert function to ensure that a kernel slot reference string refers to a
 * slot of a given type.
 *
 * @param {'object' | 'device' | 'promise'} type  The kernel slot type desired, a string.
 * @param {string} kernelSlot  The kernel slot reference string being tested
 *
 * @throws if kernelSlot is not of the given type or is malformed.
 *
 * @returns {void}
 */
export function insistKernelType(type, kernelSlot) {
  type === parseKernelSlot(kernelSlot).type ||
    Fail`kernelSlot ${kernelSlot} is not of type ${type}`;
}
