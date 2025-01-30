package cmd

import (
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"cosmossdk.io/client/v2/autocli"
	"cosmossdk.io/core/appmodule"
	"cosmossdk.io/log"
	confixcmd "cosmossdk.io/tools/confix/cmd"
	tmcfg "github.com/cometbft/cometbft/config"
	tmcli "github.com/cometbft/cometbft/libs/cli"
	dbm "github.com/cosmos/cosmos-db"
	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/config"
	"github.com/cosmos/cosmos-sdk/client/debug"
	"github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/cosmos/cosmos-sdk/client/keys"
	"github.com/cosmos/cosmos-sdk/client/pruning"
	"github.com/cosmos/cosmos-sdk/client/rpc"
	"github.com/cosmos/cosmos-sdk/client/snapshot"
	"github.com/cosmos/cosmos-sdk/codec/address"
	runtimeservices "github.com/cosmos/cosmos-sdk/runtime/services"
	"github.com/cosmos/cosmos-sdk/server"
	serverconfig "github.com/cosmos/cosmos-sdk/server/config"
	servertypes "github.com/cosmos/cosmos-sdk/server/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/module"
	authcmd "github.com/cosmos/cosmos-sdk/x/auth/client/cli"
	authcodec "github.com/cosmos/cosmos-sdk/x/auth/codec"
	"github.com/cosmos/cosmos-sdk/x/auth/types"
	banktypes "github.com/cosmos/cosmos-sdk/x/bank/types"
	genutilcli "github.com/cosmos/cosmos-sdk/x/genutil/client/cli"
	genutiltypes "github.com/cosmos/cosmos-sdk/x/genutil/types"
	rosetta "github.com/cosmos/rosetta/cmd"
	"github.com/spf13/cast"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"

	gaia "github.com/Agoric/agoric-sdk/golang/cosmos/app"
	"github.com/Agoric/agoric-sdk/golang/cosmos/app/params"
	"github.com/Agoric/agoric-sdk/golang/cosmos/vm"
	swingset "github.com/Agoric/agoric-sdk/golang/cosmos/x/swingset"
	swingsetkeeper "github.com/Agoric/agoric-sdk/golang/cosmos/x/swingset/keeper"
)

var AppName = "agd"
var OnStartHook func(*vm.AgdServer, log.Logger, servertypes.AppOptions) error
var OnExportHook func(*vm.AgdServer, log.Logger, servertypes.AppOptions) error

// CustomAppConfig extends the base config struct.
type CustomAppConfig struct {
	serverconfig.Config `mapstructure:",squash"`
	// Swingset must be named as expected by swingset.DefaultConfigTemplate
	// and must use a mapstructure key matching swingset.ConfigPrefix.
	Swingset swingset.SwingsetConfig `mapstructure:"swingset"`
}

type cobraRunE func(cmd *cobra.Command, args []string) error

func appendToPreRunE(cmd *cobra.Command, fn cobraRunE) {
	preRunE := cmd.PreRunE
	if preRunE == nil {
		cmd.PreRunE = fn
		return
	}
	composite := func(cmd *cobra.Command, args []string) error {
		if err := preRunE(cmd, args); err != nil {
			return err
		}
		return fn(cmd, args)
	}
	cmd.PreRunE = composite
}

type emptyAppOptions struct{}

func (ao emptyAppOptions) Get(_ string) interface{} { return nil }

func tempDir(defaultHome string) string {
	dir, err := os.MkdirTemp("", "agoric")
	if err != nil {
		dir = defaultHome
	}
	defer os.RemoveAll(dir)

	return dir
}

