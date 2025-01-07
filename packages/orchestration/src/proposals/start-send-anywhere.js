import {
  deeplyFulfilledObject,
  makeTracer,
  NonNullish,
} from '@agoric/internal';
import { E } from '@endo/far';

/// <reference types="@agoric/vats/src/core/types-ambient"/>

/**
 * @import {Installation} from '@agoric/zoe/src/zoeService/utils.js';
 * @import {CosmosChainInfo, Denom, DenomDetail} from '@agoric/orchestration';
 * @import {start as StartFn} from '@agoric/orchestration/src/examples/send-anywhere.contract.js';
 */

const trace = makeTracer('StartSA', true);

/**
 * @param {BootstrapPowers & {
 *   installation: {
 *     consume: {
 *       sendAnywhere: Installation<StartFn>;
 *     };
 *   };
 *   instance: {
 *     produce: {
 *       sendAnywhere: Producer<Instance>;
 *     };
 *   };
 *   issuer: {
 *     consume: {
 *       BLD: Issuer<'nat'>;
 *       IST: Issuer<'nat'>;
 *     };
 *   };
 * }} powers
 * @param {{
 *   options: {
 *     chainInfo: Record<string, CosmosChainInfo>;
 *     assetInfo: [Denom, DenomDetail & { brandKey?: string }][];
 *   };
 * }} config
 */
export const startSendAnywhere = async (
  {
    consume: {
      agoricNames,
      board,
      chainStorage,
      chainTimerService,
      cosmosInterchainService,
      localchain,
      startUpgradable,
    },
    installation: {
      consume: { sendAnywhere },
    },
    instance: {
      produce: { sendAnywhere: produceInstance },
    },
    issuer: {
      consume: { BLD, IST },
    },
  },
  { options: { chainInfo, assetInfo } },
) => {
  trace(startSendAnywhere.name);

  const marshaller = await E(board).getReadonlyMarshaller();

  const privateArgs = await deeplyFulfilledObject(
    harden({
      agoricNames,
      localchain,
      marshaller,
      orchestrationService: cosmosInterchainService,
      storageNode: E(NonNullish(await chainStorage)).makeChildNode(
        'send-anywhere',
      ),
      timerService: chainTimerService,
      chainInfo,
      assetInfo,
    }),
  );

  /** @param {() => Promise<Issuer>} p */
  const safeFulfill = async p =>
    E.when(
      p(),
      i => i,
      () => undefined,
    );

  const atomIssuer = await safeFulfill(async () =>
    E(agoricNames).lookup('issuer', 'ATOM'),
  );
  const osmoIssuer = await safeFulfill(async () =>
    E(agoricNames).lookup('issuer', 'OSMO'),
  );

  const issuerKeywordRecord = harden({
    BLD: await BLD,
    IST: await IST,
    ...(atomIssuer && { ATOM: atomIssuer }),
    ...(osmoIssuer && { OSMO: osmoIssuer }),
  });
  trace('issuerKeywordRecord', issuerKeywordRecord);

  const { instance } = await E(startUpgradable)({
    label: 'send-anywhere',
    installation: sendAnywhere,
    issuerKeywordRecord,
    privateArgs,
  });
  produceInstance.resolve(instance);
  trace('done');
};
harden(startSendAnywhere);

export const getManifest = ({ restoreRef }, { installationRef, options }) => {
  return {
    manifest: {
      [startSendAnywhere.name]: {
        consume: {
          agoricNames: true,
          board: true,
          chainStorage: true,
          chainTimerService: true,
          cosmosInterchainService: true,
          localchain: true,

          startUpgradable: true,
        },
        installation: {
          consume: { sendAnywhere: true },
        },
        instance: {
          produce: { sendAnywhere: true },
        },
        issuer: {
          consume: { BLD: true, IST: true },
        },
      },
    },
    installations: {
      sendAnywhere: restoreRef(installationRef),
    },
    options,
  };
};
