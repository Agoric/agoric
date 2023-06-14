package daemon

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/cosmos/cosmos-sdk/server"
	svrcmd "github.com/cosmos/cosmos-sdk/server/cmd"

	"github.com/Agoric/agoric-sdk/golang/cosmos/agoric"
	app "github.com/Agoric/agoric-sdk/golang/cosmos/app"
	"github.com/Agoric/agoric-sdk/golang/cosmos/daemon/cmd"
	"github.com/Agoric/agoric-sdk/golang/cosmos/vm"

	sdk "github.com/cosmos/cosmos-sdk/types"
)

// DefaultController is a stub controller.
var DefaultController = vm.NewTarget(func(msg vm.Message) error {
	return fmt.Errorf("Controller not configured; did you mean to use `ag-chain-cosmos` instead?")
})

// Run starts the app with a stub controller.
func Run() {
	RunWithController(DefaultController)
}

// RunWithController starts the app with a custom upcall handler.
func RunWithController(controller vm.Target) {
	// Exit on Control-C and kill.
	// Without this explicitly, ag-chain-cosmos ignores them.
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-sigs
		os.Exit(98)
	}()

	config := sdk.GetConfig()
	agoric.SetAgoricConfig(config)
	config.Seal()

	rootCmd, _ := cmd.NewRootCmd(controller)
	if err := svrcmd.Execute(rootCmd, app.DefaultNodeHome); err != nil {
		switch e := err.(type) {
		case server.ErrorCode:
			os.Exit(e.Code)

		default:
			os.Exit(1)
		}
	}
}
