package types

import (
	"bytes"
	"fmt"

	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/cosmos/cosmos-sdk/types/bech32"

	transfertypes "github.com/cosmos/ibc-go/v6/modules/apps/transfer/types"
	clienttypes "github.com/cosmos/ibc-go/v6/modules/core/02-client/types"
	channeltypes "github.com/cosmos/ibc-go/v6/modules/core/04-channel/types"
	ibcexported "github.com/cosmos/ibc-go/v6/modules/core/exported"
)

type AddressRole string
type PacketOrigin string

const (
	RoleSender   AddressRole = "Sender"
	RoleReceiver AddressRole = "Receiver"

	PacketSrc PacketOrigin = "src"
	PacketDst PacketOrigin = "dst"

	AddressHookVersion     = 0
	BaseAddressLengthBytes = 2
)

// AddressHookBytePrefix is a magic prefix that identifies a hooked address.
// Chosen to make bech32 address hooks that look like "agoric10rch..."
var AddressHookBytePrefix = []byte{0x78, 0xf1, 0x70 /* | AddressHookVersion */}

func init() {
	if AddressHookVersion&0x0f != AddressHookVersion {
		panic(fmt.Sprintf("AddressHookVersion must be less than 0x10, got 0x%x", AddressHookVersion))
	}
}

// ExtractBaseAddress extracts the base address from an Address Hook.  It
// returns addr verbatim if it is not an Address Hook.
func ExtractBaseAddress(addr string) (string, error) {
	baseAddr, _, err := SplitHookedAddress(addr)
	if err != nil {
		return "", err
	}
	return baseAddr, nil
}

// SplitHookedAddress splits a hooked address into its base address and hook data.
// For the JS implementation, look at @agoric/cosmic-proto/src/address-hooks.js.
func SplitHookedAddress(addr string) (string, []byte, error) {
	prefix, payload, err := bech32.DecodeAndConvert(addr)
	if err != nil {
		return "", []byte{}, err
	}

	lastPrefixHighNibble := AddressHookBytePrefix[len(AddressHookBytePrefix)-1]
	bz := bytes.TrimPrefix(payload, AddressHookBytePrefix[:len(AddressHookBytePrefix)-1])
	if len(bz) == len(payload) || len(bz) == 0 || bz[0]&0xf0 != lastPrefixHighNibble {
		// Return an unhooked address.
		return addr, []byte{}, nil
	}

	version := bz[0] & 0x0f
	bz = bz[1:]
	if version != AddressHookVersion {
		return "", []byte{}, fmt.Errorf("unsupported address hook version %d", version)
	}

	if len(bz) < BaseAddressLengthBytes {
		return "", []byte{}, fmt.Errorf("hooked address must have at least %d bytes", BaseAddressLengthBytes)
	}

	b := 0
	for i := BaseAddressLengthBytes - 1; i >= 0; i -= 1 {
		byteVal := bz[len(bz)-1-i]
		b <<= 8
		b |= int(byteVal)
	}

	payloadEnd := len(bz) - BaseAddressLengthBytes
	if b > payloadEnd {
		return "", []byte{}, fmt.Errorf("base address length 0x%x is longer than payload end 0x%x", b, payloadEnd)
	}

	baseAddressBuf := bz[0:b]
	baseAddress, err := bech32.ConvertAndEncode(prefix, baseAddressBuf)
	if err != nil {
		return "", []byte{}, err
	}

	return baseAddress, bz[b:payloadEnd], nil
}

