package types

const (
	// module name
	ModuleName = "swingset"

	// StoreKey to be used when creating the KVStore
	StoreKey = ModuleName
)

var (
	DataKeyPrefix = []byte(ModuleName + "/data")
	PathKeyPrefix = []byte(ModuleName + "/path")
)
