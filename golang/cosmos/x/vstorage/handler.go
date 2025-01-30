package vstorage

import (
	"fmt"

	sdkioerrors "cosmossdk.io/errors"
	"github.com/cosmos/cosmos-sdk/baseapp"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

// NewHandler returns a handler for "vstorage" type messages.
func NewHandler(k Keeper) baseapp.MsgServiceHandler {
	return func(ctx sdk.Context, msg sdk.Msg) (*sdk.Result, error) {
		errMsg := fmt.Sprintf("Unrecognized vstorage Msg type: %T", msg)
		return nil, sdkioerrors.Wrap(sdkerrors.ErrUnknownRequest, errMsg)
	}
}
