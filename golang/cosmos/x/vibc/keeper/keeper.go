package keeper

import (
	"fmt"

	storetypes "cosmossdk.io/store/types"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"

	sdkioerrors "cosmossdk.io/errors"
	capability "github.com/cosmos/ibc-go/modules/capability/types"
	clienttypes "github.com/cosmos/ibc-go/v8/modules/core/02-client/types"
	channeltypes "github.com/cosmos/ibc-go/v8/modules/core/04-channel/types"
	porttypes "github.com/cosmos/ibc-go/v8/modules/core/05-port/types"
	host "github.com/cosmos/ibc-go/v8/modules/core/24-host"
	ibcexported "github.com/cosmos/ibc-go/v8/modules/core/exported"

	"github.com/Agoric/agoric-sdk/golang/cosmos/vm"
	"github.com/Agoric/agoric-sdk/golang/cosmos/x/vibc/types"
)

var (
	_ porttypes.ICS4Wrapper = Keeper{}
	_ types.IBCModuleImpl   = Keeper{}
	_ types.ReceiverImpl    = Keeper{}
)

// Keeper maintains the link to data storage and exposes getter/setter methods for the various parts of the state machine
type Keeper struct {
	cdc codec.Codec

	channelKeeper types.ChannelKeeper
	portKeeper    types.PortKeeper

	// Filled out by `WithScope`
	scopedKeeper types.ScopedKeeper
	storeKey     storetypes.StoreKey
	pushAction   vm.ActionPusher
}

// NewKeeper creates a new vibc Keeper instance
func NewKeeper(
	cdc codec.Codec,
	channelKeeper types.ChannelKeeper,
	portKeeper types.PortKeeper,
) Keeper {

	return Keeper{
		cdc:           cdc,
		channelKeeper: channelKeeper,
		portKeeper:    portKeeper,
	}
}

// WithScope returns a new Keeper copied from the receiver, but with the given
// store key, scoped keeper, and push action.
func (k Keeper) WithScope(storeKey storetypes.StoreKey, scopedKeeper types.ScopedKeeper, pushAction vm.ActionPusher) Keeper {
	k.storeKey = storeKey
	k.scopedKeeper = scopedKeeper
	k.pushAction = pushAction
	return k
}

// PushAction sends a vm.Action to the VM controller.
func (k Keeper) PushAction(ctx sdk.Context, action vm.Action) error {
	return k.pushAction(ctx, action)
}

// GetICS4Wrapper returns the ICS4Wrapper interface for the keeper.
func (k Keeper) GetICS4Wrapper() porttypes.ICS4Wrapper {
	return k
}

// GetAppVersion defines a wrapper function for the channel Keeper's function
// in order to expose it to the vibc IBC handler.
func (k Keeper) GetAppVersion(ctx sdk.Context, portID, channelID string) (string, bool) {
	return k.channelKeeper.GetAppVersion(ctx, portID, channelID)
}

// GetChannel defines a wrapper function for the channel Keeper's function
// in order to expose it to the vibc IBC handler.
func (k Keeper) GetChannel(ctx sdk.Context, portID, channelID string) (channeltypes.Channel, bool) {
	return k.channelKeeper.GetChannel(ctx, portID, channelID)
}

// ReceiveChanOpenInit wraps the keeper's ChanOpenInit function.
func (k Keeper) ReceiveChanOpenInit(ctx sdk.Context, order channeltypes.Order, connectionHops []string,
	portID, rPortID, version string,
) error {
	capName := host.PortPath(portID)
	portCap, ok := k.GetCapability(ctx, capName)
	if !ok {
		return sdkioerrors.Wrapf(porttypes.ErrInvalidPort, "could not retrieve port capability at: %s", capName)
	}
	counterparty := channeltypes.Counterparty{
		PortId: rPortID,
	}
	channelID, chanCap, err := k.channelKeeper.ChanOpenInit(ctx, order, connectionHops, portID, portCap, counterparty, version)
	if err != nil {
		return err
	}
	chanCapName := host.ChannelCapabilityPath(portID, channelID)
	err = k.ClaimCapability(ctx, chanCap, chanCapName)
	if err != nil {
		return err
	}

	k.channelKeeper.WriteOpenInitChannel(ctx, portID, channelID, order, connectionHops, counterparty, version)
	return nil
}

// ReceiveSendPacket wraps the keeper's SendPacket function.
func (k Keeper) ReceiveSendPacket(ctx sdk.Context, packet ibcexported.PacketI) (uint64, error) {
	sourcePort := packet.GetSourcePort()
	sourceChannel := packet.GetSourceChannel()
	timeoutHeight := packet.GetTimeoutHeight()
	timeoutRevisionNumber := timeoutHeight.GetRevisionNumber()
	timeoutRevisionHeight := timeoutHeight.GetRevisionHeight()
	clientTimeoutHeight := clienttypes.NewHeight(timeoutRevisionNumber, timeoutRevisionHeight)
	timeoutTimestamp := packet.GetTimeoutTimestamp()
	data := packet.GetData()

	capName := host.ChannelCapabilityPath(sourcePort, sourceChannel)
	chanCap, ok := k.GetCapability(ctx, capName)
	if !ok {
		return 0, sdkioerrors.Wrapf(channeltypes.ErrChannelCapabilityNotFound, "could not retrieve channel capability at: %s", capName)
	}
	return k.SendPacket(ctx, chanCap, sourcePort, sourceChannel, clientTimeoutHeight, timeoutTimestamp, data)
}