// NewRootCmd creates a new root command for simd. It is called once in the
// main function.
func NewRootCmd(sender vm.Sender) (*cobra.Command, params.EncodingConfig) {
	encodingConfig := gaia.MakeEncodingConfig()
	initClientCtx := client.Context{}.
		WithCodec(encodingConfig.Marshaler).
		WithInterfaceRegistry(encodingConfig.InterfaceRegistry).
		WithTxConfig(encodingConfig.TxConfig).
		WithLegacyAmino(encodingConfig.Amino).
		WithInput(os.Stdin).
		WithAccountRetriever(types.AccountRetriever{}).
		WithHomeDir(gaia.DefaultNodeHome).
		WithViper("AGD_")

	rootCmd := &cobra.Command{
		Use:   AppName,
		Short: "Agoric Cosmos App",
		PersistentPreRunE: func(cmd *cobra.Command, _ []string) error {
			// set the default command outputs
			cmd.SetOut(cmd.OutOrStdout())
			cmd.SetErr(cmd.ErrOrStderr())

			initClientCtx, err := client.ReadPersistentCommandFlags(initClientCtx, cmd.Flags())
			if err != nil {
				return err
			}

			initClientCtx, err = config.ReadFromClientConfig(initClientCtx)
			if err != nil {
				return err
			}

			if err := client.SetCmdClientContextHandler(initClientCtx, cmd); err != nil {
				return err
			}

			customAppTemplate, customAppConfig := initAppConfig()
			customTMConfig := initTendermintConfig()
			return server.InterceptConfigsPreRunHandler(cmd, customAppTemplate, customAppConfig, customTMConfig)
		},
	}

	initRootCmd(sender, rootCmd, encodingConfig)

	tempDir := tempDir(gaia.DefaultNodeHome)
	tempApp := gaia.NewGaiaApp(
		log.NewNopLogger(),
		dbm.NewMemDB(),
		nil, true, map[int64]bool{},
		tempDir,
		0,
		encodingConfig,
		emptyAppOptions{},
	)

	defer func() {
		if err := tempApp.Close(); err != nil {
			panic(err)
		}
		if tempDir != gaia.DefaultNodeHome {
			os.RemoveAll(tempDir)
		}
	}()

	if err := autoCliOpts(initClientCtx, tempApp).EnhanceRootCommand(rootCmd); err != nil {
		panic(err)
	}

	return rootCmd, encodingConfig
}

func initTendermintConfig() *tmcfg.Config {
	cfg := tmcfg.DefaultConfig()
	// customize config here
	return cfg
}

// initAppConfig helps to override default appConfig template and configs.
// return "", nil if no custom configuration is required for the application.
func initAppConfig() (string, interface{}) {
	srvCfg := serverconfig.DefaultConfig()

	// FIXME: We may want a non-zero min gas price.
	// For now, we set it to zero to reduce friction (the default "" fails
	// startup, forcing each validator to set their own value).
	srvCfg.MinGasPrices = "0uist"

	customAppConfig := CustomAppConfig{
		Config:   *srvCfg,
		Swingset: swingset.DefaultSwingsetConfig,
	}

	// Config TOML.
	customAppTemplate := strings.Join([]string{
		serverconfig.DefaultConfigTemplate,
		swingset.DefaultConfigTemplate,
	}, "")

	return customAppTemplate, customAppConfig
}

