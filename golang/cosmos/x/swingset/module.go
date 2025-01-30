package swingset

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/grpc-ecosystem/grpc-gateway/runtime"
	"github.com/spf13/cobra"

	"github.com/Agoric/agoric-sdk/golang/cosmos/x/swingset/client/cli"
	"github.com/Agoric/agoric-sdk/golang/cosmos/x/swingset/keeper"
	"github.com/Agoric/agoric-sdk/golang/cosmos/x/swingset/types"
	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/codec"
	cdctypes "github.com/cosmos/cosmos-sdk/codec/types"
	"github.com/cosmos/cosmos-sdk/types/module"

	abci "github.com/cometbft/cometbft/abci/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
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
	err := cdc.UnmarshalJSON(bz, &data)
	if err != nil {
		return err
	}
	// Once json successfully marshalled, passes along to genesis.go
	return ValidateGenesis(&data)
}

func (AppModuleBasic) RegisterGRPCGatewayRoutes(clientCtx client.Context, mux *runtime.ServeMux) {
	_ = types.RegisterQueryHandlerClient(context.Background(), mux, types.NewQueryClient(clientCtx))
}

// Get the root query command of this module
func (AppModuleBasic) GetQueryCmd() *cobra.Command {
	return cli.GetQueryCmd(StoreKey)
}

// Get the root tx command of this module
func (AppModuleBasic) GetTxCmd() *cobra.Command {
	return cli.GetTxCmd(StoreKey)
}

type AppModule struct {
	AppModuleBasic
	keeper                   Keeper
	swingStoreExportsHandler *SwingStoreExportsHandler
	setBootstrapNeeded       func()
	ensureControllerInited   func(sdk.Context)
	swingStoreExportDir      string
	swingStoreExportMode     string
}

// NewAppModule creates a new AppModule Object
func NewAppModule(
	k Keeper,
	swingStoreExportsHandler *SwingStoreExportsHandler,
	setBootstrapNeeded func(),
	ensureControllerInited func(sdk.Context),
	swingStoreExportDir string,
	swingStoreExportMode string,
) AppModule {
	am := AppModule{
		AppModuleBasic:           AppModuleBasic{},
		keeper:                   k,
		swingStoreExportsHandler: swingStoreExportsHandler,
		setBootstrapNeeded:       setBootstrapNeeded,
		ensureControllerInited:   ensureControllerInited,
		swingStoreExportDir:      swingStoreExportDir,
		swingStoreExportMode:     swingStoreExportMode,
	}
	return am
}

func (AppModule) Name() string {
	return ModuleName
}

// For testing purposes
func (am *AppModule) SetSwingStoreExportDir(dir string) {
	am.swingStoreExportDir = dir
}

func (am AppModule) RegisterInvariants(ir sdk.InvariantRegistry) {}

func (am AppModule) RegisterServices(cfg module.Configurator) {
	types.RegisterMsgServer(cfg.MsgServer(), keeper.NewMsgServerImpl(am.keeper))
	querier := keeper.Querier{Keeper: am.keeper}
	types.RegisterQueryServer(cfg.QueryServer(), querier)
	m := keeper.NewMigrator(am.keeper)
	err := cfg.RegisterMigration(types.ModuleName, 1, m.Migrate1to2)
	if err != nil {
		panic(err)
	}
}

func (AppModule) ConsensusVersion() uint64 { return 2 }

func (am AppModule) BeginBlock(ctx sdk.Context) {
	am.ensureControllerInited(ctx)

	err := BeginBlock(ctx, am.keeper)
	if err != nil {
		fmt.Println("BeginBlock error:", err)
	}
}

func (am AppModule) EndBlock(ctx sdk.Context) []abci.ValidatorUpdate {
	valUpdate, err := EndBlock(ctx, am.keeper)
	if err != nil {
		fmt.Println("EndBlock error:", err)
	}
	if valUpdate != nil {
		return valUpdate
	}

	// Prevent Cosmos SDK internal errors.
	return []abci.ValidatorUpdate{}
}

func (am *AppModule) checkSwingStoreExportSetup() {
	if am.swingStoreExportDir == "" {
		am.swingStoreExportDir = "/tmp/swingset_export"
	}
}

func (am AppModule) InitGenesis(ctx sdk.Context, cdc codec.JSONCodec, data json.RawMessage) []abci.ValidatorUpdate {
	var genesisState types.GenesisState
	cdc.MustUnmarshalJSON(data, &genesisState)
	am.checkSwingStoreExportSetup()
	bootstrapNeeded := InitGenesis(ctx, am.keeper, am.swingStoreExportsHandler, am.swingStoreExportDir, &genesisState)
	if bootstrapNeeded {
		am.setBootstrapNeeded()
	}
	return []abci.ValidatorUpdate{}
}

func (am AppModule) ExportGenesis(ctx sdk.Context, cdc codec.JSONCodec) json.RawMessage {
	am.checkSwingStoreExportSetup()
	gs := ExportGenesis(
		ctx,
		am.keeper,
		am.swingStoreExportsHandler,
		am.swingStoreExportDir,
		am.swingStoreExportMode,
	)
	return cdc.MustMarshalJSON(gs)
}
