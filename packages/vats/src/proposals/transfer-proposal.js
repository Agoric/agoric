// @ts-check
import { E } from '@endo/far';
import { BridgeId as BRIDGE_ID } from '@agoric/internal';
import { VTRANSFER_IBC_EVENT } from '@agoric/internal/src/action-types.js';
import { makeScopedBridge } from '../bridge.js';

/**
 * @param {BootstrapPowers & {
 *   consume: {
 *     bridgeManager: import('../types').BridgeManager;
 *     vtransferBridgeManager: import('../types').ScopedBridgeManager<'vtransfer'>;
 *   };
 *   produce: {
 *     transferMiddleware: Producer<any>;
 *     transferVat: Producer<any>;
 *     vtransferBridgeManager: Producer<any>;
 *   };
 * }} powers
 * @param {object} options
 * @param {{ transferRef: VatSourceRef }} options.options
 */
export const setupTransferMiddleware = async (
  {
    consume: {
      loadCriticalVat,
      bridgeManager: bridgeManagerP,
      vtransferBridgeManager: vtransferBridgeManagerP,
    },
    produce: {
      transferMiddleware: produceTransferMiddleware,
      transferVat: produceTransferVat,
      vtransferBridgeManager: produceVtransferBridgeManager,
    },
  },
  options,
) => {
  const bridgeManager = await bridgeManagerP;
  if (!bridgeManager) {
    console.error('No bridgeManager, skipping setupTransferMiddleware');
    return;
  }

  const { transferRef } = options.options;
  const vats = {
    transfer: E(loadCriticalVat)('transfer', transferRef),
  };
  // don't proceed if loadCriticalVat fails
  await Promise.all(Object.values(vats));
  produceTransferVat.reset();
  produceTransferVat.resolve(vats.transfer);

  // We'll be exporting a TransferMiddleware instance that implements a
  // vtransfer app registry supporting active and passive "taps" while handling
  // IBC transfer protocol conformance by configuring its backing
  // BridgeTargetKit registry to wrap each app with an interceptor.
  // But a bridge channel scoped to vtransfer might already exist, so we make or
  // retrieve it as appropriate, then make its intercepting BridgeTargetKit,
  // and then finally configure the TransferMiddleware with that kit's registry.
  const { finisher, interceptorFactory, transferMiddleware } = await E(
    vats.transfer,
  ).makeTransferMiddlewareKit();
  const vtransferID = BRIDGE_ID.VTRANSFER;
  const provideBridgeTargetKit = async bridge =>
    E(vats.transfer).provideBridgeTargetKit(
      bridge,
      VTRANSFER_IBC_EVENT,
      interceptorFactory,
    );
  /** @type {Awaited<ReturnType<typeof provideBridgeTargetKit>>} */
  let bridgeTargetKit;
  try {
    const vtransferBridge = await makeScopedBridge(bridgeManager, vtransferID);
    produceVtransferBridgeManager.reset();
    produceVtransferBridgeManager.resolve(vtransferBridge);
    bridgeTargetKit = await provideBridgeTargetKit(vtransferBridge);
    await E(finisher).useRegistry(bridgeTargetKit.targetRegistry);
    await E(vtransferBridge).initHandler(bridgeTargetKit.bridgeHandler);
    console.info('Successfully initHandler for', vtransferID);
  } catch (e) {
    console.error(
      'Failed to initHandler',
      vtransferID,
      'reason:',
      e,
      'falling back to setHandler',
    );
    const vtransferBridge = await vtransferBridgeManagerP;
    bridgeTargetKit = await provideBridgeTargetKit(vtransferBridge);
    await E(finisher).useRegistry(bridgeTargetKit.targetRegistry);
    await E(vtransferBridge).setHandler(bridgeTargetKit.bridgeHandler);
    console.info('Successfully setHandler for', vtransferID);
  }

  produceTransferMiddleware.reset();
  produceTransferMiddleware.resolve(transferMiddleware);
};

export const getManifestForTransfer = (_powers, { transferRef }) => ({
  manifest: {
    [setupTransferMiddleware.name]: {
      consume: {
        loadCriticalVat: true,
        bridgeManager: 'bridge',
        vtransferBridgeManager: 'transfer',
      },
      produce: {
        transferMiddleware: 'transfer',
        transferVat: 'transfer',
        vtransferBridgeManager: 'transfer',
      },
    },
  },
  options: {
    transferRef,
  },
});