func initRootCmd(sender vm.Sender, rootCmd *cobra.Command, encodingConfig params.EncodingConfig) {
	cfg := sdk.GetConfig()
	cfg.Seal()

	ac := appCreator{
		encCfg:    encodingConfig,
		sender:    sender,
		agdServer: vm.NewAgdServer(),
	}
	valOperAddressCodec := address.NewBech32Codec(sdk.GetConfig().GetBech32ValidatorAddrPrefix())
	rootCmd.AddCommand(
		genutilcli.InitCmd(gaia.ModuleBasics, gaia.DefaultNodeHome),
		genutilcli.CollectGenTxsCmd(banktypes.GenesisBalancesIterator{}, gaia.DefaultNodeHome, genutiltypes.DefaultMessageValidator, valOperAddressCodec),
		genutilcli.MigrateGenesisCmd(genutilcli.MigrationMap),
		genutilcli.GenTxCmd(gaia.ModuleBasics, encodingConfig.TxConfig, banktypes.GenesisBalancesIterator{}, gaia.DefaultNodeHome, valOperAddressCodec),
		genutilcli.ValidateGenesisCmd(gaia.ModuleBasics),
		AddGenesisAccountCmd(encodingConfig.Marshaler, gaia.DefaultNodeHome),
		tmcli.NewCompletionCmd(rootCmd, true),
		testnetCmd(gaia.ModuleBasics, banktypes.GenesisBalancesIterator{}),
		debug.Cmd(),
		confixcmd.ConfigCommand(),
		pruning.Cmd(ac.newSnapshotsApp, gaia.DefaultNodeHome),
		snapshot.Cmd(ac.newSnapshotsApp),
	)

	server.AddCommands(rootCmd, gaia.DefaultNodeHome, ac.newApp, ac.appExport, addStartFlags)

	for _, command := range rootCmd.Commands() {
		switch command.Name() {
		case "start":
			var preRunE cobraRunE = func(cmd *cobra.Command, _ []string) error {
				// Consume and validate config.
				viper := server.GetServerContextFromCmd(cmd).Viper
				baseConfig, err := serverconfig.GetConfig(viper)
				if err != nil {
					return err
				}
				if err = baseConfig.ValidateBasic(); err != nil {
					return err
				}
				if _, err = swingset.SwingsetConfigFromViper(viper); err != nil {
					return err
				}
				return nil
			}
			appendToPreRunE(command, preRunE)
		case "export":
			addAgoricVMFlags(command)
			extendCosmosExportCommand(command)
		case "snapshots":
			for _, subCommand := range command.Commands() {
				switch subCommand.Name() {
				case "restore":
					addAgoricVMFlags(subCommand)
				case "export":
					addAgoricVMFlags(subCommand)
					replaceCosmosSnapshotExportCommand(subCommand, ac)
				}
			}
		}
	}

	// add keybase, auxiliary RPC, query, and tx child commands
	rootCmd.AddCommand(
		server.StatusCommand(),
		queryCommand(),
		txCommand(),
		keys.Commands(),
	)

	// add rosetta
	rootCmd.AddCommand(rosetta.RosettaCommand(encodingConfig.InterfaceRegistry, encodingConfig.Marshaler))
}

const (
	// FlagSplitVm is the command-line flag for subcommands that can use a
	// split-process Agoric VM.  The default is to use an embedded VM.
	FlagSplitVm      = "split-vm"
	EmbeddedVmEnvVar = "AGD_EMBEDDED_VM"
)

// hasVMController returns true if we have a VM (are running in split-vm mode,
// or with an embedded VM).
func hasVMController(serverCtx *server.Context) bool {
	return serverCtx.Viper.GetString(FlagSplitVm) != "" ||
		os.Getenv(EmbeddedVmEnvVar) != ""
}

func addAgoricVMFlags(cmd *cobra.Command) {
	cmd.PersistentFlags().String(
		FlagSplitVm,
		"",
		"Specify the external Agoric VM program",
	)
}

func addStartFlags(startCmd *cobra.Command) {
	addAgoricVMFlags(startCmd)
}

func queryCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:                        "query",
		Aliases:                    []string{"q"},
		Short:                      "Querying subcommands",
		DisableFlagParsing:         true,
		SuggestionsMinimumDistance: 2,
		RunE:                       client.ValidateCmd,
	}

	cmd.AddCommand(
		rpc.ValidatorCommand(),
		authcmd.QueryTxsByEventsCmd(),
		authcmd.QueryTxCmd(),
	)

	cmd.PersistentFlags().String(flags.FlagChainID, "", "The network chain ID")

	return cmd
}

func txCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:                        "tx",
		Short:                      "Transactions subcommands",
		DisableFlagParsing:         true,
		SuggestionsMinimumDistance: 2,
		RunE:                       client.ValidateCmd,
	}

	cmd.AddCommand(
		authcmd.GetSignCommand(),
		authcmd.GetSignBatchCommand(),
		authcmd.GetMultiSignCommand(),
		authcmd.GetMultiSignBatchCmd(),
		authcmd.GetValidateSignaturesCommand(),
		flags.LineBreak,
		authcmd.GetBroadcastCommand(),
		authcmd.GetEncodeCommand(),
		authcmd.GetDecodeCommand(),
		flags.LineBreak,
	)

	gaia.ModuleBasics.AddTxCommands(cmd)
	cmd.PersistentFlags().String(flags.FlagChainID, "", "The network chain ID")

	return cmd
}

type appCreator struct {
	encCfg    params.EncodingConfig
	sender    vm.Sender
	agdServer *vm.AgdServer
}

func (ac appCreator) newApp(
	logger log.Logger,
	db dbm.DB,
	traceStore io.Writer,
	appOpts servertypes.AppOptions,
) servertypes.Application {
	if OnStartHook != nil {
		if err := OnStartHook(ac.agdServer, logger, appOpts); err != nil {
			panic(err)
		}
	}

	baseappOptions := server.DefaultBaseappOptions(appOpts)

	skipUpgradeHeights := make(map[int64]bool)
	for _, h := range cast.ToIntSlice(appOpts.Get(server.FlagUnsafeSkipUpgrades)) {
		skipUpgradeHeights[int64(h)] = true
	}

	homePath := cast.ToString(appOpts.Get(flags.FlagHome))

	// Set a default value for FlagSwingStoreExportDir based on homePath
	// in case we need to InitGenesis with swing-store data
	viper, ok := appOpts.(*viper.Viper)
	if ok && viper.GetString(gaia.FlagSwingStoreExportDir) == "" {
		exportDir := filepath.Join(homePath, "config", ExportedSwingStoreDirectoryName)
		viper.Set(gaia.FlagSwingStoreExportDir, exportDir)
	}

	return gaia.NewAgoricApp(
		ac.sender, ac.agdServer,
		logger, db, traceStore, true, skipUpgradeHeights,
		homePath,
		cast.ToUint(appOpts.Get(server.FlagInvCheckPeriod)),
		ac.encCfg,
		appOpts,
		baseappOptions...,
	)
}

func (ac appCreator) newSnapshotsApp(
	logger log.Logger,
	db dbm.DB,
	traceStore io.Writer,
	appOpts servertypes.AppOptions,
) servertypes.Application {
	if OnExportHook != nil {
		if err := OnExportHook(ac.agdServer, logger, appOpts); err != nil {
			panic(err)
		}
	}

	baseappOptions := server.DefaultBaseappOptions(appOpts)

	homePath := cast.ToString(appOpts.Get(flags.FlagHome))

	return gaia.NewAgoricApp(
		ac.sender, ac.agdServer,
		logger, db, traceStore, true, map[int64]bool{},
		homePath,
		cast.ToUint(appOpts.Get(server.FlagInvCheckPeriod)),
		ac.encCfg,
		appOpts,
		baseappOptions...,
	)
}

const (
	// FlagExportDir is the command-line flag for the "export" command specifying
	// where the output of the export should be placed. It contains both the
	// items names below: the genesis file, and a directory containing the
	// exported swing-store artifacts
	FlagExportDir = "export-dir"
	// ExportedGenesisFileName is the file name used to save the genesis in the export-dir
	ExportedGenesisFileName = "genesis.json"
	// ExportedSwingStoreDirectoryName is the directory name used to save the swing-store
	// export (artifacts only) in the export-dir
	ExportedSwingStoreDirectoryName = "swing-store"
)

var allowedSwingSetExportModes = map[string]bool{
	swingset.SwingStoreExportModeDebug:       true,
	swingset.SwingStoreExportModeOperational: true,
	swingset.SwingStoreExportModeSkip:        true,
}

