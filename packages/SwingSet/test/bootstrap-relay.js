import { assert } from '@agoric/assert';
import { objectMap } from '@agoric/internal';
import { Far, E } from '@endo/far';
import { buildManualTimer } from '../tools/manual-timer.js';
import { makePassableEncoding } from '../tools/passableEncoding.js';

const { Fail, quote: q } = assert;

export const buildRootObject = () => {
  const timer = buildManualTimer();
  let vatAdmin;
  const vatData = new Map();
  const devicesByName = new Map();
  const callLogsByRemotable = new Map();

  const { encodePassable, decodePassable } = makePassableEncoding();

  return Far('root', {
    bootstrap: async (vats, devices) => {
      vatAdmin = await E(vats.vatAdmin).createVatAdminService(devices.vatAdmin);
      for (const [name, root] of Object.entries(vats)) {
        if (name !== 'vatAdmin') {
          vatData.set(name, { root });
        }
      }
      for (const [name, device] of Object.entries(devices)) {
        devicesByName.set(name, device);
      }
    },

    getDevice: async deviceName =>
      encodePassable(devicesByName.get(deviceName)),

    getVatAdmin: async () => encodePassable(vatAdmin),

    getTimer: async () => encodePassable(timer),

    getVatRoot: async ({ name, rawOutput = false }) => {
      const vat = vatData.get(name) || Fail`unknown vat name: ${q(name)}`;
      const { root } = vat;
      return rawOutput ? root : encodePassable(root);
    },

    createVat: async ({ name, bundleCapName, vatParameters = {} }) => {
      const bcap = await E(vatAdmin).getNamedBundleCap(bundleCapName);
      const options = { vatParameters };
      const { adminNode, root } = await E(vatAdmin).createVat(bcap, options);
      vatData.set(name, { adminNode, root });
      return encodePassable(root);
    },

    upgradeVat: async ({ name, bundleCapName, vatParameters = {} }) => {
      /** @type {{ adminNode: import('@agoric/swingset-vat').VatAdminFacet, result: import('../src/types-external.js').VatRestartResults }} */
      const vat = vatData.get(name) || Fail`unknown vat name: ${q(name)}`;
      const bcap = await E(vatAdmin).getNamedBundleCap(bundleCapName);
      const options = { vatParameters };
      const result = await E(vat.adminNode).restartVat(bcap, options);
      vat.result = result;
      return result;
    },

    /**
     * Derives a remotable from an object by mapping each object property into a method that returns the value.
     * This function is intended to be called from testing code outside of the vat environment,
     * but methods of the returned remotable are intended to be called from *inside* that environment
     * and therefore do not perform argument/response translation.
     *
     * @param {string} label
     * @param {Record<string, any>} encodedMethodReturnValues
     */
    makeRemotable: (label, encodedMethodReturnValues) => {
      const callLogs = [];
      const makeGetterFunction = (value, name) => {
        const getValue = (...args) => {
          callLogs.push([name, ...args]);
          return value;
        };
        return getValue;
      };
      const methodReturnValues = decodePassable(encodedMethodReturnValues);
      // `objectMap` hardens its result, but...
      const methods = objectMap(methodReturnValues, makeGetterFunction);
      // ... `Far` requires its methods argument not to be hardened.
      const unhardenedMethods = { ...methods };
      const remotable = Far(label, unhardenedMethods);
      callLogsByRemotable.set(remotable, callLogs);
      return encodePassable(remotable);
    },

    /**
     * Returns a copy of a remotable's logs.
     *
     * @param {object} encodedRemotable
     */
    getLogForRemotable: encodedRemotable => {
      const remotable = decodePassable(encodedRemotable);
      const decodedLogs =
        callLogsByRemotable.get(remotable) ||
        Fail`logs not found for ${q(remotable)}`;
      // Return a copy so that the original remains mutable.
      return encodePassable(harden([...decodedLogs]));
    },

    messageVat: async ({ name, methodName, args = [] }) => {
      const vat = vatData.get(name) || Fail`unknown vat name: ${q(name)}`;
      const { root } = vat;
      const decodedArgs = args.map(decodePassable);
      const result = await E(root)[methodName](...decodedArgs);
      return encodePassable(result);
    },

    messageVatObject: async ({ presence, methodName, args = [] }) => {
      const object = decodePassable(presence);
      const decodedArgs = args.map(decodePassable);
      const result = await E(object)[methodName](...decodedArgs);
      return encodePassable(result);
    },

    awaitVatObject: async ({ presence, path = [], rawOutput = false }) => {
      let value = await decodePassable(presence);
      for (const key of path) {
        // eslint-disable-next-line no-await-in-loop
        value = await value[key];
      }
      return rawOutput ? value : encodePassable(value);
    },
  });
};
