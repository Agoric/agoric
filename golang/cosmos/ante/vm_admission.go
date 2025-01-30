package ante

import (
	sdkioerrors "cosmossdk.io/errors"
	"github.com/cosmos/cosmos-sdk/telemetry"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/hashicorp/go-metrics"

	"github.com/Agoric/agoric-sdk/golang/cosmos/vm"
)

// TODO: We don't have a more appropriate error type for this.
var ErrAdmissionRefused = sdkerrors.ErrMempoolIsFull

// AdmissionDecorator will ask the Controller (such as SwingSet) if it is
// temporarily rejecting inbound messages.  If CheckAdmissibility passes for all
// messages, decorator calls next AnteHandler in chain.
type AdmissionDecorator struct {
	data interface{}
}

func NewAdmissionDecorator(data interface{}) AdmissionDecorator {
	return AdmissionDecorator{data: data}
}

// AnteHandle calls CheckAdmissibility for all messages that implement the
// vm.ControllerAdmissionMsg interface.  If it returns an error, refuse the
// entire transaction.
func (ad AdmissionDecorator) AnteHandle(ctx sdk.Context, tx sdk.Tx, simulate bool, next sdk.AnteHandler) (sdk.Context, error) {
	msgs := tx.GetMsgs()
	errors := make([]error, 0, len(msgs))

	// Ask the controller if we are rejecting messages.
	for _, msg := range tx.GetMsgs() {
		if camsg, ok := msg.(vm.ControllerAdmissionMsg); ok {
			if err := camsg.CheckAdmissibility(ctx, ad.data); err != nil {
				// Only let admission errors interrupt the transaction if we're not
				// simulating, otherwise our gas estimation will be too low.
				if !simulate {
					errors = append(errors, err)
					defer func(msg sdk.Msg) {
						telemetry.IncrCounterWithLabels(
							[]string{"tx", "ante", "admission_refused"},
							1,
							[]metrics.Label{
								telemetry.NewLabel("msg", sdk.MsgTypeURL(msg)),
							},
						)
					}(msg)
				}
			}
		}
	}

	numErrors := len(errors)
	if numErrors > 0 {
		// Add to instrumentation.

		return ctx, sdkioerrors.Wrapf(ErrAdmissionRefused, "controller refused message admission: %s", errors[0].Error())
	}

	return next(ctx, tx, simulate)
}
