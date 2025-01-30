package keeper

import (
	"context"

	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/Agoric/agoric-sdk/golang/cosmos/vm"
	"github.com/Agoric/agoric-sdk/golang/cosmos/x/swingset/types"
)

type coreEvalAction struct {
	*vm.ActionHeader `actionType:"CORE_EVAL"`
	Evals            []types.CoreEval `json:"evals"`
}

// CoreEvalProposal tells SwingSet to evaluate the given JS code.
func (k Keeper) CoreEvalProposal(ctx sdk.Context, p *types.CoreEvalProposal) error {
	action := coreEvalAction{
		Evals: p.Evals,
	}

	// While the CoreEvalProposal was originally created by a transaction, by the time it
	// passes by governance, we no longer have its provenance information, so we need to
	// synthesize unique context information.
	// We use a fixed placeholder value for the txHash context. We use `0` for the message
	// index which assumes there is a single proposal per block.
	ctx = ctx.WithContext(context.WithValue(ctx.Context(), sdk.ContextKey("tx-hash"), "x/gov"))
	ctx = ctx.WithContext(context.WithValue(ctx.Context(), sdk.ContextKey("tx-msg-idx"), 0))
	return k.PushHighPriorityAction(ctx, action)
}
