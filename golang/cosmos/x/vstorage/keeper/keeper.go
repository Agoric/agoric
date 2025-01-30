package keeper

import (
	"bytes"
	"cosmossdk.io/core/store"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"sort"
	"strconv"
	"strings"

	sdkmath "cosmossdk.io/math"
	storetypes "cosmossdk.io/store/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
	db "github.com/tendermint/tm-db"

	agoric "github.com/Agoric/agoric-sdk/golang/cosmos/types"
	"github.com/Agoric/agoric-sdk/golang/cosmos/x/vstorage/types"
)

// StreamCell is an envelope representing a sequence of values written at a path in a single block.
// It is persisted to storage as a { "blockHeight": "<digits>", "values": ["...", ...] } JSON text
// that off-chain consumers rely upon.
// Many of those consumers *also* rely upon the strings of "values" being valid JSON text,
// but we do not enforce that in this package.
type StreamCell struct {
	BlockHeight string   `json:"blockHeight"`
	Values      []string `json:"values"`
}

type ProposedChange struct {
	Path               string
	ValueFromLastBlock string
	NewValue           string
	LegacyEvents       bool
}

type ChangeManager interface {
	Track(ctx sdk.Context, k Keeper, entry agoric.KVEntry, isLegacy bool) error
	EmitEvents(ctx sdk.Context, k Keeper)
	Rollback(ctx sdk.Context)
}

type BatchingChangeManager struct {
	// Map from storage path to proposed change.
	changes map[string]*ProposedChange
}

var _ ChangeManager = (*BatchingChangeManager)(nil)

// 2 ** 256 - 1
var MaxSDKInt = sdkmath.NewIntFromBigInt(new(big.Int).Sub(new(big.Int).Exp(big.NewInt(2), big.NewInt(256), nil), big.NewInt(1)))

// Keeper maintains the link to data storage and exposes getter/setter methods
// for the various parts of the state machine
type Keeper struct {
	storeKey      string
	changeManager ChangeManager
	storeService  store.KVStoreService
}

func (bcm *BatchingChangeManager) Track(ctx sdk.Context, k Keeper, entry agoric.KVEntry, isLegacy bool) error {
	path := entry.Key()
	// TODO: differentiate between deletion and setting empty string?
	// Using empty string for deletion for backwards compatibility
	value := entry.StringValue()
	if change, ok := bcm.changes[path]; ok {
		change.NewValue = value
		if isLegacy {
			change.LegacyEvents = true
		}
		return nil
	}
	entry, err := k.GetEntry(ctx, path)
	if err != nil {
		return err
	}
	bcm.changes[path] = &ProposedChange{
		Path:               path,
		NewValue:           value,
		ValueFromLastBlock: entry.StringValue(),
		LegacyEvents:       isLegacy,
	}
	return nil
}

func (bcm *BatchingChangeManager) Rollback(ctx sdk.Context) {
	bcm.changes = make(map[string]*ProposedChange)
}

// EmitEvents emits events for all actual changes.
// This does not clear the cache, so the caller must call Rollback() to do so.
func (bcm *BatchingChangeManager) EmitEvents(ctx sdk.Context, k Keeper) {
	changes := bcm.changes
	if len(changes) == 0 {
		return
	}

	// Deterministic order.
	sortedPaths := make([]string, 0, len(changes))
	for path := range changes {
		sortedPaths = append(sortedPaths, path)
	}
	sort.Strings(sortedPaths)

	for _, path := range sortedPaths {
		change := bcm.changes[path]
		k.EmitChange(ctx, change)
	}
}

// The BatchingChangeManager needs to be a pointer because its state is mutated.
func NewBatchingChangeManager() *BatchingChangeManager {
	bcm := BatchingChangeManager{changes: make(map[string]*ProposedChange)}
	return &bcm
}

func NewKeeper(storeService store.KVStoreService, storeKey string) Keeper {
	return Keeper{
		storeKey:      storeKey,
		storeService:  storeService,
		changeManager: NewBatchingChangeManager(),
	}
}

// ExportStorage fetches all storage
func (k Keeper) ExportStorage(ctx sdk.Context) []*types.DataEntry {
	return k.ExportStorageFromPrefix(ctx, "")
}

