package vstorage

import (
	"fmt"

	"github.com/Agoric/agoric-sdk/golang/cosmos/x/vstorage/types"
	abci "github.com/cometbft/cometbft/abci/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

func NewGenesisState() *types.GenesisState {
	return &types.GenesisState{
		Data: []*types.DataEntry{},
	}
}

func ValidateGenesis(data *types.GenesisState) error {
	if data == nil {
		return nil
	}
	for _, entry := range data.Data {
		if err := types.ValidatePath(entry.Path); err != nil {
			return fmt.Errorf("genesis vstorage.data entry %q has invalid path format: %s", entry.Path, err)
		}
	}
	return nil
}

func DefaultGenesisState() *types.GenesisState {
	return &types.GenesisState{
		Data: []*types.DataEntry{},
	}
}

func InitGenesis(ctx sdk.Context, keeper Keeper, data *types.GenesisState) []abci.ValidatorUpdate {
	keeper.ImportStorage(ctx, data.Data)
	return []abci.ValidatorUpdate{}
}

func ExportGenesis(ctx sdk.Context, keeper Keeper) *types.GenesisState {
	gs := NewGenesisState()
	gs.Data = keeper.ExportStorage(ctx)
	return gs
}
