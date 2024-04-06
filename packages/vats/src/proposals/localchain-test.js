// @ts-check
import { E } from '@endo/far';
import {
  makeProtoConverter,
  typedJson,
  getSigningAgoricClientOptions,
} from '@agoric/cosmic-proto';

const { registry } = getSigningAgoricClientOptions();

/**
 * @param {BootstrapPowers & {
 *   consume: {
 *     localchain: import('../localchain.js').LocalChain;
 *   };
 * }} powers
 * @param {object} options
 * @param {{ testResultPath: string }} options.options
 */
export const testLocalChain = async (
  { consume: { chainStorage, localchain } },
  { options: { testResultPath } },
) => {
  console.warn('=== localchain test started (result in', testResultPath, ')!');
  /** @type {null | ERef<StorageNode>} */
  let node = await chainStorage;
  if (!node) {
    throw new Error('no chainStorage');
  }

  for (const nodeName of testResultPath.split('.')) {
    node = E(node).makeChildNode(nodeName);
  }

  const convertProto = makeProtoConverter(registry);

  let result;
  try {
    const lca = await E(localchain).createAccount();
    console.info('created account', lca);
    const address = await E(lca).getAddress();
    console.info('address', address);

    // test protobuf encoding
    const proto = registry.encodeAsAny({
      typeUrl: '/cosmos.bank.v1beta1.QueryAllBalancesRequest',
      value: {
        address,
        denom: 'ucosm',
      },
    });
    const queryMsg = convertProto(proto);
    const balances = await E(localchain).query(queryMsg);
    console.info('balances', balances);

    await E(lca)
      .executeTx([
        typedJson('/cosmos.bank.v1beta1.MsgSend', {
          fromAddress: address,
          toAddress: address,
          amount: [{ denom: 'ucosm', amount: '1' }],
        }),
      ])
      .then(
        res => console.info('unexpected executeTx result', res),
        e => {
          if (String(e).match(/insufficient funds/)) {
            console.info('insufficient funds as expected');
            return;
          }
          console.info('unexpected error', e);
        },
      );

    const emptyQuery = await E(localchain).queryMany([]);
    console.info('emptyQuery', emptyQuery);

    result = { success: true };
  } catch (e) {
    console.error('test failed with', e);
    result = { success: false, error: String(e) };
  }

  console.warn('=== localchain test done, setting', { result });
  await E(node).setValue(JSON.stringify(result));
};

export const getManifestForLocalChainTest = (_powers, { testResultPath }) => ({
  manifest: {
    [testLocalChain.name]: {
      consume: {
        chainStorage: 'bridge',
        localchain: 'localchain',
      },
    },
  },
  options: {
    testResultPath,
  },
});
