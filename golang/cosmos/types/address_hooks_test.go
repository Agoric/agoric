package types_test

import (
	"testing"

	"github.com/stretchr/testify/require"

	codec "github.com/cosmos/cosmos-sdk/codec"
	cdctypes "github.com/cosmos/cosmos-sdk/codec/types"

	transfertypes "github.com/cosmos/ibc-go/v8/modules/apps/transfer/types"
	clienttypes "github.com/cosmos/ibc-go/v8/modules/core/02-client/types"
	channeltypes "github.com/cosmos/ibc-go/v8/modules/core/04-channel/types"

	"github.com/Agoric/agoric-sdk/golang/cosmos/types"
)

func TestSplitHookedAddress(t *testing.T) {
	cases := []struct {
		name     string
		hook     string
		baseAddr string
		hookData []byte
		err      string
	}{
		{"empty", "", "", []byte{}, "decoding bech32 failed: invalid bech32 string length 0"},
		{"no hook", "agoric1qqp0e5ys", "agoric1qqp0e5ys", []byte{}, ""},
		{"Fast USDC", "agoric10rchp4vc53apxn32q42c3zryml8xq3xshyzuhjk6405wtxy7tl3d7e0f8az423padaek6me38qekget2vdhx66mtvy6kg7nrw5uhsaekd4uhwufswqex6dtsv44hxv3cd4jkuqpqvduyhf",
			"agoric16kv2g7snfc4q24vg3pjdlnnqgngtjpwtetd2h689nz09lcklvh5s8u37ek",
			[]byte("?EUD=osmo183dejcnmkka5dzcu9xw6mywq0p2m5peks28men"),
			""},
		{"version 0",
			"agoric10rchqqqpqgpsgpgxquyqjzstpsxsurcszyfpxpqrqgqsq9qx0p9wp",
			"agoric1qqqsyqcyq5rqwzqfpg9scrgwpugpzysn3tn9p0",
			[]byte{4, 3, 2, 1},
			""},
		{"version 1 reject",
			"agoric10rchzqqpqgpsgpgxquyqjzstpsxsurcszyfpxpqrqgqsq9q04n2fg",
			"",
			[]byte{},
			"unsupported address hook version 1"},
		{"version 15 reject",
			"agoric10rch7qqpqgpsgpgxquyqjzstpsxsurcszyfpxpqrqgqsq9q25ez2d",
			"",
			[]byte{},
			"unsupported address hook version 15"},
	}

	for _, tc := range cases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			baseAddr, hookData, err := types.SplitHookedAddress(tc.hook)
			if len(tc.err) > 0 {
				require.Error(t, err)
				require.Equal(t, tc.err, err.Error())
			} else {
				require.NoError(t, err)
				require.Equal(t, tc.baseAddr, baseAddr)
				require.Equal(t, string(tc.hookData), string(hookData))
			}
		})
	}
}

func TestExtractBaseAddress(t *testing.T) {
	bases := []struct {
		name string
		addr string
	}{
		{"agoric address", "agoric1qqp0e5ys"},
		{"cosmos address", "cosmos1qqxuevtt"},
	}

	suffixes := []struct {
		hookStr     string
		baseIsWrong bool
		isErr       bool
	}{
		{"", false, false},
		{"/", false, false},
		{"/sub/account", false, false},
		{"?query=something&k=v&k2=v2", false, false},
		{"?query=something&k=v&k2=v2#fragment", false, false},
		{"unexpected", false, false},
		{"\x01", false, false},
	}

	for _, b := range bases {
		b := b
		for _, s := range suffixes {
			s := s
			t.Run(b.name+" "+s.hookStr, func(t *testing.T) {
				addrHook, err := types.JoinHookedAddress(b.addr, []byte(s.hookStr))
				require.NoError(t, err)
				addr, err := types.ExtractBaseAddress(addrHook)
				if s.isErr {
					require.Error(t, err)
				} else {
					require.NoError(t, err)
					if s.baseIsWrong {
						require.NotEqual(t, b.addr, addr)
					} else {
						require.Equal(t, b.addr, addr)
						addr, hookData, err := types.SplitHookedAddress(addrHook)
						require.NoError(t, err)
						require.Equal(t, b.addr, addr)
						require.Equal(t, s.hookStr, string(hookData))
					}
				}
			})
		}
	}
}