// JoinHookedAddress joins a base bech32 address with hook data to create a
// hooked bech32 address.
// For the JS implementation, look at @agoric/cosmic-proto/src/address-hooks.js
func JoinHookedAddress(baseAddr string, hookData []byte) (string, error) {
	prefix, bz, err := bech32.DecodeAndConvert(baseAddr)
	if err != nil {
		return "", err
	}

	b := len(bz)
	maxB := 1<<(8*BaseAddressLengthBytes-1) + 1
	if b > maxB {
		return "", fmt.Errorf("base address length 0x%x is longer than the maximum 0x%x", b, maxB)
	}

	payload := make([]byte, 0, len(AddressHookBytePrefix)+b+len(hookData)+BaseAddressLengthBytes)
	payload = append(payload, AddressHookBytePrefix...)
	payload[len(payload)-1] |= byte(AddressHookVersion)
	payload = append(payload, bz...)
	payload = append(payload, hookData...)
	baLen := make([]byte, BaseAddressLengthBytes)
	for i := BaseAddressLengthBytes - 1; i >= 0; i -= 1 {
		baLen[i] = byte(b)
		b >>= 8
	}
	payload = append(payload, baLen...)

	return bech32.ConvertAndEncode(prefix, payload)
}

// extractBaseTransferData returns the base address from the transferData.Sender
// (if RoleSender) or transferData.Receiver (if RoleReceiver). Errors in
// determining the base address are ignored... we then assume the base address
// is exactly the original address.  If newTransferData is not nil, it will be
// populated with a new FungibleTokenPacketData consisting of the role replaced
// with its base address.
func extractBaseTransferData(transferData transfertypes.FungibleTokenPacketData, role AddressRole, newTransferData *transfertypes.FungibleTokenPacketData) (string, error) {
	var target string
	sender := transferData.Sender
	receiver := transferData.Receiver

	switch role {
	case RoleSender:
		baseSender, err := ExtractBaseAddress(sender)
		if err == nil {
			sender = baseSender
		}
		target = sender

	case RoleReceiver:
		baseReceiver, err := ExtractBaseAddress(receiver)
		if err == nil {
			receiver = baseReceiver
		}
		target = receiver

	default:
		err := fmt.Errorf("invalid address role: %s", role)
		return target, err
	}

	if newTransferData == nil {
		return target, nil
	}

	// Create the new transfer data.
	*newTransferData = transfertypes.NewFungibleTokenPacketData(
		transferData.Denom,
		transferData.Amount,
		sender, receiver,
		transferData.Memo,
	)

	return target, nil
}

// ExtractBaseAddressFromPacket returns the base address from a transfer
// packet's data, either Sender (if role is RoleSender) or Receiver (if role is
// RoleReceiver).
// Errors in determining the base address are ignored... we then assume the base
// address is exactly the original address.
// If newPacket is not nil, it is populated with a new transfer packet whose
// corresponding Sender or Receiver is replaced with the extracted base address.
func ExtractBaseAddressFromPacket(cdc codec.Codec, packet ibcexported.PacketI, role AddressRole, newPacket *channeltypes.Packet) (string, error) {
	transferData := transfertypes.FungibleTokenPacketData{}
	if err := cdc.UnmarshalJSON(packet.GetData(), &transferData); err != nil {
		return "", err
	}

	var newTransferData *transfertypes.FungibleTokenPacketData
	if newPacket != nil {
		// Capture the transfer data for the new packet.
		newTransferData = &transfertypes.FungibleTokenPacketData{}
	}
	target, err := extractBaseTransferData(transferData, role, newTransferData)
	if err != nil {
		return target, err
	}

	if newPacket == nil {
		return target, nil
	}

	// Create new packet data from the new transfer data.
	var newData []byte
	if *newTransferData == transferData {
		// The transfer data properties were not modified, so we can reuse the
		// original packet data.
		newData = bytes.Clone(packet.GetData())
	} else {
		// Re-serialize the packet data with the base addresses.
		newData = newTransferData.GetBytes()
	}

	// Create the new packet.
	th := packet.GetTimeoutHeight()
	*newPacket = channeltypes.NewPacket(
		newData, packet.GetSequence(),
		packet.GetSourcePort(), packet.GetSourceChannel(),
		packet.GetDestPort(), packet.GetDestChannel(),
		clienttypes.NewHeight(th.GetRevisionNumber(), th.GetRevisionHeight()),
		packet.GetTimeoutTimestamp(),
	)

	return target, nil
}
