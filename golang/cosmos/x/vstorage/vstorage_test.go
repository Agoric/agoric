package vstorage

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/cosmos/cosmos-sdk/runtime"
	"reflect"
	"strings"
	"testing"

	storemetrics "cosmossdk.io/store/metrics"

	"github.com/Agoric/agoric-sdk/golang/cosmos/x/vstorage/types"

	"cosmossdk.io/store"
	storetypes "cosmossdk.io/store/types"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"cosmossdk.io/log"
	agorictypes "github.com/Agoric/agoric-sdk/golang/cosmos/types"
	tmproto "github.com/cometbft/cometbft/proto/tendermint/types"
	dbm "github.com/cosmos/cosmos-db"
)

var (
	storeKey = storetypes.NewKVStoreKey(types.StoreKey)
)

func ptr[T any](v T) *T {
	return &v
}

type testKit struct {
	keeper  Keeper
	handler vstorageHandler
	ctx     sdk.Context
	cctx    context.Context
}

func makeTestKit() testKit {
	keeper := NewKeeper(runtime.NewKVStoreService(storeKey), storeKey.String())
	db := dbm.NewMemDB()
	logger := log.NewNopLogger()
	ms := store.NewCommitMultiStore(db, logger, storemetrics.NewNoOpMetrics())
	ms.MountStoreWithDB(storeKey, storetypes.StoreTypeIAVL, db)
	err := ms.LoadLatestVersion()
	if err != nil {
		panic(err)
	}
	ctx := sdk.NewContext(ms, tmproto.Header{}, false, log.NewNopLogger())
	cctx := sdk.WrapSDKContext(ctx)
	handler := vstorageHandler{keeper}
	return testKit{keeper, handler, ctx, cctx}
}

func callReceive(
	handler vstorageHandler,
	cctx context.Context,
	method string,
	args []interface{},
) (string, error) {
	var rawArgs []json.RawMessage
	for _, arg := range args {
		rawArg, _ := json.Marshal(arg)
		rawArgs = append(rawArgs, json.RawMessage(rawArg))
	}
	req := vstorageMessage{method, rawArgs}
	reqBytes, _ := json.Marshal(req)
	return handler.Receive(cctx, string(reqBytes))
}

func TestGetAndHas(t *testing.T) {
	kit := makeTestKit()
	keeper, handler, ctx, cctx := kit.keeper, kit.handler, kit.ctx, kit.cctx

	keeper.SetStorage(ctx, agorictypes.NewKVEntry("foo", "bar"))
	keeper.SetStorage(ctx, agorictypes.NewKVEntry("empty", ""))
	keeper.SetStorage(ctx, agorictypes.NewKVEntry("top.empty-non-terminal.leaf", ""))
	keeper.SetStorage(ctx, agorictypes.NewKVEntryWithNoValue("top.empty-non-terminal"))

	type testCase struct {
		label       string
		args        []interface{}
		want        string
		errContains *string
	}
	cases := []testCase{
		{label: "nonempty value", args: []interface{}{"foo"}, want: `"bar"`},
		{label: "empty string value", args: []interface{}{"empty"}, want: `""`},
		{label: "deep empty string", args: []interface{}{"top.empty-non-terminal.leaf"}, want: `""`},
		{label: "empty non-terminal", args: []interface{}{"top.empty-non-terminal"}, want: `null`},
		{label: "no entry", args: []interface{}{"nosuchpath"}, want: `null`},
		{label: "empty args", args: []interface{}{}, errContains: ptr(`missing`)},
		{label: "non-string arg", args: []interface{}{42}, errContains: ptr(`json`)},
		{label: "extra args", args: []interface{}{"foo", "bar"}, errContains: ptr(`extra`)},
	}
	for _, desc := range cases {
		got, err := callReceive(handler, cctx, "get", desc.args)
		has, hasErr := callReceive(handler, cctx, "has", desc.args)

		// Verify get/has error agreement.
		if (err == nil) != (hasErr == nil) {
			t.Errorf("%s: get/has error mismatch, %v vs. %v", desc.label, err, hasErr)
		} else if err != nil && hasErr.Error() != err.Error() {
			t.Errorf("%s: get/has error message mismatch, %v vs. %v", desc.label, err, hasErr)
		}

		if got != desc.want {
			t.Errorf("%s: got %q; want %q", desc.label, got, desc.want)
		}
		if desc.errContains == nil {
			if err != nil {
				t.Errorf("%s: got unexpected error %v", desc.label, err)
			}

			// Verify that `has` returns false iff `get` returns null.
			noData := desc.want == `null`
			if (noData && has != `false`) || (!noData && has != `true`) {
				t.Errorf("%s: got has %v; want %v", desc.label, has, !noData)
			}
		} else if err == nil {
			t.Errorf("%s: got no error, want error %q", desc.label, *desc.errContains)
		} else if !strings.Contains(err.Error(), *desc.errContains) {
			t.Errorf("%s: got error %v, want error %q", desc.label, err, *desc.errContains)
		}
	}
}

