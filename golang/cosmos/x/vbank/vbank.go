package vbank

import (
	"context"
	"encoding/json"
	"fmt"
	stdlog "log"
	"sort"

	sdkmath "cosmossdk.io/math"
	"github.com/Agoric/agoric-sdk/golang/cosmos/vm"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

type portHandler struct {
	am     AppModule
	keeper Keeper
}

type portMessage struct { // comes from swingset's vat-bank
	Type       string `json:"type"` // VBANK_*
	Address    string `json:"address"`
	Recipient  string `json:"recipient"`
	Sender     string `json:"sender"`
	ModuleName string `json:"moduleName"`
	Denom      string `json:"denom"`
	Amount     string `json:"amount"`
}

func NewPortHandler(am AppModule, keeper Keeper) portHandler {
	return portHandler{
		am:     am,
		keeper: keeper,
	}
}

type VbankSingleBalanceUpdate struct {
	Address string `json:"address"`
	Denom   string `json:"denom"`
	Amount  string `json:"amount"`
}

// Make vbankManyBalanceUpdates sortable
type vbankManyBalanceUpdates []VbankSingleBalanceUpdate

var _ sort.Interface = vbankManyBalanceUpdates{}

func (vbu vbankManyBalanceUpdates) Len() int {
	return len(vbu)
}

func (vbu vbankManyBalanceUpdates) Less(i int, j int) bool {
	if vbu[i].Address < vbu[j].Address {
		return true
	} else if vbu[i].Address > vbu[j].Address {
		return false
	}
	if vbu[i].Denom < vbu[j].Denom {
		return true
	} else if vbu[i].Denom > vbu[j].Denom {
		return false
	}
	return vbu[i].Amount < vbu[j].Amount
}

func (vbu vbankManyBalanceUpdates) Swap(i int, j int) {
	vbu[i], vbu[j] = vbu[j], vbu[i]
}

type VbankBalanceUpdate struct {
	*vm.ActionHeader `actionType:"VBANK_BALANCE_UPDATE"`
	Nonce            uint64                  `json:"nonce"`
	Updated          vbankManyBalanceUpdates `json:"updated"`
}

// getBalanceUpdate returns a bridge message containing the current bank balance
// for the given addresses each for the specified denominations. Coins are used
// only to track the set of denoms, not for the particular nonzero amounts.
func getBalanceUpdate(ctx sdk.Context, keeper Keeper, addressToUpdate map[string]sdk.Coins) vm.Action {
	nentries := len(addressToUpdate)
	if nentries == 0 {
		return nil
	}

	nonce, _ := keeper.GetNextSequence(ctx)
	event := VbankBalanceUpdate{
		Nonce:   nonce,
		Updated: make([]VbankSingleBalanceUpdate, 0, nentries),
	}

	// Note that Golang randomises the order of iteration, so we have to sort
	// below to be deterministic.
	for address, coins := range addressToUpdate {
		account, err := sdk.AccAddressFromBech32(address)
		if err != nil {
			stdlog.Println("Cannot parse address for vbank update", address)
			continue
		}
		for _, coin := range coins {
			// generate an update even when the current balance is zero
			balance := keeper.GetBalance(ctx, account, coin.Denom)
			update := VbankSingleBalanceUpdate{
				Address: address,
				Denom:   coin.Denom,
				Amount:  balance.Amount.String(),
			}
			event.Updated = append(event.Updated, update)
		}
	}

	// Ensure we have a deterministic order of updates.
	sort.Sort(event.Updated)

	// Populate the event default fields (even though event does not embed vm.ActionHeader)
	return vm.PopulateAction(ctx, event)
}

func marshal(event vm.Jsonable) ([]byte, error) {
	if event == nil {
		return nil, nil
	}
	return json.Marshal(event)
}

func (ch portHandler) Receive(cctx context.Context, str string) (ret string, err error) {
	// fmt.Println("vbank.go downcall", str)
	ctx := sdk.UnwrapSDKContext(cctx)
	keeper := ch.keeper

	var msg portMessage
	err = json.Unmarshal([]byte(str), &msg)
	if err != nil {
		return ret, err
	}

	switch msg.Type {
	case "VBANK_GET_BALANCE":
		addr, err := sdk.AccAddressFromBech32(msg.Address)
		if err != nil {
			return "", fmt.Errorf("cannot convert %s to address: %s", msg.Address, err)
		}
		if err = sdk.ValidateDenom(msg.Denom); err != nil {
			return "", fmt.Errorf("invalid denom %s: %s", msg.Denom, err)
		}
		coin := keeper.GetBalance(ctx, addr, msg.Denom)
		packet := coin.Amount.String()
		bytes, err := json.Marshal(&packet)
		if err == nil {
			ret = string(bytes)
		}

	case "VBANK_GRAB":
		addr, err := sdk.AccAddressFromBech32(msg.Sender)
		if err != nil {
			return "", fmt.Errorf("cannot convert %s to address: %s", msg.Sender, err)
		}
		if err = sdk.ValidateDenom(msg.Denom); err != nil {
			return "", fmt.Errorf("invalid denom %s: %s", msg.Denom, err)
		}
		value, ok := sdkmath.NewIntFromString(msg.Amount)
		if !ok {
			return "", fmt.Errorf("cannot convert %s to int", msg.Amount)
		}
		coins := sdk.NewCoins(sdk.NewCoin(msg.Denom, value))
		if err := keeper.GrabCoins(ctx, addr, coins); err != nil {
			return "", fmt.Errorf("cannot grab %s coins: %s", coins.Sort().String(), err)
		}
		addressToBalances := make(map[string]sdk.Coins, 1)
		addressToBalances[msg.Sender] = sdk.NewCoins(sdk.NewInt64Coin(msg.Denom, 1))
		bz, err := marshal(getBalanceUpdate(ctx, keeper, addressToBalances))
		if err != nil {
			return "", err
		}
		if bz == nil {
			ret = "true"
		} else {
			ret = string(bz)
		}

	case "VBANK_GIVE":
		addr, err := sdk.AccAddressFromBech32(msg.Recipient)
		if err != nil {
			return "", fmt.Errorf("cannot convert %s to address: %s", msg.Recipient, err)
		}
		if err = sdk.ValidateDenom(msg.Denom); err != nil {
			return "", fmt.Errorf("invalid denom %s: %s", msg.Denom, err)
		}
		value, ok := sdkmath.NewIntFromString(msg.Amount)
		if !ok {
			return "", fmt.Errorf("cannot convert %s to int", msg.Amount)
		}
		coins := sdk.NewCoins(sdk.NewCoin(msg.Denom, value))
		if err := keeper.SendCoins(ctx, addr, coins); err != nil {
			return "", fmt.Errorf("cannot give %s coins: %s", coins.Sort().String(), err)
		}
		addressToBalances := make(map[string]sdk.Coins, 1)
		addressToBalances[msg.Recipient] = sdk.NewCoins(sdk.NewInt64Coin(msg.Denom, 1))
		bz, err := marshal(getBalanceUpdate(ctx, keeper, addressToBalances))
		if err != nil {
			return "", err
		}
		if bz == nil {
			ret = "true"
		} else {
			ret = string(bz)
		}

	case "VBANK_GIVE_TO_REWARD_DISTRIBUTOR":
		value, ok := sdkmath.NewIntFromString(msg.Amount)
		if !ok {
			return "", fmt.Errorf("cannot convert %s to int", msg.Amount)
		}
		coins := sdk.NewCoins(sdk.NewCoin(msg.Denom, value))
		if err := keeper.StoreRewardCoins(ctx, coins); err != nil {
			return "", fmt.Errorf("cannot store reward %s coins: %s", coins.Sort().String(), err)
		}
		state, err := keeper.GetState(ctx)
		if err != nil {
			return "", err
		}
		state.RewardPool = state.RewardPool.Add(coins...)
		keeper.SetState(ctx, state)
		// We don't supply the module balance, since the controller shouldn't know.
		ret = "true"

	case "VBANK_GET_MODULE_ACCOUNT_ADDRESS":
		addr := keeper.GetModuleAccountAddress(ctx, msg.ModuleName).String()
		if len(addr) == 0 {
			return "", fmt.Errorf("module account %s not found", msg.ModuleName)
		}
		bz, err := marshal(addr)
		if err != nil {
			return "", err
		}
		ret = string(bz)

	default:
		err = fmt.Errorf("unrecognized type %s", msg.Type)
	}

	// fmt.Println("vbank.go downcall reply", ret, err)
	return
}

func (am AppModule) PushAction(ctx sdk.Context, action vm.Action) error {
	// vbank actions are not triggered by a swingset message in a transaction, so we need to
	// synthesize unique context information.
	// We use a fixed placeholder value for the txHash context, and can simply use `0` for the
	// message index as there is only one such action per block.
	ctx = ctx.WithContext(context.WithValue(ctx.Context(), sdk.ContextKey("tx-hash"), "x/vbank"))
	ctx = ctx.WithContext(context.WithValue(ctx.Context(), sdk.ContextKey("tx-msg-idx"), 0))
	return am.keeper.PushAction(ctx, action)
}
