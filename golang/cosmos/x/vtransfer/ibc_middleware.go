package vtransfer

import (
	"github.com/Agoric/agoric-sdk/golang/cosmos/x/vtransfer/keeper"
	sdk "github.com/cosmos/cosmos-sdk/types"
	capabilitytypes "github.com/cosmos/cosmos-sdk/x/capability/types"
	clienttypes "github.com/cosmos/ibc-go/v6/modules/core/02-client/types"
	channeltypes "github.com/cosmos/ibc-go/v6/modules/core/04-channel/types"
	porttypes "github.com/cosmos/ibc-go/v6/modules/core/05-port/types"
	"github.com/cosmos/ibc-go/v6/modules/core/exported"
)

// IBCMiddleware (https://ibc.cosmos.network/main/ibc/apps/ibcmodule) forwards
// most of its methods to the next layer in the stack (which may be the ibc-go
// transfer application or another middleware), but hooks the packet-related
// methods and sends them to vtransferKeeper for async interception by the
// associated VM:
//
// 1. IBCModule channel handshake callbacks (OnChanOpenInit, OnChanOpenTry,
// OnChanOpenAck, and OnChanOpenConfirm)—handled by the wrapped IBCModule.
//
// 2. IBCModule channel closing callbacks (OnChanCloseInit and
// OnChanCloseConfirm)—handled by the wrapped IBCModule.
//
// 3. IBCModule packet callbacks (OnRecvPacket, OnAcknowledgementPacket, and
// OnTimeoutPacket)—intercepted by vtransfer.
//
// 4. ICS4Wrapper packet initiation methods (SendPacket, WriteAcknowledgement
// and GetAppVersion)—delegated by vtransfer to vibc.

var _ porttypes.Middleware = (*IBCMiddleware)(nil)

// IBCMiddleware implements the ICS26 callbacks for the middleware given the
// underlying IBCModule and the keeper.
type IBCMiddleware struct {
	ibcModule       porttypes.IBCModule
	vtransferKeeper keeper.Keeper
}

// NewIBCMiddleware creates a new IBCMiddleware given the underlying IBCModule and keeper.
func NewIBCMiddleware(ibcModule porttypes.IBCModule, vtransferKeeper keeper.Keeper) IBCMiddleware {
	return IBCMiddleware{
		ibcModule:       ibcModule,
		vtransferKeeper: vtransferKeeper,
	}
}

///////////////////////////////////
// The following channel handshake events are all directly forwarded to the
// wrapped IBCModule.  They are not performed in the context of a packet, and so
// do not need to be intercepted.

// OnChanOpenInit implements the IBCModule interface.
func (im IBCMiddleware) OnChanOpenInit(
	ctx sdk.Context,
	order channeltypes.Order,
	connectionHops []string,
	portID string,
	channelID string,
	chanCap *capabilitytypes.Capability,
	counterparty channeltypes.Counterparty,
	version string,
) (string, error) {
	return im.ibcModule.OnChanOpenInit(ctx, order, connectionHops, portID, channelID, chanCap, counterparty, version)
}

// OnChanOpenTry implements the IBCModule interface.
func (im IBCMiddleware) OnChanOpenTry(
	ctx sdk.Context,
	order channeltypes.Order,
	connectionHops []string,
	portID,
	channelID string,
	chanCap *capabilitytypes.Capability,
	counterparty channeltypes.Counterparty,
	counterpartyVersion string,
) (string, error) {
	return im.ibcModule.OnChanOpenTry(ctx, order, connectionHops, portID, channelID, chanCap, counterparty, counterpartyVersion)
}

// OnChanOpenAck implements the IBCModule interface.
func (im IBCMiddleware) OnChanOpenAck(
	ctx sdk.Context,
	portID,
	channelID string,
	counterpartyChannelID string,
	counterpartyVersion string,
) error {
	return im.ibcModule.OnChanOpenAck(ctx, portID, channelID, counterpartyChannelID, counterpartyVersion)
}

