package keeper

import (
	abci "github.com/cometbft/cometbft/abci/types"

	sdkioerrors "cosmossdk.io/errors"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"

	"github.com/Agoric/agoric-sdk/golang/cosmos/x/vstorage/types"
)

// query endpoints supported by the vstorage Querier
const (
	QueryData     = "data"
	QueryChildren = "children"
)

// getVstorageEntryPath validates that a request URL path represents a valid
// entry path with no extra data, and returns the path of that vstorage entry.
func getVstorageEntryPath(urlPathSegments []string) (string, error) {
	if len(urlPathSegments) != 1 || types.ValidatePath(urlPathSegments[0]) != nil {
		return "", sdkioerrors.Wrap(sdkerrors.ErrInvalidRequest, "invalid vstorage entry path")
	}
	return urlPathSegments[0], nil
}

// NewQuerier returns the function for handling queries routed to this module.
// It performs its own routing based on the first slash-separated URL path
// segment (e.g., URL path `/data/foo.bar` is a request for the value associated
// with vstorage path "foo.bar", and `/children/foo.bar` is a request for the
// child path segments immediately underneath vstorage path "foo.bar" which may
// be used to extend it to a vstorage path such as "foo.bar.baz").
func NewQuerier(keeper Keeper, legacyQuerierCdc *codec.LegacyAmino) func(ctx sdk.Context, path []string, req abci.RequestQuery) ([]byte, error) {
	return func(ctx sdk.Context, urlPathSegments []string, req abci.RequestQuery) (res []byte, err error) {
		var queryType string
		if len(urlPathSegments) > 0 {
			queryType = urlPathSegments[0]
		}
		switch queryType {
		case QueryData:
			entryPath, entryPathErr := getVstorageEntryPath(urlPathSegments[1:])
			if entryPathErr != nil {
				return nil, entryPathErr
			}
			return queryData(ctx, entryPath, req, keeper, legacyQuerierCdc)
		case QueryChildren:
			entryPath, entryPathErr := getVstorageEntryPath(urlPathSegments[1:])
			if entryPathErr != nil {
				return nil, entryPathErr
			}
			return queryChildren(ctx, entryPath, req, keeper, legacyQuerierCdc)
		default:
			return nil, sdkioerrors.Wrap(sdkerrors.ErrUnknownRequest, "unknown vstorage query path")
		}
	}
}

// nolint: unparam
func queryData(ctx sdk.Context, path string, req abci.RequestQuery, keeper Keeper, legacyQuerierCdc *codec.LegacyAmino) (res []byte, err error) {
	entry, err := keeper.GetEntry(ctx, path)
	if err != nil {
		return nil, err
	}

	if !entry.HasValue() {
		return nil, sdkioerrors.Wrap(sdkerrors.ErrNotFound, "no data for vstorage path")
	}

	bz, marshalErr := codec.MarshalJSONIndent(legacyQuerierCdc, types.Data{Value: entry.StringValue()})
	if marshalErr != nil {
		return nil, sdkioerrors.Wrap(sdkerrors.ErrJSONMarshal, marshalErr.Error())
	}

	return bz, nil
}

// nolint: unparam
func queryChildren(ctx sdk.Context, path string, req abci.RequestQuery, keeper Keeper, legacyQuerierCdc *codec.LegacyAmino) (res []byte, err error) {
	children, err := keeper.GetChildren(ctx, path)
	if err != nil {
		return nil, err
	}
	klist := children.Children

	if klist == nil {
		klist = []string{}
	}

	bz, err2 := codec.MarshalJSONIndent(legacyQuerierCdc, types.Children{Children: klist})
	if err2 != nil {
		return nil, sdkioerrors.Wrap(sdkerrors.ErrJSONMarshal, err2.Error())
	}

	return bz, nil
}