// ExportStorageFromPrefix fetches storage only under the supplied pathPrefix.
func (k Keeper) ExportStorageFromPrefix(ctx sdk.Context, pathPrefix string) []*types.DataEntry {
	s := k.storeService.OpenKVStore(ctx)

	if len(pathPrefix) > 0 {
		if err := types.ValidatePath(pathPrefix); err != nil {
			panic(err)
		}
		pathPrefix = pathPrefix + types.PathSeparator
	}

	// since vstorage encodes keys with a prefix indicating the number of path
	// elements, exporting all entries under a given path cannot use a prefix
	// iterator. Instead we iterate over the whole vstorage content and check
	// whether each entry matches the path prefix. This choice assumes most
	// entries will be exported. An alternative implementation would be to
	// recursively list all children under the pathPrefix, and export them.

	iterator, _ := s.Iterator(nil, nil)
	var exported []*types.DataEntry
	defer iterator.Close()
	for ; iterator.Valid(); iterator.Next() {
		rawValue := iterator.Value()
		if len(rawValue) == 0 {
			continue
		}
		if bytes.Equal(rawValue, types.EncodedNoDataValue) {
			continue
		}
		path := types.EncodedKeyToPath(iterator.Key())
		if !strings.HasPrefix(path, pathPrefix) {
			continue
		}
		value, hasPrefix := bytes.CutPrefix(rawValue, types.EncodedDataPrefix)
		if !hasPrefix {
			panic(fmt.Errorf("value at path %q starts with unexpected prefix", path))
		}
		path = path[len(pathPrefix):]
		entry := types.DataEntry{Path: path, Value: string(value)}
		exported = append(exported, &entry)
	}
	return exported
}

func (k Keeper) ImportStorage(ctx sdk.Context, entries []*types.DataEntry) {
	for _, entry := range entries {
		// This set does the bookkeeping for us in case the entries aren't a
		// complete tree.
		k.SetStorage(ctx, agoric.NewKVEntry(entry.Path, entry.Value))
	}
}

func getEncodedKeysWithPrefixFromIterator(iterator storetypes.Iterator, prefix string) [][]byte {
	keys := make([][]byte, 0)
	defer iterator.Close()
	for ; iterator.Valid(); iterator.Next() {
		key := iterator.Key()
		path := types.EncodedKeyToPath(key)
		if strings.HasPrefix(path, prefix) {
			keys = append(keys, key)
		}
	}
	return keys
}

// RemoveEntriesWithPrefix removes all storage entries starting with the
// supplied pathPrefix, which may not be empty.
// It has the same effect as listing children of the prefix and removing each
// descendant recursively.
func (k Keeper) RemoveEntriesWithPrefix(ctx sdk.Context, pathPrefix string) error {
	//store := ctx.KVStore(k.storeService)
	s := k.storeService.OpenKVStore(ctx)

	if len(pathPrefix) == 0 {
		panic("cannot remove all content")
	}
	if err := types.ValidatePath(pathPrefix); err != nil {
		panic(err)
	}
	descendantPrefix := pathPrefix + types.PathSeparator

	// since vstorage encodes keys with a prefix indicating the number of path
	// elements, we cannot use a simple prefix iterator.
	// Instead we iterate over the whole vstorage content and check
	// whether each entry matches the descendantPrefix. This choice assumes most
	// entries will be deleted. An alternative implementation would be to
	// recursively list all children under the descendantPrefix, and delete them.

	//iterator := storetypes.KVStorePrefixIterator(store, nil)
	iterator, _ := s.Iterator(nil, nil)

	keys := getEncodedKeysWithPrefixFromIterator(iterator, descendantPrefix)

	for _, key := range keys {
		err := s.Delete(key)
		if err != nil {
			return err
		}
	}

	// Update the prefix entry itself with SetStorage, which will effectively
	// delete it and all necessary ancestors.
	k.SetStorage(ctx, agoric.NewKVEntryWithNoValue(pathPrefix))
	return nil
}

func (k Keeper) EmitChange(ctx sdk.Context, change *ProposedChange) {
	if change.NewValue == change.ValueFromLastBlock {
		// No change.
		return
	}

	if change.LegacyEvents {
		// Emit the legacy change event.
		ctx.EventManager().EmitEvent(
			types.NewLegacyStorageEvent(change.Path, change.NewValue),
		)
	}

	// Emit the new state change event.
	ctx.EventManager().EmitEvent(
		agoric.NewStateChangeEvent(
			k.GetStoreName(),
			k.PathToEncodedKey(change.Path),
			[]byte(change.NewValue),
		),
	)
}