func TestExtractBaseAddressFromPacket(t *testing.T) {
	ir := cdctypes.NewInterfaceRegistry()
	cdc := codec.NewProtoCodec(ir)
	transfertypes.RegisterInterfaces(ir)
	channeltypes.RegisterInterfaces(ir)
	clienttypes.RegisterInterfaces(ir)

	cosmosAddr := "cosmos1qqxuevtt"
	cosmosHookStr := "?foo=bar&baz=bot#fragment"
	cosmosHook, err := types.JoinHookedAddress(cosmosAddr, []byte(cosmosHookStr))
	require.NoError(t, err)
	addr, hookData, err := types.SplitHookedAddress(cosmosHook)
	require.NoError(t, err)
	require.Equal(t, cosmosAddr, addr)
	require.Equal(t, cosmosHookStr, string(hookData))

	agoricAddr := "agoric1qqp0e5ys"
	agoricHookStr := "?bingo=again"
	agoricHook, err := types.JoinHookedAddress(agoricAddr, []byte(agoricHookStr))
	require.NoError(t, err)
	addr, hookData, err = types.SplitHookedAddress(agoricHook)
	require.NoError(t, err)
	require.Equal(t, agoricAddr, addr)
	require.Equal(t, agoricHookStr, string(hookData))

	cases := []struct {
		name  string
		addrs map[types.AddressRole]struct{ addr, baseAddr string }
	}{
		{"sender has params",
			map[types.AddressRole]struct{ addr, baseAddr string }{
				types.RoleSender:   {cosmosHook, "cosmos1qqxuevtt"},
				types.RoleReceiver: {"agoric1qqp0e5ys", "agoric1qqp0e5ys"},
			},
		},
		{"receiver has params",
			map[types.AddressRole]struct{ addr, baseAddr string }{
				types.RoleSender:   {"cosmos1qqxuevtt", "cosmos1qqxuevtt"},
				types.RoleReceiver: {agoricHook, "agoric1qqp0e5ys"},
			},
		},
		{"both are base",
			map[types.AddressRole]struct{ addr, baseAddr string }{
				types.RoleSender:   {"cosmos1qqxuevtt", "cosmos1qqxuevtt"},
				types.RoleReceiver: {"agoric1qqp0e5ys", "agoric1qqp0e5ys"},
			},
		},
		{"both have params",
			map[types.AddressRole]struct{ addr, baseAddr string }{
				types.RoleSender:   {agoricHook, "agoric1qqp0e5ys"},
				types.RoleReceiver: {cosmosHook, "cosmos1qqxuevtt"},
			},
		},
	}

	for _, tc := range cases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			ftPacketData := transfertypes.NewFungibleTokenPacketData("denom", "100", tc.addrs[types.RoleSender].addr, tc.addrs[types.RoleReceiver].addr, "my-favourite-memo")
			packetBz, err := cdc.MarshalJSON(&ftPacketData)
			require.NoError(t, err)
			packet := channeltypes.NewPacket(packetBz, 1234, "my-port", "my-channel", "their-port", "their-channel", clienttypes.NewHeight(133, 445), 10999)

			for role, addrs := range tc.addrs {
				addrs := addrs
				role := role

				t.Run(string(role), func(t *testing.T) {
					baseAddr, err := types.ExtractBaseAddress(addrs.addr)
					require.NoError(t, err)
					require.Equal(t, addrs.baseAddr, baseAddr)

					packetBaseAddr, err := types.ExtractBaseAddressFromPacket(cdc, packet, role, nil)
					require.NoError(t, err)
					require.Equal(t, addrs.baseAddr, packetBaseAddr)

					var newPacket channeltypes.Packet
					packetBaseAddr2, err := types.ExtractBaseAddressFromPacket(cdc, packet, role, &newPacket)
					require.NoError(t, err)
					require.Equal(t, addrs.baseAddr, packetBaseAddr2)

					var basePacketData transfertypes.FungibleTokenPacketData
					err = cdc.UnmarshalJSON(newPacket.GetData(), &basePacketData)
					require.NoError(t, err)

					// Check that the only difference between the packet data is the baseAddr.
					packetData := basePacketData
					switch role {
					case types.RoleSender:
						require.Equal(t, addrs.baseAddr, basePacketData.Sender)
						packetData.Sender = addrs.addr
					case types.RoleReceiver:
						require.Equal(t, addrs.baseAddr, basePacketData.Receiver)
						packetData.Receiver = addrs.addr
					default:
						t.Fatal("unexpected role", role)
					}

					require.Equal(t, ftPacketData, packetData)
				})
			}
		})
	}
}
