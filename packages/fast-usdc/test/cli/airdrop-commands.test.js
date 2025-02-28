/**
 * @file Attempt at creating interface for communicating between agoric account <--> airdrop contract instance
 *
 * Currently....
 * 1. outputActionAndHint does not seem to be succeeding.
 * 2. test throws the following error:
 *    Error {
 *      message: 'internal: decodeRemotableFromSmallcaps option must return a remotable: "board0257"',
 *    }
 *
 */
import { makeMarshal } from '@endo/marshal';
import test from 'ava';
import { Command } from 'commander';
import { flags } from '../../tools/cli-tools.js';
import {
  fetchEnvNetworkConfig,
  makeSmartWalletKit,
} from '@agoric/client-utils';
import { outputActionAndHint } from '../../src/cli/bridge-action.js';

const offerArgs = {
  pubkey: 'AnEGbxH55aKu/9zIbgVDV2qXC43bpIqtZdHTKV8BAM58',
  tier: 0,
  proof: [
    {
      hash: '65841582aae8dcb596cb38ff196ac070f83bd019b879ed97041e6be416a1d385',
      direction: 'left',
    },
    {
      hash: 'd0bb415aaec20b82f17bb886d2c48ee7c3259af5010f53005641803aba7a2175',
      direction: 'right',
    },
    {
      hash: '6c745c21ba3edb5109aae76d9fd7a4a8dca6432966b4db8a18ddc9d9cb154580',
      direction: 'right',
    },
    {
      hash: 'f38a7b08ac5a9b5a25d50bf562bdfccde70bb54802cd7efb2ffe7f9d8def424d',
      direction: 'right',
    },
    {
      hash: '403f53a2a7b81f1323d66cc8a8965d5dbeba25cf77e731101eae8689fcb0bbee',
      direction: 'right',
    },
    {
      hash: 'd4f10c6b26ef2bbfb127e12fd1d98791d5b718286e230ab9b843d8ce8f41b87a',
      direction: 'right',
    },
    {
      hash: '64f6e4008ca2c1bb635da596d907c1370df8a24a0261f3af1b6bcf8905190ee1',
      direction: 'right',
    },
    {
      hash: '1d990892f1fe1f8d5c0af3664eb13b327776f961e6461384e323ebcb9921a14f',
      direction: 'right',
    },
    {
      hash: 'cf780e6e280c26d5c951eb9a42c1b1e0c07d30d414656d82f4ad9312605c341c',
      direction: 'right',
    },
    {
      hash: '702b3d244dc26e284ff0339ed0915a71f8ca5154e7e53b4066ecc41fc5b76da4',
      direction: 'right',
    },
    {
      hash: '4760036b289220fa586c87e0a3cfb78b124a5c4dc5e5d6227d2df4384b8c16b6',
      direction: 'right',
    },
  ],
};

/**
 * mock stdout / stderr, for example
 *
 * @param {string[]} buf - caller-provided buffer for written data
 * @returns {import('node:stream').Writable} A writable stream mock
 */
export const mockStream = buf => ({
  write: txt => {
    buf.push(txt);
    return true;
  },
});
// Utility functions
const isNull = obj => obj === null || obj === undefined;
const isObject = value => typeof value === 'object' && !isNull(value);
const createIndent = depth => '---'.repeat(depth);
const log = message => console.info(message);

// Main recursive function using functional composition
const inspectObject = (obj, depth = 0) =>
  isNull(obj)
    ? log('null or undefined')
    : Object.entries(obj).reduce((_, [key, value]) => {
        const indent = createIndent(depth);
        log(`${indent}${key}:`);
        return isObject(value)
          ? inspectObject(value, depth + 1)
          : log(`${indent}  ${value}`);
      }, null);

const marshalData = makeMarshal(_v => assert.fail('data only'));

const getInstance = instanceName => walletKit =>
  Promise.resolve(walletKit.agoricNames.instance[instanceName]);

