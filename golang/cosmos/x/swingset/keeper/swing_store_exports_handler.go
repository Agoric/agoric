package keeper

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"

	sdkioerrors "cosmossdk.io/errors"
	"cosmossdk.io/log"
	agoric "github.com/Agoric/agoric-sdk/golang/cosmos/types"
	"github.com/Agoric/agoric-sdk/golang/cosmos/vm"
	"github.com/Agoric/agoric-sdk/golang/cosmos/x/swingset/types"
)

// This module abstracts the generation and handling of swing-store exports,
// including the communication with the JS side to generate and restore them.
//
// Its interface derives from the following requirements:
// - Multiple golang components may perform swing-store export or import
//   operations, but the JS side does not support concurrent operations as
//   there are no legitimate use cases.
// - Some components cannot block the main execution while performing an export
//   operation. In particular, cosmos's state-sync snapshot process cannot
//   block the logic handling tendermint events.
// - The JS swing-store cannot access historical states. To generate
//   deterministic exports, the export operations that cannot block must be able
//   to synchronize with commit points that will change the JS swing-store.
// - The JS swing-store export logic does however support mutation of the
//   JS swing-store state after an export operation has started. Such mutations
//	 do not affect the export that is produced, and can span multiple blocks.
// - This implies the commit synchronization is only necessary until the JS
// 	 side of the export operation has started.
// - Some components, in particular state-sync, may need to perform other work
//   alongside generating a swing-store export. This work similarly cannot block
//   the main execution, but must allow for the swing-store synchronization
//   that enables generating deterministic export. For state-sync, this work
//   happens before the generated swing-store export can be consumed.
//
// The general approach taken is to implement a SwingStoreExportsHandler that
// implements the communication with the JS side, enforces that no concurrent
// operations take place, defers the consumption of the export to a provided
// SwingStoreExportEventHandler, and provides some synchronization methods to
// let the application enforce mutation boundaries.
//
// There should be a single SwingStoreExportsHandler instance, and all its method
// calls should be performed from the same goroutine (no mutex enforcement).
//
// The process of generating a SwingStore export proceeds as follow:
// - The component invokes swingStoreExportsHandler.InitiateExport with an
//   eventHandler for the export.
// - InitiateExport verifies no other export operation is in progress and
//   starts a goroutine to perform the export operation. It requests the JS
//   side to start generating an export of the swing-store, and calls the
//   eventHandler's OnExportStarted method with a function param allowing it to
//   retrieve the export.
// - The cosmos app will call WaitUntilSwingStoreExportStarted before
//   instructing the JS controller to commit its work, satisfying the
//   deterministic exports requirement.
// - OnExportStarted must call the retrieve function before returning, however
//   it may perform other work before. For cosmos state-sync snapshots,
//   OnExportStarted will call app.Snapshot which will invoke the swingset
//   module's ExtensionSnapshotter that will retrieve and process the
//   swing-store export.
// - When the retrieve function is called, it blocks until the JS export is
//   ready, then creates a SwingStoreExportProvider that abstract accessing
//   the content of the export. The eventHandler's OnExportRetrieved is called
//   with the export provider.
// - OnExportRetrieved reads the export using the provider.
//
// Restoring a swing-store export does not have similar non-blocking requirements.
// The component simply invokes swingStoreExportsHandler.RestoreExport with a
// SwingStoreExportProvider representing the swing-store export to
// be restored, and RestoreExport will consume it and block until the JS side
// has completed the restore before returning.

// exportManifest represents the content of the JS swing-store export manifest.
// The export is exchanged between Cosmos and JS using the file system, and only
// the directory containing the export is exchanged with a blockingSend. The
// manifest is a JSON file with the agreed upon file name of
// "export-manifest.json" in the export directory. It contains the file names
// for the "export data" (described in the godoc for exportDataFilename), and
// for the opaque artifacts of the export.
type exportManifest struct {
	// BlockHeight is the block height of the manifest.
	BlockHeight uint64 `json:"blockHeight,omitempty"`
	// Data is the filename of the export data.
	Data string `json:"data,omitempty"`
	// Artifacts is the list of [artifact name, file name] pairs.
	Artifacts [][2]string `json:"artifacts"`
}