// extendCosmosExportCommand monkey-patches the "export" command added by
// cosmos-sdk to add a required "export-dir" command-line flag, and create the
// genesis export in the specified directory if the VM is running.
func extendCosmosExportCommand(cmd *cobra.Command) {
	cmd.Flags().String(FlagExportDir, "", "The directory where to create the genesis export")
	err := cmd.MarkFlagRequired(FlagExportDir)
	if err != nil {
		panic(err)
	}

	var keys []string
	for key := range allowedSwingSetExportModes {
		keys = append(keys, key)
	}

	cmd.Flags().String(
		gaia.FlagSwingStoreExportMode,
		swingset.SwingStoreExportModeOperational,
		fmt.Sprintf(
			"The mode for swingstore export (%s)",
			strings.Join(keys, " | "),
		),
	)

	originalRunE := cmd.RunE

	extendedRunE := func(cmd *cobra.Command, args []string) error {
		serverCtx := server.GetServerContextFromCmd(cmd)

		exportDir, _ := cmd.Flags().GetString(FlagExportDir)
		swingStoreExportMode, _ := cmd.Flags().GetString(gaia.FlagSwingStoreExportMode)

		err := os.MkdirAll(exportDir, os.ModePerm)
		if err != nil {
			return err
		}

		genesisPath := filepath.Join(exportDir, ExportedGenesisFileName)

		// Since none mode doesn't perform any swing store export
		// There is no point in creating the export directory
		if swingStoreExportMode != swingset.SwingStoreExportModeSkip {
			swingStoreExportPath := filepath.Join(exportDir, ExportedSwingStoreDirectoryName)

			err = os.MkdirAll(swingStoreExportPath, os.ModePerm)
			if err != nil {
				return err
			}
			// We unconditionally set FlagSwingStoreExportDir as for export, it makes
			// little sense for users to control this location separately, and we don't
			// want to override any swing-store artifacts that may be associated to the
			// current genesis.
			serverCtx.Viper.Set(gaia.FlagSwingStoreExportDir, swingStoreExportPath)
		}

		if hasVMController(serverCtx) || swingStoreExportMode == swingset.SwingStoreExportModeSkip {
			// Capture the export in the genesisPath.
			// This will fail if a genesis.json already exists in the export-dir
			genesisFile, err := os.OpenFile(
				genesisPath,
				os.O_CREATE|os.O_EXCL|os.O_WRONLY,
				os.ModePerm,
			)
			if err != nil {
				return err
			}
			defer genesisFile.Close()
			cmd.SetOut(genesisFile)
		}

		// If we don't have a VM, appExport will just use the OnExportHook to exec
		// the VM program, which will result in reentering this function with the VM
		// controller set, and activate the above condition.
		return originalRunE(cmd, args)
	}

	cmd.RunE = extendedRunE
}

func (ac appCreator) appExport(
	logger log.Logger,
	db dbm.DB,
	traceStore io.Writer,
	height int64,
	forZeroHeight bool,
	jailAllowedAddrs []string,
	appOpts servertypes.AppOptions,
	modulesToExport []string,
) (servertypes.ExportedApp, error) {
	swingStoreExportMode, ok := appOpts.Get(gaia.FlagSwingStoreExportMode).(string)
	if !(ok && allowedSwingSetExportModes[swingStoreExportMode]) {
		return servertypes.ExportedApp{}, fmt.Errorf(
			"export mode '%s' is not supported",
			swingStoreExportMode,
		)
	}

	// We don't have to launch VM in case the swing store export is not required
	if swingStoreExportMode != swingset.SwingStoreExportModeSkip && OnExportHook != nil {
		if err := OnExportHook(ac.agdServer, logger, appOpts); err != nil {
			return servertypes.ExportedApp{}, err
		}
	}

	homePath, ok := appOpts.Get(flags.FlagHome).(string)
	if !ok || homePath == "" {
		return servertypes.ExportedApp{}, errors.New("application home is not set")
	}

	loadLatest := height == -1

	gaiaApp := gaia.NewAgoricApp(
		ac.sender, ac.agdServer,
		logger,
		db,
		traceStore,
		loadLatest,
		map[int64]bool{},
		homePath,
		cast.ToUint(appOpts.Get(server.FlagInvCheckPeriod)),
		ac.encCfg,
		appOpts,
	)

	if height != -1 {
		if err := gaiaApp.LoadHeight(height); err != nil {
			return servertypes.ExportedApp{}, err
		}
	}

	return gaiaApp.ExportAppStateAndValidators(forZeroHeight, jailAllowedAddrs, modulesToExport)
}

