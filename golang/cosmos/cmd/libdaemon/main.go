package main

// /* These comments before the import "C" are included in the C output. */
// #include <stdlib.h>
// typedef const char* Body;
// typedef int (*sendFunc)(int, int, Body);
// inline int invokeSendFunc(sendFunc send, int port, int reply, Body str) {
//    return send(port, reply, str);
// }
import "C"

import (
	"context"
	"encoding/json"
	"net/rpc"
	"os"
	"path/filepath"

	log "cosmossdk.io/log"

	gaia "github.com/Agoric/agoric-sdk/golang/cosmos/app"
	"github.com/Agoric/agoric-sdk/golang/cosmos/daemon"
	daemoncmd "github.com/Agoric/agoric-sdk/golang/cosmos/daemon/cmd"
	"github.com/Agoric/agoric-sdk/golang/cosmos/vm"
	servertypes "github.com/cosmos/cosmos-sdk/server/types"
)

type goReturn = struct {
	str string
	err error
}

const SwingSetPort = 123

var vmClientCodec *vm.ClientCodec
var agdServer *vm.AgdServer

// ConnectVMClientCodec creates an RPC client codec and a sender to the
// in-process implementation of the VM.
func ConnectVMClientCodec(ctx context.Context, nodePort int, sendFunc func(int, int, string)) (*vm.ClientCodec, vm.Sender) {
	vmClientCodec = vm.NewClientCodec(ctx, sendFunc)
	vmClient := rpc.NewClientWithCodec(vmClientCodec)

	var sendToNode vm.Sender = func(ctx context.Context, needReply bool, jsonRequest string) (jsonReply string, err error) {
		if jsonRequest == "shutdown" {
			return "", vmClientCodec.Close()
		}

		msg := vm.Message{
			Port:       nodePort,
			NeedsReply: needReply,
			Data:       jsonRequest,
		}
		var reply string
		err = vmClient.Call(vm.ReceiveMessageMethod, msg, &reply)
		return reply, err
	}

	return vmClientCodec, sendToNode
}

//export RunAgCosmosDaemon
func RunAgCosmosDaemon(nodePort C.int, toNode C.sendFunc, cosmosArgs []*C.char) C.int {
	userHomeDir, err := os.UserHomeDir()
	if err != nil {
		panic(err)
	}

	gaia.DefaultNodeHome = filepath.Join(userHomeDir, ".ag-chain-cosmos")
	daemoncmd.AppName = "ag-chain-cosmos"
	if err := os.Setenv(daemoncmd.EmbeddedVmEnvVar, "libdaemon"); err != nil {
		panic(err)
	}

	var sendToNode vm.Sender

	sendFunc := func(port int, reply int, str string) {
		C.invokeSendFunc(toNode, C.int(port), C.int(reply), C.CString(str))
	}

	vmClientCodec, sendToNode = ConnectVMClientCodec(
		context.Background(),
		int(nodePort),
		sendFunc,
	)

	args := make([]string, len(cosmosArgs))
	for i, s := range cosmosArgs {
		args[i] = C.GoString(s)
	}

	// fmt.Fprintln(os.Stderr, "Starting Cosmos", args)
	os.Args = args
	go func() {
		// We run in the background, but exit when the job is over.
		// swingset.SendToNode("hello from Initial Go!")
		exitCode := 0
		daemoncmd.OnStartHook = func(srv *vm.AgdServer, logger log.Logger, appOpts servertypes.AppOptions) error {
			agdServer = srv
			// We tried running start, which should never exit, so exit with non-zero
			// code if we ever stop.
			exitCode = 99
			return nil
		}
		daemon.RunWithController(sendToNode)
		// fmt.Fprintln(os.Stderr, "Shutting down Cosmos")
		os.Exit(exitCode)
	}()
	// fmt.Fprintln(os.Stderr, "Done starting Cosmos")
	return SwingSetPort
}

//export ReplyToGo
func ReplyToGo(replyPort C.int, isError C.int, resp C.Body) C.int {
	respStr := C.GoString(resp)
	// fmt.Printf("Reply to Go %d %s\n", replyPort, respStr)
	if err := vmClientCodec.Receive(int(replyPort), int(isError) != 0, respStr); err != nil {
		return C.int(1)
	}
	return C.int(0)
}

type errorWrapper struct {
	Error string `json:"error"`
}

//export SendToGo
func SendToGo(port C.int, msg C.Body) C.Body {
	msgStr := C.GoString(msg)
	// fmt.Fprintln(os.Stderr, "Send to Go", msgStr)
	var respStr string
	message := &vm.Message{
		Port:       int(port),
		NeedsReply: true,
		Data:       msgStr,
	}

	err := agdServer.ReceiveMessage(message, &respStr)
	if err == nil {
		return C.CString(respStr)
	}

	// fmt.Fprintln(os.Stderr, "Cannot receive from controller", err)
	errResp := errorWrapper{
		Error: err.Error(),
	}
	respBytes, err := json.Marshal(&errResp)
	if err != nil {
		panic(err)
	}
	return C.CString(string(respBytes))
}

// Do nothing in main.
func main() {}