// ExportManifestFilename is the manifest filename which must be synchronized with the JS export/import tooling
// See packages/cosmic-swingset/src/export-kernel-db.js and packages/cosmic-swingset/src/import-kernel-db.js
const ExportManifestFilename = "export-manifest.json"

// For restore operations, the swing-store "export data" is exchanged with the
// JS side as a file which encodes "export data" entries as a sequence of
// [key, value] JSON arrays each terminated by a new line.
// NB: this is not technically jsonlines since the entries are new line
// terminated instead of being new line separated, however the parsers in both
// JS and golang handle such extra whitespace.
const exportDataFilename = "export-data.jsonl"

// UntrustedExportDataArtifactName is a special artifact name that the provider
// and consumer of an export can use to indicate the presence of a synthetic
// artifact containing untrusted "export data". This artifact must not end up in
// the list of artifacts imported by the JS import tooling (which would fail).
const UntrustedExportDataArtifactName = "UNTRUSTED-EXPORT-DATA"
const untrustedExportDataFilename = "untrusted-export-data.jsonl"

const exportedFilesMode = 0644

// swingStoreExportActionType is the action type used for all swing-store
// export blockingSend, and synchronized with the JS side in
// packages/internal/src/action-types.js
const swingStoreExportActionType = "SWING_STORE_EXPORT"

// initiateRequest is the request type for initiating an export
const initiateRequest = "initiate"

type swingStoreInitiateExportAction struct {
	Type        string                     `json:"type"`                  // "SWING_STORE_EXPORT"
	Request     string                     `json:"request"`               // "initiate"
	BlockHeight uint64                     `json:"blockHeight,omitempty"` // empty if no blockHeight requested (latest)
	Args        [1]SwingStoreExportOptions `json:"args"`
}

// retrieveRequest is the request type for retrieving an initiated export
const retrieveRequest = "retrieve"

type swingStoreRetrieveExportAction struct {
	Type    string `json:"type"`    // "SWING_STORE_EXPORT"
	Request string `json:"request"` // "retrieve"
}
type swingStoreRetrieveResult = string

// discardRequest is the request type for discarding an initiated but an export
// that was not retrieved
const discardRequest = "discard"

type swingStoreDiscardExportAction struct {
	Type    string `json:"type"`    // "SWING_STORE_EXPORT"
	Request string `json:"request"` // "discard"
}

// restoreRequest is the request type for restoring an export
const restoreRequest = "restore"

type swingStoreRestoreExportAction struct {
	Type        string                     `json:"type"`                  // "SWING_STORE_EXPORT"
	Request     string                     `json:"request"`               // "restore"
	BlockHeight uint64                     `json:"blockHeight,omitempty"` // empty if deferring blockHeight to the manifest
	Args        [1]swingStoreImportOptions `json:"args"`
}

const (
	// SwingStoreArtifactModeNone means that no artifacts are part of the
	// export / import.
	SwingStoreArtifactModeNone = "none"

	// SwingStoreArtifactModeOperational represents the minimal set of artifacts
	// needed to operate a node.
	SwingStoreArtifactModeOperational = "operational"

	// SwingStoreArtifactModeReplay represents the set of artifacts needed to
	// replay the current incarnation of every vat.
	SwingStoreArtifactModeReplay = "replay"

	// SwingStoreArtifactModeArchival represents the set of all artifacts
	// providing all available historical state.
	SwingStoreArtifactModeArchival = "archival"

	// SwingStoreArtifactModeDebug represents the maximal set of artifacts
	// available in the JS swing-store, including any kept around for debugging
	// purposes only (like previous XS heap snapshots)
	SwingStoreArtifactModeDebug = "debug"
)

const (
	// SwingStoreExportDataModeSkip indicates "export data" should be excluded from
	// an export. ArtifactMode cannot be "none" in this case.
	SwingStoreExportDataModeSkip = "skip"

	// SwingStoreExportDataModeRepairMetadata indicates the "export data" should be
	// used to repair the metadata of an existing swing-store for an import
	// operation. ArtifactMode must be "none" in this case.
	SwingStoreExportDataModeRepairMetadata = "repair-metadata"

	// SwingStoreExportDataModeAll indicates "export data" should be part of the
	// export or import. For import, ArtifactMode cannot be "none".
	SwingStoreExportDataModeAll = "all"
)

