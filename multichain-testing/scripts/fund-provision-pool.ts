import childProcess from 'node:child_process';
import { sleep } from '../tools/sleep.js';
import { makeAgd } from '../tools/agd-lib.js';

const PROVISION_POOL_ADDR = 'agoric1megzytg65cyrgzs6fvzxgrcqvwwl7ugpt62346';
const PROVISION_POOL_AMOUNT = '1000000000uist'
// add retry logic, in case we get something like 'account sequence mismatch'
const MAX_RETRIES = 3;
const RETRY_DELAY = 500; // 0.5 seconds

const main = async () => {
  console.log('Funding provision pool...');
  const agd = makeAgd(childProcess).withOpts({ keyringBackend: 'test' });
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await agd.tx(
        ['bank', 'send', 'faucet', PROVISION_POOL_ADDR, PROVISION_POOL_AMOUNT],
        {
          chainId: 'agoriclocal',
          from: '$(agd keys show -a faucet)',
          yes: true,
        },
      );
      console.log(res);
      return;
    } catch (e) {
      console.error(`Attempt ${attempt} failed:`, e.message);
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY);
      } else {
        console.error('Max retries reached. Operation failed.');
        throw e;
      }
    }
  }
};

main().catch(error => {
  console.error('Error funding provision pool:', error);
  process.exit(1);
});
