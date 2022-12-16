# Inter Protocol Preview: Interchain Asset Vaults

## Add ATOM to Vaults

We propose to add Cosmos Testnet tokens as a collateral
in the Inter Protocol Vaults, standing in for ATOM. The
debt limit will be 0 until the governance committee decides
there is sufficient AMM liquidity and such to raise the debt limit.

## Choose Oracle Operators

This proposal specifies addresses of Chainlink Oracle operators
responsible for the ATOM / USD price pair. This includes a
revised price aggregation contract to address rounding issues.

## Seat Economic Committee

We also propose to seat the Inter Protocol economic committee as follows:

      Bill: "agoric1xgw4cknedau6xhrlyn6c8e40d02mejee8gwnef",
      Dan: "agoric14s56vwftwx8p5kz23fercqptnwex5uw2yj903l",
      Rowland: "agoric1qed57ae8k5cqr30u5mmd46jdxfr0juyggxv6ad",

## Background

This is a `swingset-core-eval` proposal that includes JavaScript to execute to enact the proposal, as well as a JSON policy to limit the capabilities of the proposal.

See also:

- [using keplr wallet for devnet governance and staking](https://github.com/Agoric/documentation/issues/668)
- [Install Inter Protocol Preview release in devnet on April 22 · Issue \#5062 · Agoric/agoric\-sdk](https://github.com/Agoric/agoric-sdk/issues/5062)
- https://agoric.com/discord channel `#devnet`
- https://commonwealth.im/agoric
