package keeper

import (
	"context"

	"github.com/Agoric/agoric-sdk/golang/cosmos/x/vbank/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

var _ types.QueryServer = Keeper{}

// Params queries params of distribution module
func (k Keeper) Params(c context.Context, req *types.QueryParamsRequest) (*types.QueryParamsResponse, error) {
	ctx := sdk.UnwrapSDKContext(c)
	var params types.Params
	k.paramSpace.GetParamSet(ctx, &params)

	return &types.QueryParamsResponse{Params: params}, nil
}

// State queries state of distribution module
func (k Keeper) State(c context.Context, req *types.QueryStateRequest) (*types.QueryStateResponse, error) {
	ctx := sdk.UnwrapSDKContext(c)
	state, err := k.GetState(ctx)
	if err != nil {
		return nil, err
	}

	return &types.QueryStateResponse{State: state}, nil
}
