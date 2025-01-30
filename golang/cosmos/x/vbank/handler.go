package vbank

import (
	"fmt"

	sdkioerrors "cosmossdk.io/errors"
	"github.com/cosmos/cosmos-sdk/baseapp"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

// NewHandler returns a handler for "vbank" type messages.
func NewHandler(keeper Keeper) baseapp.MsgServiceHandler {
	return func(ctx sdk.Context, msg sdk.Msg) (*sdk.Result, error) {
		switch msg := msg.(type) {
		default:
			errMsg := fmt.Sprintf("Unrecognized vbank Msg type: %T", msg)
			return nil, sdkioerrors.Wrap(sdkerrors.ErrUnknownRequest, errMsg)
		}
	}
}
