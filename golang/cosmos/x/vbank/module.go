package vbank

import (
	"context"
	"encoding/json"
	stdlog "log"

	"github.com/grpc-ecosystem/grpc-gateway/runtime"
	"github.com/spf13/cobra"

	"github.com/Agoric/agoric-sdk/golang/cosmos/x/vbank/client/cli"
	"github.com/Agoric/agoric-sdk/golang/cosmos/x/vbank/keeper"
	"github.com/Agoric/agoric-sdk/golang/cosmos/x/vbank/types"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/codec"
	cdctypes "github.com/cosmos/cosmos-sdk/codec/types"
	"github.com/cosmos/cosmos-sdk/types/module"

	abci "github.com/cometbft/cometbft/abci/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
	banktypes "github.com/cosmos/cosmos-sdk/x/bank/types"
)

// type check to ensure the interface is properly implemented
var (
	_ module.AppModule      = AppModule{}
	_ module.AppModuleBasic = AppModuleBasic{}
)

// app module Basics object
type AppModuleBasic struct {
}

// IsAppModule implements the appmodule.AppModule interface.
func (am AppModule) IsAppModule() {}

// IsOnePerModuleType is a marker function just indicates that this is a one-per-module type.
func (am AppModule) IsOnePerModuleType() {}

func (AppModuleBasic) Name() string {
	return ModuleName
}

func (AppModuleBasic) RegisterLegacyAminoCodec(cdc *codec.LegacyAmino) {
	RegisterCodec(cdc)
}

// RegisterInterfaces registers the module's interface types
func (b AppModuleBasic) RegisterInterfaces(registry cdctypes.InterfaceRegistry) {
	types.RegisterInterfaces(registry)
}

// DefaultGenesis returns default genesis state as raw bytes for the deployment
func (AppModuleBasic) DefaultGenesis(cdc codec.JSONCodec) json.RawMessage {
	return cdc.MustMarshalJSON(DefaultGenesisState())
}

// Validation check of the Genesis
func (AppModuleBasic) ValidateGenesis(cdc codec.JSONCodec, config client.TxEncodingConfig, bz json.RawMessage) error {
	var data types.GenesisState
	if err := cdc.UnmarshalJSON(bz, &data); err != nil {
		return err
	}
	return ValidateGenesis(&data)
}

func (AppModuleBasic) RegisterGRPCGatewayRoutes(clientCtx client.Context, mux *runtime.ServeMux) {
	_ = types.RegisterQueryHandlerClient(context.Background(), mux, types.NewQueryClient(clientCtx))
}

// GetTxCmd implements AppModuleBasic interface
func (AppModuleBasic) GetTxCmd() *cobra.Command {
	return nil
}

// GetQueryCmd implements AppModuleBasic interface
func (AppModuleBasic) GetQueryCmd() *cobra.Command {
	return cli.GetQueryCmd()
}

type AppModule struct {
	AppModuleBasic
	keeper Keeper
}

// NewAppModule creates a new AppModule Object
func NewAppModule(k Keeper) AppModule {
	am := AppModule{
		AppModuleBasic: AppModuleBasic{},
		keeper:         k,
	}
	return am
}

func (AppModule) Name() string {
	return ModuleName
}

func (AppModule) ConsensusVersion() uint64 { return 2 }

// BeginBlock implements the AppModule interface
func (am AppModule) BeginBlock(ctx sdk.Context) {
}

// EndBlock implements the AppModule interface
func (am AppModule) EndBlock(ctx sdk.Context) []abci.ValidatorUpdate {
	events := ctx.EventManager().ABCIEventsHistory()
	addressToUpdate := make(map[string]sdk.Coins, len(events)*2)

	// records that we want to emit an balance update for the address
	// for the given denoms. We use the Coins only to track the set of
	// denoms, not for the amounts.
	ensureAddressUpdate := func(address string, denoms sdk.Coins) {
		if denoms.IsZero() {
			return
		}
		currentDenoms := sdk.NewCoins()
		if coins, ok := addressToUpdate[address]; ok {
			currentDenoms = coins
		}
		addressToUpdate[address] = currentDenoms.Add(denoms...)
	}

	/* Scan for all the events matching (taken from cosmos-sdk/x/bank/spec/04_events.md):

	type: "coin_received"
	  "receiver": {recipient address}
	  "amount": {Coins string}
	type: "coin_spent"
	  "spender": {spender address}
	  "amount": {Coins string}
	*/
NextEvent:
	for _, event := range events {
		switch event.Type {
		case banktypes.EventTypeCoinReceived, banktypes.EventTypeCoinSpent:
			var addr string
			denoms := sdk.NewCoins()
			for _, attr := range event.GetAttributes() {
				switch string(attr.GetKey()) {
				case banktypes.AttributeKeyReceiver, banktypes.AttributeKeySpender:
					addr = string(attr.GetValue())
				case sdk.AttributeKeyAmount:
					coins, err := sdk.ParseCoinsNormalized(string(attr.GetValue()))
					if err != nil {
						stdlog.Println("Cannot ensure vbank balance for", addr, err)
						break NextEvent
					}
					denoms = coins
				}
			}
			if addr != "" && !denoms.IsZero() {
				ensureAddressUpdate(addr, denoms)
			}
		}
	}

	// Prune the addressToUpdate map to only include module accounts.  We prune
	// only after recording and consolidating all account updates to minimize the
	// number of account keeper queries.
	unfilteredAddresses := addressToUpdate
	addressToUpdate = make(map[string]sdk.Coins, len(addressToUpdate))
	for addr, denoms := range unfilteredAddresses {
		accAddr, err := sdk.AccAddressFromBech32(addr)
		if err == nil && am.keeper.IsAllowedMonitoringAccount(ctx, accAddr) {
			// Pass through the module account.
			addressToUpdate[addr] = denoms
		}
	}

	// Dump all the addressToBalances entries to SwingSet.
	action := getBalanceUpdate(ctx, am.keeper, addressToUpdate)
	if action != nil {
		err := am.PushAction(ctx, action)
		if err != nil {
			panic(err)
		}
	}

	if err := am.keeper.DistributeRewards(ctx); err != nil {
		stdlog.Println("Cannot distribute rewards", err.Error())
	}

	return []abci.ValidatorUpdate{}
}

// RegisterInvariants implements the AppModule interface
func (AppModule) RegisterInvariants(ir sdk.InvariantRegistry) {
	// TODO
}

// RegisterServices registers module services.
func (am AppModule) RegisterServices(cfg module.Configurator) {
	tx := &types.UnimplementedMsgServer{}
	types.RegisterMsgServer(cfg.MsgServer(), tx)
	types.RegisterQueryServer(cfg.QueryServer(), am.keeper)

	m := keeper.NewMigrator(am.keeper)
	err := cfg.RegisterMigration(types.ModuleName, 1, m.Migrate1to2)
	if err != nil {
		panic(err)
	}
}

// InitGenesis performs genesis initialization for the ibc-transfer module. It returns
// no validator updates.
func (am AppModule) InitGenesis(ctx sdk.Context, cdc codec.JSONCodec, data json.RawMessage) []abci.ValidatorUpdate {
	var genesisState types.GenesisState
	cdc.MustUnmarshalJSON(data, &genesisState)
	return InitGenesis(ctx, am.keeper, &genesisState)
}

// ExportGenesis returns the exported genesis state as raw bytes for the ibc-transfer
// module.
func (am AppModule) ExportGenesis(ctx sdk.Context, cdc codec.JSONCodec) json.RawMessage {
	gs, _ := ExportGenesis(ctx, am.keeper)
	return cdc.MustMarshalJSON(gs)
}
