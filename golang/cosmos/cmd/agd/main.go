package main

import (
	"context"
	"errors"
	"net/rpc"
	"net/rpc/jsonrpc"
	"os"
	"os/exec"
	"syscall"
	"time"

	"cosmossdk.io/log"
	"github.com/spf13/cast"

	gaia "github.com/Agoric/agoric-sdk/golang/cosmos/app"
	"github.com/Agoric/agoric-sdk/golang/cosmos/daemon"
	daemoncmd "github.com/Agoric/agoric-sdk/golang/cosmos/daemon/cmd"
	"github.com/Agoric/agoric-sdk/golang/cosmos/vm"
	"github.com/Agoric/agoric-sdk/golang/cosmos/vm/jsonrpcconn"
	servertypes "github.com/cosmos/cosmos-sdk/server/types"
)

// TerminateSubprocessGracePeriod is how long we wait between closing the pipe
// waiting for it to exit, then sending a termination signal.
const TerminateSubprocessGracePeriod = 3 * time.Second

// KillSubprocessGracePeriod is how long we wait between sending a subprocess a
// termination signal, waiting for it to exit, then killing it.
const KillSubprocessGracePeriod = 5 * time.Second

// makeShutdown returns a function that terminates the vm.
func makeShutdown(cmd *exec.Cmd, writer *os.File) func() error {
	return func() error {
		// Stop talking to the subprocess.
		_ = writer.Close()
		go func() {
			// Wait a bit.
			time.Sleep(TerminateSubprocessGracePeriod)
			// Then punch it in the shoulder.
			_ = cmd.Process.Signal(os.Interrupt)
			// Wait a bit.
			time.Sleep(KillSubprocessGracePeriod)
			// Then blow it away.
			_ = cmd.Process.Kill()
		}()
		// Wait for it to keel over.
		return cmd.Wait()
	}
}

// main is the entry point of the agd daemon.  It determines whether to
// initialize JSON-RPC communications with the separate `--split-vm` VM process,
// or just to give up control entirely to another binary.
func main() {
	var vmClient *rpc.Client
	var shutdown func() error

	nodePort := 1
	var sendToNode vm.Sender = func(ctx context.Context, needReply bool, jsonRequest string) (jsonReply string, err error) {
		if vmClient == nil {
			return "", errors.New("sendToVM called without VM client set up")
		}

		if jsonRequest == "shutdown" {
			// We could ask nicely, but don't bother.
			if shutdown != nil {
				return "", shutdown()
			}
			return "", nil
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

	exitCode := 0
	launchVM := func(agdServer *vm.AgdServer, logger log.Logger, appOpts servertypes.AppOptions) error {
		args := []string{"ag-chain-cosmos", "--home", gaia.DefaultNodeHome}
		args = append(args, os.Args[1:]...)

		binary := cast.ToString(appOpts.Get(daemoncmd.FlagSplitVm))
		if binary == "" {
			binary, lookErr := FindCosmicSwingsetBinary()
			if lookErr != nil {
				return lookErr
			}

			// We completely delegate to our default app for running the actual chain.
			logger.Info("agd delegating to JS executable", "binary", binary, "args", args)
			return syscall.Exec(binary, args, os.Environ())
		}

		// Split the execution between us and the VM.
		agdFromVm, vmToAgd, err := os.Pipe()
		if err != nil {
			return err
		}
		vmFromAgd, agdToVm, err := os.Pipe()
		if err != nil {
			return err
		}

		// Start the command running, then continue.
		args[0] = binary
		cmd := NewVMCommand(logger, binary, args, vmFromAgd, vmToAgd)
		shutdown = makeShutdown(cmd, agdToVm)

		if err := cmd.Start(); err != nil {
			return err
		}
		if vmFromAgd.Close() != nil {
			return err
		}
		if vmToAgd.Close() != nil {
			return err
		}

		// Multiplex bidirectional JSON-RPC over the pipes.
		agvmConn := jsonrpcconn.NewConn(agdFromVm, agdToVm)
		clientConn, serverConn := jsonrpcconn.ClientServerConn(agvmConn)

		// Set up the VM server.
		vmServer := rpc.NewServer()
		if err := vmServer.RegisterName("agd", agdServer); err != nil {
			return err
		}
		go vmServer.ServeCodec(jsonrpc.NewServerCodec(serverConn))

		// Set up the VM client.
		vmClient = jsonrpc.NewClient(clientConn)

		go func() {
			// Premature exit from `agd start` should exit the process.
			_ = cmd.Wait()
			os.Exit(exitCode)
		}()

		return nil
	}

	daemoncmd.OnExportHook = launchVM
	daemoncmd.OnStartHook = func(agdServer *vm.AgdServer, logger log.Logger, appOpts servertypes.AppOptions) error {
		// We tried running start, which should never exit, so exit with non-zero
		// code if we do.
		exitCode = 99
		return launchVM(agdServer, logger, appOpts)
	}

	daemon.RunWithController(sendToNode)
}
