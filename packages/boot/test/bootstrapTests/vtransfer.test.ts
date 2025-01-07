import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import type { TestFn } from 'ava';

import type { ScopedBridgeManager } from '@agoric/vats';
import type { TransferMiddleware } from '@agoric/vats/src/transfer.js';
import type { TransferVat } from '@agoric/vats/src/vat-transfer.js';
import { BridgeId } from '@agoric/internal';
import { VTRANSFER_IBC_EVENT } from '@agoric/internal/src/action-types.js';
import { makeSwingsetTestKit } from '../../tools/supports.js';

const makeDefaultTestContext = async t => {
  const swingsetTestKit = await makeSwingsetTestKit(t.log, undefined, {
    configSpecifier: '@agoric/vm-config/decentral-demo-config.json',
  });
  return swingsetTestKit;
};
type DefaultTestContext = Awaited<ReturnType<typeof makeDefaultTestContext>>;

const test: TestFn<DefaultTestContext> = anyTest;

test.before(async t => (t.context = await makeDefaultTestContext(t)));
test.after.always(async t => t.context.shutdown?.());

test('vtransfer', async t => {
  const {
    buildProposal,
    evalProposal,
    bridgeUtils: { getOutboundMessages },
    runUtils,
  } = t.context;
  const { EV } = runUtils;

  // Pull what transfer-proposal produced into local scope
  const transferVat = (await EV.vat('bootstrap').consumeItem(
    'transferVat',
  )) as ERef<TransferVat>;
  t.truthy(transferVat);
  const transferMiddleware = (await EV.vat('bootstrap').consumeItem(
    'transferMiddleware',
  )) as TransferMiddleware;
  t.truthy(transferMiddleware);
  const vtransferBridgeManager = (await EV.vat('bootstrap').consumeItem(
    'vtransferBridgeManager',
  )) as ScopedBridgeManager<'vtransfer'>;
  t.truthy(vtransferBridgeManager);

  // only VTRANSFER_IBC_EVENT is supported by vtransferBridgeManager
  await t.throwsAsync(
    EV(vtransferBridgeManager).fromBridge({
      type: 'VTRANSFER_OTHER',
    }),
    {
      message: `Invalid inbound event type "VTRANSFER_OTHER"; expected "${VTRANSFER_IBC_EVENT}"`,
    },
  );

  const target = 'agoric1vtransfertest';
  const packet = 'thisIsPacket';

  // 0 interceptors for target

  // it's an error to target an address before an interceptor is registered
  await t.throwsAsync(
    EV(vtransferBridgeManager).fromBridge({
      target,
      type: VTRANSFER_IBC_EVENT,
      event: 'echo',
    }),
    {
      message:
        'key "agoric1vtransfertest" not found in collection "targetToApp"',
    },
  );

  // 1 interceptors for target

  // Tap into VTRANSFER_IBC_EVENT messages
  const testVtransferProposal = buildProposal(
    '@agoric/builders/scripts/vats/test-vtransfer.js',
  );
  await evalProposal(testVtransferProposal);

  // simulate a Golang upcall with arbitrary payload
  // note that property order matters!
  const expectedAckData = {
    event: 'writeAcknowledgement',
    packet,
    target,
    type: VTRANSFER_IBC_EVENT,
  };

  await EV(vtransferBridgeManager).fromBridge(expectedAckData);

  // verify the ackMethod outbound
  const messages = getOutboundMessages(BridgeId.VTRANSFER);
  t.deepEqual(messages, [
    {
      target,
      type: 'BRIDGE_TARGET_REGISTER',
    },
    {
      ack: btoa(JSON.stringify(expectedAckData)),
      method: 'receiveExecuted',
      packet,
      type: 'IBC_METHOD',
    },
  ]);

  // test adding an interceptor for the same target, which should fail
  await t.throwsAsync(async () => evalProposal(testVtransferProposal), {
    message: /Target.*already registered/,
  });
});
