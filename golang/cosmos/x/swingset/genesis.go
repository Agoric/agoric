package swingset

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"hash"
	"io"
	"strings"

	"cosmossdk.io/core/store"

	agoric "github.com/Agoric/agoric-sdk/golang/cosmos/types"
	"github.com/Agoric/agoric-sdk/golang/cosmos/x/swingset/keeper"
	"github.com/Agoric/agoric-sdk/golang/cosmos/x/swingset/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

const (
	// SwingStoreExportModeSkip indicates swing store data should be
	// excluded from the export.
	SwingStoreExportModeSkip = "skip"

	// SwingStoreExportModeOperational (default) indicates export should
	// have the minimal set of artifacts needed to operate a node.
	SwingStoreExportModeOperational = "operational"

	// SwingStoreExportModeDebug indicates export should have the maximal
	// set of artifacts available in the JS swing-store.
	SwingStoreExportModeDebug = "debug"
)

func ValidateGenesis(data *types.GenesisState) error {
	if data == nil {
		return fmt.Errorf("swingset genesis data cannot be nil")
	}
	if err := data.Params.ValidateBasic(); err != nil {
		return err
	}
	return nil
}

func DefaultGenesisState() *types.GenesisState {
	return &types.GenesisState{
		Params:               types.DefaultParams(),
		State:                types.State{},
		SwingStoreExportData: []*types.SwingStoreExportDataEntry{},
	}
}

// InitGenesis initializes the (Cosmos-side) SwingSet state from the GenesisState.
// Returns whether the app should send a bootstrap action to the controller.
func InitGenesis(ctx sdk.Context, k Keeper, swingStoreExportsHandler *SwingStoreExportsHandler, swingStoreExportDir string, data *types.GenesisState) bool {
	k.SetParams(ctx, data.GetParams())
	k.SetState(ctx, data.GetState())

	swingStoreExportData := data.GetSwingStoreExportData()
	if len(swingStoreExportData) == 0 && data.SwingStoreExportDataHash == "" {
		return true
	} else if data.SwingStoreExportDataHash != "" && len(swingStoreExportData) > 0 {
		panic("Swingset genesis state cannot have both export data and hash of export data")
	}

	artifactProvider, err := keeper.OpenSwingStoreExportDirectory(swingStoreExportDir)
	if err != nil {
		panic(err)
	}

	swingStore := k.GetSwingStore(ctx)

	snapshotHeight := uint64(ctx.BlockHeight())

	var getExportDataReader func() (agoric.KVEntryReader, error)

	if len(swingStoreExportData) > 0 {
		for _, entry := range swingStoreExportData {
			swingStore.Set([]byte(entry.Key), []byte(entry.Value))
		}
		getExportDataReader = func() (agoric.KVEntryReader, error) {
			// exportDataIterator, err := swingStore.Iterator(nil, nil)
			panic(fmt.Errorf("failed to iterate over swing-store export data: %s", err))
			// return agoric.NewKVIteratorReader(exportDataIterator), nil
		}
	} else {
		hashParts := strings.SplitN(data.SwingStoreExportDataHash, ":", 2)
		if len(hashParts) != 2 {
			panic(fmt.Errorf("invalid swing-store export data hash %s", data.SwingStoreExportDataHash))
		}
		if hashParts[0] != "sha256" {
			panic(fmt.Errorf("invalid swing-store export data hash algorithm %s, expected sha256", hashParts[0]))
		}
		sha256Hash, err := hex.DecodeString(hashParts[1])
		if err != nil {
			panic(err)
		}
		getExportDataReader = func() (agoric.KVEntryReader, error) {
			kvReader, err := artifactProvider.GetExportDataReader()
			if err != nil {
				return nil, err
			}

			if kvReader == nil {
				return nil, fmt.Errorf("swing-store export has no export data")
			}

			hasher := sha256.New()
			encoder := json.NewEncoder(hasher)
			encoder.SetEscapeHTML(false)

			return agoric.NewKVHookingReader(kvReader, func(entry agoric.KVEntry) error {
				key := []byte(entry.Key())

				if !entry.HasValue() {
					swingStore.Delete(key)
				} else {
					swingStore.Set(key, []byte(entry.StringValue()))
				}

				return encoder.Encode(entry)
			}, func() error {
				sum := hasher.Sum(nil)
				if !bytes.Equal(sum, sha256Hash) {
					return fmt.Errorf("swing-store data sha256sum didn't match. expected %x, got %x", sha256Hash, sum)
				}
				return nil
			}), nil
		}
	}

	err = swingStoreExportsHandler.RestoreExport(
		keeper.SwingStoreExportProvider{
			BlockHeight:         snapshotHeight,
			GetExportDataReader: getExportDataReader,
			ReadNextArtifact:    artifactProvider.ReadNextArtifact,
		},
		keeper.SwingStoreRestoreOptions{
			ArtifactMode:   keeper.SwingStoreArtifactModeOperational,
			ExportDataMode: keeper.SwingStoreExportDataModeAll,
		},
	)
	if err != nil {
		panic(err)
	}

	return false
}

