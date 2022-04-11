## RUN Protocol Governance parameters

This page documents the Governance-controlled parameters of the major RUN Protocol contracts.

Below, for each contract you will find the governance keys for the various parameters,
the type of each parameter, and an indicator of whether that parameter is described in
the RUN Protocol Whitepaper, v0.8.  

### Vault Manager

In `packages/run-protocol/src/vaultFactory/params.js`:

| Governance Key     | Type              | WP? |
| ------------------ | :---------------- | --- |
| DebtLimit          | ParamTypes.AMOUNT | Yes |
| LiquidationMargin  | ParamTypes.RATIO  | Yes |
| LiquidationPenalty | ParamTypes.RATIO  | Yes |
| InterestRate       | ParamTypes.RATIO  |     |
| LoanFee            | ParamTypes.RATIO  |     |
| ChargingPeriod     | 'nat'             |     |
| RecordingPeriod    | 'nat'             |     |

From RUN Protocol Whitepaper, v0.8:  
>Governance determines the approved collateral types: the crypto assets that can be used as collateral in vaults. In addition, it sets and manages the parameters associated with each collateral type based on the risk of the asset. These include the total debt limit, the collateralization ratio, the stability fee, and the liquidation penalty. 

### Automated Market Maker (AMM)

In `packages/run-protocol/src/vpool-xyk-amm/multipoolMarketMaker.js`:

| Governance Key     | Type              | WP? |
| ------------------ | :---------------- | --- |
| PoolFee            | ParamTypes.NAT    | N/A |
| ProtocolFee        | ParamTypes.NAT    | N/A |

The RUN Protocol Whitepaper v0.8 does not describe the governance parameters
for this contract.  

### Collateral Reserve

In `packages/run-protocol/src/reserve/collateralReserve.js`:

| Governance Key     | Type                | WP? |
| ------------------ | :------------------ | --- |
| AmmInstance        | ParamTypes.INSTANCE | N/A |

The RUN Protocol Whitepaper v0.8 does not describe the governance parameters
for this contract.  

### RUNStake

In `packages/run-protocol/src/runStake/runStake.js`:

| Governance Key     | Type                | WP? |
| ------------------ | :------------------ | --- |
| DebtLimit          | ParamTypes.AMOUNT   | Yes |
| InterestRate       | ParamTypes.RATIO    | Yes |
| LoanFee            | ParamTypes.RATIO    | Yes |
| MintingRatio       | ParamTypes.RATIO    | Yes |

From RUN Protocol Whitepaper, v0.8:  
>Governance through the BLDer DAO determines the parameters for RUNstake. These include the total debt limit, the minting limit per account, and minting fees and interest rates. 

### Parity Stability Mechanism (PSM)

In `packages/run-protocol/src/psm/psm.js`:

| Governance Key     | Type                | WP? |
| ------------------ | :------------------ | --- |
| WantStableFeeBP    | BASIS_POINTS        | N/A |
| GiveStableFeeBP    | BASIS_POINTS        | N/A |
| MintLimit          | Amount              | N/A |

The RUN Protocol Whitepaper v0.8 does not describe the governance parameters
for this contract.  