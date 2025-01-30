package keeper

import (
	"strings"

	sdkmath "cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

// minCoins returns the minimum of each denomination.
// The input coins should be sorted.
func minCoins(a, b sdk.Coins) sdk.Coins {
	min := make([]sdk.Coin, 0)
	for indexA, indexB := 0, 0; indexA < len(a) && indexB < len(b); {
		coinA, coinB := a[indexA], b[indexB]
		switch strings.Compare(coinA.Denom, coinB.Denom) {
		case -1: // A < B
			indexA++
		case 0: // A == B
			minCoin := coinA
			if coinB.IsLT(minCoin) {
				minCoin = coinB
			}
			if !minCoin.IsZero() {
				min = append(min, minCoin)
			}
			indexA++
			indexB++
		case 1: // A > B
			indexB++
		}
	}
	return sdk.NewCoins(min...)
}

func mulCoins(a sdk.Coins, b sdkmath.LegacyDec) sdk.Coins {
	coins := make([]sdk.Coin, 0, len(a))
	for _, coin := range a {
		amount := b.MulInt(coin.Amount).TruncateInt()
		if amount.IsPositive() {
			coins = append(coins, sdk.NewCoin(coin.Denom, amount))
		}
	}
	return sdk.NewCoins(coins...)
}

// DistributeRewards drives the rewards state machine.
func (k Keeper) DistributeRewards(ctx sdk.Context) error {
	// Distribute rewards.
	state, err := k.GetState(ctx)
	if err != nil {
		return err
	}
	params := k.GetParams(ctx)

	smoothingBlocks := params.GetSmoothingBlocks()
	thisBlock := ctx.BlockHeight()
	cycleIndex := thisBlock - state.LastRewardDistributionBlock

	// Check if we're at the end of the last cycle.
	if cycleIndex >= params.RewardEpochDurationBlocks {
		// Get more rewards to distribute.
		toDistribute := mulCoins(state.RewardPool, params.PerEpochRewardFraction)
		state.LastRewardDistributionBlock = thisBlock
		state.RewardBlockAmount = params.RewardRate(toDistribute, smoothingBlocks)
		k.SetState(ctx, state)
	}

	if cycleIndex >= smoothingBlocks {
		// No more distribution to do until the next cycle.
		return nil
	}

	// We're currently within the smoothing period, send the amount to distribute.
	xfer := minCoins(state.RewardBlockAmount, state.RewardPool)
	if !xfer.IsZero() {
		if err := k.SendCoinsToRewardDistributor(ctx, xfer); err != nil {
			return err
		}
	}

	state.RewardPool = state.RewardPool.Sub(xfer...)
	k.SetState(ctx, state)
	return nil
}
