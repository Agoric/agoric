import { assert, details as X } from '@agoric/assert';
import { insistCapData } from './capdata.js';

/**
 * Assert function to ensure that something expected to be a message object
 * actually is. A message object should have a .method property that's a string,
 * a .args property that's a capdata object, and optionally a .result property
 * that, if present, must be a string.
 *
 * @param {unknown} message The object to be tested
 * @returns {asserts message is Message}
 * @throws {Error} If, upon inspection, the parameter does not satisfy the above criteria.
 */
export function insistMessage(message) {
  assert.typeof(
    message.method,
    'string',
    X`message has non-string .method ${message.method}`,
  );
  insistCapData(message.args);
  if (message.result) {
    assert.typeof(
      message.result,
      'string',
      X`message has non-string non-null .result ${message.result}`,
    );
  }
  return undefined;
}

/**
 * @param {unknown} vdo
 * @returns {asserts vdo is VatDeliveryObject}
 */
export function insistVatDeliveryObject(vdo) {
  assert(Array.isArray(vdo));
  const [type, ...rest] = vdo;
  switch (type) {
    case 'message': {
      const [target, msg] = rest;
      assert.typeof(target, 'string');
      insistMessage(msg);
      break;
    }
    case 'notify': {
      const [resolutions] = rest;
      assert(Array.isArray(resolutions));
      for (const [vpid, rejected, data] of resolutions) {
        assert.typeof(vpid, 'string');
        assert.typeof(rejected, 'boolean');
        insistCapData(data);
      }
      break;
    }
    case 'dropExports':
    case 'retireExports':
    case 'retireImports': {
      const [slots] = rest;
      assert(Array.isArray(slots));
      for (const slot of slots) {
        assert.typeof(slot, 'string');
      }
      break;
    }
    case 'startVat': {
      assert(rest.length === 1);
      const [vatParameters] = rest;
      insistCapData(vatParameters);
      break;
    }
    case 'bringOutYourDead': {
      assert(rest.length === 0);
      break;
    }
    default:
      assert.fail(`unknown delivery type ${type}`);
  }
  return undefined;
}

/**
 * @param {unknown} vdr
 * @returns {asserts vdr is VatDeliveryResult}
 */
export function insistVatDeliveryResult(vdr) {
  assert(Array.isArray(vdr));
  const [type, problem, _usage] = vdr;
  switch (type) {
    case 'ok': {
      assert.equal(problem, null);
      break;
    }
    case 'error': {
      assert.typeof(problem, 'string');
      break;
    }
    default:
      assert.fail(`unknown delivery result type ${type}`);
  }
  return undefined;
}

/**
 * @param {unknown} vso
 * @returns {asserts vso is VatSyscallObject}
 */
export function insistVatSyscallObject(vso) {
  assert(Array.isArray(vso));
  const [type, ...rest] = vso;
  switch (type) {
    case 'send': {
      const [target, msg] = rest;
      assert.typeof(target, 'string');
      insistMessage(msg);
      break;
    }
    case 'callNow': {
      const [target, method, args] = rest;
      assert.typeof(target, 'string');
      assert.typeof(method, 'string');
      insistCapData(args);
      break;
    }
    case 'subscribe': {
      const [vpid] = rest;
      assert.typeof(vpid, 'string');
      break;
    }
    case 'resolve': {
      const [resolutions] = rest;
      assert(Array.isArray(resolutions));
      for (const [vpid, rejected, data] of resolutions) {
        assert.typeof(vpid, 'string');
        assert.typeof(rejected, 'boolean');
        insistCapData(data);
      }
      break;
    }
    case 'exit': {
      const [isFailure, info] = rest;
      assert.typeof(isFailure, 'boolean');
      insistCapData(info);
      break;
    }
    case 'vatstoreGet': {
      const [key] = rest;
      assert.typeof(key, 'string');
      break;
    }
    case 'vatstoreSet': {
      const [key, data] = rest;
      assert.typeof(key, 'string');
      assert.typeof(data, 'string');
      break;
    }
    case 'vatstoreGetAfter': {
      const [priorKey, lowerBound, upperBound] = rest;
      assert.typeof(priorKey, 'string');
      assert.typeof(lowerBound, 'string');
      if (upperBound !== undefined && upperBound !== null) {
        assert.typeof(upperBound, 'string');
      }
      break;
    }
    case 'vatstoreDelete': {
      const [key] = rest;
      assert.typeof(key, 'string');
      break;
    }
    case 'dropImports':
    case 'retireImports':
    case 'retireExports': {
      const [slots] = rest;
      assert(Array.isArray(slots));
      for (const slot of slots) {
        assert.typeof(slot, 'string');
      }
      break;
    }
    default:
      assert.fail(`unknown syscall type ${type}`);
  }
  return undefined;
}

/**
 * @param {unknown} vsr
 * @returns {asserts vsr is VatSyscallResult}
 */
export function insistVatSyscallResult(vsr) {
  assert(Array.isArray(vsr));
  const [type, ...rest] = vsr;
  switch (type) {
    case 'ok': {
      break;
    }
    case 'error': {
      const [err] = rest;
      assert.typeof(err, 'string');
      break;
    }
    default:
      assert.fail(`unknown syscall result type ${type}`);
  }
  return undefined;
}