// SwingStoreExportOptions are configurable options provided to the JS swing-store export
type SwingStoreExportOptions struct {
	// ArtifactMode controls the set of artifacts that should be included in the
	// swing-store export. Any SwingStoreArtifactMode* const value can be used
	// (None, Operational, Replay, Archival, Debug).
	// See packages/cosmic-swingset/src/export-kernel-db.js initiateSwingStoreExport
	ArtifactMode string `json:"artifactMode,omitempty"`
	// ExportDataMode selects whether to include "export data" in the swing-store
	// export or not. Use the value SwingStoreExportDataModeSkip or
	// SwingStoreExportDataModeAll. If "skip", the reader returned by
	// SwingStoreExportProvider's GetExportDataReader will be nil.
	ExportDataMode string `json:"exportDataMode,omitempty"`
}

// SwingStoreRestoreOptions are configurable options provided to the JS swing-store import
type SwingStoreRestoreOptions struct {
	// ArtifactMode controls the set of artifacts that should be restored in
	// swing-store. Any SwingStoreArtifactMode* const value can be used
	// (None, Operational, Replay, Archival, Debug).
	// See packages/cosmic-swingset/src/import-kernel-db.js performStateSyncImport
	ArtifactMode string `json:"artifactMode,omitempty"`
	// ExportDataMode selects the purpose of the restore, to recreate a
	// swing-store (SwingStoreExportDataModeAll), or just to import missing
	// metadata (SwingStoreExportDataModeRepairMetadata).
	// If RepairMetadata, ArtifactMode should be SwingStoreArtifactModeNone.
	// If All, ArtifactMode must be at least SwingStoreArtifactModeOperational.
	ExportDataMode string `json:"exportDataMode,omitempty"`
}

type swingStoreImportOptions struct {
	// ExportDir is the directory created by RestoreExport that JS swing-store
	// should import from.
	ExportDir string `json:"exportDir"`
	// ArtifactMode is a copy of SwingStoreRestoreOptions.ArtifactMode
	ArtifactMode string `json:"artifactMode,omitempty"`
	// ExportDataMode is a copy of SwingStoreRestoreOptions.ExportDataMode
	ExportDataMode string `json:"exportDataMode,omitempty"`
}

var disallowedArtifactNameChar = regexp.MustCompile(`[^-_.a-zA-Z0-9]`)

// sanitizeArtifactName searches a string for all characters
// other than ASCII alphanumerics, hyphens, underscores, and dots,
// and replaces each of them with a hyphen.
func sanitizeArtifactName(name string) string {
	return disallowedArtifactNameChar.ReplaceAllString(name, "-")
}

type operationDetails struct {
	// isRestore indicates whether the operation in progress is a restore.
	// It is assigned at creation and never mutated.
	isRestore bool
	// blockHeight is the block height of this in-progress operation.
	// It is assigned at creation and never mutated.
	blockHeight uint64
	// logger is the destination for this operation's log messages.
	// It is assigned at creation and never mutated.
	logger log.Logger
	// exportStartedResult is used to synchronize the commit boundary by the
	// component performing the export operation to ensure export determinism.
	// unused for restore operations
	// It is assigned at creation and never mutated. The started goroutine
	// writes into the channel and closes it. The main goroutine reads from the
	// channel.
	exportStartedResult chan error
	// exportRetrieved is an internal flag indicating whether the JS generated
	// export was retrieved. It can be false regardless of the component's
	// eventHandler reporting an error or not. It is only indicative of whether
	// the component called retrieveExport, and used to control whether to send
	// a discard request if the JS side stayed responsible for the generated but
	// un-retrieved export.
	// It is only read or written by the export operation's goroutine.
	exportRetrieved bool
	// exportDone is a channel that is closed when the active export operation
	// is complete.
	// It is assigned at creation and never mutated. The started goroutine
	// writes into the channel and closes it. The main goroutine reads from the
	// channel.
	exportDone chan error
}

// activeOperation is a global variable reflecting a swing-store import or
// export in progress on the JS side.
// This variable is only assigned to through calls of the public methods of
// SwingStoreExportsHandler, which rely on the exportDone channel getting
// closed to nil this variable.
// Only the calls to InitiateExport and RestoreExport set this to a non-nil
// value. The goroutine in which these calls occur is referred to as the
// "main goroutine". That goroutine may be different over time, but it's the
// caller's responsibility to ensure those goroutines do not overlap calls to
// the SwingStoreExportsHandler public methods.
// See also the details of each field for the conditions under which they are
// accessed.
var activeOperation *operationDetails

