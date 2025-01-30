package keeper

import (
	abci "github.com/cometbft/cometbft/abci/types"

	sdkioerrors "cosmossdk.io/errors"
	"github.com/Agoric/agoric-sdk/golang/cosmos/x/vbank/types"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

func NewQuerier(k Keeper, legacyQuerierCdc *codec.LegacyAmino) func(ctx sdk.Context, path []string, req abci.RequestQuery) ([]byte, error) {
	return func(ctx sdk.Context, path []string, req abci.RequestQuery) ([]byte, error) {
		var queryType string
		if len(path) > 0 {
			queryType = path[0]
		}
		switch queryType {
		case types.QueryParams:
			return queryParams(ctx, path[1:], req, k, legacyQuerierCdc)

		case types.QueryState:
			return queryState(ctx, path[1:], req, k, legacyQuerierCdc)

		default:
			return nil, sdkioerrors.Wrapf(sdkerrors.ErrUnknownRequest, "unknown vbank query path")
		}
	}
}

func queryParams(ctx sdk.Context, _ []string, _ abci.RequestQuery, k Keeper, legacyQuerierCdc *codec.LegacyAmino) ([]byte, error) {
	params := k.GetParams(ctx)

	res, err := codec.MarshalJSONIndent(legacyQuerierCdc, params)
	if err != nil {
		return nil, sdkioerrors.Wrap(sdkerrors.ErrJSONMarshal, err.Error())
	}

	return res, nil
}

func queryState(ctx sdk.Context, _ []string, _ abci.RequestQuery, k Keeper, legacyQuerierCdc *codec.LegacyAmino) ([]byte, error) {
	state, err := k.GetState(ctx)
	if err != nil {
		return nil, err
	}

	res, err := codec.MarshalJSONIndent(legacyQuerierCdc, state)
	if err != nil {
		return nil, sdkioerrors.Wrap(sdkerrors.ErrJSONMarshal, err.Error())
	}

	return res, nil
}
