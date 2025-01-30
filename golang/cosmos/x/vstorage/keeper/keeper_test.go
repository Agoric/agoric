package keeper

import (
	"reflect"
	"testing"

	"github.com/cosmos/cosmos-sdk/runtime"

	"strings"

	"cosmossdk.io/log"
	"cosmossdk.io/store"
	storemetrics "cosmossdk.io/store/metrics"
	storetypes "cosmossdk.io/store/types"
	agoric "github.com/Agoric/agoric-sdk/golang/cosmos/types"
	vstoragetypes "github.com/Agoric/agoric-sdk/golang/cosmos/x/vstorage/types"
	tmproto "github.com/cometbft/cometbft/proto/tendermint/types"
	dbm "github.com/cosmos/cosmos-db"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/stretchr/testify/require"
)

var (
	vstorageStoreKey = storetypes.NewKVStoreKey(vstoragetypes.StoreKey)
)

type testKit struct {
	ctx            sdk.Context
	vstorageKeeper Keeper
}

func makeTestKit() testKit {
	keeper := NewKeeper(runtime.NewKVStoreService(vstorageStoreKey), vstorageStoreKey.String())

	db := dbm.NewMemDB()
	logger := log.NewNopLogger()
	ms := store.NewCommitMultiStore(db, logger, storemetrics.NewNoOpMetrics())
	ms.MountStoreWithDB(vstorageStoreKey, storetypes.StoreTypeIAVL, db)
	err := ms.LoadLatestVersion()
	if err != nil {
		panic(err)
	}
	ctx := sdk.NewContext(ms, tmproto.Header{}, false, log.NewNopLogger())

	return testKit{ctx, keeper}
}

