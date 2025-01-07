// @jessie-check
// @ts-check

import {
  handleParamGovernance,
  ParamTypes,
  publicMixinAPI,
} from '@agoric/governance';
import { InvitationShape } from '@agoric/governance/src/typeGuards.js';
import { M } from '@agoric/store';
import { prepareExo } from '@agoric/vat-data';
import { provideSingleton } from '@agoric/zoe/src/contractSupport/durability.js';
import { prepareRecorderKitMakers } from '@agoric/zoe/src/contractSupport/recorder.js';
import { TopicsRecordShape } from '@agoric/zoe/src/contractSupport/topics.js';
import { makeDurableZone } from '@agoric/zone/durable.js';
import {
  prepareBridgeProvisionTool,
  prepareProvisionPoolKit,
} from './provisionPoolKit.js';

/** @import {Marshal} from '@endo/marshal'; */

/** @type {ContractMeta} */
export const meta = {
  privateArgsShape: M.splitRecord(
    {
      poolBank: M.eref(M.remotable('bank')),
      storageNode: M.eref(M.remotable('storageNode')),
      marshaller: M.eref(M.remotable('marshaller')),
    },
    {
      // only necessary on first invocation, not subsequent
      initialPoserInvitation: InvitationShape,
      metricsOverride: M.recordOf(M.string()),
    },
  ),
  upgradability: 'canUpgrade',
};
harden(meta);

/**
 * @typedef {StandardTerms &
 *   GovernanceTerms<{
 *     PerAccountInitialAmount: 'amount';
 *   }>} ProvisionTerms
 *   TODO: ERef<GovernedCreatorFacet<ProvisionCreator>>
 * @param {ZCF<ProvisionTerms>} zcf
 * @param {{
 *   poolBank: import('@endo/far').ERef<
 *     import('@agoric/vats/src/vat-bank.js').Bank
 *   >;
 *   initialPoserInvitation: Invitation;
 *   storageNode: StorageNode;
 *   marshaller: Marshal<any>;
 *   metricsOverride?: import('./provisionPoolKit.js').MetricsNotification;
 *   governedParamOverrides?: Record<string, Amount | undefined>;
 * }} privateArgs
 * @param {import('@agoric/vat-data').Baggage} baggage
 */
export const start = async (zcf, privateArgs, baggage) => {
  const { poolBank, metricsOverride } = privateArgs;

  const { makeRecorderKit } = prepareRecorderKitMakers(
    baggage,
    privateArgs.marshaller,
  );

  // Governance
  const { publicMixin, makeDurableGovernorFacet, params } =
    await handleParamGovernance(
      zcf,
      privateArgs.initialPoserInvitation,
      {
        PerAccountInitialAmount: ParamTypes.AMOUNT,
      },
      privateArgs.storageNode,
      privateArgs.marshaller,
      privateArgs.governedParamOverrides,
    );

  const zone = makeDurableZone(baggage);

  const makeBridgeProvisionTool = prepareBridgeProvisionTool(zone);
  const makeProvisionPoolKit = prepareProvisionPoolKit(zone, {
    makeRecorderKit,
    params,
    poolBank,
    zcf,
    makeBridgeProvisionTool,
  });

  const provisionPoolKit = await provideSingleton(
    baggage,
    'provisionPoolKit',
    async () =>
      makeProvisionPoolKit({
        // XXX governance can change the brand of the amount but should only be able to change the value
        // NB: changing the brand will break this pool
        // @ts-expect-error XXX Brand AssetKind
        poolBrand: params.getPerAccountInitialAmount().brand,
        storageNode: privateArgs.storageNode,
      }),
    kit => kit.helper.start({ metrics: metricsOverride }),
  );

  const publicFacet = prepareExo(
    baggage,
    'Provisioning Pool public',
    M.interface('ProvisionPool', {
      getMetrics: M.call().returns(M.remotable('MetricsSubscriber')),
      getPublicTopics: M.call().returns(TopicsRecordShape),
      ...publicMixinAPI,
    }),
    {
      getMetrics() {
        return provisionPoolKit.public.getPublicTopics().metrics.subscriber;
      },
      getPublicTopics() {
        return provisionPoolKit.public.getPublicTopics();
      },
      ...publicMixin,
    },
  );

  return harden({
    creatorFacet: makeDurableGovernorFacet(baggage, provisionPoolKit.machine)
      .governorFacet,
    publicFacet,
  });
};

harden(start);
