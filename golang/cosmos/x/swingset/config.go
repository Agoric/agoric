package swingset

import (
	"fmt"
	"path/filepath"

	"github.com/spf13/viper"

	pruningtypes "cosmossdk.io/store/pruning/types"
	"github.com/cosmos/cosmos-sdk/client/flags"
	serverconfig "github.com/cosmos/cosmos-sdk/server/config"
	servertypes "github.com/cosmos/cosmos-sdk/server/types"

	"github.com/Agoric/agoric-sdk/golang/cosmos/util"
)

const (
	ConfigPrefix                = "swingset"
	FlagSlogfile                = ConfigPrefix + ".slogfile"
	FlagVatSnapshotArchiveDir   = ConfigPrefix + ".vat-snapshot-archive-dir"
	FlagVatTranscriptArchiveDir = ConfigPrefix + ".vat-transcript-archive-dir"

	SnapshotRetentionOptionDebug       = "debug"
	SnapshotRetentionOptionOperational = "operational"

	TranscriptRetentionOptionArchival    = "archival"
	TranscriptRetentionOptionOperational = "operational"
)

var snapshotRetentionValues []string = []string{
	SnapshotRetentionOptionDebug,
	SnapshotRetentionOptionOperational,
}

var transcriptRetentionValues []string = []string{
	TranscriptRetentionOptionArchival,
	TranscriptRetentionOptionOperational,
}

// DefaultConfigTemplate defines a default TOML configuration section for the SwingSet VM.
// Values are pulled from a "Swingset" property, in accord with CustomAppConfig from
// ../../daemon/cmd/root.go.
// See https://github.com/cosmos/cosmos-sdk/issues/20097 for auto-synchronization ideas.
const DefaultConfigTemplate = `
###############################################################################
###                         SwingSet Configuration                          ###
###############################################################################

[swingset]
# The path at which a SwingSet log "slog" file should be written.
# If relative, it is interpreted against the application home directory
# (e.g., ~/.agoric).
# May be overridden by a SLOGFILE environment variable, which if relative is
# interpreted against the working directory.
slogfile = "{{ .Swingset.SlogFile }}"

# The maximum number of vats that the SwingSet kernel will bring online. A lower number
# requires less memory but may have a negative performance impact if vats need to
# be frequently paged out to remain under this limit.
max-vats-online = {{ .Swingset.MaxVatsOnline }}

# Retention of vat snapshots, with values analogous to those of export
# 'artifactMode' (cf.
# https://github.com/Agoric/agoric-sdk/blob/master/packages/swing-store/docs/data-export.md#optional--historical-data ).
# * "debug": keep all snapshots
# * "operational": keep only the last snapshot
vat-snapshot-retention = "{{ .Swingset.VatSnapshotRetention }}"

# Retention of vat transcript spans, with values analogous to those of export
# 'artifactMode' (cf.
# https://github.com/Agoric/agoric-sdk/blob/master/packages/swing-store/docs/data-export.md#optional--historical-data ).
# * "archival": keep all transcript spans
# * "operational": keep only necessary transcript spans (i.e., since the
#   last snapshot of their vat)
# * "default": determined by 'pruning' ("archival" if 'pruning' is "nothing",
#   otherwise "operational")
vat-transcript-retention = "{{ .Swingset.VatTranscriptRetention }}"

# Archival of gzipped vat snapshots.
vat-snapshot-archive-dir = "{{ .Swingset.VatSnapshotArchiveDir }}"

# Archival of historical (i.e., closed) vat transcript spans to gzipped files.
vat-transcript-archive-dir = "{{ .Swingset.VatTranscriptArchiveDir }}"
`

// SwingsetConfig defines configuration for the SwingSet VM.
// "mapstructure" tag data is used to direct reads from app.toml;
// "json" tag data is used to populate init messages for the VM.
// This should be kept in sync with SwingsetConfigShape in
// ../../../../packages/cosmic-swingset/src/chain-main.js.
// TODO: Consider extensions from docs/env.md.
type SwingsetConfig struct {
	// SlogFile is the path at which a SwingSet log "slog" file should be written.
	// If relative, it is interpreted against the application home directory
	SlogFile string `mapstructure:"slogfile" json:"slogfile,omitempty"`

	// MaxVatsOnline is the maximum number of vats that the SwingSet kernel will have online
	// at any given time.
	MaxVatsOnline int `mapstructure:"max-vats-online" json:"maxVatsOnline,omitempty"`

	// VatSnapshotRetention controls retention of vat snapshots,
	// and has values analogous to those of export `artifactMode` (cf.
	// ../../../../packages/swing-store/docs/data-export.md#optional--historical-data ).
	// * "debug": keep all snapshots
	// * "operational": keep only the last snapshot
	VatSnapshotRetention string `mapstructure:"vat-snapshot-retention" json:"vatSnapshotRetention,omitempty"`

	// VatTranscriptRetention controls retention of vat transcript spans,
	// and has values analogous to those of export `artifactMode` (cf.
	// ../../../../packages/swing-store/docs/data-export.md#optional--historical-data ).
	// * "archival": keep all transcript spans
	// * "operational": keep only necessary transcript spans (i.e., since the
	//   last snapshot of their vat)
	// * "default": determined by `pruning` ("archival" if `pruning` is
	//   "nothing", otherwise "operational")
	VatTranscriptRetention string `mapstructure:"vat-transcript-retention" json:"vatTranscriptRetention,omitempty"`

	// VatSnapshotArchiveDir controls archival of gzipped vat snapshots.
	VatSnapshotArchiveDir string `mapstructure:"vat-snapshot-archive-dir" json:"vatSnapshotArchiveDir,omitempty"`

	// VatTranscriptArchiveDir controls archival of historical (i.e., closed) vat
	// transcript spans to gzipped files.
	VatTranscriptArchiveDir string `mapstructure:"vat-transcript-archive-dir" json:"vatTranscriptArchiveDir,omitempty"`
}