// GetEntry gets generic storage.  The default value is an empty string.
func (k Keeper) GetEntry(ctx sdk.Context, path string) (agoric.KVEntry, error) {
	s := k.storeService.OpenKVStore(ctx)
	encodedKey := types.PathToEncodedKey(path)
	rawValue, err := s.Get(encodedKey)
	if err != nil {
		return agoric.KVEntry{}, err
	}
	if len(rawValue) == 0 {
		return agoric.NewKVEntryWithNoValue(path), nil
	}
	if bytes.Equal(rawValue, types.EncodedNoDataValue) {
		return agoric.NewKVEntryWithNoValue(path), nil
	}
	value, hasPrefix := bytes.CutPrefix(rawValue, types.EncodedDataPrefix)
	if !hasPrefix {
		panic(fmt.Errorf("value at path %q starts with unexpected prefix", path))
	}
	return agoric.NewKVEntry(path, string(value)), nil
}

func (k Keeper) getKeyIterator(ctx sdk.Context, path string) (db.Iterator, error) {
	s := k.storeService.OpenKVStore(ctx)
	keyPrefix := types.PathToChildrenPrefix(path)

	iterator, err := s.Iterator(keyPrefix, storetypes.PrefixEndBytes(keyPrefix))
	if err != nil {
		return nil, err
	}
	return iterator, nil
}

// GetChildren gets all vstorage child children at a given path
func (k Keeper) GetChildren(ctx sdk.Context, path string) (*types.Children, error) {
	iterator, err := k.getKeyIterator(ctx, path)
	if err != nil {
		return nil, err
	}

	var children types.Children
	children.Children = []string{}
	defer iterator.Close()
	for ; iterator.Valid(); iterator.Next() {
		parts := strings.Split(types.EncodedKeyToPath(iterator.Key()), types.PathSeparator)
		childrentr := parts[len(parts)-1]
		children.Children = append(children.Children, childrentr)
	}
	return &children, nil
}

// HasStorage tells if a given path has data.  Some storage nodes have no data
// (just an empty string) and exist only to provide linkage to subnodes with
// data.
func (k Keeper) HasStorage(ctx sdk.Context, path string) (bool, error) {
	value, err := k.GetEntry(ctx, path)
	if err != nil {
		return false, err
	}
	return value.HasValue(), nil
}

// HasEntry tells if a given path has either subnodes or data.
func (k Keeper) HasEntry(ctx sdk.Context, path string) (bool, error) {
	s := k.storeService.OpenKVStore(ctx)
	encodedKey := types.PathToEncodedKey(path)

	// Check if we have a path entry.
	has, err := s.Has(encodedKey)
	if err != nil {
		return false, err
	}
	return has, nil
}

// HasChildren tells if a given path has child children.
func (k Keeper) HasChildren(ctx sdk.Context, path string) (bool, error) {
	// Check if we have children.
	iterator, err := k.getKeyIterator(ctx, path)
	if err != nil {
		return false, err
	}
	defer iterator.Close()
	return iterator.Valid(), nil
}

func (k Keeper) NewChangeBatch(ctx sdk.Context) {
	k.changeManager.Rollback(ctx)
}

func (k Keeper) FlushChangeEvents(ctx sdk.Context) {
	k.changeManager.EmitEvents(ctx, k)
	k.changeManager.Rollback(ctx)
}

func (k Keeper) SetStorageAndNotify(ctx sdk.Context, entry agoric.KVEntry) {
	k.changeManager.Track(ctx, k, entry, false)
	k.SetStorage(ctx, entry)
}

func (k Keeper) LegacySetStorageAndNotify(ctx sdk.Context, entry agoric.KVEntry) {
	k.changeManager.Track(ctx, k, entry, true)
	k.SetStorage(ctx, entry)
}

func (k Keeper) AppendStorageValueAndNotify(ctx sdk.Context, path, value string) error {
	blockHeight := strconv.FormatInt(ctx.BlockHeight(), 10)

	// Preserve correctly-formatted data within the current block,
	// otherwise initialize a blank cell.
	currentDataByte, err := k.GetEntry(ctx, path)
	if err != nil {
		return err
	}
	currentData := currentDataByte.StringValue()
	var cell StreamCell
	_ = json.Unmarshal([]byte(currentData), &cell)
	if cell.BlockHeight != blockHeight {
		cell = StreamCell{BlockHeight: blockHeight, Values: make([]string, 0, 1)}
	}

	// Append the new value.
	cell.Values = append(cell.Values, value)

	// Perform the write.
	bz, err := json.Marshal(cell)
	if err != nil {
		return err
	}
	k.SetStorageAndNotify(ctx, agoric.NewKVEntry(path, string(bz)))
	return nil
}

func componentsToPath(components []string) string {
	return strings.Join(components, types.PathSeparator)
}