// OnChanOpenConfirm implements the IBCModule interface.
func (im IBCMiddleware) OnChanOpenConfirm(
	ctx sdk.Context,
	portID,
	channelID string,
) error {
	return im.ibcModule.OnChanOpenConfirm(ctx, portID, channelID)
}

// OnChanCloseInit implements the IBCModule interface.
func (im IBCMiddleware) OnChanCloseInit(
	ctx sdk.Context,
	portID,
	channelID string,
) error {
	return im.ibcModule.OnChanCloseInit(ctx, portID, channelID)
}

// OnChanCloseConfirm implements the IBCModule interface.
func (im IBCMiddleware) OnChanCloseConfirm(
	ctx sdk.Context,
	portID,
	channelID string,
) error {
	return im.ibcModule.OnChanCloseConfirm(ctx, portID, channelID)
}

///////////////////////////////////
// The following packet methods are all implemented by
// im.vtransferKeeper.Intercept*, so named because those methods are "tee"s
// combining the middleware stack with an interception of the packet event
// (On*Packet) or packet method (WriteAcknowledgment) by the async VM.

// OnRecvPacket implements the IBCModule interface.
func (im IBCMiddleware) OnRecvPacket(
	ctx sdk.Context,
	packet channeltypes.Packet,
	relayer sdk.AccAddress,
) exported.Acknowledgement {
	return im.vtransferKeeper.InterceptOnRecvPacket(ctx, im.ibcModule, packet, relayer)
}

// OnAcknowledgementPacket implements the IBCModule interface.
func (im IBCMiddleware) OnAcknowledgementPacket(
	ctx sdk.Context,
	packet channeltypes.Packet,
	acknowledgement []byte,
	relayer sdk.AccAddress,
) error {
	return im.vtransferKeeper.InterceptOnAcknowledgementPacket(ctx, im.ibcModule, packet, acknowledgement, relayer)
}

// OnTimeoutPacket implements the IBCModule interface.
func (im IBCMiddleware) OnTimeoutPacket(
	ctx sdk.Context,
	packet channeltypes.Packet,
	relayer sdk.AccAddress,
) error {
	return im.vtransferKeeper.InterceptOnTimeoutPacket(ctx, im.ibcModule, packet, relayer)
}

// WriteAcknowledgement implements the ICS4 Wrapper interface.
// Unlike implementations of IBCModule interface methods, implementations of
// ICS4 Wrapper interface methods do not pass along the wrapped IBC module
// because they support packet initiation.
func (im IBCMiddleware) WriteAcknowledgement(
	ctx sdk.Context,
	chanCap *capabilitytypes.Capability,
	packet exported.PacketI,
	ack exported.Acknowledgement,
) error {
	syncAck, origPacket := im.vtransferKeeper.InterceptWriteAcknowledgement(ctx, chanCap, packet, ack)
	if syncAck != nil {
		return im.vtransferKeeper.WriteAcknowledgement(ctx, chanCap, origPacket, syncAck)
	}
	return nil
}

///////////////////////////////////
// The following methods are directly implemented by the ICS4Wrapper outside of
// us, whether the ibc-go stack or another middleware.

// SendPacket implements the ICS4 Wrapper interface.
func (im IBCMiddleware) SendPacket(
	ctx sdk.Context,
	chanCap *capabilitytypes.Capability,
	sourcePort string,
	sourceChannel string,
	timeoutHeight clienttypes.Height,
	timeoutTimestamp uint64,
	data []byte,
) (uint64, error) {
	return im.vtransferKeeper.SendPacket(ctx, chanCap, sourcePort, sourceChannel, timeoutHeight, timeoutTimestamp, data)
}

// GetAppVersion implements the ICS4 Wrapper interface.
func (im IBCMiddleware) GetAppVersion(ctx sdk.Context, portID, channelID string) (string, bool) {
	return im.vtransferKeeper.GetAppVersion(ctx, portID, channelID)
}
