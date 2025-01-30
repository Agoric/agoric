package keeper

import (
	"cosmossdk.io/core/store"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/Agoric/agoric-sdk/golang/cosmos/x/vbank/types"
	paramtypes "github.com/cosmos/cosmos-sdk/x/params/types"

	vm "github.com/Agoric/agoric-sdk/golang/cosmos/vm"
)

const stateKey string = "state"

// Keeper maintains the link to data storage and exposes getter/setter methods for the various parts of the state machine
type Keeper struct {
	storService store.KVStoreService
	cdc         codec.Codec
	paramSpace  paramtypes.Subspace

	accountKeeper         types.AccountKeeper
	bankKeeper            types.BankKeeper
	rewardDistributorName string
	PushAction            vm.ActionPusher
}

// NewKeeper creates a new vbank Keeper instance
func NewKeeper(
	cdc codec.Codec, storeService store.KVStoreService, paramSpace paramtypes.Subspace,
	accountKeeper types.AccountKeeper, bankKeeper types.BankKeeper,
	rewardDistributorName string,
	pushAction vm.ActionPusher,
) Keeper {

	// set KeyTable if it has not already been set
	if !paramSpace.HasKeyTable() {
		paramSpace = paramSpace.WithKeyTable(types.ParamKeyTable())
	}

	return Keeper{
		storService:           storeService,
		cdc:                   cdc,
		paramSpace:            paramSpace,
		accountKeeper:         accountKeeper,
		bankKeeper:            bankKeeper,
		rewardDistributorName: rewardDistributorName,
		PushAction:            pushAction,
	}
}

func (k Keeper) GetBalance(ctx sdk.Context, addr sdk.AccAddress, denom string) sdk.Coin {
	return k.bankKeeper.GetBalance(ctx, addr, denom)
}

func (k Keeper) GetAllBalances(ctx sdk.Context, addr sdk.AccAddress) sdk.Coins {
	return k.bankKeeper.GetAllBalances(ctx, addr)
}

func (k Keeper) StoreRewardCoins(ctx sdk.Context, amt sdk.Coins) error {
	return k.bankKeeper.MintCoins(ctx, types.ModuleName, amt)
}

func (k Keeper) SendCoinsToRewardDistributor(ctx sdk.Context, amt sdk.Coins) error {
	return k.bankKeeper.SendCoinsFromModuleToModule(ctx, types.ModuleName, k.rewardDistributorName, amt)
}

func (k Keeper) SendCoins(ctx sdk.Context, addr sdk.AccAddress, amt sdk.Coins) error {
	if err := k.bankKeeper.MintCoins(ctx, types.ModuleName, amt); err != nil {
		return err
	}
	return k.bankKeeper.SendCoinsFromModuleToAccount(ctx, types.ModuleName, addr, amt)
}

func (k Keeper) GrabCoins(ctx sdk.Context, addr sdk.AccAddress, amt sdk.Coins) error {
	if err := k.bankKeeper.SendCoinsFromAccountToModule(ctx, addr, types.ModuleName, amt); err != nil {
		return err
	}
	return k.bankKeeper.BurnCoins(ctx, types.ModuleName, amt)
}

func (k Keeper) GetModuleAccountAddress(ctx sdk.Context, name string) sdk.AccAddress {
	acct := k.accountKeeper.GetModuleAccount(ctx, name)
	if acct == nil {
		return nil
	}
	return acct.GetAddress()
}

func (k Keeper) IsAllowedMonitoringAccount(ctx sdk.Context, addr sdk.AccAddress) bool {
	params := k.GetParams(ctx)
	return params.IsAllowedMonitoringAccount(addr.String())
}

func (k Keeper) GetParams(ctx sdk.Context) (params types.Params) {
	k.paramSpace.GetParamSetIfExists(ctx, &params)
	return params
}

func (k Keeper) SetParams(ctx sdk.Context, params types.Params) {
	k.paramSpace.SetParamSet(ctx, &params)
}

func (k Keeper) GetState(ctx sdk.Context) (types.State, error) {
	s := k.storService.OpenKVStore(ctx)
	bz, err := s.Get([]byte(stateKey))
	if err != nil {
		return types.State{}, err
	}
	state := types.State{}
	k.cdc.MustUnmarshal(bz, &state)
	return state, nil
}

func (k Keeper) SetState(ctx sdk.Context, state types.State) error {
	s := k.storService.OpenKVStore(ctx)
	bz := k.cdc.MustMarshal(&state)
	err := s.Set([]byte(stateKey), bz)
	if err != nil {
		return err
	}
	return nil
}

func (k Keeper) GetNextSequence(ctx sdk.Context) (uint64, error) {
	state, err := k.GetState(ctx)
	if err != nil {
		return 0, err
	}
	state.LastSequence = state.GetLastSequence() + 1
	err = k.SetState(ctx, state)
	if err != nil {
		return 0, err
	}
	return state.LastSequence, nil
}