// SetStorage sets the data value for a path.
//
// Maintains the invariant: path entries exist if and only if self or some
// descendant has non-empty storage
func (k Keeper) SetStorage(ctx sdk.Context, entry agoric.KVEntry) error {
	s := k.storeService.OpenKVStore(ctx)
	path := entry.Key()
	encodedKey := types.PathToEncodedKey(path)

	var err error
	if !entry.HasValue() {
		hasChildren, err := k.HasChildren(ctx, path)
		if err != nil {
			return err
		}
		if !hasChildren {
			// We have no children, can delete.
			err = s.Delete(encodedKey)
		} else {
			err = s.Set(encodedKey, types.EncodedNoDataValue)
		}
	} else {
		// Update the value.
		bz := bytes.Join([][]byte{types.EncodedDataPrefix, []byte(entry.StringValue())}, []byte{})
		err = s.Set(encodedKey, bz)
	}
	if err != nil {
		return err
	}

	// Update our other parent children.
	pathComponents := strings.Split(path, types.PathSeparator)
	if !entry.HasValue() {
		// delete placeholder ancestors if they're no longer needed
		for i := len(pathComponents) - 1; i >= 0; i-- {
			ancestor := componentsToPath(pathComponents[0:i])
			hasStorage, err := k.HasStorage(ctx, ancestor)
			if err != nil {
				return err
			}
			hasChildren, err := k.HasChildren(ctx, ancestor)
			if err != nil {
				return err
			}
			if hasStorage || hasChildren {
				// this and further ancestors are needed, skip out
				break
			}
			err = s.Delete(types.PathToEncodedKey(ancestor))
			if err != nil {
				return err
			}
		}
	} else {
		// add placeholders as needed
		for i := len(pathComponents) - 1; i >= 0; i-- {
			ancestor := componentsToPath(pathComponents[0:i])
			hasEntry, err := k.HasEntry(ctx, ancestor)
			if err != nil {
				return err
			}
			if hasEntry {
				// The ancestor exists, implying all further ancestors exist, so we can break.
				break
			}
			err = s.Set(types.PathToEncodedKey(ancestor), types.EncodedNoDataValue)
			if err != nil {
				return err
			}
		}
	}
	return nil
}

func (k Keeper) PathToEncodedKey(path string) []byte {
	return types.PathToEncodedKey(path)
}

func (k Keeper) GetStoreName() string {
	return k.storeKey
}

func (k Keeper) GetDataPrefix() []byte {
	return types.EncodedDataPrefix
}

func (k Keeper) GetNoDataValue() []byte {
	return types.EncodedNoDataValue
}

func (k Keeper) GetIntValue(ctx sdk.Context, path string) (sdkmath.Int, error) {
	indexEntry, err := k.GetEntry(ctx, path)
	if err != nil {
		return sdkmath.NewInt(0), err
	}
	if !indexEntry.HasValue() {
		return sdkmath.NewInt(0), nil
	}

	index, ok := sdkmath.NewIntFromString(indexEntry.StringValue())
	if !ok {
		return index, fmt.Errorf("couldn't parse %s as Int: %s", path, indexEntry.StringValue())
	}
	return index, nil
}

func (k Keeper) GetQueueLength(ctx sdk.Context, queuePath string) (sdkmath.Int, error) {
	head, err := k.GetIntValue(ctx, queuePath+".head")
	if err != nil {
		return sdkmath.NewInt(0), err
	}
	tail, err := k.GetIntValue(ctx, queuePath+".tail")
	if err != nil {
		return sdkmath.NewInt(0), err
	}
	// The tail index is exclusive
	return tail.Sub(head), nil
}

func (k Keeper) PushQueueItem(ctx sdk.Context, queuePath string, value string) error {
	// Get the current queue tail, defaulting to zero if its vstorage doesn't exist.
	// The `tail` is the value of the next index to be inserted
	tail, err := k.GetIntValue(ctx, queuePath+".tail")
	if err != nil {
		return err
	}

	if tail.GTE(MaxSDKInt) {
		return errors.New(queuePath + " overflow")
	}
	nextTail := tail.Add(sdkmath.NewInt(1))

	// Set the vstorage corresponding to the queue entry for the current tail.
	path := queuePath + "." + tail.String()
	k.SetStorage(ctx, agoric.NewKVEntry(path, value))

	// Update the tail to point to the next available entry.
	path = queuePath + ".tail"
	k.SetStorage(ctx, agoric.NewKVEntry(path, nextTail.String()))
	return nil
}
