package types

import (
	"fmt"

	yaml "gopkg.in/yaml.v2"

	sdkmath "cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"
	authtypes "github.com/cosmos/cosmos-sdk/x/auth/types"
	paramtypes "github.com/cosmos/cosmos-sdk/x/params/types"
)

const AllowAllMonitoringAccountsPattern = "*"

// Parameter keys
var (
	ParamStoreKeyRewardEpochDurationBlocks = []byte("reward_epoch_duration_blocks")
	ParamStoreKeyRewardSmoothingBlocks     = []byte("reward_smoothing_blocks")
	ParamStoreKeyPerEpochRewardFraction    = []byte("per_epoch_reward_fraction")
	ParamStoreKeyAllowedMonitoringAccounts = []byte("allowed_monitoring_accounts")
)

// ParamKeyTable returns the parameter key table.
func ParamKeyTable() paramtypes.KeyTable {
	return paramtypes.NewKeyTable().RegisterParamSet(&Params{})
}

// DefaultParams returns default parameters
func DefaultParams() Params {
	provisionAddress := authtypes.NewModuleAddress(ProvisionPoolName)
	return Params{
		RewardEpochDurationBlocks: 0,
		RewardSmoothingBlocks:     1,
		PerEpochRewardFraction:    sdkmath.LegacyOneDec(),
		AllowedMonitoringAccounts: []string{provisionAddress.String()},
	}
}

func (p Params) String() string {
	out, _ := yaml.Marshal(p)
	return string(out)
}

func (p Params) GetSmoothingBlocks() int64 {
	smoothingBlocks := p.RewardSmoothingBlocks
	if smoothingBlocks < 0 {
		epochBlocks := p.RewardEpochDurationBlocks
		if epochBlocks == 0 {
			epochBlocks = 1
		}
		smoothingBlocks = epochBlocks
	}
	return smoothingBlocks
}

// RewardRate calculates the rate for dispensing the pool of coins over
// the specified number of blocks. Fractions are rounded up. In other
// words, it returns the smallest Coins such that pool is exhausted
// after #blocks withdrawals.
func (p Params) RewardRate(pool sdk.Coins, blocks int64) sdk.Coins {
	coins := make([]sdk.Coin, 0, len(pool))
	if blocks > 0 {
		for _, coin := range pool {
			if coin.IsZero() {
				continue
			}
			// divide by blocks, rounding fractions up
			// (coin.Amount - 1)/blocks + 1
			rate := coin.Amount.SubRaw(1).QuoRaw(blocks).AddRaw(1)
			coins = append(coins, sdk.NewCoin(coin.GetDenom(), rate))
		}
	}
	return sdk.NewCoins(coins...)
}

// IsAllowedMonitoringAccount checks to see if a given address is allowed to monitor its balance.
func (p Params) IsAllowedMonitoringAccount(addr string) bool {
	for _, pat := range p.AllowedMonitoringAccounts {
		switch pat {
		case AllowAllMonitoringAccountsPattern, addr:
			// Got an AllowAll pattern or an exact match.
			return true
		}
	}

	// No match found.
	return false
}

// ParamSetPairs returns the parameter set pairs.
func (p *Params) ParamSetPairs() paramtypes.ParamSetPairs {
	return paramtypes.ParamSetPairs{
		paramtypes.NewParamSetPair(ParamStoreKeyRewardEpochDurationBlocks, &p.RewardEpochDurationBlocks, validateRewardEpochDurationBlocks),
		paramtypes.NewParamSetPair(ParamStoreKeyRewardSmoothingBlocks, &p.RewardSmoothingBlocks, validateRewardSmoothingBlocks),
		paramtypes.NewParamSetPair(ParamStoreKeyPerEpochRewardFraction, &p.PerEpochRewardFraction, validatePerEpochRewardFraction),
		paramtypes.NewParamSetPair(ParamStoreKeyAllowedMonitoringAccounts, &p.AllowedMonitoringAccounts, validateAllowedMonitoringAccounts),
	}
}

// ValidateBasic performs basic validation on distribution parameters.
func (p Params) ValidateBasic() error {
	if err := validateRewardEpochDurationBlocks(p.RewardEpochDurationBlocks); err != nil {
		return err
	}
	if err := validatePerEpochRewardFraction(p.PerEpochRewardFraction); err != nil {
		return err
	}
	if err := validateRewardSmoothingBlocks(p.RewardSmoothingBlocks); err != nil {
		return err
	}
	if err := validateAllowedMonitoringAccounts(p.AllowedMonitoringAccounts); err != nil {
		return err
	}
	return nil
}

func validateRewardSmoothingBlocks(i interface{}) error {
	v, ok := i.(int64)
	if !ok {
		return fmt.Errorf("invalid parameter type: %T", i)
	}

	if v < 0 {
		return fmt.Errorf("reward smoothing blocks must be nonnegative: %d", v)
	}

	return nil
}

func validateRewardEpochDurationBlocks(i interface{}) error {
	v, ok := i.(int64)
	if !ok {
		return fmt.Errorf("invalid parameter type: %T", i)
	}

	if v < 0 {
		return fmt.Errorf("reward epoch duration blocks must be nonnegative: %d", v)
	}

	return nil
}

func validatePerEpochRewardFraction(i interface{}) error {
	v, ok := i.(sdkmath.LegacyDec)
	if !ok {
		return fmt.Errorf("invalid parameter type: %T", i)
	}

	if v.IsNegative() {
		return fmt.Errorf("per epoch reward fraction must be nonnegative: %s", v)
	}

	if v.GT(sdkmath.LegacyOneDec()) {
		return fmt.Errorf("per epoch reward fraction must be less than or equal to one: %s", v)
	}

	return nil
}

func validateAllowedMonitoringAccounts(i interface{}) error {
	v, ok := i.([]string)
	if !ok {
		return fmt.Errorf("invalid parameter type: %T", i)
	}

	for a, acc := range v {
		if acc == "" {
			return fmt.Errorf("allowed monitoring accounts element[%d] cannot be empty", a)
		}
	}

	return nil
}