func childrenEqual(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

func TestStorage(t *testing.T) {
	testKit := makeTestKit()
	ctx, keeper := testKit.ctx, testKit.vstorageKeeper

	// Test that we can store and retrieve a value.
	keeper.SetStorage(ctx, agoric.NewKVEntry("inited", "initValue"))
	gotEntry, err := keeper.GetEntry(ctx, "inited")
	if err != nil {
		t.Fatal(err)
	}
	if got := gotEntry.StringValue(); got != "initValue" {
		t.Errorf("got %q, want %q", got, "initValue")
	}

	// Test that unknown children return empty string.
	gotEntry, err = keeper.GetEntry(ctx, "unknown")
	if err != nil {
		t.Fatal(err)
	}
	if got := gotEntry; got.HasValue() || got.StringValue() != "" {
		t.Errorf("got %q, want no value", got.StringValue())
	}

	// Test that we can store and retrieve an empty string value.
	err = keeper.SetStorage(ctx, agoric.NewKVEntry("inited", ""))
	if err != nil {
		t.Fatal(err)
	}
	gotEntry, err = keeper.GetEntry(ctx, "inited")
	if err != nil {
		t.Fatal(err)
	}
	if got := gotEntry; !got.HasValue() || got.StringValue() != "" {
		t.Errorf("got %q, want empty string", got.StringValue())
	}

	// Check that our children are updated as expected.
	gotChildren, err := keeper.GetChildren(ctx, "")
	if err != nil {
		t.Fatal(err)
	}
	if got := gotChildren; !childrenEqual(got.Children, []string{"inited"}) {
		t.Errorf("got %q children, want [inited]", got.Children)
	}

	err = keeper.SetStorage(ctx, agoric.NewKVEntry("key1", "value1"))
	if err != nil {
		t.Fatal(err)
	}
	gotChildren, err = keeper.GetChildren(ctx, "")
	if err != nil {
		t.Fatal(err)
	}
	if got := gotChildren; !childrenEqual(got.Children, []string{"inited", "key1"}) {
		t.Errorf("got %q children, want [inited,key1]", got.Children)
	}

	// Check alphabetical.
	err = keeper.SetStorage(ctx, agoric.NewKVEntry("alpha2", "value2"))
	if err != nil {
		t.Fatal(err)
	}
	gotChildren, err = keeper.GetChildren(ctx, "")
	if err != nil {
		t.Fatal(err)
	}
	if got := gotChildren; !childrenEqual(got.Children, []string{"alpha2", "inited", "key1"}) {
		t.Errorf("got %q children, want [alpha2,inited,key1]", got.Children)
	}

	err = keeper.SetStorage(ctx, agoric.NewKVEntry("beta3", "value3"))
	if err != nil {
		t.Fatal(err)
	}
	gotChildren, err = keeper.GetChildren(ctx, "")
	if err != nil {
		t.Fatal(err)
	}
	if got := gotChildren; !childrenEqual(got.Children, []string{"alpha2", "beta3", "inited", "key1"}) {
		t.Errorf("got %q children, want [alpha2,beta3,inited,key1]", got.Children)
	}

	gotChildren, err = keeper.GetChildren(ctx, "nonexistent")
	if err != nil {
		t.Fatal(err)
	}
	if got := gotChildren; !childrenEqual(got.Children, []string{}) {
		t.Errorf("got %q children, want []", got.Children)
	}

	// Check adding children.
	err = keeper.SetStorage(ctx, agoric.NewKVEntry("key1.child1", "value1child"))
	if err != nil {
		t.Fatal(err)
	}

	entryKey1Child1, err := keeper.GetEntry(ctx, "key1.child1")
	if got := entryKey1Child1.StringValue(); got != "value1child" {
		t.Errorf("got %q, want %q", got, "value1child")
	}

	gotChildren, err = keeper.GetChildren(ctx, "key1")
	if err != nil {
		t.Fatal(err)
	}
	if got := gotChildren; !childrenEqual(got.Children, []string{"child1"}) {
		t.Errorf("got %q children, want [child1]", got.Children)
	}

	// Add a grandchild.
	err = keeper.SetStorage(ctx, agoric.NewKVEntry("key1.child1.grandchild1", "value1grandchild"))
	if err != nil {
		t.Fatal(err)
	}
	gotEntryKey1, err := keeper.GetEntry(ctx, "key1.child1.grandchild1")
	if got := gotEntryKey1.StringValue(); got != "value1grandchild" {
		t.Errorf("got %q, want %q", got, "value1grandchild")
	}

	gotChildren, err = keeper.GetChildren(ctx, "key1.child1")
	if got := gotChildren; !childrenEqual(got.Children, []string{"grandchild1"}) {
		t.Errorf("got %q children, want [grandchild1]", got.Children)
	}

	// Delete the child's contents.
	err = keeper.SetStorage(ctx, agoric.NewKVEntryWithNoValue("key1.child1"))
	if err != nil {
		t.Fatal(err)
	}

	gotChildren, err = keeper.GetChildren(ctx, "key1")
	if err != nil {
		t.Fatal(err)
	}
	if got := gotChildren; !childrenEqual(got.Children, []string{"child1"}) {
		t.Errorf("got %q children, want [child1]", got.Children)
	}

	gotChildren, err = keeper.GetChildren(ctx, "key1.child1")
	if got := gotChildren; !childrenEqual(got.Children, []string{"grandchild1"}) {
		t.Errorf("got %q children, want [grandchild1]", got.Children)
	}

	// Delete the grandchild's contents.
	err = keeper.SetStorage(ctx, agoric.NewKVEntryWithNoValue("key1.child1.grandchild1"))
	if err != nil {
		t.Fatal(err)
	}

	gotChildren, err = keeper.GetChildren(ctx, "key1.child1")
	if err != nil {
		t.Fatal(err)
	}
	if got := gotChildren; !childrenEqual(got.Children, []string{}) {
		t.Errorf("got %q children, want []", got.Children)
	}
	// Removing that node rolls up into the parent.
	gotChildren, err = keeper.GetChildren(ctx, "key1")
	if err != nil {
		t.Fatal(err)
	}
	if got := gotChildren; !childrenEqual(got.Children, []string{}) {
		t.Errorf("got %q children, want []", got.Children)
	}

	// See about deleting the parent.
	err = keeper.SetStorage(ctx, agoric.NewKVEntryWithNoValue("key1"))
	if err != nil {
		t.Fatal(err)
	}

	gotChildren, err = keeper.GetChildren(ctx, "")
	if err != nil {
		t.Fatal(err)
	}
	if got := gotChildren; !childrenEqual(got.Children, []string{"alpha2", "beta3", "inited"}) {
		t.Errorf("got %q children, want [alpha2,beta3,inited]", got.Children)
	}

	// Do a deep set.
	err = keeper.SetStorage(ctx, agoric.NewKVEntry("key2.child2.grandchild2", "value2grandchild"))
	if err != nil {
		t.Fatal(err)
	}
	gotChildren, err = keeper.GetChildren(ctx, "")
	if err != nil {
		t.Fatal(err)
	}
	if got := gotChildren; !childrenEqual(got.Children, []string{"alpha2", "beta3", "inited", "key2"}) {
		t.Errorf("got %q children, want [alpha2,beta3,inited,key2]", got.Children)
	}

	gotChildren, err = keeper.GetChildren(ctx, "key2.child2")
	if err != nil {
		t.Fatal(err)
	}
	if got := gotChildren; !childrenEqual(got.Children, []string{"grandchild2"}) {
		t.Errorf("got %q children, want [grandchild2]", got.Children)
	}

	gotChildren, err = keeper.GetChildren(ctx, "key2")
	if got := gotChildren; !childrenEqual(got.Children, []string{"child2"}) {
		t.Errorf("got %q children, want [child2]", got.Children)
	}

	// Do another deep set.
	err = keeper.SetStorage(ctx, agoric.NewKVEntry("key2.child2.grandchild2a", "value2grandchilda"))
	if err != nil {
		t.Fatal(err)
	}

	gotChildren, err = keeper.GetChildren(ctx, "key2.child2")
	if err != nil {
		t.Fatal(err)
	}
	if got := gotChildren; !childrenEqual(got.Children, []string{"grandchild2", "grandchild2a"}) {
		t.Errorf("got %q children, want [grandchild2,grandchild2a]", got.Children)
	}

	// Check the export.
	expectedExport := []*vstoragetypes.DataEntry{
		{Path: "alpha2", Value: "value2"},
		{Path: "beta3", Value: "value3"},
		{Path: "inited", Value: ""},
		{Path: "key2.child2.grandchild2", Value: "value2grandchild"},
		{Path: "key2.child2.grandchild2a", Value: "value2grandchilda"},
	}
	gotExport := keeper.ExportStorage(ctx)
	if !reflect.DeepEqual(gotExport, expectedExport) {
		t.Errorf("got export %q, want %q", gotExport, expectedExport)
	}

	// Check the export.
	expectedKey2Export := []*vstoragetypes.DataEntry{
		{Path: "child2.grandchild2", Value: "value2grandchild"},
		{Path: "child2.grandchild2a", Value: "value2grandchilda"},
	}
	if got := keeper.ExportStorageFromPrefix(ctx, "key2"); !reflect.DeepEqual(got, expectedKey2Export) {
		t.Errorf("got export %q, want %q", got, expectedKey2Export)
	}

	keeper.RemoveEntriesWithPrefix(ctx, "key2.child2")
	hasEntry, err := keeper.HasEntry(ctx, "key2")
	if err != nil {
		t.Fatal(err)
	}
	if hasEntry {
		t.Errorf("got leftover entries for key2 after removal")
	}
	expectedRemainingExport := []*vstoragetypes.DataEntry{
		{Path: "alpha2", Value: "value2"},
		{Path: "beta3", Value: "value3"},
		{Path: "inited", Value: ""},
	}
	gotRemainingExport := keeper.ExportStorage(ctx)
	if !reflect.DeepEqual(gotRemainingExport, expectedRemainingExport) {
		t.Errorf("got remaining export %q, want %q", expectedRemainingExport, expectedRemainingExport)
	}

	keeper.ImportStorage(ctx, gotExport)
	gotExport = keeper.ExportStorage(ctx)
	if !reflect.DeepEqual(gotExport, expectedExport) {
		t.Errorf("got export %q after import, want %q", gotExport, expectedExport)
	}
}

func TestStorageNotify(t *testing.T) {
	tk := makeTestKit()
	ctx, keeper := tk.ctx, tk.vstorageKeeper

	keeper.SetStorageAndNotify(ctx, agoric.NewKVEntry("notify.noLegacy", "noLegacyValue"))
	keeper.LegacySetStorageAndNotify(ctx, agoric.NewKVEntry("notify.legacy", "legacyValue"))
	keeper.SetStorageAndNotify(ctx, agoric.NewKVEntry("notify.noLegacy2", "noLegacyValue2"))
	keeper.SetStorageAndNotify(ctx, agoric.NewKVEntry("notify.legacy2", "legacyValue2"))
	keeper.LegacySetStorageAndNotify(ctx, agoric.NewKVEntry("notify.legacy2", "legacyValue2b"))
	keeper.SetStorageAndNotify(ctx, agoric.NewKVEntry("notify.noLegacy2", "noLegacyValue2b"))

	// Check the batched events
	require.Empty(t, ctx.EventManager().Events(), "expected no events before flush")

	keeper.FlushChangeEvents(ctx)
	events := ctx.EventManager().Events()

	// Check number of events
	require.Equal(t, 6, len(events), "wrong number of events")

	// Check each event type and its attributes
	for _, event := range events {
		switch event.Type {
		case "storage":
			require.Equal(t, 2, len(event.Attributes))
			require.Equal(t, "path", event.Attributes[0].Key)
			require.Equal(t, "value", event.Attributes[1].Key)

		case "state_change":
			require.Equal(t, 4, len(event.Attributes))
			require.Equal(t, "store", event.Attributes[0].Key)
			require.True(t, strings.Contains(event.Attributes[0].Value, "vstorage"),
				"store value should contain 'vstorage', got %s", event.Attributes[0].Value)
			require.Equal(t, "key", event.Attributes[1].Key)
			require.Equal(t, "anckey", event.Attributes[2].Key)
			require.Equal(t, "value", event.Attributes[3].Key)
		}
	}

	// Check second flush doesn't change events
	keeper.FlushChangeEvents(ctx)
	newEvents := ctx.EventManager().Events()
	require.Equal(t, len(events), len(newEvents), "number of events changed after second flush")
}
