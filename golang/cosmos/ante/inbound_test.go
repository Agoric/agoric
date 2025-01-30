package ante

import (
	"context"
	"fmt"
	"reflect"
	"testing"

	sdkmath "cosmossdk.io/math"
	swingtypes "github.com/Agoric/agoric-sdk/golang/cosmos/x/swingset/types"
	"github.com/cosmos/cosmos-sdk/codec/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/tx"
	banktypes "github.com/cosmos/cosmos-sdk/x/bank/types"
	"github.com/cosmos/gogoproto/proto"
	protov2 "google.golang.org/protobuf/proto"
)

func TestInboundAnteHandle(t *testing.T) {
	for _, tt := range []struct {
		name                  string
		checkTx               bool
		tx                    sdk.Tx
		simulate              bool
		inboundQueueLength    int32
		inboundQueueLengthErr error
		inboundLimit          int32
		mempoolLimit          int32
		errMsg                string
		isHighPriorityOwner   bool
	}{
		{
			name: "empty-empty",
			tx:   makeTestTx(),
		},
		{
			name:   "reject-on-zero-allowed",
			tx:     makeTestTx(&swingtypes.MsgDeliverInbound{}),
			errMsg: ErrInboundQueueFull.Error(),
		},
		{
			name:               "has-room",
			tx:                 makeTestTx(&swingtypes.MsgInstallBundle{}),
			inboundLimit:       10,
			inboundQueueLength: 8,
		},
		{
			name:               "at-limit",
			tx:                 makeTestTx(&swingtypes.MsgInstallBundle{}),
			inboundLimit:       10,
			inboundQueueLength: 9,
		},
		{
			name:               "no-room",
			tx:                 makeTestTx(&swingtypes.MsgProvision{}),
			inboundLimit:       10,
			inboundQueueLength: 10,
			errMsg:             ErrInboundQueueFull.Error(),
		},
		{
			name:                  "state-lookup-error",
			tx:                    makeTestTx(&swingtypes.MsgWalletAction{}, &swingtypes.MsgWalletSpendAction{}),
			inboundLimit:          10,
			inboundQueueLengthErr: fmt.Errorf("sunspots"),
			errMsg:                "sunspots",
		},
		{
			name:         "allow-non-swingset-msgs",
			tx:           makeTestTx(&banktypes.MsgSend{}, &banktypes.MsgSend{}),
			inboundLimit: 1,
		},
		{
			name:                  "lazy-queue-length-lookup",
			tx:                    makeTestTx(&banktypes.MsgSend{}, &banktypes.MsgSend{}),
			inboundLimit:          1,
			inboundQueueLengthErr: fmt.Errorf("sunspots"),
		},
		{
			name:               "checktx",
			checkTx:            true,
			tx:                 makeTestTx(&swingtypes.MsgDeliverInbound{}),
			inboundLimit:       10,
			mempoolLimit:       5,
			inboundQueueLength: 7,
			errMsg:             ErrInboundQueueFull.Error(),
		},
		{
			name:         "empty-queue-allowed",
			tx:           makeTestTx(&swingtypes.MsgInstallBundle{}),
			inboundLimit: -1,
			errMsg:       ErrInboundQueueFull.Error(),
		},
		{
			name:               "already-full",
			tx:                 makeTestTx(&swingtypes.MsgProvision{}),
			inboundLimit:       10,
			inboundQueueLength: 10,
			errMsg:             ErrInboundQueueFull.Error(),
		},
		{
			name:               "max-per-tx",
			tx:                 makeTestTx(&swingtypes.MsgWalletAction{}, &swingtypes.MsgWalletSpendAction{}),
			inboundLimit:       10,
			inboundQueueLength: 5,
			errMsg:             ErrInboundQueueFull.Error(),
		},
		{
			name:                "priority-limit-bypass",
			tx:                  makeTestTx(&swingtypes.MsgWalletSpendAction{}),
			isHighPriorityOwner: true,
		},
		{
			name:                "priority-multi-bypass",
			tx:                  makeTestTx(&swingtypes.MsgWalletSpendAction{}, &swingtypes.MsgWalletSpendAction{}),
			isHighPriorityOwner: true,
		},
		{
			name:                "mixed-priority-limit-first-fail",
			tx:                  makeTestTx(&swingtypes.MsgWalletSpendAction{}, &swingtypes.MsgProvision{}),
			isHighPriorityOwner: true,
			inboundLimit:        1,
			errMsg:              ErrInboundQueueFull.Error(),
		},
		{
			name:                "mixed-priority-limit-last-succeed",
			tx:                  makeTestTx(&swingtypes.MsgProvision{}, &swingtypes.MsgWalletSpendAction{}),
			isHighPriorityOwner: true,
			inboundLimit:        1,
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			ctx := sdk.Context{}.WithContext(context.Background()).WithIsCheckTx(tt.checkTx)
			emptyQueueAllowed := false
			if tt.inboundLimit == -1 {
				emptyQueueAllowed = true
			}
			mock := mockSwingsetKeeper{
				inboundQueueLength:    tt.inboundQueueLength,
				inboundQueueLengthErr: tt.inboundQueueLengthErr,
				inboundLimit:          tt.inboundLimit,
				mempoolLimit:          tt.mempoolLimit,
				emptyQueueAllowed:     emptyQueueAllowed,
				isHighPriorityOwner:   tt.isHighPriorityOwner,
			}
			decorator := NewInboundDecorator(mock)
			newCtx, err := decorator.AnteHandle(ctx, tt.tx, tt.simulate, nilAnteHandler)
			if !reflect.DeepEqual(newCtx, ctx) {
				t.Errorf("want ctx %v, got %v", ctx, newCtx)
			}
			if err != nil {
				if tt.errMsg == "" {
					t.Errorf("want no error, got %s", err.Error())
				} else if err.Error() != tt.errMsg {
					t.Errorf("want error %s, got %s", tt.errMsg, err.Error())
				}
			} else if tt.errMsg != "" {
				t.Errorf("want error %s, got none", tt.errMsg)
			}
		})
	}
}