func doTestSet(t *testing.T, method string, expectNotify bool) {
	kit := makeTestKit()
	keeper, handler, ctx, cctx := kit.keeper, kit.handler, kit.ctx, kit.cctx

	type testCase struct {
		label        string
		args         []interface{}
		errContains  *string
		skipReadBack map[int]bool
	}
	cases := []testCase{
		{label: "single value",
			args: []interface{}{[]string{"foo", "bar"}},
		},
		{label: "other single value",
			args: []interface{}{[]string{"bar", "baz"}},
		},
		{label: "multi-value",
			args: []interface{}{[]string{"baz.a", "qux"}, []string{"baz.b", "qux"}},
		},
		{label: "other multi-value",
			args: []interface{}{[]string{"qux", "A"}, []string{"quux", "B"}},
		},
		{label: "overwrites",
			args: []interface{}{[]string{"bar"}, []string{"quux", "new"}},
		},
		{label: "non-string path",
			// TODO: Fully validate input before making changes
			// args:        []interface{}{[]string{"foo", "X"}, []interface{}{42, "new"}},
			args:        []interface{}{[]interface{}{42, "new"}},
			errContains: ptr("json"),
		},
		{label: "non-string value",
			// TODO: Fully validate input before making changes
			// args:        []interface{}{[]string{"foo", "X"}, []interface{}{"foo", true}},
			args:        []interface{}{[]interface{}{"foo", true}},
			errContains: ptr("value"),
		},
		{label: "self-overwrite",
			args:         []interface{}{[]string{"final.final.corge", "grault"}, []string{"final.final.corge", "garply"}},
			skipReadBack: map[int]bool{0: true},
		},
	}
	stateChangeEvent := func(path, value string) sdk.Event {
		return agorictypes.NewStateChangeEvent(
			keeper.GetStoreName(),
			keeper.PathToEncodedKey(path),
			[]byte(value),
		)
	}
	// Expect events to be alphabetized by key.
	expectedFlushEvents := sdk.Events{
		stateChangeEvent("baz.a", "qux"),
		stateChangeEvent("baz.b", "qux"),
		stateChangeEvent("final.final.corge", "garply"),
		stateChangeEvent("foo", "bar"),
		stateChangeEvent("quux", "new"),
		stateChangeEvent("qux", "A"),
	}
	for _, desc := range cases {
		got, err := callReceive(handler, cctx, method, desc.args)

		if desc.errContains == nil {
			if err != nil {
				t.Errorf("%s %s: got unexpected error %v", method, desc.label, err)
			} else if got != "true" {
				t.Errorf("%s %s: got unexpected response %q; want %q", method, desc.label, got, "true")
			}

			// Read the data back.
			for i, arg := range desc.args {
				entry, ok := arg.([]string)
				if desc.skipReadBack[i] {
					continue
				} else if !ok {
					t.Errorf("%s %s: cannot convert %#v to []string!", method, desc.label, arg)
					continue
				}
				path := entry[0]
				var value *string
				if len(entry) > 1 {
					value = &entry[1]
				}
				wantBackBytes, _ := json.Marshal(value)
				wantBack := string(wantBackBytes)
				gotBack, err := callReceive(handler, cctx, "get", []interface{}{path})
				if err != nil {
					t.Errorf("%s %s read back %q: got unexpected error %v", method, desc.label, path, err)
				} else if gotBack != wantBack {
					t.Errorf("%s %s read back %q: got %q; want %q", method, desc.label, path, gotBack, wantBack)
				}
			}
		} else if err == nil {
			t.Errorf("%s %s: got no error, want error %q", method, desc.label, *desc.errContains)
		} else if !strings.Contains(err.Error(), *desc.errContains) {
			t.Errorf("%s %s: got error %v, want error %q", method, desc.label, err, *desc.errContains)
		}
	}

	// Verify corresponding events.
	if got := ctx.EventManager().Events(); !reflect.DeepEqual(got, sdk.Events{}) {
		t.Errorf("%s got unexpected events before flush %#v", method, got)
	}
	keeper.FlushChangeEvents(ctx)
	if !expectNotify {
		if got := ctx.EventManager().Events(); !reflect.DeepEqual(got, sdk.Events{}) {
			t.Errorf("%s got unexpected events after flush %#v", method, got)
		}
	} else if got := ctx.EventManager().Events(); !reflect.DeepEqual(got, expectedFlushEvents) {
		for _, evt := range got {
			attrs := make([]string, len(evt.Attributes))
			for i, attr := range evt.Attributes {
				attrs[i] = fmt.Sprintf("%s=%q", attr.Key, attr.Value)
			}
			t.Logf("%s got event %s<%s>", method, evt.Type, strings.Join(attrs, ", "))
		}
		t.Errorf("%s got after flush events %#v; want %#v", method, got, expectedFlushEvents)
	}
}

