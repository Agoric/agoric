package keeper

import (
	sdk "github.com/cosmos/cosmos-sdk/types"

	clienttypes "github.com/cosmos/ibc-go/v8/modules/core/02-client/types"
	channeltypes "github.com/cosmos/ibc-go/v8/modules/core/04-channel/types"
	ibcexported "github.com/cosmos/ibc-go/v8/modules/core/exported"

	"github.com/Agoric/agoric-sdk/golang/cosmos/vm"
	"github.com/Agoric/agoric-sdk/golang/cosmos/x/vibc/types"
)

func reifyPacket(packet ibcexported.PacketI) channeltypes.Packet {
	height := packet.GetTimeoutHeight()
	ctHeight := clienttypes.Height{
		RevisionHeight: height.GetRevisionHeight(),
		RevisionNumber: height.GetRevisionNumber(),
	}
	return channeltypes.Packet{
		Sequence:           packet.GetSequence(),
		SourcePort:         packet.GetSourcePort(),
		SourceChannel:      packet.GetSourceChannel(),
		DestinationPort:    packet.GetDestPort(),
		DestinationChannel: packet.GetDestChannel(),
		Data:               packet.GetData(),
		TimeoutHeight:      ctHeight,
		TimeoutTimestamp:   packet.GetTimeoutTimestamp(),
	}
}

type WriteAcknowledgementEvent struct {
	*vm.ActionHeader `actionType:"IBC_EVENT"`
	Event            string              `json:"event" default:"writeAcknowledgement"`
	Target           string              `json:"target"`
	Packet           channeltypes.Packet `json:"packet"`
	Acknowledgement  []byte              `json:"acknowledgement"`
	Relayer          sdk.AccAddress      `json:"relayer"`
}

func (k Keeper) TriggerWriteAcknowledgement(
	ctx sdk.Context,
	target string,
	packet ibcexported.PacketI,
	acknowledgement ibcexported.Acknowledgement,
) error {
	event := WriteAcknowledgementEvent{
		Target:          target,
		Packet:          reifyPacket(packet),
		Acknowledgement: acknowledgement.Acknowledgement(),
	}

	err := k.PushAction(ctx, event)
	if err != nil {
		return err
	}

	return nil
}

func (k Keeper) TriggerOnAcknowledgementPacket(
	ctx sdk.Context,
	target string,
	packet ibcexported.PacketI,
	acknowledgement []byte,
	relayer sdk.AccAddress,
) error {
	event := types.AcknowledgementPacketEvent{
		Target:          target,
		Packet:          reifyPacket(packet),
		Acknowledgement: acknowledgement,
		Relayer:         relayer,
	}

	err := k.PushAction(ctx, event)
	if err != nil {
		return err
	}

	return nil
}

func (k Keeper) TriggerOnTimeoutPacket(
	ctx sdk.Context,
	target string,
	packet ibcexported.PacketI,
	relayer sdk.AccAddress,
) error {
	event := types.TimeoutPacketEvent{
		Target:  target,
		Packet:  reifyPacket(packet),
		Relayer: relayer,
	}

	err := k.PushAction(ctx, event)
	if err != nil {
		return err
	}

	return nil
}
