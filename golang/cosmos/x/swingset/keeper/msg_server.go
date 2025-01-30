package keeper

import (
	"context"

	"github.com/Agoric/agoric-sdk/golang/cosmos/vm"
	"github.com/Agoric/agoric-sdk/golang/cosmos/x/swingset/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

type msgServer struct {
	Keeper
}

// NewMsgServerImpl returns an implementation of the bank MsgServer interface
// for the provided Keeper.
func NewMsgServerImpl(keeper Keeper) types.MsgServer {
	return &msgServer{Keeper: keeper}
}

var _ types.MsgServer = msgServer{}

type deliverInboundAction struct {
	*vm.ActionHeader `actionType:"DELIVER_INBOUND"`
	Peer             string          `json:"peer"`
	Messages         [][]interface{} `json:"messages"`
	Ack              uint64          `json:"ack"`
}

func (keeper msgServer) routeAction(ctx sdk.Context, msg vm.ControllerAdmissionMsg, action vm.Action) error {
	isHighPriority, err := msg.IsHighPriority(ctx, keeper)
	if err != nil {
		return err
	}

	if isHighPriority {
		return keeper.PushHighPriorityAction(ctx, action)
	} else {
		return keeper.PushAction(ctx, action)
	}
}

func (keeper msgServer) DeliverInbound(goCtx context.Context, msg *types.MsgDeliverInbound) (*types.MsgDeliverInboundResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	// msg.Nums and msg.Messages must be zipped into an array of [num, message] pairs.
	messages := make([][]interface{}, len(msg.Messages))
	for i, message := range msg.Messages {
		messages[i] = []interface{}{msg.Nums[i], message}
	}
	action := deliverInboundAction{
		Peer:     msg.Submitter.String(),
		Messages: messages,
		Ack:      msg.Ack,
	}

	err := keeper.routeAction(ctx, msg, action)
	// fmt.Fprintln(os.Stderr, "Returned from SwingSet", out, err)
	if err != nil {
		return nil, err
	}
	return &types.MsgDeliverInboundResponse{}, nil
}

type walletAction struct {
	*vm.ActionHeader `actionType:"WALLET_ACTION"`
	Owner            string `json:"owner"`
	Action           string `json:"action"`
}

func (keeper msgServer) WalletAction(goCtx context.Context, msg *types.MsgWalletAction) (*types.MsgWalletActionResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	err := keeper.provisionIfNeeded(ctx, msg.Owner)
	if err != nil {
		return nil, err
	}

	action := walletAction{
		Owner:  msg.Owner.String(),
		Action: msg.Action,
	}
	// fmt.Fprintf(os.Stderr, "Context is %+v\n", ctx)

	err = keeper.routeAction(ctx, msg, action)
	// fmt.Fprintln(os.Stderr, "Returned from SwingSet", out, err)
	if err != nil {
		return nil, err
	}
	return &types.MsgWalletActionResponse{}, nil
}

type walletSpendAction struct {
	*vm.ActionHeader `actionType:"WALLET_SPEND_ACTION"`
	Owner            string `json:"owner"`
	SpendAction      string `json:"spendAction"`
}

func (keeper msgServer) WalletSpendAction(goCtx context.Context, msg *types.MsgWalletSpendAction) (*types.MsgWalletSpendActionResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	err := keeper.provisionIfNeeded(ctx, msg.Owner)
	if err != nil {
		return nil, err
	}

	action := walletSpendAction{
		Owner:       msg.Owner.String(),
		SpendAction: msg.SpendAction,
	}
	// fmt.Fprintf(os.Stderr, "Context is %+v\n", ctx)
	err = keeper.routeAction(ctx, msg, action)
	if err != nil {
		return nil, err
	}
	return &types.MsgWalletSpendActionResponse{}, nil
}

type provisionAction struct {
	*vm.ActionHeader `actionType:"PLEASE_PROVISION"`
	*types.MsgProvision
	AutoProvision bool `json:"autoProvision"`
}

// provisionIfNeeded generates a provision action if no smart wallet is already
// provisioned for the account. This assumes that all messages for
// non-provisioned smart wallets allowed by the admission AnteHandler should
// auto-provision the smart wallet.
func (keeper msgServer) provisionIfNeeded(ctx sdk.Context, owner sdk.AccAddress) error {
	// We need to generate a provision action until the smart wallet has
	// been fully provisioned by the controller. This is because a provision is
	// not guaranteed to succeed (e.g. lack of provision pool funds)
	walletState, err := keeper.GetSmartWalletState(ctx, owner)
	if err != nil {
		return err
	}
	if walletState == types.SmartWalletStateProvisioned {
		return nil
	}

	msg := &types.MsgProvision{
		Address:    owner,
		Submitter:  owner,
		PowerFlags: []string{types.PowerFlagSmartWallet},
	}

	action := provisionAction{
		MsgProvision:  msg,
		AutoProvision: true,
	}

	err = keeper.routeAction(ctx, msg, action)
	// fmt.Fprintln(os.Stderr, "Returned from SwingSet", out, err)
	if err != nil {
		return err
	}

	return nil
}

func (keeper msgServer) Provision(goCtx context.Context, msg *types.MsgProvision) (*types.MsgProvisionResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	err := keeper.ChargeForProvisioning(ctx, msg.Submitter, msg.Address, msg.PowerFlags)
	if err != nil {
		return nil, err
	}

	action := provisionAction{
		MsgProvision: msg,
	}

	// Create the account, if it doesn't already exist.
	egress := types.NewEgress(msg.Nickname, msg.Address, msg.PowerFlags)
	err = keeper.SetEgress(ctx, egress)
	if err != nil {
		return nil, err
	}

	err = keeper.routeAction(ctx, msg, action)
	// fmt.Fprintln(os.Stderr, "Returned from SwingSet", out, err)
	if err != nil {
		return nil, err
	}

	return &types.MsgProvisionResponse{}, nil
}

type installBundleAction struct {
	*vm.ActionHeader `actionType:"INSTALL_BUNDLE"`
	*types.MsgInstallBundle
}

func (keeper msgServer) InstallBundle(goCtx context.Context, msg *types.MsgInstallBundle) (*types.MsgInstallBundleResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	err := msg.Uncompress()
	if err != nil {
		return nil, err
	}
	action := installBundleAction{
		MsgInstallBundle: msg,
	}

	err = keeper.routeAction(ctx, msg, action)
	// fmt.Fprintln(os.Stderr, "Returned from SwingSet", out, err)
	if err != nil {
		return nil, err
	}

	return &types.MsgInstallBundleResponse{}, nil
}
