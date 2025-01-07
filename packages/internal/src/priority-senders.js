import { Fail, q } from '@endo/errors';
import { E, Far } from '@endo/far';

const PRIORITY_SENDERS_NAMESPACE_RE = /^[a-zA-Z0-9_-]{1,50}$/;

/** @type {(namespace: string) => string} */
export const normalizeSenderNamespace = namespace => {
  const candidate = namespace.replace(/[ ,()]/g, '_');
  PRIORITY_SENDERS_NAMESPACE_RE.test(candidate) ||
    Fail`invalid namespace ${q(namespace)}`;
  return candidate;
};
harden(normalizeSenderNamespace);

/**
 * XXX lets holder manage sender list for all namespaces
 *
 * @param {ERef<import('./lib-chainStorage.js').StorageNode>} sendersNode
 */
export const makePrioritySendersManager = sendersNode => {
  /**
   * address to tuple with storage node and set of namespaces that requested
   * priority
   *
   * @type {Map<
   *   string,
   *   readonly [node: StorageNode, namespaces: Set<string>]
   * >}
   */
  const addressRecords = new Map();

  /**
   * Write a list of namespaces into a storage node.
   *
   * @param {import('./lib-chainStorage.js').StorageNode} node
   * @param {Set<string>} namespaces
   */
  const refreshVstorage = async (node, namespaces) => {
    return E(node).setValue(
      // if the list set is empty, the string will be '' and thus deleted from IAVL
      [...namespaces.keys()].sort().join(','),
    );
  };

  const provideRecordForAddress = async address => {
    const extant = addressRecords.get(address);
    if (extant) {
      return extant;
    }
    const node = await E(sendersNode).makeChildNode(address, {
      sequence: false,
    });
    /** @type {readonly [node: StorageNode, namespaces: Set<string>]} */
    const r = [node, new Set()];
    addressRecords.set(address, r);
    return r;
  };

  return Far('prioritySenders manager', {
    /**
     * @param {string} rawNamespace
     * @param {string} address
     * @returns {Promise<void>}
     */
    add: async (rawNamespace, address) => {
      const namespace = normalizeSenderNamespace(rawNamespace);

      const record = await provideRecordForAddress(address);

      const [node, namespaces] = record;
      if (namespaces.has(namespace)) {
        throw Fail`namespace ${q(namespace)} already has address ${q(address)}`;
      }
      namespaces.add(namespace);

      return refreshVstorage(node, namespaces);
    },
    /**
     * @param {string} rawNamespace
     * @param {string} address
     * @returns {Promise<void>}
     */
    remove: async (rawNamespace, address) => {
      const namespace = normalizeSenderNamespace(rawNamespace);
      const record = addressRecords.get(address);
      if (!record) {
        throw Fail`address not registered: ${q(address)}`;
      }
      const [node, namespaces] = record;
      if (!namespaces.has(namespace)) {
        throw Fail`namespace ${q(namespace)} does not have address ${q(
          address,
        )}`;
      }

      namespaces.delete(namespace);
      if (namespaces.size === 0) {
        addressRecords.delete(address);
      }

      return refreshVstorage(node, namespaces);
    },
  });
};
harden(makePrioritySendersManager);

/** @typedef {ReturnType<typeof makePrioritySendersManager>} PrioritySendersManager */