// replaceCosmosSnapshotExportCommand monkey-patches the "snapshots export" command
// added by cosmos-sdk and replaces its implementation with one suitable for
// our modifications to the cosmos snapshots process
func replaceCosmosSnapshotExportCommand(cmd *cobra.Command, ac appCreator) {
	// Copy of RunE is cosmos-sdk/client/snapshot/export.go
	replacedRunE := func(cmd *cobra.Command, args []string) error {
		ctx := server.GetServerContextFromCmd(cmd)

		heightFlag, err := cmd.Flags().GetInt64("height")
		if err != nil {
			return err
		}

		home := ctx.Config.RootDir
		dataDir := filepath.Join(home, "data")
		db, err := dbm.NewDB("application", server.GetAppDBBackend(ctx.Viper), dataDir)
		if err != nil {
			return err
		}

		app := ac.newSnapshotsApp(ctx.Logger, db, nil, ctx.Viper)
		gaiaApp := app.(*gaia.GaiaApp)

		latestHeight := app.CommitMultiStore().LastCommitID().Version

		if heightFlag != 0 && latestHeight != heightFlag {
			return fmt.Errorf("cannot export at height %d, only latest height %d is supported", heightFlag, latestHeight)
		}

		cmd.Printf("Exporting snapshot for height %d\n", latestHeight)

		err = gaiaApp.SwingSetSnapshotter.InitiateSnapshot(latestHeight)
		if err != nil {
			return err
		}

		err = swingsetkeeper.WaitUntilSwingStoreExportDone()
		if err != nil {
			return err
		}

		snapshotList, err := app.SnapshotManager().List()
		if err != nil {
			return err
		}

		snapshotHeight := uint64(latestHeight)

		for _, snapshot := range snapshotList {
			if snapshot.Height == snapshotHeight {
				cmd.Printf("Snapshot created at height %d, format %d, chunks %d\n", snapshot.Height, snapshot.Format, snapshot.Chunks)
				break
			}
		}

		return nil
	}

	cmd.RunE = replacedRunE
}

func autoCliOpts(initClientCtx client.Context, tempApp *gaia.GaiaApp) autocli.AppOptions {
	modules := make(map[string]appmodule.AppModule, 0)
	for _, m := range tempApp.ModuleManager().Modules {
		if moduleWithName, ok := m.(module.HasName); ok {
			moduleName := moduleWithName.Name()
			if appModule, ok := moduleWithName.(appmodule.AppModule); ok {
				modules[moduleName] = appModule
			}
		}
	}

	return autocli.AppOptions{
		Modules:               modules,
		ModuleOptions:         runtimeservices.ExtractAutoCLIOptions(tempApp.ModuleManager().Modules),
		AddressCodec:          authcodec.NewBech32Codec(sdk.GetConfig().GetBech32AccountAddrPrefix()),
		ValidatorAddressCodec: authcodec.NewBech32Codec(sdk.GetConfig().GetBech32ValidatorAddrPrefix()),
		ConsensusAddressCodec: authcodec.NewBech32Codec(sdk.GetConfig().GetBech32ConsensusAddrPrefix()),
		ClientCtx:             initClientCtx}
}