// WaitUntilSwingStoreExportStarted synchronizes with an export operation in
// progress, if any.
// The JS swing-store export must have started before a new block is committed
// to ensure the content of the export is the one expected. The app must call
// this method before sending a commit action to the JS controller.
//
// Waits for a just initiated export operation to have started in its goroutine.
// If no operation is in progress (InitiateExport hasn't been called or
// already completed), or if we previously checked if the operation had started,
// returns immediately.
//
// Must be called by the main goroutine
func WaitUntilSwingStoreExportStarted() error {
	operationDetails := activeOperation
	if operationDetails == nil {
		return nil
	}
	// Block until the active operation has started, saving the result.
	// The operation's goroutine only produces a value in case of an error,
	// and closes the channel once the export has started or failed.
	// Only the first call after an export was initiated will report an error.
	startErr := <-operationDetails.exportStartedResult

	// Check if the active export operation is done, and if so, nil it out so
	// future calls are faster.
	select {
	case <-operationDetails.exportDone:
		// If there was a start error, the channel is already closed at this point.
		activeOperation = nil
	default:
		// don't wait for it to finish
		// If there is no start error, the operation may take an arbitrary amount
		// of time to terminate, likely spanning multiple blocks. However this
		// function will only ever observe the expected activeOperation since the
		// internal checkNotActive() called immediately on InitiateSnapshot will
		// nil-out activeOperation if a stale value was sill sitting around.
	}

	return startErr
}

// WaitUntilSwingStoreExportDone synchronizes with the completion of an export
// operation in progress, if any.
// Only a single swing-store operation may execute at a time. Calling
// InitiateExport or RestoreExport will fail if a swing-store operation is
// already in progress. Furthermore, a component may need to know once an
// export it initiated has completed. Once this method call returns, the
// goroutine is guaranteed to have terminated, and the SwingStoreExportEventHandler
// provided to InitiateExport to no longer be in use.
//
// Reports any error that may have occurred from InitiateExport.
// If no export operation is in progress (InitiateExport hasn't been called or
// already completed), or if we previously checked if an export had completed,
// returns immediately.
//
// Must be called by the main goroutine
func WaitUntilSwingStoreExportDone() error {
	operationDetails := activeOperation
	if operationDetails == nil {
		return nil
	}
	// Block until the active export has completed.
	// The export operation's goroutine only produces a value in case of an error,
	// and closes the channel once the export has completed or failed.
	// Only the first call after an export was initiated will report an error.
	exportErr := <-operationDetails.exportDone
	activeOperation = nil

	return exportErr
}

// checkNotActive returns an error if there is an active operation.
//
// Always internally called by the main goroutine
func checkNotActive() error {
	operationDetails := activeOperation
	if operationDetails != nil {
		select {
		case <-operationDetails.exportDone:
			// nil-out any stale operation
			activeOperation = nil
		default:
			if operationDetails.isRestore {
				return fmt.Errorf("restore operation already in progress for height %d", operationDetails.blockHeight)
			} else {
				return fmt.Errorf("export operation already in progress for height %d", operationDetails.blockHeight)
			}
		}
	}
	return nil
}

// SwingStoreExportProvider gives access to a SwingStore "export data" and the
// related artifacts.
// A JS swing-store export is composed of optional "export data" (a set of
// key/value pairs), and opaque artifacts (a name and data as bytes) that
// complement the "export data".
// The abstraction is similar to the JS side swing-store export abstraction,
// but without the ability to list artifacts or random access them.
//
// A swing-store export for creating a state-sync snapshot will not contain any
// "export data" since this information is reflected every block into the
// verified cosmos DB.
// On state-sync snapshot restore, the swingset ExtensionSnapshotter will
// synthesize a provider for this module with "export data" sourced from the
// restored cosmos DB, and artifacts from the extension's payloads. When
// importing, the JS swing-store will verify that the artifacts match hashes
// contained in the trusted "export data".
type SwingStoreExportProvider struct {
	// BlockHeight is the block height of the SwingStore export.
	BlockHeight uint64
	// GetExportDataReader returns a KVEntryReader for the "export data" of the
	// SwingStore export, or nil if the "export data" is not part of this export.
	GetExportDataReader func() (agoric.KVEntryReader, error)
	// ReadNextArtifact is a function to return the next unread artifact in the SwingStore export.
	// It errors with io.EOF upon reaching the end of the list of available artifacts.
	ReadNextArtifact func() (types.SwingStoreArtifact, error)
}