type testTx struct {
	tx.Tx
}

func (tx testTx) GetMsgsV2() ([]protov2.Message, error) { return nil, nil }

func makeTestTx(msgs ...proto.Message) sdk.Tx {
	wrappedMsgs := make([]*types.Any, len(msgs))
	for i, m := range msgs {
		any, err := types.NewAnyWithValue(m)
		if err != nil {
			panic(err)
		}
		wrappedMsgs[i] = any
	}
	return &testTx{
		Tx: tx.Tx{
			Body: &tx.TxBody{
				Messages: wrappedMsgs,
			},
		},
	}
}

func nilAnteHandler(ctx sdk.Context, tx sdk.Tx, simulate bool) (newCtx sdk.Context, err error) {
	return ctx, nil
}

type mockSwingsetKeeper struct {
	inboundQueueLength    int32
	inboundQueueLengthErr error
	inboundLimit          int32
	mempoolLimit          int32
	emptyQueueAllowed     bool
	isHighPriorityOwner   bool
}

var _ SwingsetKeeper = mockSwingsetKeeper{}
var _ swingtypes.SwingSetKeeper = mockSwingsetKeeper{}

func (msk mockSwingsetKeeper) InboundQueueLength(ctx sdk.Context) (int32, error) {
	return msk.inboundQueueLength, msk.inboundQueueLengthErr
}

func (msk mockSwingsetKeeper) GetState(ctx sdk.Context) (swingtypes.State, error) {
	if msk.emptyQueueAllowed {
		return swingtypes.State{}, nil
	}
	return swingtypes.State{
		QueueAllowed: []swingtypes.QueueSize{
			swingtypes.NewQueueSize(swingtypes.QueueInbound, msk.inboundLimit),
			swingtypes.NewQueueSize(swingtypes.QueueInboundMempool, msk.mempoolLimit),
		},
	}, nil
}

func (msk mockSwingsetKeeper) IsHighPriorityAddress(ctx sdk.Context, addr sdk.AccAddress) (bool, error) {
	return msk.isHighPriorityOwner, nil
}

func (msk mockSwingsetKeeper) GetBeansPerUnit(ctx sdk.Context) map[string]sdkmath.Uint {
	return nil
}

func (msk mockSwingsetKeeper) ChargeBeans(ctx sdk.Context, beansPerUnit map[string]sdkmath.Uint, addr sdk.AccAddress, beans sdkmath.Uint) error {
	return fmt.Errorf("not implemented")
}

func (msk mockSwingsetKeeper) GetSmartWalletState(ctx sdk.Context, addr sdk.AccAddress) (swingtypes.SmartWalletState, error) {
	panic(fmt.Errorf("not implemented"))
}

func (msk mockSwingsetKeeper) ChargeForSmartWallet(ctx sdk.Context, beansPerUnit map[string]sdkmath.Uint, addr sdk.AccAddress) error {
	return fmt.Errorf("not implemented")
}
