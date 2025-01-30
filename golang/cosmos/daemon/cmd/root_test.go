package cmd_test

import (
	"bytes"
	"io"
	"os"
	"testing"
	"text/template"

	"cosmossdk.io/log"
	"github.com/spf13/pflag"
	"github.com/stretchr/testify/require"

	dbm "github.com/cosmos/cosmos-db"
	"github.com/cosmos/cosmos-sdk/server"
	svrcmd "github.com/cosmos/cosmos-sdk/server/cmd"
	serverconfig "github.com/cosmos/cosmos-sdk/server/config"
	servertypes "github.com/cosmos/cosmos-sdk/server/types"

	app "github.com/Agoric/agoric-sdk/golang/cosmos/app"
	"github.com/Agoric/agoric-sdk/golang/cosmos/daemon/cmd"
)

func TestRootCmdConfig(t *testing.T) {

	rootCmd, _ := cmd.NewRootCmd(nil)
	rootCmd.SetArgs([]string{
		"keys", //
		"list", //
	})

	require.NoError(t, svrcmd.Execute(rootCmd, "", app.DefaultNodeHome))
}

func TestCLIFlags(t *testing.T) {
	// List of flags we have so far observed as used by the base cosmos sdk
	// Before adding any flag to this list, the author should audit if explicit
	// handling should not be added in the Agoric app (most likely in root.go)
	expectedFlagNames := map[string]interface{}{
		"abci":                  "",
		"abci-client-type":      "",
		"address":               "",
		"app-db-backend":        "",
		"cpu-profile":           "",
		"db_backend":            "",
		"db_dir":                "",
		"genesis_hash":          "",
		"grpc-only":             "",
		"halt-height":           "",
		"halt-time":             "",
		"home":                  "",
		"iavl-cache-size":       "",
		"iavl-disable-fastnode": "",
		"index-events":          "",
		"inter-block-cache":     "",
		"inv-check-period":      "",
		"min-retain-blocks":     "",
		"minimum-gas-prices":    "",
		"moniker":               "",
		"priv_validator_laddr":  "",
		"proxy_app":             "",
		"pruning":               "default",
		"pruning-interval":      "",
		"pruning-keep-recent":   "",
		"trace":                 "",
		"trace-store":           "",
		"transport":             "",
		"unsafe-skip-upgrades":  "",
		"with-comet":            "",

		"query-gas-limit": "",
		"shutdown-grace":  "",

		"api.address":              "",
		"api.enable":               "",
		"api.enabled-unsafe-cors":  "",
		"api.max-open-connections": "",
		"api.rpc-max-body-bytes":   "",
		"api.rpc-read-timeout":     "",
		"api.rpc-write-timeout":    "",
		"api.swagger":              "",

		"consensus.create_empty_blocks":          "",
		"consensus.create_empty_blocks_interval": "",
		"consensus.double_sign_check_height":     "",

		"grpc-web.enable": "",

		"grpc.address":           "",
		"grpc.enable":            "",
		"grpc.max-recv-msg-size": "",
		"grpc.max-send-msg-size": "",

		"p2p.external-address":       "",
		"p2p.laddr":                  "",
		"p2p.persistent_peers":       "",
		"p2p.pex":                    "",
		"p2p.private_peer_ids":       "",
		"p2p.seed_mode":              "",
		"p2p.seeds":                  "",
		"p2p.unconditional_peer_ids": "",

		"rpc.grpc_laddr":  "",
		"rpc.laddr":       "",
		"rpc.pprof_laddr": "",
		"rpc.unsafe":      "",

		"state-sync.snapshot-interval":    "",
		"state-sync.snapshot-keep-recent": "",

		"telemetry.enable-hostname-label":     "",
		"telemetry.enable-hostname":           "",
		"telemetry.enable-service-label":      "",
		"telemetry.enabled":                   "",
		"telemetry.global-labels":             "",
		"telemetry.prometheus-retention-time": "",
		"telemetry.service-name":              "",
		"telemetry.datadog-hostname":          "",
		"telemetry.statsd-addr":               "",

		"telemetry.metrics-sink": "",

		"mempool.max-txs": "",

		"streaming.abci.plugin":           "",
		"streaming.abci.keys":             "",
		"streaming.abci.stop-node-on-err": "",
	}
	unknownFlagNames := []string{}
	missingFlagNames := map[string]bool{}
	for name := range expectedFlagNames {
		missingFlagNames[name] = true
	}
	readFlag := func(name string) interface{} {
		if defaultValue, found := expectedFlagNames[name]; found {
			delete(missingFlagNames, name)
			return defaultValue
		}
		unknownFlagNames = append(unknownFlagNames, name)
		return nil
	}

	homeDir, err := os.MkdirTemp("", "cosmos-sdk-home")
	if err != nil {
		panic(err)
	}
	defer os.RemoveAll(homeDir)

	// First get the command line flags that the base cosmos-sdk defines
	dummyAppCreator := func(
		logger log.Logger,
		db dbm.DB,
		traceStore io.Writer,
		appOpts servertypes.AppOptions,
	) servertypes.Application {
		return new(app.GaiaApp)
	}
	cmd := server.StartCmd(dummyAppCreator, homeDir)
	flags := cmd.Flags()
	flags.SortFlags = true
	flags.VisitAll(func(flag *pflag.Flag) {
		readFlag(flag.Name)
	})

	// Then get the options parsing the default config file.
	serverCtx := server.NewDefaultContext()
	// appTemplate, appConfig := initAppConfig()
	appTemplate := serverconfig.DefaultConfigTemplate
	appConfig := serverconfig.DefaultConfig()
	configTemplate := template.Must(template.New("").Parse(appTemplate))
	var buffer bytes.Buffer
	if err := configTemplate.Execute(&buffer, appConfig); err != nil {
		panic(err)
	}
	serverCtx.Viper.SetConfigType("toml")
	if err := serverCtx.Viper.MergeConfig(&buffer); err != nil {
		panic(err)
	}
	for _, configKey := range serverCtx.Viper.AllKeys() {
		readFlag(configKey)
	}

	if len(unknownFlagNames) != 0 {
		t.Error(
			"unknown CLI flags in cosmos-sdk; incorporate as needed and update this test",
			unknownFlagNames,
		)
	}
	if len(missingFlagNames) != 0 {
		missing := []string{}
		for name := range missingFlagNames {
			missing = append(missing, name)
		}
		t.Error(
			"expected CLI flags missing from cosmos-sdk; remove from this test",
			missing,
		)
	}
}
