package types

import (
	context "context"

	sdkmath "cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

type SmartWalletState uint8

const (
	SmartWalletStateUnspecified SmartWalletState = iota
	SmartWalletStateNone
	SmartWalletStatePending
	SmartWalletStateProvisioned
)

type AccountKeeper interface {
	GetAccount(ctx context.Context, addr sdk.AccAddress) sdk.AccountI
	NewAccountWithAddress(ctx context.Context, addr sdk.AccAddress) sdk.AccountI
	SetAccount(ctx context.Context, acc sdk.AccountI)
}

type SwingSetKeeper interface {
	GetBeansPerUnit(ctx sdk.Context) map[string]sdkmath.Uint
	ChargeBeans(ctx sdk.Context, beansPerUnit map[string]sdkmath.Uint, addr sdk.AccAddress, beans sdkmath.Uint) error
	IsHighPriorityAddress(ctx sdk.Context, addr sdk.AccAddress) (bool, error)
	GetSmartWalletState(ctx sdk.Context, addr sdk.AccAddress) (SmartWalletState, error)
	ChargeForSmartWallet(ctx sdk.Context, beansPerUnit map[string]sdkmath.Uint, addr sdk.AccAddress) error
}
