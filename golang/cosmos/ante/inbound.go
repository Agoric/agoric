package ante

import (
	"github.com/cosmos/cosmos-sdk/telemetry"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/hashicorp/go-metrics"

	"github.com/Agoric/agoric-sdk/golang/cosmos/vm"
	swingtypes "github.com/Agoric/agoric-sdk/golang/cosmos/x/swingset/types"
)

/*
This AnteDecorator enforces a limit on the size of the Swingset inbound queue
by scanning for Cosmos-messages which end up on Swingset's message queues. Note
that when running DeliverTx, inbound messages are placed in either the
actionQueue or the highPriorityQueue (forming the Swingset inbound queue),
and kept there until processed by SwingSet. Previous Txs in the block will have
already been added to the inbound queue, so we must reject Txs which would grow
the actionQueue beyond the allowed inbound size. Additions to the
highPriorityQueue are exempt of inbound queue size checks but count towards the
overall inbound queue size, which means the inbound queue can "overflow" its
limits when adding high priority actions.

We would like to reject messages during mempool admission (CheckTx)
rather than during block execution (DeliverTx), but at CheckTx time
we don't know how many messages will be allowed at DeliverTx time,
nor the size of the inbound queue from preceding Txs in the block.
To mitigate this, x/swingset implements an hysteresis by computing
the number of messages allowed for mempool admission as if its max
queue length was lower (e.g. 50%). This is the QueueInboundMempool
entry in the Swingset state QueueAllowed field. At DeliverTx time
the QueueInbound entry gives the number of allowed messages.
*/

const (
	maxInboundPerTx = 1
)

// TODO: We don't have a more appropriate error type for this.
var ErrInboundQueueFull = sdkerrors.ErrMempoolIsFull

// inboundAnte is an sdk.AnteDecorator which enforces the allowed size of the inbound queue.
type inboundAnte struct {
	sk SwingsetKeeper
}

// NewInboundDecorator returns an AnteDecorator which honors the allowed size of the inbound queue.
func NewInboundDecorator(sk SwingsetKeeper) sdk.AnteDecorator {
	return inboundAnte{sk: sk}
}

// AnteHandle implements sdk.AnteDecorator.
// Lazily consults the Swingset state to avoid overhead when dealing
// with pure Cosmos-level Txs.
func (ia inboundAnte) AnteHandle(ctx sdk.Context, tx sdk.Tx, simulate bool, next sdk.AnteHandler) (sdk.Context, error) {
	msgs := tx.GetMsgs()
	inboundsAllowed := int32(-1)
	for _, msg := range msgs {
		inbounds := inboundMessages(msg)
		if inbounds == 0 {
			continue
		}
		if inboundsAllowed == -1 {
			var err error
			inboundsAllowed, err = ia.allowedInbound(ctx)
			if err != nil {
				return ctx, err
			}
		}
		isHighPriority, err := ia.isPriorityMessage(ctx, msg)
		if err != nil {
			return ctx, err
		}
		if inboundsAllowed >= inbounds {
			inboundsAllowed -= inbounds
		} else if isHighPriority {
			inboundsAllowed = 0
		} else {
			defer func() {
				telemetry.IncrCounterWithLabels(
					[]string{"tx", "ante", "inbound_not_allowed"},
					1,
					[]metrics.Label{
						telemetry.NewLabel("msg", sdk.MsgTypeURL(msg)),
					},
				)
			}()
			return ctx, ErrInboundQueueFull
		}
	}
	return next(ctx, tx, simulate)
}

func (ia inboundAnte) isPriorityMessage(ctx sdk.Context, msg sdk.Msg) (bool, error) {
	if c, ok := msg.(vm.ControllerAdmissionMsg); ok {
		return c.IsHighPriority(ctx, ia.sk)
	}
	return false, nil
}

// allowedInbound returns the allowed number of inbound queue messages or an error.
// Look up the limit from the swingset state queue sizes: from QueueInboundMempool
// if we're running CheckTx (for the hysteresis described above), otherwise QueueAllowed.
func (ia inboundAnte) allowedInbound(ctx sdk.Context) (int32, error) {
	state, err := ia.sk.GetState(ctx)
	if err != nil {
		return 0, err
	}
	entry := swingtypes.QueueInbound
	if ctx.IsCheckTx() {
		entry = swingtypes.QueueInboundMempool
	}
	allowed, found := swingtypes.QueueSizeEntry(state.QueueAllowed, entry)
	if !found {
		// if number of allowed entries not given, fail closed
		return 0, nil
	}
	actions, err := ia.sk.InboundQueueLength(ctx)
	if err != nil {
		return 0, err
	}
	if actions >= allowed {
		return 0, nil
	}
	allowed -= actions
	if allowed > maxInboundPerTx {
		return maxInboundPerTx, nil
	}
	return allowed, nil
}

// inboundMessages returns the nunber of inbound queue messages in msg.
func inboundMessages(msg sdk.Msg) int32 {
	if c, ok := msg.(vm.ControllerAdmissionMsg); ok {
		return c.GetInboundMsgCount()
	}
	return 0
}
