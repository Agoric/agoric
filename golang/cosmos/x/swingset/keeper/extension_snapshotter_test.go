package keeper

import (
	"io"
	"testing"

	"cosmossdk.io/log"
)

func newTestExtensionSnapshotter() *ExtensionSnapshotter {
	logger := log.NewNopLogger() // log.NewTMLogger(log.NewSyncWriter( /* os.Stdout*/ io.Discard)).With("module", "sdk/app")
	return &ExtensionSnapshotter{
		isConfigured:             func() bool { return true },
		logger:                   logger,
		swingStoreExportsHandler: newTestSwingStoreExportsHandler(),
	}
}

func TestExtensionSnapshotterInProgress(t *testing.T) {
	extensionSnapshotter := newTestExtensionSnapshotter()
	ch := make(chan struct{})
	extensionSnapshotter.takeAppSnapshot = func(height int64) {
		<-ch
	}
	err := extensionSnapshotter.InitiateSnapshot(123)
	if err != nil {
		t.Fatal(err)
	}
	err = WaitUntilSwingStoreExportStarted()
	if err != nil {
		t.Fatal(err)
	}

	err = extensionSnapshotter.InitiateSnapshot(456)
	if err == nil {
		t.Error("wanted error for snapshot in progress")
	}

	err = extensionSnapshotter.RestoreExtension(
		456, SnapshotFormat,
		func() ([]byte, error) {
			return nil, io.EOF
		})
	if err == nil {
		t.Error("wanted error for snapshot in progress")
	}

	close(ch)
	err = WaitUntilSwingStoreExportDone()
	if err != nil {
		t.Fatal(err)
	}

	err = extensionSnapshotter.InitiateSnapshot(456)
	if err != nil {
		t.Fatal(err)
	}
	err = WaitUntilSwingStoreExportDone()
	if err != nil {
		t.Fatal(err)
	}
}

func TestExtensionSnapshotterNotConfigured(t *testing.T) {
	extensionSnapshotter := newTestExtensionSnapshotter()
	extensionSnapshotter.isConfigured = func() bool { return false }
	err := extensionSnapshotter.InitiateSnapshot(123)
	if err == nil {
		t.Error("wanted error for unconfigured snapshot manager")
	}
}

func TestExtensionSnapshotterSecondCommit(t *testing.T) {
	extensionSnapshotter := newTestExtensionSnapshotter()

	// Use a channel to block the snapshot goroutine after it has started but before it exits.
	ch := make(chan struct{})
	extensionSnapshotter.takeAppSnapshot = func(height int64) {
		<-ch
	}

	// First run through app.Commit()
	err := WaitUntilSwingStoreExportStarted()
	if err != nil {
		t.Fatal(err)
	}
	err = extensionSnapshotter.InitiateSnapshot(123)
	if err != nil {
		t.Fatal(err)
	}

	// Second run through app.Commit() - should return right away
	err = WaitUntilSwingStoreExportStarted()
	if err != nil {
		t.Fatal(err)
	}

	// close the signaling channel to let goroutine exit
	close(ch)
	err = WaitUntilSwingStoreExportDone()
	if err != nil {
		t.Fatal(err)
	}
}