// SwingStoreExportEventHandler is used to handle events that occur while generating
// a swing-store export. It is provided to SwingStoreExportsHandler.InitiateExport.
type SwingStoreExportEventHandler interface {
	// OnExportStarted is called by InitiateExport in a goroutine after the
	// swing-store export has successfully started.
	// This is where the component performing the export must initiate its own
	// off main goroutine work, which results in retrieving and processing the
	// swing-store export.
	//
	// Must call the retrieveExport function before returning, which will in turn
	// synchronously invoke OnExportRetrieved once the swing-store export is ready.
	OnExportStarted(blockHeight uint64, retrieveExport func() error) error
	// OnExportRetrieved is called when the swing-store export has been retrieved,
	// during the retrieveExport invocation.
	// The provider is not a return value to retrieveExport in order to
	// report errors in components that are unable to propagate errors back to the
	// OnExportStarted result, like cosmos state-sync ExtensionSnapshotter.
	// The implementation must synchronously consume the provider, which becomes
	// invalid after the method returns.
	OnExportRetrieved(provider SwingStoreExportProvider) error
}

// SwingStoreExportsHandler exclusively manages the communication with the JS side
// related to swing-store exports, ensuring insensitivity to sub-block timing,
// and enforcing concurrency requirements.
// The caller of this submodule must arrange block level commit synchronization,
// to ensure the results are deterministic.
//
// Some blockingSend calls performed by this submodule are non-deterministic.
// This submodule will send messages to JS from goroutines at unpredictable
// times, but this is safe because when handling the messages, the JS side
// does not perform operations affecting consensus and ignores state changes
// since committing the previous block.
// Some other blockingSend calls however do change the JS swing-store and
// must happen before the Swingset controller on the JS side was inited, in
// which case the mustNotBeInited parameter will be set to true.
type SwingStoreExportsHandler struct {
	logger       log.Logger
	blockingSend func(action vm.Jsonable, mustNotBeInited bool) (string, error)
}

// NewSwingStoreExportsHandler creates a SwingStoreExportsHandler
func NewSwingStoreExportsHandler(logger log.Logger, blockingSend func(action vm.Jsonable, mustNotBeInited bool) (string, error)) *SwingStoreExportsHandler {
	return &SwingStoreExportsHandler{
		logger:       logger.With("module", fmt.Sprintf("x/%s", types.ModuleName), "submodule", "SwingStoreExportsHandler"),
		blockingSend: blockingSend,
	}
}

