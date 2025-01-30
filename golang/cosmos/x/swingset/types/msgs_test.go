package types

import (
	"bytes"
	"math"
	"testing"

	"github.com/cosmos/cosmos-sdk/crypto/keys/secp256k1"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/gogoproto/proto"
)

var (
	key  = secp256k1.GenPrivKey()
	pub  = key.PubKey()
	addr = sdk.AccAddress(pub.Address())
)

func TestWalletAction(t *testing.T) {
	for _, tt := range []struct {
		name      string
		msg       *MsgWalletAction
		shouldErr bool
	}{
		{
			name:      "empty",
			msg:       &MsgWalletAction{},
			shouldErr: true,
		},
		{
			name: "normal",
			msg:  NewMsgWalletAction(addr, "null"),
		},
		{
			name:      "empty action",
			msg:       NewMsgWalletAction(addr, ""),
			shouldErr: true,
		},
		{
			name:      "bad json",
			msg:       NewMsgWalletAction(addr, "foo"),
			shouldErr: true,
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.msg.ValidateBasic()
			if err != nil && !tt.shouldErr {
				t.Fatalf("unexpected validation error %s", err)
			}
			if err == nil && tt.shouldErr {
				t.Fatalf("wanted validation error")
			}
		})
	}
}

func TestWalletSpendAction(t *testing.T) {
	for _, tt := range []struct {
		name      string
		msg       *MsgWalletSpendAction
		shouldErr bool
	}{
		{
			name:      "empty",
			msg:       &MsgWalletSpendAction{},
			shouldErr: true,
		},
		{
			name: "normal",
			msg:  NewMsgWalletSpendAction(addr, "null"),
		},
		{
			name:      "empty action",
			msg:       NewMsgWalletSpendAction(addr, ""),
			shouldErr: true,
		},
		{
			name:      "bad json",
			msg:       NewMsgWalletSpendAction(addr, "foo"),
			shouldErr: true,
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.msg.ValidateBasic()
			if err != nil && !tt.shouldErr {
				t.Fatalf("unexpected validation error %s", err)
			}
			if err == nil && tt.shouldErr {
				t.Fatalf("wanted validation error")
			}
		})
	}
}

func TestInstallBundle_ValidateBasic(t *testing.T) {
	for _, tt := range []struct {
		name      string
		msg       *MsgInstallBundle
		shouldErr bool
	}{
		{
			name:      "empty",
			msg:       &MsgInstallBundle{},
			shouldErr: true,
		},
		{
			name:      "no bundle",
			msg:       NewMsgInstallBundle("", addr),
			shouldErr: true,
		},
		{
			name: "uncompressed",
			msg:  NewMsgInstallBundle("true", addr),
		},
		{
			name: "compressed",
			msg: &MsgInstallBundle{
				Submitter:        addr,
				CompressedBundle: []byte{1, 2, 3},
				UncompressedSize: 4,
			},
		},
		{
			name: "both",
			msg: &MsgInstallBundle{
				Bundle:           "foo",
				Submitter:        addr,
				CompressedBundle: []byte{1},
			},
			shouldErr: true,
		},
		{
			name: "zero size",
			msg: &MsgInstallBundle{
				Submitter:        addr,
				CompressedBundle: []byte{1, 2, 3},
			},
			shouldErr: true,
		},
		{
			name: "negative size",
			msg: &MsgInstallBundle{
				Submitter:        addr,
				CompressedBundle: []byte{1, 2, 3},
				UncompressedSize: -4,
			},
			shouldErr: true,
		},
		{
			name: "under limit",
			msg: &MsgInstallBundle{
				Submitter:        addr,
				CompressedBundle: []byte{1, 2, 3},
				UncompressedSize: bundleUncompressedSizeLimit - 1,
			},
		},

		{
			name: "limit",
			msg: &MsgInstallBundle{
				Submitter:        addr,
				CompressedBundle: []byte{1, 2, 3},
				UncompressedSize: bundleUncompressedSizeLimit,
			},
			shouldErr: true,
		},
		{
			name: "max",
			msg: &MsgInstallBundle{
				Submitter:        addr,
				CompressedBundle: []byte{1, 2, 3},
				UncompressedSize: math.MaxInt64,
			},
			shouldErr: true,
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.msg.ValidateBasic()
			if err != nil && !tt.shouldErr {
				t.Fatalf("unexpected validation error %s", err)
			}
			if err == nil && tt.shouldErr {
				t.Fatalf("wanted validation error")
			}
		})
	}
}

func TestInstallBundle_Compress(t *testing.T) {
	// proto.Equal panics because of AccAddress field
	eq := func(a, b *MsgInstallBundle) bool {
		return a.Bundle == b.Bundle &&
			a.Submitter.Equals(b.Submitter) &&
			bytes.Equal(a.CompressedBundle, b.CompressedBundle) &&
			a.UncompressedSize == b.UncompressedSize
	}
	text := "Lorem ipsum dolor sit amet"
	size := len(text)
	msg := NewMsgInstallBundle(text, addr)
	origMsg := proto.Clone(msg).(*MsgInstallBundle)
	err := msg.ValidateBasic()
	if err != nil {
		t.Fatal(err)
	}
	gotSize := msg.ExpectedUncompressedSize()
	if gotSize != uint64(size) {
		t.Errorf("want expected size %d, got %d", size, gotSize)
	}
	err = msg.Uncompress()
	if err != nil {
		t.Fatal(err)
	}
	if !eq(msg, origMsg) {
		t.Errorf("noop uncompress got %+v, want %+v", *msg, origMsg)
	}
	err = msg.Compress()
	if err != nil {
		t.Fatal(err)
	}
	err = msg.ValidateBasic()
	if err != nil {
		t.Fatal(err)
	}
	if msg.UncompressedSize != int64(size) {
		t.Errorf("want uncompressed size field %d, got %d", size, msg.UncompressedSize)
	}
	gotSize = msg.ExpectedUncompressedSize()
	if gotSize != uint64(size) {
		t.Errorf("want expected size %d, got %d", size, gotSize)
	}
	if msg.Bundle != "" {
		t.Errorf("want empty bundle field, got %s", msg.Bundle)
	}
	if len(msg.CompressedBundle) == 0 {
		t.Errorf("got empty compressed bundle")
	}
	compressedMsg := proto.Clone(msg).(*MsgInstallBundle)
	err = msg.Compress()
	if err != nil {
		t.Fatal(err)
	}
	if !eq(msg, compressedMsg) {
		t.Errorf("noop compress got %+v, want %+v", msg, compressedMsg)
	}
	err = msg.Uncompress()
	if err != nil {
		t.Fatal(err)
	}
	if !eq(msg, origMsg) {
		t.Errorf("round-trip got %+v, want %+v", msg, origMsg)
	}
	msgModLo := proto.Clone(compressedMsg).(*MsgInstallBundle)
	msgModLo.UncompressedSize--
	err = msgModLo.Uncompress()
	if err == nil {
		t.Errorf("wanted Uncompress error for low uncompressed size")
	}
	msgModHi := proto.Clone(compressedMsg).(*MsgInstallBundle)
	msgModHi.UncompressedSize++
	err = msgModHi.Uncompress()
	if err == nil {
		t.Errorf("wanted Uncompress error for high uncompressed size")
	}
}
