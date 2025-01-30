package testing

import (
	"fmt"

	sdkmath "cosmossdk.io/math"
	storetypes "cosmossdk.io/store/types"
	keeper "github.com/Agoric/agoric-sdk/golang/cosmos/x/vstorage/keeper"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

func GetQueueItems(ctx sdk.Context, vstorageKeeper keeper.Keeper, queuePath string) ([]string, error) {
	unlimitedCtx := ctx.WithGasMeter(storetypes.NewInfiniteGasMeter())
	head, err := vstorageKeeper.GetIntValue(unlimitedCtx, queuePath+".head")
	if err != nil {
		return nil, err
	}
	tail, err := vstorageKeeper.GetIntValue(unlimitedCtx, queuePath+".tail")
	if err != nil {
		return nil, err
	}
	length := tail.Sub(head).Int64()
	values := make([]string, length)
	var i int64
	for i = 0; i < length; i++ {
		path := fmt.Sprintf("%s.%s", queuePath, head.Add(sdkmath.NewInt(i)).String())
		value, err := vstorageKeeper.GetEntry(unlimitedCtx, path)
		if err != nil {
			return nil, err
		}
		values[i] = value.StringValue()
	}
	return values, nil
}