// InitiateExport synchronously verifies that there is not already an export or
// import operation in progress and initiates a new export in a goroutine,
// via a dedicated SWING_STORE_EXPORT blockingSend action independent of other
// block related blockingSends, calling the given eventHandler when a related
// blockingSend completes. If the eventHandler doesn't retrieve the export,
// then it sends another blockingSend action to discard it.
//
// eventHandler is invoked solely from the spawned goroutine.
// The "started" and "done" events can be used for synchronization with an
// active operation taking place in the goroutine, by calling respectively the
// WaitUntilSwingStoreExportStarted and WaitUntilSwingStoreExportDone methods
// from the goroutine that initiated the export.
//
// Must be called by the main goroutine
func (exportsHandler SwingStoreExportsHandler) InitiateExport(blockHeight uint64, eventHandler SwingStoreExportEventHandler, exportOptions SwingStoreExportOptions) error {
	err := checkNotActive()
	if err != nil {
		return err
	}

	var logger log.Logger
	if blockHeight != 0 {
		logger = exportsHandler.logger.With("height", blockHeight)
	} else {
		logger = exportsHandler.logger.With("height", "latest")
	}

	// Indicate that an export operation has been initiated by setting the global
	// activeOperation var.
	// This structure is used to synchronize with the goroutine spawned below.
	operationDetails := &operationDetails{
		blockHeight:         blockHeight,
		logger:              logger,
		exportStartedResult: make(chan error, 1),
		exportRetrieved:     false,
		exportDone:          make(chan error, 1),
	}
	activeOperation = operationDetails

	go func() {
		var err error
		var startedErr error
		defer func() {
			if err == nil {
				err = startedErr
			}
			if err != nil {
				operationDetails.exportDone <- err
			}
			// First, indicate an export is no longer in progress. This ensures that
			// for an operation with a start error, a call to WaitUntilSwingStoreExportStarted
			// waiting on exportStartedResult will always find the operation has
			// completed, and clear the active operation instead of racing if the
			// channel close order was reversed.
			close(operationDetails.exportDone)
			// Then signal the current export operation that it failed to start,
			// which will be reported to a waiting WaitUntilSwingStoreExportStarted,
			// or the next call otherwise.
			if startedErr != nil {
				operationDetails.exportStartedResult <- startedErr
				close(operationDetails.exportStartedResult)
			}
		}()

		initiateAction := &swingStoreInitiateExportAction{
			Type:        swingStoreExportActionType,
			BlockHeight: blockHeight,
			Request:     initiateRequest,
			Args:        [1]SwingStoreExportOptions{exportOptions},
		}

		// blockingSend for SWING_STORE_EXPORT action is safe to call from a goroutine
		_, startedErr = exportsHandler.blockingSend(initiateAction, false)

		if startedErr != nil {
			logger.Error("failed to initiate swing-store export", "err", startedErr)
			// The deferred function will communicate the error and close channels
			// in the appropriate order.
			return
		}

		// Signal that the export operation has started successfully in the goroutine.
		// Calls to WaitUntilSwingStoreExportStarted will no longer block.
		close(operationDetails.exportStartedResult)

		// The user provided OnExportStarted function should call retrieveExport()
		var retrieveErr error
		err = eventHandler.OnExportStarted(blockHeight, func() error {
			activeOperationDetails := activeOperation
			if activeOperationDetails != operationDetails || operationDetails.exportRetrieved {
				// shouldn't happen, but return an error if it does
				return errors.New("export operation no longer active")
			}

			retrieveErr = exportsHandler.retrieveExport(eventHandler.OnExportRetrieved)

			return retrieveErr
		})

		// Restore any retrieve error swallowed by OnExportStarted
		if err == nil {
			err = retrieveErr
		}
		if err != nil {
			logger.Error("failed to process swing-store export", "err", err)
		}

		// Check whether the JS generated export was retrieved by eventHandler
		if operationDetails.exportRetrieved {
			return
		}

		// Discarding the export so invalidate retrieveExport
		operationDetails.exportRetrieved = true

		discardAction := &swingStoreDiscardExportAction{
			Type:    swingStoreExportActionType,
			Request: discardRequest,
		}
		_, discardErr := exportsHandler.blockingSend(discardAction, false)

		if discardErr != nil {
			logger.Error("failed to discard swing-store export", "err", err)
		}

		if err == nil {
			err = discardErr
		} else if discardErr != nil {
			// Safe to wrap error and use detailed error info since this error
			// will not go back into swingset layers
			err = sdkioerrors.Wrapf(err, "failed to discard swing-store export after failing to process export: %+v", discardErr)
		}
	}()

	return nil
}

// retrieveExport retrieves an initiated export then invokes onExportRetrieved
// with the retrieved export.
//
// It performs a SWING_STORE_EXPORT blockingSend which on success returns a
// string of the directory containing the JS swing-store export. It then reads
// the export manifest generated by the JS side, and synthesizes a
// SwingStoreExportProvider for the onExportRetrieved callback to access the
// retrieved swing-store export.
// The export manifest format is described by the exportManifest struct.
//
// After calling onExportRetrieved, the export directory and its contents are
// deleted.
//
// This will block until the export is ready. Internally invoked by the
// InitiateExport logic in the export operation's goroutine.
func (exportsHandler SwingStoreExportsHandler) retrieveExport(onExportRetrieved func(provider SwingStoreExportProvider) error) (err error) {
	operationDetails := activeOperation
	if operationDetails == nil {
		// shouldn't happen, but return an error if it does
		return errors.New("no active swing-store export operation")
	}

	blockHeight := operationDetails.blockHeight

	action := &swingStoreRetrieveExportAction{
		Type:    swingStoreExportActionType,
		Request: retrieveRequest,
	}
	out, err := exportsHandler.blockingSend(action, false)

	if err != nil {
		return err
	}
	operationDetails.exportRetrieved = true

	var exportDir swingStoreRetrieveResult
	err = json.Unmarshal([]byte(out), &exportDir)
	if err != nil {
		return err
	}

	defer os.RemoveAll(exportDir)

	provider, err := OpenSwingStoreExportDirectory(exportDir)
	if err != nil {
		return err
	}

	if blockHeight != 0 && provider.BlockHeight != blockHeight {
		return fmt.Errorf("export manifest blockHeight (%d) doesn't match (%d)", provider.BlockHeight, blockHeight)
	}

	err = onExportRetrieved(provider)
	if err != nil {
		return err
	}

	operationDetails.logger.Info("retrieved swing-store export", "exportDir", exportDir)

	return nil
}

