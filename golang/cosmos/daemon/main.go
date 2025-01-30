package daemon

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	svrcmd "github.com/cosmos/cosmos-sdk/server/cmd"

	"github.com/Agoric/agoric-sdk/golang/cosmos/agoric"
	app "github.com/Agoric/agoric-sdk/golang/cosmos/app"
	"github.com/Agoric/agoric-sdk/golang/cosmos/daemon/cmd"
	"github.com/Agoric/agoric-sdk/golang/cosmos/vm"

	sdk "github.com/cosmos/cosmos-sdk/types"
)

// DefaultController is a stub controller.
var DefaultController vm.Sender = func(ctx context.Context, needReply bool, jsonRequest string) (jsonReply string, err error) {
	return "", fmt.Errorf("Controller not configured; did you mean to use `ag-chain-cosmos` instead?")
}

// Run starts the app with a stub controller.
func Run() {
	RunWithController(DefaultController)
}

// RunWithController starts the app with a custom upcall handler.
func RunWithController(sendToController vm.Sender) {
	// Exit on Control-C and kill.
	// Without this explicitly, ag-chain-cosmos ignores them.
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-sigs
		_, _ = sendToController(context.Background(), false, "shutdown")
		os.Exit(98)
	}()

	config := sdk.GetConfig()
	agoric.SetAgoricConfig(config)
	config.Seal()

	rootCmd, _ := cmd.NewRootCmd(sendToController)
	if err := svrcmd.Execute(rootCmd, "", app.DefaultNodeHome); err != nil {
		os.Exit(1)
	}
}
