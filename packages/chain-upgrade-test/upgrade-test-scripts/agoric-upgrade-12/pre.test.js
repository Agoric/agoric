import test from 'ava';

import { waitForBlock } from '../commonUpgradeHelpers.js';
import { getIncarnation } from './tools/vat-status.js';

test.before(async () => {
  console.log('Wait for upgrade to settle');

  await waitForBlock(5);
});

test(`Ensure Zoe Vat is at 0`, async t => {
  const incarnation = await getIncarnation('zoe');
  t.is(incarnation, 0);
});

test('Ensure Network Vat is at 0', async t => {
  const incarnation = await getIncarnation('network');
  t.is(incarnation, 0);
});
