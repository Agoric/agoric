package swingset

import (
	// "os"
	"context"
	"fmt"
	"time"

	abci "github.com/cometbft/cometbft/abci/types"
	"github.com/cosmos/cosmos-sdk/telemetry"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/Agoric/agoric-sdk/golang/cosmos/vm"
	"github.com/Agoric/agoric-sdk/golang/cosmos/x/swingset/types"
)

type beginBlockAction struct {
	*vm.ActionHeader `actionType:"BEGIN_BLOCK"`
	ChainID          string       `json:"chainID"`
	Params           types.Params `json:"params"`
}

type endBlockAction struct {
	*vm.ActionHeader `actionType:"END_BLOCK"`
}

type commitBlockAction struct {
	*vm.ActionHeader `actionType:"COMMIT_BLOCK"`
}

type afterCommitBlockAction struct {
	*vm.ActionHeader `actionType:"AFTER_COMMIT_BLOCK"`
}

func BeginBlock(ctx sdk.Context, keeper Keeper) error {
	defer telemetry.ModuleMeasureSince(types.ModuleName, time.Now(), telemetry.MetricKeyBeginBlocker)

	action := beginBlockAction{
		ChainID: ctx.ChainID(),
		Params:  keeper.GetParams(ctx),
	}
	_, err := keeper.BlockingSend(ctx, action)
	// fmt.Fprintf(os.Stderr, "BEGIN_BLOCK Returned from SwingSet: %s, %v\n", out, err)
	if err != nil {
		panic(err)
	}

	err = keeper.UpdateQueueAllowed(ctx)

	return err
}

var endBlockHeight int64
var endBlockTime int64

func EndBlock(ctx sdk.Context, keeper Keeper) ([]abci.ValidatorUpdate, error) {
	defer telemetry.ModuleMeasureSince(types.ModuleName, time.Now(), telemetry.MetricKeyEndBlocker)

	action := endBlockAction{}
	_, err := keeper.BlockingSend(ctx, action)

	// fmt.Fprintf(os.Stderr, "END_BLOCK Returned from SwingSet: %s, %v\n", out, err)
	if err != nil {
		// NOTE: A failed END_BLOCK means that the SwingSet state is inconsistent.
		// Panic here, in the hopes that a replay from scratch will fix the problem.
		panic(err)
	}

	// Save our EndBlock status.
	endBlockHeight = ctx.BlockHeight()
	endBlockTime = ctx.BlockTime().Unix()

	return []abci.ValidatorUpdate{}, nil
}

func getEndBlockContext() sdk.Context {
	return sdk.Context{}.
		WithContext(context.Background()).
		WithBlockHeight(endBlockHeight).
		WithBlockTime(time.Unix(endBlockTime, 0))
}

func CommitBlock(keeper Keeper) error {
	defer telemetry.ModuleMeasureSince(types.ModuleName, time.Now(), "commit_blocker")

	action := commitBlockAction{}
	_, err := keeper.BlockingSend(getEndBlockContext(), action)

	// fmt.Fprintf(os.Stderr, "COMMIT_BLOCK Returned from SwingSet: %s, %v\n", out, err)
	if err != nil {
		// NOTE: A failed COMMIT_BLOCK means that the SwingSet state is inconsistent.
		// Panic here, in the hopes that a replay from scratch will fix the problem.
		panic(err)
	}
	return err
}

func AfterCommitBlock(keeper Keeper) error {
	// defer telemetry.ModuleMeasureSince(types.ModuleName, time.Now(), "commit_blocker")

	action := afterCommitBlockAction{}
	_, err := keeper.BlockingSend(getEndBlockContext(), action)

	// fmt.Fprintf(os.Stderr, "AFTER_COMMIT_BLOCK Returned from SwingSet: %s, %v\n", out, err)
	if err != nil {
		// Panic here, in the hopes that a replay from scratch will fix the problem.
		panic(fmt.Errorf("AFTER_COMMIT_BLOCK failed: %s. Swingset is in an irrecoverable inconsistent state", err))
	}
	return err
}