const getBrand = brandName => walletKit =>
  Promise.resolve(walletKit.agoricNames.brand[brandName]);

const getInstanceAndBrand =
  ({ brandName, instanceName }) =>
  wk =>
    Promise.all([getInstance(instanceName)(wk), getBrand(brandName)(wk)]);
const handleFetchNetworkConfig = ({ env, fetch }) =>
  fetchEnvNetworkConfig({ env, fetch });

const handleMakeSmartWalletKit =
  ({ delay, fetch }) =>
  networkConfig =>
    makeSmartWalletKit({ delay, fetch }, networkConfig);

const makeClaimAirdropOffer = (
  { feeBrand, instanceName },
  { proof, tier, pubkey },
) => ({
  id: `offer-${pubkey.slice(0, 10)}`,
  invitationSpec: {
    source: 'agoricContract',
    instancePath: [instanceName],
    callPipe: [['makeClaimTokensInvitation']],
  },
  proposal: {
    give: {
      Fee: {
        brand: feeBrand,
        value: 5n,
      },
    },
  },
  offerArgs: {
    proof,
    tier,
    pubkey,
  },
});

const trace = label => value => {
  console.log(label, '::::', value);
  return value;
};
const traceAsync = label => value => Promise.resolve(value).then(trace(label));

const composeM =
  method =>
  (...ms) =>
    ms.reduce((f, g) => x => g(x)[method](f));

const composePromises = composeM('then');

// Successfully
const collectPowers = config =>
  composePromises(
    trace('inspecting walletKit capabilities'),
    handleMakeSmartWalletKit(config),
    traceAsync('network config'),
    () => handleFetchNetworkConfig({ env: config.env, fetch: config.fetch }),
  );

const addAirdropCommands = (program, { fetch, stderr, stdout }) => ({
  operator: program.command('claimer').description('Claim airdrop commands'),
  invoke() {
    this.operator
      .command('send')
      .description(
        'constructs an OfferSpec in accordance with makeClaimTokensInvitation from ertp-airdrop.',
      )
      .option('--proof <string>', 'Proof', String)
      .option('--pubkey <string>', 'Public key', String)
      .option('--tier <number>', 'Tier', Number)
      .action(async opts => {
        const { proof, tier, pubkey } = opts;
        const powers = await collectPowers({
          delay: 500,
          fetch,
          env: { AGORIC_NET: 'xnet' },
        })();

        const [instance, brand] = await getInstanceAndBrand({
          brandName: 'IST',
          instanceName: 'tribblesXnetDeployment',
        })(powers);
        console.log('------------------------');
        console.log({ instance, brand });

        /** @type {import('@agoric/smart-wallet/src/invitations.js').InvitationSpec} */
        const offer = makeClaimAirdropOffer(
          { feeBrand: brand, instanceName: 'tribblesXnetDeployment' },
          { proof, tier, pubkey },
        );

        console.log({ offer });
        outputActionAndHint(
          { method: 'executeOffer', offer },
          { stderr, stdout },
          powers.marshaller,
        );
      });
    return this.operator;
  },
});

export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Alternative: Async pipe executes functions left to right (sometimes more intuitive)

test('tribbles airdrop program', async t => {
  const program = new Command('Airdrop');
  const claimArgs = harden(offerArgs);
  const { proof, pubkey, tier } = claimArgs;

  const stringProof = JSON.stringify(proof);

  const argv = [
    ...`node Airdrop claimer send`.split(' '),
    ...flags({ proof: stringProof, pubkey, tier }),
  ];
  t.log(...argv);
  program.exitOverride();
  const out = [];
  const err = [];

  addAirdropCommands(program, {
    fetch: fetch,
    stdout: mockStream(out),
    stderr: mockStream(err),
    env: {},
    now: () => 1234,
  }).invoke();
  await program.parseAsync(argv);

  const action = marshalData.fromCapData(JSON.parse(out.join('')));

  t.deepEqual(action, []);
});