// OpenSwingStoreExportDirectory creates an export provider from a swing-store
// export saved on disk in the provided directory. It expects the export manifest
// to be present in that directory. The provider's function will read the
// export's data and artifacts from disk on demand. Each artifact is using a
// dedicated file, and the export data is read from a jsonl-like file, if any.
// The export manifest filename and overall export format is common with the JS
// swing-store import/export logic.
func OpenSwingStoreExportDirectory(exportDir string) (SwingStoreExportProvider, error) {
	rawManifest, err := os.ReadFile(filepath.Join(exportDir, ExportManifestFilename))
	if err != nil {
		return SwingStoreExportProvider{}, err
	}

	var manifest exportManifest
	err = json.Unmarshal(rawManifest, &manifest)
	if err != nil {
		return SwingStoreExportProvider{}, err
	}

	getExportDataReader := func() (agoric.KVEntryReader, error) {
		if manifest.Data == "" {
			return nil, nil
		}

		dataFile, err := os.Open(filepath.Join(exportDir, manifest.Data))
		if err != nil {
			return nil, err
		}
		exportDataReader := agoric.NewJsonlKVEntryDecoderReader(dataFile)
		return exportDataReader, nil
	}

	nextArtifact := 0

	readNextArtifact := func() (artifact types.SwingStoreArtifact, err error) {
		if nextArtifact == len(manifest.Artifacts) {
			return artifact, io.EOF
		} else if nextArtifact > len(manifest.Artifacts) {
			return artifact, fmt.Errorf("exceeded expected artifact count: %d > %d", nextArtifact, len(manifest.Artifacts))
		}

		artifactEntry := manifest.Artifacts[nextArtifact]
		nextArtifact++

		artifactName := artifactEntry[0]
		fileName := artifactEntry[1]
		if artifactName == UntrustedExportDataArtifactName {
			return artifact, fmt.Errorf("unexpected export artifact name %s", artifactName)
		}
		artifact.Name = artifactName
		artifact.Data, err = os.ReadFile(filepath.Join(exportDir, fileName))

		return artifact, err
	}

	return SwingStoreExportProvider{BlockHeight: manifest.BlockHeight, GetExportDataReader: getExportDataReader, ReadNextArtifact: readNextArtifact}, nil
}

