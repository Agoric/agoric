package types

import (
	fmt "fmt"

	sdkioerrors "cosmossdk.io/errors"
	"github.com/Agoric/agoric-sdk/golang/cosmos/vm"
	capability "github.com/cosmos/ibc-go/modules/capability/types"
	channeltypes "github.com/cosmos/ibc-go/v8/modules/core/04-channel/types"
	porttypes "github.com/cosmos/ibc-go/v8/modules/core/05-port/types"
	host "github.com/cosmos/ibc-go/v8/modules/core/24-host"

	"github.com/cosmos/ibc-go/v8/modules/core/exported"

	sdk "github.com/cosmos/cosmos-sdk/types"
)

const (
	// AsyncVersions is a flag that indicates whether the IBC module supports
	// asynchronous versions.  If it does, then the VM must supply an empty
	// version string to indicate that the VM explicitly (possibly async)
	// performs the Write* method.
	// This flag is created in anticipation of ibc-go implementing async versions,
	// see https://github.com/Agoric/agoric-sdk/issues/9358 for more details.
	AsyncVersions = false
)

var (
	_ porttypes.IBCModule = (*IBCModule)(nil)
)

type IBCModuleImpl interface {
	ClaimCapability(ctx sdk.Context, channelCap *capability.Capability, path string) error
	GetChannel(ctx sdk.Context, portID, channelID string) (channeltypes.Channel, bool)
	PushAction(ctx sdk.Context, action vm.Action) error
}

type IBCModule struct {
	impl IBCModuleImpl
}

func NewIBCModule(impl IBCModuleImpl) IBCModule {
	return IBCModule{
		impl: impl,
	}
}

type ChannelOpenInitEvent struct {
	*vm.ActionHeader `actionType:"IBC_EVENT"`
	Event            string                    `json:"event" default:"channelOpenInit"`
	Target           string                    `json:"target,omitempty"`
	Order            string                    `json:"order"`
	ConnectionHops   []string                  `json:"connectionHops"`
	PortID           string                    `json:"portID"`
	ChannelID        string                    `json:"channelID"`
	Counterparty     channeltypes.Counterparty `json:"counterparty"`
	Version          string                    `json:"version"`
	AsyncVersions    bool                      `json:"asyncVersions"`
}

// Implement IBCModule callbacks
func (im IBCModule) OnChanOpenInit(
	ctx sdk.Context,
	order channeltypes.Order,
	connectionHops []string,
	portID string,
	channelID string,
	channelCap *capability.Capability,
	counterparty channeltypes.Counterparty,
	version string,
) (string, error) {
	event := ChannelOpenInitEvent{
		Order:          orderToString(order),
		ConnectionHops: connectionHops,
		PortID:         portID,
		ChannelID:      channelID,
		Counterparty:   counterparty,
		Version:        version,
		AsyncVersions:  AsyncVersions,
	}

	err := im.impl.PushAction(ctx, event)
	if err != nil {
		return "", err
	}

	// Claim channel capability passed back by IBC module
	if err := im.impl.ClaimCapability(ctx, channelCap, host.ChannelCapabilityPath(portID, channelID)); err != nil {
		return "", err
	}

	if !event.AsyncVersions {
		// We have to supply a synchronous version, so just echo back the one they sent.
		return event.Version, nil
	}

	return "", nil
}

type ChannelOpenTryEvent struct {
	*vm.ActionHeader `actionType:"IBC_EVENT"`
	Event            string                    `json:"event" default:"channelOpenTry"`
	Target           string                    `json:"target,omitempty"`
	Order            string                    `json:"order"`
	ConnectionHops   []string                  `json:"connectionHops"`
	PortID           string                    `json:"portID"`
	ChannelID        string                    `json:"channelID"`
	Counterparty     channeltypes.Counterparty `json:"counterparty"`
	Version          string                    `json:"version"`
	AsyncVersions    bool                      `json:"asyncVersions"`
}

func (im IBCModule) OnChanOpenTry(
	ctx sdk.Context,
	order channeltypes.Order,
	connectionHops []string,
	portID,
	channelID string,
	channelCap *capability.Capability,
	counterparty channeltypes.Counterparty,
	counterpartyVersion string,
) (string, error) {
	event := ChannelOpenTryEvent{
		Order:          orderToString(order),
		ConnectionHops: connectionHops,
		PortID:         portID,
		ChannelID:      channelID,
		Counterparty:   counterparty,
		Version:        counterpartyVersion,
		AsyncVersions:  AsyncVersions,
	}

	err := im.impl.PushAction(ctx, event)
	if err != nil {
		return "", err
	}

	// Claim channel capability passed back by IBC module
	if err = im.impl.ClaimCapability(ctx, channelCap, host.ChannelCapabilityPath(portID, channelID)); err != nil {
		return "", sdkioerrors.Wrap(channeltypes.ErrChannelCapabilityNotFound, err.Error())
	}

	if !event.AsyncVersions {
		// We have to supply a synchronous version, so just echo back the one they sent.
		return event.Version, nil
	}

	// Use an empty version string to indicate that the VM explicitly (possibly
	// async) performs the WriteOpenTryChannel.
	return "", nil
}

type ChannelOpenAckEvent struct {
	*vm.ActionHeader    `actionType:"IBC_EVENT"`
	Event               string                    `json:"event" default:"channelOpenAck"`
	PortID              string                    `json:"portID"`
	ChannelID           string                    `json:"channelID"`
	CounterpartyVersion string                    `json:"counterpartyVersion"`
	Counterparty        channeltypes.Counterparty `json:"counterparty"`
	ConnectionHops      []string                  `json:"connectionHops"`
}

