# Inter Protocol Liquidation Bidding Test Tool

***Note: For information on bidding on mainnet, see [Bidding For Liquidated Collateral](https://docs.inter.trade/user-how-to/bidding-for-liquidated-collateral) on https://docs.inter.trade 

The `agops` command (from the `agoric` package in `packages/agoric-cli`)
supports the role of liquidation bidder using a unix command-line interface (CLI).

```
$ inter bid by-price --give 85IST --price 8.55 --from test-acct | jq
bid is broadcast:
{
  "timestamp": "2023-03-31T05:46:27Z",
  "height": "54871",
  "offerId": "bid-1680241587424",
  "txhash": "CC8D778F51867B36CB91D0..."
}
{
  "id": "bid-1680241587424",
  "price": "8.50 IST/ATOM",
  "give": { "Currency": "85 IST" },
  "maxBuy": "1000000 ATOM",
  "result": "Your bid has been accepted"
}
```

Then perhaps yours is the winning bid:

```
$ inter bid list --from test-acct --all | jq
{
  "id": "bid-1680241587424",
  "payouts": {"Collateral":"3.105 ATOM"}
}
```

See also [test-inter-cli.js.md](../../../agoric-cli/test/snapshots/inter-cli.test.js.md) for exhaustive command options.

## Installation

To install `agd` and `agops` as well as prerequisite dev tools (`go`, `node`, `yarn`):

```sh
git clone https://github.com/Agoric/agoric-sdk
cd agoric-sdk
SKIP_DOWNLOAD=false ./bin/agd build
```


### Locating the `agd` command

To ensure `agd` is in your `$PATH`:

```sh
export PATH=$PWD/bin:$PATH
```

Then try `agd version` to confirm.

### Locating the `agops inter` command

`agops` follows `npm`/`yarn` conventions, so you can `yarn run agops inter` as long as your current directory is under `agoric-sdk`.

#### Add an alias for `agops inter`

```sh
alias inter="yarn run agops inter"
```

Then you can just run...

```
$ inter
Usage: agops inter [options] [command]

Inter Protocol commands for liquidation bidding etc.
...
```


## Key management with `agd`

If you don't already have a testing address and corresponding private key:

```sh
agd keys add test-acct --keyring-backend=test
```

For example:

```
$ agd keys add test-acct --keyring-backend=test

- name: test-acct
  type: local
  address: agoric18jr9nlvp300feu726y3v4n07ykfjwup3twnlyn
  pubkey: '{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"ApPNaneZjAWy2RarLaIw5O3vkBD6R3uZ9F2eRogei2BO"}'
  mnemonic: ""


**Important** write this mnemonic phrase in a safe place.
It is the only way to recover your account if you ever forget your password.

abandon plate bind ...
```

**CAUTION**: `agd keys add` displays the private mnemonic.


Using the `test` keyring is lower friction, but feel free to use the os keyring:

```sh
agd keys add test-acct
```


## Adding some tokens to your account

If you see something like this when you try sign and send a transaction with a brand new key...

```
$ inter bid by-price --from test-acct --give 10IST --price 3
Error: key with address 3C8659F... not found: key not found
Usage: ...
...
```

It's because the blockchain has no record of your account until some tokens are sent to it.

Use https://devnet.faucet.agoric.net/ to get some BLD and toy IBC asset tokens.

Confirm by querying your balances:

```
$ agd query bank balances agoric18jr9nlvp... --node=https://devnet.rpc.agoric.net:443
balances:
- amount: "25000000"
  denom: ibc/toyatom
- amount: "75000000"
  denom: ubld
```

**Note:** The URLs of the faucet, RPC node, explorer, etc. are available at https://devnet.agoric.net/ .

## Provisioning your account for use with Zoe smart contracts

Introducing your account to Zoe involves provisioning an offer handler.

Again, use https://devnet.agoric.net/ but this time, choose "send IST and provision ...".


## Liquidation Auction Status

To see what's available:

```
$ inter auction status
{
  book0: {
    collateralAvailable: '0 ATOM',
    currentPriceLevel: '4.4955 IST/ATOM',
    startCollateral: '0 ATOM',
    startPrice: '9.99 IST/ATOM',
  },
  params: {
    ClockStep: '00:00:10',
    DiscountStep: '5.00%',
    LowestRate: '45.00%',
  },
  schedule: {
    nextDescendingStepTime: '2023-04-19T03:35:02.000Z',
    nextStartTime: '2023-04-19T03:35:02.000Z',
  },
}
```

## Choosing a network configuration with `AGORIC_NET`

By default, `agops` tries to contact a local node. If you don't have one running, you may see...

```
$ inter liquidation status
(Error#1)
Error#1: cannot read data of published.agoricNames.brand: request to http://0.0.0.0:26657/abci_query?path=%22/custom/vstorage/data/published.agoricNames.brand%22&height=0 failed, reason: connect ECONNREFUSED 0.0.0.0:26657
```

https://devnet.agoric.net/network-config has details such as `chainName`, `rpcAddrs`. To tell `agops` to use it:

```sh
export AGORIC_NET=devnet
```


## Smart Contract Token Metadata: `inter vbank list`

You may notice that `inter liquidation status` used the name `IST` where `agd query bank balances` shows `uist`. And the decimals were different.

Electronic Rights Transfer Protocol (ERTP) is the token abstraction used in the Agoric smart contract platform. Cosmos-SDK denoms are reflected as ERTP issuers and brands via the **vbank**. Use `inter vbank list` To see the correspondence:

```
$ inter vbank list
[
  {
    "issuerName": "BLD",
    "denom": "ubld",
    "brand": { "boardId": "board0223" },
    "displayInfo": { "decimalPlaces": 6 }
  },
  {
    "issuerName": "IST",
    "denom": "uist",
    "brand": { "boardId": "board0566" },
    "displayInfo": { "decimalPlaces": 6 }
  },
  {
    "issuerName": "ATOM",
    "denom": "ibc/toyatom",
    "brand": { "boardId": "board03446" },
    "displayInfo": { "decimalPlaces": 6 }
  }
]
```


## Placing a bid: `inter bid ...`

Let's place a 5 IST bid at a price of 9.50:

```
$ inter bid by-price --give 5IST --price 9.50 --from test-acct
2023-03-31T07:07:33.319399551Z tx not in block 55762 retrying...
2023-03-31T07:07:33.319399551Z tx not in block 55762 retrying...
bid is broadcast:
{"timestamp":"2023-03-31T07:07:38Z","height":"55763","offerId":"bid-1680246460034","txhash":"FDB98EEC71E987FEEE4A..."}
{"id":"bid-1680246460034","price":"9.5 IST/ATOM","give":{"Currency":"5 IST"},"maxBuy": "1000000 ATOM","result":"Your bid has been accepted"}
```

This command does several things:

  1. formats the bid as a Zoe offer specification
  2. signs and broadcasts a transaction containing the offer spec
  3. waits for the transaction to be included in a block
  4. waits for the offer to be placed with the auctioneer contract via Zoe


## Listing your open bids: `inter bid list`

```
$ inter bid list --from test-acct
{"id":"bid-1680246460034","price":"9.5 IST/ATOM","give":{"Currency":"5 IST"},"maxBuy": "1000000 ATOM","result":"Your bid has been accepted"}
```

### Listing all bids, including payouts, with `--all`

If you win an auction, the winning bid will no longer be open; so use `--all`:

```
$ inter bid list --from test-acct --all
{"id":"bid-123142131231","price":"10 IST/ATOM","give":{"Currency":"10 IST"},"maxBuy": "1000000 ATOM","payouts":{"Currency":"10IST"}}
{"id":"bid-1680232100993","price":"5 IST/ATOM","give":{"Currency":"0.7 IST"},"maxBuy": "1000000 ATOM","result":"Your bid has been accepted"}
```


## Canceling a bid: `inter bid cancel`

```
$ inter bid cancel bid-1680246460034 --from test-acct
2023-03-31T07:22:46.249734011Z tx not in block 55929 retrying...
2023-03-31T07:22:46.249734011Z tx not in block 55929 retrying...
cancel action is broadcast:
{"timestamp":"2023-03-31T07:22:51Z","height":"55930","offerId":"bid-1680246460034","txhash":"5E855848A12C..."}
bid bid-1680246460034 is no longer live
{"time":"2023-03-31T07:22:51.77137307Z","height":"55930"}
```

A cancelled bid is refunded; this is shown as `payouts` when using `inter bid list --all`:

```
$ inter bid list --all --from test-acct | grep bid-1680246460034
{"id":"bid-1680246460034","price":"9.5 IST/ATOM","give":{"Currency":"5 IST"},"maxBuy": "1000000 ATOM","payouts":{"Collateral":"0 ATOM","Currency":"5 IST"}}
```

## Bid History and Pruning

Bid history is subject to the [pruning policy](https://github.com/cosmos/cosmos-sdk/blob/58f3a4a2375f0b617ee0ac3399085c1f996195ba/tools/confix/data/v0.45-app.toml#L13-L22)
 of the node that you are conneting to. To be sure you have the full history of your bids available, [run your own node](https://github.com/Agoric/agoric-sdk/wiki/Validator-Guide).
