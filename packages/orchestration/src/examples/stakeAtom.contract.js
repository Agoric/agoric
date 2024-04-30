// @ts-check
/**
 * @file Example contract that uses orchestration
 */
import { makeTracer } from '@agoric/internal';
import { makeDurableZone } from '@agoric/zone/durable.js';
import { V as E } from '@agoric/vat-data/vow.js';
import { M } from '@endo/patterns';
import { prepareRecorderKitMakers } from '@agoric/zoe/src/contractSupport';
import { prepareStakingAccountKit } from '../exos/stakingAccountKit.js';

const trace = makeTracer('StakeAtom');
/**
 * @import { OrchestrationService } from '../service.js'
 * @import { Baggage } from '@agoric/vat-data';
 * @import { IBCConnectionID } from '@agoric/vats';
 */

/**
 * @typedef {{
 *  hostConnectionId: IBCConnectionID;
 *  controllerConnectionId: IBCConnectionID;
 * }} StakeAtomTerms
 */

/**
 *
 * @param {ZCF<StakeAtomTerms>} zcf
 * @param {{
 *  orchestration: OrchestrationService;
 *  storageNode: StorageNode;
 *  marshaller: Marshaller;
 * }} privateArgs
 * @param {Baggage} baggage
 */
export const start = async (zcf, privateArgs, baggage) => {
  const { hostConnectionId, controllerConnectionId } = zcf.getTerms();
  const { orchestration, marshaller, storageNode } = privateArgs;

  const zone = makeDurableZone(baggage);

  const { makeRecorderKit } = prepareRecorderKitMakers(baggage, marshaller);

  const makeStakingAccountKit = prepareStakingAccountKit(
    baggage,
    makeRecorderKit,
    zcf,
  );

  async function createAccount() {
    const account = await E(orchestration).createAccount(
      hostConnectionId,
      controllerConnectionId,
    );
    const accountAddress = await E(account).getAccountAddress();
    trace('account address', accountAddress);
    const { holder, invitationMakers } = makeStakingAccountKit(
      account,
      storageNode,
      accountAddress,
    );
    return {
      publicSubscribers: holder.getPublicTopics(),
      invitationMakers,
      account: holder,
    };
  }

  const publicFacet = zone.exo(
    'StakeAtom',
    M.interface('StakeAtomI', {
      createAccount: M.callWhen().returns(M.remotable('ChainAccount')),
      makeCreateAccountInvitation: M.call().returns(M.promise()),
    }),
    {
      async createAccount() {
        trace('createAccount');
        return createAccount().then(({ account }) => account);
      },
      makeCreateAccountInvitation() {
        trace('makeCreateAccountInvitation');
        return zcf.makeInvitation(
          async seat => {
            seat.exit();
            return createAccount();
          },
          'wantStakingAccount',
          undefined,
          undefined,
        );
      },
    },
  );

  return { publicFacet };
};

/** @typedef {typeof start} StakeAtomSF */
