package vm_test

import (
	"bytes"
	"strings"
	"testing"

	"github.com/Agoric/agoric-sdk/golang/cosmos/vm"

	sdk "github.com/cosmos/cosmos-sdk/types"

	banktypes "github.com/cosmos/cosmos-sdk/x/bank/types"
	stakingtypes "github.com/cosmos/cosmos-sdk/x/staking/types"
)

func TestProtoJSONMarshal(t *testing.T) {
	accAddr, err := sdk.AccAddressFromHexUnsafe("0123456789")
	if err != nil {
		panic(err)
	}
	valAddr, err := sdk.ValAddressFromHex("9876543210")
	if err != nil {
		panic(err)
	}
	coin := sdk.NewInt64Coin("uatom", 1234567)

	testCases := []struct {
		name     string
		create   func() interface{}
		expected string
	}{
		{
			"nil",
			func() interface{} {
				return nil
			},
			`null`,
		},
		{
			"primitive number",
			func() interface{} {
				return 12345
			},
			`12345`,
		},
		{
			"MsgDelegate",
			func() interface{} {
				return stakingtypes.NewMsgDelegate(accAddr.String(), valAddr.String(), coin)
			},
			`{"delegatorAddress":"cosmos1qy352eufjjmc9c","validatorAddress":"cosmosvaloper1npm9gvss52mlmk","amount":{"denom":"uatom","amount":"1234567"}}`,
		},
		{
			"QueryDenomOwnersResponse",
			func() interface{} {
				return &banktypes.QueryDenomOwnersResponse{
					DenomOwners: []*banktypes.DenomOwner{
						{
							Address: accAddr.String(),
							Balance: coin,
						},
						{
							Address: valAddr.String(),
							Balance: coin.Add(coin),
						},
					},
				}
			},
			`{"denomOwners":[{"address":"cosmos1qy352eufjjmc9c","balance":{"denom":"uatom","amount":"1234567"}},{"address":"cosmosvaloper1npm9gvss52mlmk","balance":{"denom":"uatom","amount":"2469134"}}],"pagination":null}`,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			val := tc.create()
			bz, err := vm.ProtoJSONMarshal(val)
			if err != nil {
				t.Errorf("ProtoJSONMarshal of %q failed %v", val, err)
			}
			if !bytes.Equal(bz, []byte(tc.expected)) {
				t.Errorf("ProtoJSONMarshal of %q returned %q, expected %q", val, string(bz), tc.expected)
			}
		})
	}

	t.Run("all in a slice", func(t *testing.T) {
		vals := make([]interface{}, len(testCases))
		expectedJson := make([]string, len(testCases))
		for i, tc := range testCases {
			vals[i] = tc.create()
			expectedJson[i] = tc.expected
		}
		bz, err := vm.ProtoJSONMarshalSlice(vals)
		if err != nil {
			t.Errorf("ProtoJSONMarshalSlice of %q failed %v", vals, err)
		}

		expected := "[" + strings.Join(expectedJson, ",") + "]"
		if !bytes.Equal(bz, []byte(expected)) {
			t.Errorf("ProtoJSONMarshalSlice of %q returned %q, expected %q", vals, string(bz), expected)
		}
	})
}
