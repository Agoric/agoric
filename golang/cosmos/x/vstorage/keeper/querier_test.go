package keeper

import (
	"bytes"
	"testing"

	agoric "github.com/Agoric/agoric-sdk/golang/cosmos/types"

	abci "github.com/cometbft/cometbft/abci/types"

	sdkioerrors "cosmossdk.io/errors"
	"github.com/cosmos/cosmos-sdk/codec"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

func TestQuerier(t *testing.T) {
	testKit := makeTestKit()
	ctx, keeper := testKit.ctx, testKit.vstorageKeeper
	legacyQuerierCdc := codec.NewAminoCodec(codec.NewLegacyAmino())
	querier := NewQuerier(keeper, legacyQuerierCdc.LegacyAmino)

	// Populate mock data
	keeper.SetStorage(ctx, agoric.NewKVEntry("foo.bar", "42"))
	keeper.SetStorage(ctx, agoric.NewKVEntry("foo.baz", "hello"))

	type testCase struct {
		label    string
		path     []string
		expected []byte
		err      *sdkioerrors.Error
	}
	testCases := []testCase{}

	// Test invalid endpoint
	testCases = append(testCases, []testCase{
		{label: "invalid endpoint",
			path: []string{"foo"},
			err:  sdkerrors.ErrUnknownRequest,
		},
	}...)

	// Test invalid arguments to valid data and children endpoints
	for _, endpoint := range []string{"data", "children"} {
		testCases = append(testCases, []testCase{
			{label: endpoint + ": no entry path",
				path: []string{endpoint},
				err:  sdkerrors.ErrInvalidRequest,
			},
			{label: endpoint + ": too many segments",
				path: []string{endpoint, "foo", "bar"},
				err:  sdkerrors.ErrInvalidRequest,
			},
			{label: endpoint + ": invalid path",
				path: []string{endpoint, ".", ""},
				err:  sdkerrors.ErrInvalidRequest,
			},
		}...)
	}

	// Test data endpoint with valid vstorage path
	testCases = append(testCases, []testCase{
		{label: "data: non-existent path",
			path: []string{"data", "bar"},
			// DO NOT CHANGE
			// The UI and CLI check for the specific cosmos-sdk error code & codespace
			err: sdkerrors.ErrNotFound,
		},
		{label: "data: path with no data",
			path: []string{"data", "foo"},
			// DO NOT CHANGE
			// The UI and CLI check for the specific cosmos-sdk error code & codespace
			err: sdkerrors.ErrNotFound,
		},
		{label: "data: path with data",
			path:     []string{"data", "foo.bar"},
			expected: []byte("{\n  \"value\": \"42\"\n}"),
		},
	}...)

	// Ensure stability of cosmos-sdk error codes
	if codespace, code, _ := sdkioerrors.ABCIInfo(sdkerrors.ErrNotFound, true); codespace != "sdk" || code != 38 {
		t.Errorf("cosmos-sdk ErrNotFound has codespace %s, code %d, expected sdk/38", codespace, code)
	}

	// Test children endpoint with valid vstorage path
	testCases = append(testCases, []testCase{
		{label: "children: non-existent path",
			path:     []string{"children", "bar"},
			expected: []byte("{\n  \"children\": []\n}"),
		},
		{label: "children: path with no children",
			path:     []string{"children", "foo.bar"},
			expected: []byte("{\n  \"children\": []\n}"),
		},
		{label: "children: path with children",
			path:     []string{"children", "foo"},
			expected: []byte("{\n  \"children\": [\n    \"bar\",\n    \"baz\"\n  ]\n}"),
		},
	}...)

	for _, desc := range testCases {
		res, err := querier(ctx, desc.path, abci.RequestQuery{})
		if desc.err != nil {
			if err == nil {
				t.Errorf("%s: got no error, want error %q", desc.label, *desc.err)
			} else if codespace, code, _ := sdkioerrors.ABCIInfo(err, true); codespace != desc.err.Codespace() || code != desc.err.ABCICode() {
				t.Errorf("%s: got error %v, want error %q", desc.label, err, *desc.err)
			}
		} else if !bytes.Equal(res, desc.expected) {
			t.Errorf("%s: wrong result: %#v, expected %#v", desc.label, string(res), string(desc.expected))
		}
	}
}
