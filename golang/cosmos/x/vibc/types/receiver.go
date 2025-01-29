package types

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/Agoric/agoric-sdk/golang/cosmos/vm"
	channeltypes "github.com/cosmos/ibc-go/v6/modules/core/04-channel/types"

	"github.com/cosmos/ibc-go/v6/modules/core/exported"

	sdk "github.com/cosmos/cosmos-sdk/types"
)

var (
	_ vm.PortHandler           = (*Receiver)(nil)
	_ exported.Acknowledgement = (*RawAcknowledgement)(nil)
)

type ReceiverImpl interface {
	ReceiveSendPacket(ctx sdk.Context, packet exported.PacketI) (uint64, error)
	ReceiveWriteAcknowledgement(ctx sdk.Context, packet exported.PacketI, ack exported.Acknowledgement) error
	ReceiveChanOpenInit(ctx sdk.Context, order channeltypes.Order, hops []string, sourcePort, destinationPort, version string) error
	ReceiveWriteOpenTryChannel(ctx sdk.Context, packet exported.PacketI, order channeltypes.Order, connectionHops []string, version string) error
	ReceiveChanCloseInit(ctx sdk.Context, sourcePort, sourceChannel string) error
	ReceiveBindPort(ctx sdk.Context, sourcePort string) error
	ReceiveTimeoutExecuted(ctx sdk.Context, packet exported.PacketI) error
}

type Receiver struct {
	impl ReceiverImpl
}

func NewReceiver(impl ReceiverImpl) Receiver {
	return Receiver{
		impl: impl,
	}
}

type PortMessage struct { // comes from swingset's IBC handler
	Type              string              `json:"type"` // IBC_METHOD
	Method            string              `json:"method"`
	Packet            channeltypes.Packet `json:"packet"`
	RelativeTimeoutNs uint64              `json:"relativeTimeoutNs,string"`
	Order             string              `json:"order"`
	Hops              []string            `json:"hops"`
	Version           string              `json:"version"`
	Ack               []byte              `json:"ack"`
}

func stringToOrder(order string) channeltypes.Order {
	switch order {
	case "ORDERED":
		return channeltypes.ORDERED
	case "UNORDERED":
		return channeltypes.UNORDERED
	default:
		return channeltypes.NONE
	}
}

func orderToString(order channeltypes.Order) string {
	switch order {
	case channeltypes.ORDERED:
		return "ORDERED"
	case channeltypes.UNORDERED:
		return "UNORDERED"
	default:
		return "NONE"
	}
}

type RawAcknowledgement struct {
	data []byte
}

func NewRawAcknowledgement(data []byte) RawAcknowledgement {
	return RawAcknowledgement{
		data: data,
	}
}

func (r RawAcknowledgement) Acknowledgement() []byte {
	return r.data
}

func (r RawAcknowledgement) Success() bool {
	return true
}

// Receive implements vm.PortHandler.  It unmarshals the string as JSON text
// representing an IBC portMessage object.  If the resulting type is
// "IBC_METHOD" it dispatches on method ("sendPacket"/"receiveExecuted"/etc.)
// and calls the corresponding method of the wrapped ReceiverImpl.
//
// Otherwise, it requires the wrapped ReceiverImpl to be a vm.PortHandler
// and delegates to the Receive method of that PortHandler.
func (ir Receiver) Receive(cctx context.Context, jsonRequest string) (jsonReply string, err error) {
	ctx := sdk.UnwrapSDKContext(cctx)
	impl := ir.impl

	msg := new(PortMessage)
	err = json.Unmarshal([]byte(jsonRequest), &msg)
	if err != nil {
		return "", err
	}

	if msg.Type != "IBC_METHOD" {
		if receiver, ok := impl.(vm.PortHandler); ok {
			return receiver.Receive(cctx, jsonRequest)
		}
		return "", fmt.Errorf(`channel handler only accepts messages of "type": "IBC_METHOD"; got %q`, msg.Type)
	}

	switch msg.Method {
	case "sendPacket":
		timeoutTimestamp := msg.Packet.TimeoutTimestamp
		if msg.Packet.TimeoutHeight.IsZero() && timeoutTimestamp == 0 {
			// Use the relative timeout if no absolute timeout is specifiied.
			timeoutTimestamp = uint64(ctx.BlockTime().UnixNano()) + msg.RelativeTimeoutNs
		}

		packet := channeltypes.NewPacket(
			msg.Packet.Data, 0,
			msg.Packet.SourcePort, msg.Packet.SourceChannel,
			msg.Packet.DestinationPort, msg.Packet.DestinationChannel,
			msg.Packet.TimeoutHeight, timeoutTimestamp,
		)
		seq, err := impl.ReceiveSendPacket(ctx, packet)
		if err == nil {
			packet.Sequence = seq
			bytes, err := json.Marshal(&packet)
			if err == nil {
				jsonReply = string(bytes)
			}
		}

	case "tryOpenExecuted":
		err = impl.ReceiveWriteOpenTryChannel(
			ctx, msg.Packet,
			stringToOrder(msg.Order), msg.Hops, msg.Version,
		)

	case "receiveExecuted":
		ack := RawAcknowledgement{
			data: msg.Ack,
		}
		err = impl.ReceiveWriteAcknowledgement(ctx, msg.Packet, ack)

	case "startChannelOpenInit":
		err = impl.ReceiveChanOpenInit(
			ctx, stringToOrder(msg.Order), msg.Hops,
			msg.Packet.SourcePort,
			msg.Packet.DestinationPort,
			msg.Version,
		)

	case "startChannelCloseInit":
		err = impl.ReceiveChanCloseInit(ctx, msg.Packet.SourcePort, msg.Packet.SourceChannel)

	case "bindPort":
		err = impl.ReceiveBindPort(ctx, msg.Packet.SourcePort)

	case "timeoutExecuted":
		err = impl.ReceiveTimeoutExecuted(ctx, msg.Packet)

	default:
		err = fmt.Errorf("unrecognized method %s", msg.Method)
	}

	if jsonReply == "" && err == nil {
		jsonReply = "true"
	}
	return
}
