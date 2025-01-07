import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import { Far } from '@endo/far';
import { heapVowE as E } from '@agoric/vow/vat.js';
import { commonSetup } from '../supports.js';
import { preparePortfolioHolder } from '../../src/exos/portfolio-holder-kit.js';
import { prepareMakeTestLOAKit } from './make-test-loa-kit.js';
import { prepareMakeTestCOAKit } from './make-test-coa-kit.js';

test('portfolio holder kit behaviors', async t => {
  const common = await commonSetup(t);
  common.utils.populateChainHub();
  const { rootZone, storage, vowTools } = common.bootstrap;
  const storageNode = storage.rootNode.makeChildNode('accounts');

  /**
   * mock zcf that echos back the offer description
   */
  const mockZcf = Far('MockZCF', {
    /** @type {ZCF['makeInvitation']} */
    makeInvitation: async (offerHandler, description, ..._rest) => {
      t.is(typeof offerHandler, 'function');
      const p = new Promise(resolve => resolve(description));
      return p;
    },
  });

  const makeTestCOAKit = prepareMakeTestCOAKit(t, common, {
    zcf: mockZcf,
  });
  const makeTestLOAKit = prepareMakeTestLOAKit(t, common, { zcf: mockZcf });
  const makeCosmosAccount = async ({
    chainId,
    hostConnectionId,
    controllerConnectionId,
  }) => {
    return makeTestCOAKit({
      storageNode,
      chainId,
      hostConnectionId,
      controllerConnectionId,
    });
  };

  const makeLocalAccount = async () => {
    return makeTestLOAKit({ storageNode });
  };

  const accounts = {
    cosmoshub: await makeCosmosAccount({
      chainId: 'cosmoshub-99',
      hostConnectionId: 'connection-0' as const,
      controllerConnectionId: 'connection-1' as const,
    }),
    agoric: await makeLocalAccount(),
  };
  const accountEntries = harden(Object.entries(accounts));

  const makePortfolioHolder = preparePortfolioHolder(
    rootZone.subZone('portfolio'),
    vowTools,
  );
  const publicTopicEntries = harden(
    await Promise.all(
      Object.entries(accounts).map(async ([chainName, holder]) => {
        const { account } = await E(holder).getPublicTopics();
        return [chainName, account];
      }),
    ),
  );
  // @ts-expect-error type mismatch between kit and OrchestrationAccountI
  const holder = makePortfolioHolder(accountEntries, publicTopicEntries);

  const cosmosAccount = await E(holder).getAccount('cosmoshub');
  t.is(
    cosmosAccount,
    accounts.cosmoshub,
    'same account holder kit provided is returned',
  );

  const { invitationMakers } = await E(holder).asContinuingOffer();

  const delegateInv = await E(invitationMakers).Proxying(
    'cosmoshub',
    'Delegate',
    [
      {
        value: 'cosmos1valoper',
        chainId: 'cosmoshub-99',
        encoding: 'bech32',
      },
      {
        denom: 'uatom',
        value: 10n,
      },
    ],
  );

  t.is(
    delegateInv,
    // note: mocked zcf (we are not in a contract) returns inv description
    // @ts-expect-error Argument of type 'string' is not assignable to parameter of type 'Vow<any>'
    'Delegate',
    'any invitation maker accessible via Proxying',
  );

  // scenario with optional invitationArgs
  const transferInv = await E(invitationMakers).Proxying(
    'cosmoshub',
    'Transfer',
  );
  t.is(
    transferInv,
    // note: mocked zcf (we are not in a contract) returns inv description
    // @ts-expect-error Argument of type 'string' is not assignable to parameter of type 'Vow<any>'
    'Transfer',
    'invitationArgs are optional',
  );

  const osmosisAccount = await makeCosmosAccount({
    chainId: 'osmosis-99',
    hostConnectionId: 'connection-2' as const,
    controllerConnectionId: 'connection-3' as const,
  });

  const osmosisTopic = (await E(osmosisAccount).getPublicTopics()).account;

  await E(holder).addAccount(
    'osmosis',
    osmosisAccount,
    // @ts-expect-error the promise from `subscriber.getUpdateSince` can't be used in a flow
    osmosisTopic,
  );

  t.is(
    await E(holder).getAccount('osmosis'),
    osmosisAccount,
    'new accounts can be added',
  );

  t.snapshot(await E(holder).getPublicTopics(), 'public topics');
});