func ExportGenesis(
	ctx sdk.Context,
	k Keeper,
	swingStoreExportsHandler *SwingStoreExportsHandler,
	swingStoreExportDir string,
	swingStoreExportMode string,
) *types.GenesisState {
	state, _ := k.GetState(ctx)

	gs := &types.GenesisState{
		Params:               k.GetParams(ctx),
		State:                state,
		SwingStoreExportData: nil,
	}

	// This will only be used in non skip mode
	artifactMode := swingStoreExportMode
	exportDataMode := keeper.SwingStoreExportDataModeSkip
	hasher := sha256.New()
	snapshotHeight := uint64(ctx.BlockHeight())

	if swingStoreExportMode == SwingStoreExportModeDebug {
		exportDataMode = keeper.SwingStoreExportDataModeAll
		snapshotHeight = 0
	}

	if swingStoreExportMode != SwingStoreExportModeSkip {
		eventHandler := swingStoreGenesisEventHandler{
			exportDir:      swingStoreExportDir,
			snapshotHeight: snapshotHeight,
			swingStore:     k.GetSwingStore(ctx),
			hasher:         hasher,
			exportMode:     swingStoreExportMode,
		}

		err := swingStoreExportsHandler.InitiateExport(
			// The export will fail if the export of a historical height was requested outside of debug mode
			snapshotHeight,
			eventHandler,
			keeper.SwingStoreExportOptions{
				ArtifactMode:   artifactMode,
				ExportDataMode: exportDataMode,
			},
		)
		if err != nil {
			panic(err)
		}

		err = keeper.WaitUntilSwingStoreExportDone()
		if err != nil {
			panic(err)
		}
	}

	gs.SwingStoreExportDataHash = fmt.Sprintf("sha256:%x", hasher.Sum(nil))

	return gs
}

type swingStoreGenesisEventHandler struct {
	exportDir      string
	snapshotHeight uint64
	swingStore     store.KVStore
	hasher         hash.Hash
	exportMode     string
}

func (eventHandler swingStoreGenesisEventHandler) OnExportStarted(height uint64, retrieveSwingStoreExport func() error) error {
	return retrieveSwingStoreExport()
}

func (eventHandler swingStoreGenesisEventHandler) OnExportRetrieved(provider keeper.SwingStoreExportProvider) error {
	if eventHandler.exportMode != SwingStoreExportModeDebug && eventHandler.snapshotHeight != provider.BlockHeight {
		return fmt.Errorf("snapshot block height (%d) doesn't match requested height (%d)", provider.BlockHeight, eventHandler.snapshotHeight)
	}

	artifactsEnded := false

	artifactsProvider := keeper.SwingStoreExportProvider{
		GetExportDataReader: func() (agoric.KVEntryReader, error) {
			exportDataIterator, err := eventHandler.swingStore.Iterator(nil, nil)
			if err != nil {
				return nil, err
			}
			kvReader := agoric.NewKVIteratorReader(exportDataIterator)
			eventHandler.hasher.Reset()
			encoder := json.NewEncoder(eventHandler.hasher)
			encoder.SetEscapeHTML(false)

			return agoric.NewKVHookingReader(kvReader, func(entry agoric.KVEntry) error {
				return encoder.Encode(entry)
			}, func() error {
				return nil
			}), nil
		},
		ReadNextArtifact: func() (types.SwingStoreArtifact, error) {
			var (
				artifact          types.SwingStoreArtifact
				err               error
				encodedExportData bytes.Buffer
			)

			if !artifactsEnded {
				artifact, err = provider.ReadNextArtifact()
			} else {
				return types.SwingStoreArtifact{}, io.EOF
			}

			if err == io.EOF {
				artifactsEnded = true
				if eventHandler.exportMode == SwingStoreExportModeDebug {
					exportDataReader, _ := provider.GetExportDataReader()

					defer exportDataReader.Close()

					err = agoric.EncodeKVEntryReaderToJsonl(
						exportDataReader,
						&encodedExportData,
					)
					if err == nil {
						artifact = types.SwingStoreArtifact{
							Data: encodedExportData.Bytes(),
							Name: keeper.UntrustedExportDataArtifactName,
						}
					}
				}
			}

			return artifact, err
		},
	}

	if eventHandler.exportMode == SwingStoreExportModeDebug {
		artifactsProvider.BlockHeight = provider.BlockHeight
	}

	return keeper.WriteSwingStoreExportToDirectory(artifactsProvider, eventHandler.exportDir)
}