func TestSet(t *testing.T) {
	doTestSet(t, "set", true)
}

func TestSetWithoutNotify(t *testing.T) {
	doTestSet(t, "setWithoutNotify", false)
}

// TODO: TestAppend

// TODO: TestChildrenAndSize

func TestEntries(t *testing.T) {
	kit := makeTestKit()
	keeper, handler, ctx, cctx := kit.keeper, kit.handler, kit.ctx, kit.cctx

	keeper.SetStorage(ctx, agorictypes.NewKVEntry("key1", "value1"))
	keeper.SetStorage(ctx, agorictypes.NewKVEntry("key1.child1.grandchild1", "value1grandchild"))
	keeper.SetStorage(ctx, agorictypes.NewKVEntryWithNoValue("key1.child1.grandchild2"))
	keeper.SetStorage(ctx, agorictypes.NewKVEntryWithNoValue("key1.child1"))
	keeper.SetStorage(ctx, agorictypes.NewKVEntry("key1.child1.empty-non-terminal.leaf", ""))
	keeper.SetStorage(ctx, agorictypes.NewKVEntryWithNoValue("key2"))
	keeper.SetStorage(ctx, agorictypes.NewKVEntryWithNoValue("key2.child2"))
	keeper.SetStorage(ctx, agorictypes.NewKVEntry("key2.child2.grandchild2", "value2grandchild"))
	keeper.SetStorage(ctx, agorictypes.NewKVEntry("key2.child2.grandchild2a", "value2grandchilda"))

	type testCase struct {
		path string
		want string
	}
	cases := []testCase{
		{path: "key1", want: `[["child1"]]`},
		{path: "key1.child1",
			// Empty non-terminals are included, empty leaves are not.
			want: `[["empty-non-terminal"],["grandchild1","value1grandchild"]]`},
		{path: "key1.child1.grandchild1", want: `[]`},
		{path: "key1.child1.empty-non-terminal", want: `[["leaf",""]]`},
		{path: "key2", want: `[["child2"]]`},
		{path: "key2.child2",
			want: `[["grandchild2","value2grandchild"],["grandchild2a","value2grandchilda"]]`},
		{path: "nosuchkey", want: `[]`},
	}
	for _, desc := range cases {
		got, err := callReceive(handler, cctx, "entries", []interface{}{desc.path})
		if got != desc.want {
			t.Errorf("%s: got %q; want %q", desc.path, got, desc.want)
		}
		if err != nil {
			t.Errorf("%s: got unexpected error %v", desc.path, err)
		}
	}
}