var DefaultSwingsetConfig = SwingsetConfig{
	SlogFile:               "",
	MaxVatsOnline:          50,
	VatSnapshotRetention:   "operational",
	VatTranscriptRetention: "default",
}

func SwingsetConfigFromViper(resolvedConfig servertypes.AppOptions) (*SwingsetConfig, error) {
	v, ok := resolvedConfig.(*viper.Viper)
	if !ok {
		// Tolerate an apparently empty configuration such as
		// cosmos/cosmos-sdk/simapp EmptyAppOptions, but otherwise require viper.
		if resolvedConfig.Get(flags.FlagHome) != nil {
			return nil, fmt.Errorf("expected an instance of viper!")
		}
	}
	if v == nil {
		return nil, nil
	}
	v.MustBindEnv(FlagSlogfile, "SLOGFILE")
	// See CustomAppConfig in ../../daemon/cmd/root.go.
	type ExtendedConfig struct {
		serverconfig.Config `mapstructure:",squash"`
		Swingset            SwingsetConfig `mapstructure:"swingset"`
	}
	extendedConfig := ExtendedConfig{}
	if err := v.Unmarshal(&extendedConfig); err != nil {
		return nil, err
	}
	ssConfig := &extendedConfig.Swingset

	// Validate vat snapshot retention only if non-empty (because otherwise it
	// it will be omitted, leaving the VM to apply its own defaults).
	if ssConfig.VatSnapshotRetention != "" {
		if util.IndexOf(snapshotRetentionValues, ssConfig.VatSnapshotRetention) == -1 {
			err := fmt.Errorf(
				"value for vat-snapshot-retention must be in %q",
				snapshotRetentionValues,
			)
			return nil, err
		}
	}

	// Default/validate vat transcript retention.
	if ssConfig.VatTranscriptRetention == "" || ssConfig.VatTranscriptRetention == "default" {
		if extendedConfig.Pruning == pruningtypes.PruningOptionNothing {
			ssConfig.VatTranscriptRetention = TranscriptRetentionOptionArchival
		} else {
			ssConfig.VatTranscriptRetention = TranscriptRetentionOptionOperational
		}
	}
	if util.IndexOf(transcriptRetentionValues, ssConfig.VatTranscriptRetention) == -1 {
		valuesCopy := append([]string{}, transcriptRetentionValues...)
		err := fmt.Errorf(
			"value for vat-transcript-retention must be in %q",
			append(valuesCopy, "default"),
		)
		return nil, err
	}

	// Interpret relative paths from config files against the application home
	// directory and from other sources (e.g. env vars) against the current
	// working directory.
	var fileOnlyViper *viper.Viper
	resolvePath := func(path, configKey string) (string, error) {
		if path == "" || filepath.IsAbs(path) {
			return path, nil
		}
		if v.InConfig(configKey) {
			if fileOnlyViper == nil {
				var err error
				fileOnlyViper, err = util.NewFileOnlyViper(v)
				if err != nil {
					return "", err
				}
			}
			pathFromFile := fileOnlyViper.GetString(configKey)
			if path == pathFromFile {
				homePath := viper.GetString(flags.FlagHome)
				if homePath == "" {
					return "", fmt.Errorf("cannot resolve path against empty application home")
				}
				absHomePath, err := filepath.Abs(homePath)
				return filepath.Join(absHomePath, path), err
			}
		}
		return filepath.Abs(path)
	}

	resolvedSlogFile, err := resolvePath(ssConfig.SlogFile, FlagSlogfile)
	if err != nil {
		return nil, err
	}
	ssConfig.SlogFile = resolvedSlogFile

	resolvedSnapshotDir, err := resolvePath(ssConfig.VatSnapshotArchiveDir, FlagVatSnapshotArchiveDir)
	if err != nil {
		return nil, err
	}
	ssConfig.VatSnapshotArchiveDir = resolvedSnapshotDir

	resolvedTranscriptDir, err := resolvePath(ssConfig.VatTranscriptArchiveDir, FlagVatTranscriptArchiveDir)
	if err != nil {
		return nil, err
	}
	ssConfig.VatTranscriptArchiveDir = resolvedTranscriptDir

	return ssConfig, nil
}