// RestoreExport restores the JS swing-store using previously exported data and artifacts.
//
// Must be called by the main goroutine
func (exportsHandler SwingStoreExportsHandler) RestoreExport(provider SwingStoreExportProvider, restoreOptions SwingStoreRestoreOptions) error {
	err := checkNotActive()
	if err != nil {
		return err
	}

	blockHeight := provider.BlockHeight

	// We technically don't need to create an active operation here since both
	// InitiateExport and RestoreExport should only be called from the main
	// goroutine, but it doesn't cost much to add in case things go wrong.
	operationDetails := &operationDetails{
		isRestore:   true,
		blockHeight: blockHeight,
		logger:      exportsHandler.logger,
		// goroutine synchronization is unnecessary since anything checking should
		// be called from the same goroutine.
		// Effectively WaitUntilSwingStoreExportStarted would block infinitely and
		// exportsHandler.InitiateExport will error when calling checkNotActive.
		exportStartedResult: nil,
		exportDone:          nil,
	}
	activeOperation = operationDetails
	defer func() {
		activeOperation = nil
	}()

	exportDir, err := os.MkdirTemp("", fmt.Sprintf("agd-swing-store-restore-%d-*", blockHeight))
	if err != nil {
		return err
	}
	defer os.RemoveAll(exportDir)

	exportsHandler.logger.Info("creating swing-store restore", "exportDir", exportDir, "height", blockHeight)

	err = WriteSwingStoreExportToDirectory(provider, exportDir)
	if err != nil {
		return err
	}

	exportsHandler.logger.Info("restoring swing-store", "exportDir", exportDir, "height", blockHeight)

	action := &swingStoreRestoreExportAction{
		Type:        swingStoreExportActionType,
		BlockHeight: blockHeight,
		Request:     restoreRequest,
		Args: [1]swingStoreImportOptions{{
			ExportDir:      exportDir,
			ArtifactMode:   restoreOptions.ArtifactMode,
			ExportDataMode: restoreOptions.ExportDataMode,
		}},
	}

	_, err = exportsHandler.blockingSend(action, true)
	if err != nil {
		return err
	}

	exportsHandler.logger.Info("restored swing-store", "exportDir", exportDir, "height", blockHeight)

	return nil
}

// WriteSwingStoreExportToDirectory consumes a provider and saves a swing-store
// export to disk in the provided directory. It creates files for each artifact
// deriving a filename from the artifact name, and stores any "export data" in
// a jsonl-like file, before saving the export manifest linking these together.
// The export manifest filename and overall export format is common with the JS
// swing-store import/export logic.
func WriteSwingStoreExportToDirectory(provider SwingStoreExportProvider, exportDir string) (err error) {
	handleDeferError := func(fn func() error) {
		deferError := fn()
		if err == nil {
			err = deferError
		} else if deferError != nil {
			// Safe to wrap error and use detailed error info since this error
			// will not go back into swingset layers
			err = sdkioerrors.Wrapf(err, "deferred error %+v", deferError)
		}
	}

	manifest := exportManifest{
		BlockHeight: provider.BlockHeight,
	}

	exportDataReader, err := provider.GetExportDataReader()
	if err != nil {
		return err
	}

	if exportDataReader != nil {
		defer handleDeferError(exportDataReader.Close)

		manifest.Data = exportDataFilename
		exportDataFile, err := os.OpenFile(filepath.Join(exportDir, exportDataFilename), os.O_CREATE|os.O_WRONLY, exportedFilesMode)
		if err != nil {
			return err
		}
		defer handleDeferError(exportDataFile.Close)

		err = agoric.EncodeKVEntryReaderToJsonl(exportDataReader, exportDataFile)
		if err != nil {
			return err
		}

		err = exportDataFile.Sync()
		if err != nil {
			return err
		}
	}

	writeExportFile := func(filename string, data []byte) error {
		return os.WriteFile(filepath.Join(exportDir, filename), data, exportedFilesMode)
	}

	for {
		artifact, err := provider.ReadNextArtifact()
		if err == io.EOF {
			break
		} else if err != nil {
			return err
		}

		if artifact.Name != UntrustedExportDataArtifactName {
			// An artifact is only verifiable by the JS swing-store import using the
			// information contained in the "export data".
			// Since we cannot trust the source of the artifact at this point,
			// including that the artifact's name is genuine, we generate a safe and
			// unique filename from the artifact's name we received, by substituting
			// any non letters-digits-hyphen-underscore-dot by a hyphen, and
			// prefixing with an incremented id.
			// The filename is not used for any purpose in the import logic.
			filename := sanitizeArtifactName(artifact.Name)
			filename = fmt.Sprintf("%d-%s", len(manifest.Artifacts), filename)
			manifest.Artifacts = append(manifest.Artifacts, [2]string{artifact.Name, filename})
			err = writeExportFile(filename, artifact.Data)
		} else {
			// Pseudo artifact containing untrusted export data which may have been
			// saved separately for debugging purposes (not referenced from the manifest)
			err = writeExportFile(untrustedExportDataFilename, artifact.Data)
		}
		if err != nil {
			return err
		}
	}

	manifestBytes, err := json.MarshalIndent(manifest, "", "  ")
	if err != nil {
		return err
	}
	return writeExportFile(ExportManifestFilename, manifestBytes)
}
