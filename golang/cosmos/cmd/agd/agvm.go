package main

import (
	"fmt"
	"os"
	"os/exec"

	"cosmossdk.io/log"
)

// NewVMCommand creates a new OS command to run the Agoric VM.  It sets up the
// file descriptors for the VM to communicate with agd, and passes their numbers
// via AGVM_FROM_AGD and AGVM_TO_AGD environment variables.
func NewVMCommand(logger log.Logger, binary string, args []string, vmFromAgd, vmToAgd *os.File) *exec.Cmd {
	logger.Info("agd connecting to VM", "binary", binary, "args", args)
	cmd := exec.Command(binary, args[1:]...)

	// Manage the file descriptors.
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin
	numStdFiles := 3 // stdin, stdout, stderr

	// We start our file descriptor allocations after the standard ones, including
	// Node.js IPC (fd=3).
	fdFromAgd := 4
	fdToAgd := fdFromAgd + 1

	// ExtraFiles begins at fd numStdFiles, so we need to compute the array.
	cmd.ExtraFiles = make([]*os.File, fdToAgd-numStdFiles+1)
	cmd.ExtraFiles[fdFromAgd-numStdFiles] = vmFromAgd
	cmd.ExtraFiles[fdToAgd-numStdFiles] = vmToAgd

	// Pass the file descriptor numbers in the environment.
	cmd.Env = append(
		os.Environ(),
		fmt.Sprintf("AGVM_FROM_AGD=%d", fdFromAgd),
		fmt.Sprintf("AGVM_TO_AGD=%d", fdToAgd),
	)

	return cmd
}