func (im IBCModule) OnChanOpenAck(
	ctx sdk.Context,
	portID,
	channelID string,
	counterpartyChannelID string,
	counterpartyVersion string,
) error {
	// We don't care if the channel was found.  If it wasn't then GetChannel
	// returns an empty channel object that we can still use without crashing.
	channel, _ := im.impl.GetChannel(ctx, portID, channelID)

	channel.Counterparty.ChannelId = counterpartyChannelID
	event := ChannelOpenAckEvent{
		PortID:              portID,
		ChannelID:           channelID,
		CounterpartyVersion: counterpartyVersion,
		Counterparty:        channel.Counterparty,
		ConnectionHops:      channel.ConnectionHops,
	}

	return im.impl.PushAction(ctx, event)
}

type ChannelOpenConfirmEvent struct {
	*vm.ActionHeader `actionType:"IBC_EVENT"`
	Event            string `json:"event" default:"channelOpenConfirm"`
	Target           string `json:"target,omitempty"`
	PortID           string `json:"portID"`
	ChannelID        string `json:"channelID"`
}

func (im IBCModule) OnChanOpenConfirm(
	ctx sdk.Context,
	portID,
	channelID string,
) error {
	event := ChannelOpenConfirmEvent{
		PortID:    portID,
		ChannelID: channelID,
	}

	return im.impl.PushAction(ctx, event)
}

type ChannelCloseInitEvent struct {
	*vm.ActionHeader `actionType:"IBC_EVENT"`
	Event            string `json:"event" default:"channelCloseInit"`
	Target           string `json:"target,omitempty"`
	PortID           string `json:"portID"`
	ChannelID        string `json:"channelID"`
}

func (im IBCModule) OnChanCloseInit(
	ctx sdk.Context,
	portID,
	channelID string,
) error {
	event := ChannelCloseInitEvent{
		PortID:    portID,
		ChannelID: channelID,
	}

	err := im.impl.PushAction(ctx, event)
	if err != nil {
		return err
	}
	return fmt.Errorf("OnChanCloseInit can only be sent by the VM")
}

type ChannelCloseConfirmEvent struct {
	*vm.ActionHeader `actionType:"IBC_EVENT"`
	Event            string `json:"event" default:"channelCloseConfirm"`
	Target           string `json:"target,omitempty"`
	PortID           string `json:"portID"`
	ChannelID        string `json:"channelID"`
}

func (im IBCModule) OnChanCloseConfirm(
	ctx sdk.Context,
	portID,
	channelID string,
) error {
	event := ChannelCloseConfirmEvent{
		PortID:    portID,
		ChannelID: channelID,
	}

	err := im.impl.PushAction(ctx, event)
	return err
}

type ReceivePacketEvent struct {
	*vm.ActionHeader `actionType:"IBC_EVENT"`
	Event            string              `json:"event" default:"receivePacket"`
	Target           string              `json:"target,omitempty"`
	Packet           channeltypes.Packet `json:"packet"`
	Relayer          sdk.AccAddress      `json:"relayer"`
}

func (im IBCModule) OnRecvPacket(
	ctx sdk.Context,
	packet channeltypes.Packet,
	relayer sdk.AccAddress,
) exported.Acknowledgement {
	// Sometimes we receive duplicate packets, just with a
	// missing packet.TimeoutTimestamp.  This causes duplicate
	// acks, with one of them being rejected.
	//
	// This turns out to happen when you run both "rly start"
	// and also "rly tx xfer"-- they both are trying to relay
	// the same packets.

	event := ReceivePacketEvent{
		Packet:  packet,
		Relayer: relayer,
	}

	err := im.impl.PushAction(ctx, event)
	if err != nil {
		return channeltypes.NewErrorAcknowledgement(err)
	}

	return nil
}

type AcknowledgementPacketEvent struct {
	*vm.ActionHeader `actionType:"IBC_EVENT"`
	Event            string              `json:"event" default:"acknowledgementPacket"`
	Target           string              `json:"target,omitempty"`
	Packet           channeltypes.Packet `json:"packet"`
	Acknowledgement  []byte              `json:"acknowledgement"`
	Relayer          sdk.AccAddress      `json:"relayer"`
}

func (im IBCModule) OnAcknowledgementPacket(
	ctx sdk.Context,
	packet channeltypes.Packet,
	acknowledgement []byte,
	relayer sdk.AccAddress,
) error {
	event := AcknowledgementPacketEvent{
		Packet:          packet,
		Acknowledgement: acknowledgement,
		Relayer:         relayer,
	}

	err := im.impl.PushAction(ctx, event)
	if err != nil {
		return err
	}

	return nil
}

type TimeoutPacketEvent struct {
	*vm.ActionHeader `actionType:"IBC_EVENT"`
	Event            string              `json:"event" default:"timeoutPacket"`
	Target           string              `json:"target,omitempty"`
	Packet           channeltypes.Packet `json:"packet"`
	Relayer          sdk.AccAddress      `json:"relayer"`
}

func (im IBCModule) OnTimeoutPacket(
	ctx sdk.Context,
	packet channeltypes.Packet,
	relayer sdk.AccAddress,
) error {
	event := TimeoutPacketEvent{
		Packet:  packet,
		Relayer: relayer,
	}

	err := im.impl.PushAction(ctx, event)
	if err != nil {
		return err
	}

	return nil
}
