package keeper

import (
	"testing"

	"github.com/stretchr/testify/require"

	sdkmath "cosmossdk.io/math"
	"github.com/Agoric/agoric-sdk/golang/cosmos/app/params"
	sdk "github.com/cosmos/cosmos-sdk/types"
	banktypes "github.com/cosmos/cosmos-sdk/x/bank/types"
)

func TestKeeper_ParseRequestTypeURL(t *testing.T) {
	testCases := []struct {
		name        string
		typeUrl     string
		fullMethod  string
		responseURL string
	}{
		{"valid Request", "abc.def.1beta1.QueryFooBarRequest", "abc.def.1beta1.Query/FooBar", "abc.def.1beta1.QueryFooBarResponse"},
		{"not Request", "abc.def.1beta1.QueryFooBar", "abc.def.1beta1.Query/FooBar", "abc.def.1beta1.QueryFooBarResponse"},
		{"valid Msg", "cosmos.bank.v1beta1.MsgSend", "cosmos.bank.v1beta1.Msg/Send", "cosmos.bank.v1beta1.MsgSendResponse"},
		{"GIGO", "helloWorld", "hello/World", "helloWorldResponse"},
		{"one message", "Hello", "/Hello", "HelloResponse"},
		{"one namespace", "world", "/world", "worldResponse"},
		{"empty", "", "/", "Response"},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			fullMethod, responseURL := parseRequestTypeURL(tc.typeUrl)
			if fullMethod != tc.fullMethod {
				t.Errorf("%v fullMethod expected %v, got %v", tc.typeUrl, tc.fullMethod, fullMethod)
			}
			if responseURL != tc.responseURL {
				t.Errorf("%v response expected %v, got %v", tc.typeUrl, tc.responseURL, responseURL)
			}
		})
	}
}

func TestKeeper_DeserializeTxMessages(t *testing.T) {
	encodingConfig := params.MakeEncodingConfig()
	cdc := encodingConfig.Marshaler

	banktypes.RegisterInterfaces(encodingConfig.InterfaceRegistry)

	keeper := NewKeeper(cdc, nil, nil, nil, nil)

	expectedMsgSend := []sdk.Msg{
		&banktypes.MsgSend{
			FromAddress: "cosmos1abc",
			ToAddress:   "cosmos1xyz",
			Amount:      sdk.NewCoins(sdk.NewCoin("stake", sdkmath.NewInt(100))),
		},
	}

	testCases := []struct {
		name     string
		json     string
		expected []sdk.Msg
		wantErr  bool
	}{
		{
			name:     "camelCase keys",
			json:     `{"messages":[{"@type":"/cosmos.bank.v1beta1.MsgSend","fromAddress":"cosmos1abc","toAddress":"cosmos1xyz","amount":[{"denom":"stake","amount":"100"}]}]}`,
			expected: expectedMsgSend,
			wantErr:  false,
		},
		{
			name:     "snake_case keys",
			json:     `{"messages":[{"@type":"/cosmos.bank.v1beta1.MsgSend","from_address":"cosmos1abc","to_address":"cosmos1xyz","amount":[{"denom":"stake","amount":"100"}]}]}`,
			expected: expectedMsgSend,
			wantErr:  false,
		},
		{
			name:     "misspelled storeService",
			json:     `{"messages":[{"@type":"/cosmos.bank.v1beta1.MsgSend","from_addresss":"cosmos1abc","to_address":"cosmos1xyz","amount":[{"denom":"stake","amount":"100"}]}]}`,
			expected: expectedMsgSend,
			wantErr:  true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			msgs, err := keeper.DeserializeTxMessages([]byte(tc.json))

			if tc.wantErr {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
				require.Equal(t, tc.expected, msgs)
			}
		})
	}
}
