package vlocalchain

import (
	"fmt"

	sdkioerrors "cosmossdk.io/errors"
	"github.com/Agoric/agoric-sdk/golang/cosmos/x/vlocalchain/keeper"
	"github.com/cosmos/cosmos-sdk/baseapp"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

// NewHandler returns a handler for "vlocalchain" type messages.
func NewHandler(keeper keeper.Keeper) baseapp.MsgServiceHandler {
	return func(ctx sdk.Context, msg sdk.Msg) (*sdk.Result, error) {
		switch msg := msg.(type) {
		default:
			errMsg := fmt.Sprintf("Unrecognized vlocalchain Msg type: %T", msg)
			return nil, sdkioerrors.Wrap(sdkerrors.ErrUnknownRequest, errMsg)
		}
	}
}