// SendPacket defines a wrapper function for the channel Keeper's function
// in order to expose it to the vibc IBC handler.
func (k Keeper) SendPacket(
	ctx sdk.Context,
	chanCap *capability.Capability,
	sourcePort string,
	sourceChannel string,
	timeoutHeight clienttypes.Height,
	timeoutTimestamp uint64,
	data []byte,
) (uint64, error) {
	return k.channelKeeper.SendPacket(ctx, chanCap, sourcePort, sourceChannel, timeoutHeight, timeoutTimestamp, data)
}

// ReceiveWriteAcknowledgement wraps the keeper's WriteAcknowledgment function.
func (k Keeper) ReceiveWriteAcknowledgement(ctx sdk.Context, packet ibcexported.PacketI, ack ibcexported.Acknowledgement) error {
	portID := packet.GetDestPort()
	channelID := packet.GetDestChannel()
	capName := host.ChannelCapabilityPath(portID, channelID)
	chanCap, ok := k.GetCapability(ctx, capName)
	if !ok {
		return sdkioerrors.Wrapf(channeltypes.ErrChannelCapabilityNotFound, "could not retrieve channel capability at: %s", capName)
	}
	return k.WriteAcknowledgement(ctx, chanCap, packet, ack)
}

// WriteAcknowledgement defines a wrapper function for the channel Keeper's function
// in order to expose it to the vibc IBC handler.
func (k Keeper) WriteAcknowledgement(ctx sdk.Context, chanCap *capability.Capability, packet ibcexported.PacketI, ack ibcexported.Acknowledgement) error {
	return k.channelKeeper.WriteAcknowledgement(ctx, chanCap, packet, ack)
}

// ReceiveWriteOpenTryChannel wraps the keeper's WriteOpenTryChannel function.
func (k Keeper) ReceiveWriteOpenTryChannel(ctx sdk.Context, packet ibcexported.PacketI, order channeltypes.Order, connectionHops []string, version string) error {
	portID := packet.GetDestPort()
	channelID := packet.GetDestChannel()
	counterparty := channeltypes.NewCounterparty(packet.GetSourcePort(), packet.GetSourceChannel())
	k.WriteOpenTryChannel(ctx, portID, channelID, order, connectionHops, counterparty, version)
	return nil
}

// WriteOpenTryChannel is a wrapper function for the channel Keeper's function
func (k Keeper) WriteOpenTryChannel(ctx sdk.Context, portID, channelID string, order channeltypes.Order,
	connectionHops []string, counterparty channeltypes.Counterparty, version string) {
	k.channelKeeper.WriteOpenTryChannel(ctx, portID, channelID, order, connectionHops, counterparty, version)
}

// ReceiveChanCloseInit is a wrapper function for the channel Keeper's function
// in order to expose it to the vibc IBC handler.
func (k Keeper) ReceiveChanCloseInit(ctx sdk.Context, portID, channelID string) error {
	capName := host.ChannelCapabilityPath(portID, channelID)
	chanCap, ok := k.GetCapability(ctx, capName)
	if !ok {
		return sdkioerrors.Wrapf(channeltypes.ErrChannelCapabilityNotFound, "could not retrieve channel capability at: %s", capName)
	}
	err := k.channelKeeper.ChanCloseInit(ctx, portID, channelID, chanCap)
	if err != nil {
		return err
	}
	return nil
}

// ReceiveBindPort is a wrapper function for the port Keeper's function in order
// to expose it to the vibc IBC handler.
func (k Keeper) ReceiveBindPort(ctx sdk.Context, portID string) error {
	portPath := host.PortPath(portID)
	_, ok := k.GetCapability(ctx, portPath)
	if ok {
		return fmt.Errorf("port %s is already bound", portID)
	}
	cap := k.portKeeper.BindPort(ctx, portID)
	return k.ClaimCapability(ctx, cap, portPath)
}

// ReceiveTimeoutExecuted is a wrapper function for the channel Keeper's
// function in order to expose it to the vibc IBC handler.
func (k Keeper) ReceiveTimeoutExecuted(ctx sdk.Context, packet ibcexported.PacketI) error {
	portID := packet.GetSourcePort()
	channelID := packet.GetSourceChannel()
	capName := host.ChannelCapabilityPath(portID, channelID)
	chanCap, ok := k.GetCapability(ctx, capName)
	if !ok {
		return sdkioerrors.Wrapf(channeltypes.ErrChannelCapabilityNotFound, "could not retrieve channel capability at: %s", capName)
	}
	return k.channelKeeper.TimeoutExecuted(ctx, chanCap, packet)
}

// ClaimCapability allows the vibc module to claim a capability that IBC module
// passes to it.
func (k Keeper) ClaimCapability(ctx sdk.Context, cap *capability.Capability, name string) error {
	return k.scopedKeeper.ClaimCapability(ctx, cap, name)
}

// GetCapability allows the vibc module to retrieve a capability.
func (k Keeper) GetCapability(ctx sdk.Context, name string) (*capability.Capability, bool) {
	return k.scopedKeeper.GetCapability(ctx, name)
}
