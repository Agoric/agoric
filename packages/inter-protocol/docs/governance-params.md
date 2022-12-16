## Inter Protocol Governance parameters

This page documents the Governance-controlled parameters of the major Inter Protocol contracts.

Below, for each contract you will find the governance keys for the various parameters,
the type of each parameter, and an indicator of whether that parameter is described in
the Inter Protocol Whitepaper, v0.8.

### Vault Manager

In `packages/inter-protocol/src/vaultFactory/params.js`:

| Governance Key     | Type     | WP? |
| ------------------ | :------- | --- |
| DebtLimit          | Amount   | Yes |
| LiquidationMargin  | Ratio    | Yes |
| LiquidationPenalty | Ratio    | Yes |
| InterestRate       | Ratio    | Yes |
| LoanFee            | Ratio    | Yes |
| ChargingPeriod     | NatValue |     |
| RecordingPeriod    | NatValue |     |

From Inter Protocol Whitepaper, v0.8:

> Governance determines the approved collateral types: the crypto assets that can be used as collateral in vaults. In addition, it sets and manages the parameters associated with each collateral type based on the risk of the asset. These include the total debt limit, the collateralization ratio, the stability fee, and the liquidation penalty.

Note that the "stability fee" described in the Whitepaper comprises both InterestRate and LoanFee.

### Automated Market Maker (AMM)

In `packages/inter-protocol/src/vpool-xyk-amm/multipoolMarketMaker.js`:

| Governance Key | Type           | WP? |
| -------------- | :------------- | --- |
| PoolFee        | ParamTypes.NAT | N/A |
| ProtocolFee    | ParamTypes.NAT | N/A |

The Inter Protocol Whitepaper v0.8 does not describe the governance parameters
for this contract.

### Collateral Reserve

In `packages/inter-protocol/src/reserve/collateralReserve.js`:

| Governance Key | Type                | WP? |
| -------------- | :------------------ | --- |
| AmmInstance    | ParamTypes.INSTANCE | N/A |

The Inter Protocol Whitepaper v0.8 does not describe the governance parameters
for this contract.

### stakeFactory

In `packages/inter-protocol/src/stakeFactory/stakeFactory.js`:

| Governance Key | Type              | WP? |
| -------------- | :---------------- | --- |
| DebtLimit      | ParamTypes.AMOUNT | Yes |
| InterestRate   | ParamTypes.RATIO  | Yes |
| LoanFee        | ParamTypes.RATIO  | Yes |
| MintingRatio   | ParamTypes.RATIO  | Yes |

From Inter Protocol Whitepaper, v0.8:

> Governance through the BLDer DAO determines the parameters for stakeFactory. These include the total debt limit, the minting limit per account, and minting fees and interest rates.

### Parity Stability Mechanism (PSM)

In `packages/inter-protocol/src/psm/psm.js`:

| Governance Key | Type   | WP? |
| -------------- | :----- | --- |
| WantMintedFee  | Ratio  | N/A |
| GiveMintedFee  | Ratio  | N/A |
| MintLimit      | Amount | N/A |

The Inter Protocol Whitepaper v0.8 does not describe the governance parameters
for this contract.

### Provision Pool

In `packages/vats/src/provisionPool.js`:

| Governance Key          | Type   | WP? |
| ----------------------- | :----- | --- |
| PerAccountInitialAmount | Amount | N/A |
