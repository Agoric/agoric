package vlocalchain_test

import (
	"context"
	"encoding/json"
	"github.com/cosmos/cosmos-sdk/types/module/testutil"
	"strings"
	"testing"
	"time"

	"cosmossdk.io/log"
	sdkmath "cosmossdk.io/math"
	"cosmossdk.io/store"
	storemetrics "cosmossdk.io/store/metrics"
	storetypes "cosmossdk.io/store/types"
	"github.com/Agoric/agoric-sdk/golang/cosmos/vm"
	"github.com/Agoric/agoric-sdk/golang/cosmos/x/vlocalchain"
	"github.com/Agoric/agoric-sdk/golang/cosmos/x/vlocalchain/types"
	dbm "github.com/cosmos/cosmos-db"
	"github.com/cosmos/cosmos-sdk/baseapp"
	"github.com/cosmos/cosmos-sdk/runtime"
	sdk "github.com/cosmos/cosmos-sdk/types"
	authtypes "github.com/cosmos/cosmos-sdk/x/auth/types"
	banktypes "github.com/cosmos/cosmos-sdk/x/bank/types"
	stakingtypes "github.com/cosmos/cosmos-sdk/x/staking/types"
	transfertypes "github.com/cosmos/ibc-go/v8/modules/apps/transfer/types"

	tmproto "github.com/cometbft/cometbft/proto/tendermint/types"
	"github.com/cosmos/gogoproto/jsonpb"
	"github.com/cosmos/gogoproto/proto"
)

var (
	vlocalchainStoreKey = storetypes.NewKVStoreKey(types.StoreKey)
)

const (
	firstAddr          = "cosmos1uupflqrldlpkktssnzgp3r03ff6kz4u4kzd92pjgsfddye7grrlqt9rmmt"
	msgAllocateAddress = `{"type":"VLOCALCHAIN_ALLOCATE_ADDRESS"}`
)

type mockAccounts struct {
	existing map[string]bool
}

var _ types.AccountKeeper = (*mockAccounts)(nil)

func (a *mockAccounts) NewAccountWithAddress(ctx context.Context, addr sdk.AccAddress) sdk.AccountI {
	return authtypes.NewBaseAccountWithAddress(addr)
}

func (a *mockAccounts) HasAccount(ctx context.Context, addr sdk.AccAddress) bool {
	existing := a.existing[addr.String()]
	return existing
}

func (a *mockAccounts) SetAccount(ctx context.Context, acc sdk.AccountI) {
	a.existing[acc.GetAddress().String()] = true
}

type mockBank struct {
	banktypes.UnimplementedQueryServer
	banktypes.UnimplementedMsgServer
	balances   map[string]sdk.Coins
	failToSend error
}

var _ banktypes.QueryServer = (*mockBank)(nil)
var _ banktypes.MsgServer = (*mockBank)(nil)

func (b *mockBank) AllBalances(cctx context.Context, req *banktypes.QueryAllBalancesRequest) (*banktypes.QueryAllBalancesResponse, error) {
	addr, err := sdk.AccAddressFromBech32(req.Address)
	if err != nil {
		return nil, err
	}

	var resp banktypes.QueryAllBalancesResponse
	resp.Balances = sdk.Coins{}
	if coins, ok := b.balances[addr.String()]; ok {
		resp.Balances = coins
	}
	return &resp, nil
}

func (b *mockBank) Send(cctx context.Context, req *banktypes.MsgSend) (*banktypes.MsgSendResponse, error) {
	if b.failToSend != nil {
		return nil, b.failToSend
	}
	return &banktypes.MsgSendResponse{}, nil
}

type mockTransfer struct {
	transfertypes.UnimplementedQueryServer
	transfertypes.UnimplementedMsgServer
}

var _ transfertypes.QueryServer = (*mockTransfer)(nil)
var _ transfertypes.MsgServer = (*mockTransfer)(nil)

func (t *mockTransfer) Transfer(cctx context.Context, msg *transfertypes.MsgTransfer) (*transfertypes.MsgTransferResponse, error) {
	return &transfertypes.MsgTransferResponse{Sequence: 1}, nil
}

type mockStaking struct {
	stakingtypes.UnimplementedMsgServer
	stakingtypes.UnimplementedQueryServer
}

var _ stakingtypes.MsgServer = (*mockStaking)(nil)
var _ stakingtypes.QueryServer = (*mockStaking)(nil)

func (s *mockStaking) Undelegate(cctx context.Context, msg *stakingtypes.MsgUndelegate) (*stakingtypes.MsgUndelegateResponse, error) {
	return &stakingtypes.MsgUndelegateResponse{CompletionTime: time.Now().UTC()}, nil
}

func (s *mockStaking) UnbondingDelegation(cctx context.Context, req *stakingtypes.QueryUnbondingDelegationRequest) (*stakingtypes.QueryUnbondingDelegationResponse, error) {
	unbondingDelegation := stakingtypes.UnbondingDelegation{
		DelegatorAddress: req.DelegatorAddr,
		ValidatorAddress: "cosmosvaloper1gghjut3ccd8ay0zduzj64hwre2fxs9ldmqhffj",
		Entries: []stakingtypes.UnbondingDelegationEntry{
			{
				CreationHeight: 100,
				CompletionTime: time.Now().UTC().Add(time.Hour * 24 * 7),
				InitialBalance: sdkmath.NewInt(1000),
				Balance:        sdkmath.NewInt(500),
			},
		},
	}
	return &stakingtypes.QueryUnbondingDelegationResponse{Unbond: unbondingDelegation}, nil
}

// makeTestKit creates a minimal Keeper and Context for use in testing.
func makeTestKit(bank *mockBank, transfer *mockTransfer, staking *mockStaking, accts *mockAccounts) (vm.PortHandler, context.Context) {
	encodingConfig := testutil.MakeTestEncodingConfig()
	cdc := encodingConfig.Codec

	txRouter := baseapp.NewMsgServiceRouter()
	txRouter.SetInterfaceRegistry(encodingConfig.InterfaceRegistry)
	queryRouter := baseapp.NewGRPCQueryRouter()
	queryRouter.SetInterfaceRegistry(encodingConfig.InterfaceRegistry)

	banktypes.RegisterInterfaces(encodingConfig.InterfaceRegistry)
	banktypes.RegisterMsgServer(txRouter, bank)
	banktypes.RegisterQueryServer(queryRouter, bank)
	transfertypes.RegisterInterfaces(encodingConfig.InterfaceRegistry)
	transfertypes.RegisterMsgServer(txRouter, transfer)
	transfertypes.RegisterQueryServer(queryRouter, transfer)
	stakingtypes.RegisterInterfaces(encodingConfig.InterfaceRegistry)
	stakingtypes.RegisterMsgServer(txRouter, staking)
	stakingtypes.RegisterQueryServer(queryRouter, staking)

	// create a new Keeper
	keeper := vlocalchain.NewKeeper(cdc, runtime.NewKVStoreService(vlocalchainStoreKey), txRouter, queryRouter, accts)

	db := dbm.NewMemDB()
	logger := log.NewNopLogger()
	ms := store.NewCommitMultiStore(db, logger, storemetrics.NewNoOpMetrics())
	ms.MountStoreWithDB(vlocalchainStoreKey, storetypes.StoreTypeIAVL, db)
	err := ms.LoadLatestVersion()
	if err != nil {
		panic(err)
	}

	// create a new SDK Context
	ctx := sdk.NewContext(ms, tmproto.Header{}, false, log.NewNopLogger()).WithBlockHeight(998)

	handler := vm.NewProtectedPortHandler(vlocalchain.NewReceiver(keeper))

	// create a new Go context
	return handler, ctx
}

func TestAllocateAddress(t *testing.T) {
	bank := &mockBank{}
	transfer := &mockTransfer{}
	staking := &mockStaking{}
	acct := &mockAccounts{existing: map[string]bool{
		firstAddr: true,
		"cosmos1c5hplwyxk5jr2dsygjqepzfqvfukwduq9c4660aah76krf99m6gs0k7hvl": true,
	}}
	handler, cctx := makeTestKit(bank, transfer, staking, acct)

	addrs := map[string]bool{
		"cosmos1yj40fakym8kf4wvgz9tky7k9f3v9msm3t7frscrmkjsdkxkpsfkqgeczkg": false,
		"cosmos1s76vryj7m8k8nm9le65a4plhf5rym5sumtt2n0vwnk5l6k4cwuhsj56ujj": false,
		"cosmos1ys3a7mtna3cad0wxcs4ddukn37stexjdvns8jfdn4uerlr95y4xqnrypf6": false,
	}
	numToTest := len(addrs)
	for i := 0; i < numToTest; i++ {
		// receive the message
		ret, err := handler.Receive(cctx, msgAllocateAddress)
		if err != nil {
			t.Fatalf("unexpected error[%d]: %v", i, err)
		}
		if ret == "" {
			t.Fatalf("expected non-empty address[%d]", i)
		}
		var addr string
		if err := json.Unmarshal([]byte(ret), &addr); err != nil {
			t.Fatalf("unexpected error unmarshalling address string[%d]: %v: %v", i, ret, err)
		}

		already, ok := addrs[addr]
		if !ok {
			t.Fatalf("unexpected address[%d]: %v", i, addr)
		}
		if already {
			t.Fatalf("unexpected duplicate address[%d]: %v", i, addr)
		}
		addrs[addr] = true
		if !acct.existing[addr] {
			t.Fatalf("expected address[%d]: %v to be added to accounts", i, addr)
		}
	}
}

func TestQuery(t *testing.T) {
	alreadyAddr := sdk.MustBech32ifyAddressBytes("cosmos", []byte("already"))
	nonexistentAddr := sdk.MustBech32ifyAddressBytes("cosmos", []byte("nonexistent"))
	bank := &mockBank{balances: map[string]sdk.Coins{
		firstAddr:   []sdk.Coin{sdk.NewCoin("fresh", sdkmath.NewInt(123))},
		alreadyAddr: []sdk.Coin{sdk.NewCoin("stale", sdkmath.NewInt(321))},
	}}
	transfer := &mockTransfer{}
	staking := &mockStaking{}
	accts := &mockAccounts{existing: map[string]bool{}}
	handler, cctx := makeTestKit(bank, transfer, staking, accts)

	// get balances
	testCases := []struct {
		name     string
		addr     string
		failure  string
		expected sdk.Coins
	}{
		{"nonexistent", nonexistentAddr, "", sdk.Coins{}},
		{"already", alreadyAddr, "", bank.balances[alreadyAddr]},
		{"first", firstAddr, "", bank.balances[firstAddr]},
		{"badaddr", "cosmos11111111111", "decoding bech32 failed: invalid separator index 16", sdk.Coins{}},
	}

	for _, tc := range testCases {
		tc := tc
		ctx := sdk.UnwrapSDKContext(cctx)
		t.Run(tc.name, func(t *testing.T) {
			msgGetBalances := `{"type":"VLOCALCHAIN_QUERY_MANY","messages":[{"@type":"/cosmos.bank.v1beta1.QueryAllBalancesRequest","address":"` + tc.addr + `"}]}`
			t.Logf("query request: %v", msgGetBalances)
			ret, err := handler.Receive(cctx, msgGetBalances)
			t.Logf("query response: %v", ret)
			if tc.failure != "" {
				if err == nil {
					t.Fatalf("expected error %v, not nil with return %v", tc.failure, ret)
				} else if err.Error() != tc.failure {
					t.Fatalf("expected error %v, not %v", tc.failure, err)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if err == nil && ret == "" {
				t.Fatalf("expected non-empty json")
			}

			// Unmarshal the responses.
			s := `{"responses":` + ret + `}`

			unmarshaler := jsonpb.Unmarshaler{}
			var qrs types.QueryResponses
			if err = unmarshaler.Unmarshal(strings.NewReader(s), &qrs); err != nil {
				t.Fatalf("unexpected error unmarshalling reply: %v: %v", ret, err)
			}

			resps := qrs.Responses
			if len(resps) != 1 {
				t.Fatalf("expected responses length 1, got %v", len(resps))
			}
			if resps[0].Error != "" {
				t.Fatalf("unexpected error response: %v", resps[0].Error)
			}
			if resps[0].Height != ctx.BlockHeight() {
				t.Fatalf("expected height %v, got %v", ctx.BlockHeight(), resps[0].Height)
			}

			// Unmarshal the Any.
			var pb banktypes.QueryAllBalancesResponse
			if err = proto.Unmarshal(resps[0].Reply.Value, &pb); err != nil {
				t.Fatalf("unexpected error unmarshalling reply: %v: %v", ret, err)
			}

			if !pb.Balances.Equal(tc.expected) {
				t.Errorf("unexpected balance: expected %v, got %v", tc.expected, pb.Balances)
			}
		})
	}

	t.Run("UnbondingDelegation", func(t *testing.T) {
		// create a new message
		msg := `{"type":"VLOCALCHAIN_QUERY_MANY","messages":[{"@type":"/cosmos.staking.v1beta1.QueryUnbondingDelegationRequest","delegator_addr":"` + firstAddr + `","validator_addr":"cosmosvaloper1gghjut3ccd8ay0zduzj64hwre2fxs9ldmqhffj"}]}`
		t.Logf("query request: %v", msg)
		ret, err := handler.Receive(cctx, msg)
		t.Logf("query response: %v", ret)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if ret == "" {
			t.Fatalf("expected non-empty json")
		}

		// Unmarshal the JSON response
		var respJSON []map[string]interface{}
		if err := json.Unmarshal([]byte(ret), &respJSON); err != nil {
			t.Fatalf("unexpected error unmarshalling JSON response: %v", err)
		}

		// Check the response fields
		if len(respJSON) != 1 {
			t.Fatalf("expected 1 response, got %d", len(respJSON))
		}
		resp := respJSON[0]

		replyAny, ok := resp["reply"].(map[string]interface{})
		if !ok {
			t.Fatalf("expected reply field to be a map, got %v", resp["reply"])
		}

		unbond, ok := replyAny["unbond"].(map[string]interface{})
		if !ok {
			t.Fatalf("expected unbond field to be a map, got %v", replyAny["unbond"])
		}

		// Check the field names and values
		if unbond["delegatorAddress"] != firstAddr {
			t.Errorf("expected delegatorAddress %s, got %v", firstAddr, unbond["delegator_address"])
		}
		if unbond["validatorAddress"] != "cosmosvaloper1gghjut3ccd8ay0zduzj64hwre2fxs9ldmqhffj" {
			t.Errorf("expected validatorAddress cosmosvaloper1gghjut3ccd8ay0zduzj64hwre2fxs9ldmqhffj, got %v", unbond["validator_address"])
		}

		entries, ok := unbond["entries"].([]interface{})
		if !ok || len(entries) != 1 {
			t.Fatalf("expected 1 unbonding delegation entry, got %v", entries)
		}
		entry, ok := entries[0].(map[string]interface{})
		if !ok {
			t.Fatalf("expected unbonding delegation entry to be a map, got %v", entries[0])
		}
		if entry["creationHeight"] != "100" {
			t.Errorf("expected creationHeight \"100\", got %v", entry["creation_height"])
		}
		if entry["balance"] != "500" {
			t.Errorf("expected balance \"500\", got %v", entry["balance"])
		}
		if _, ok := entry["completionTime"]; !ok {
			t.Error("expected completionTime field in the response")
		}
	})
}

func TestExecuteTx(t *testing.T) {
	alreadyAddr := sdk.MustBech32ifyAddressBytes("cosmos", []byte("already"))
	bank := &mockBank{balances: map[string]sdk.Coins{
		firstAddr:   []sdk.Coin{sdk.NewCoin("fresh", sdkmath.NewInt(123))},
		alreadyAddr: []sdk.Coin{sdk.NewCoin("stale", sdkmath.NewInt(321))},
	}}
	transfer := &mockTransfer{}
	staking := &mockStaking{}
	accts := &mockAccounts{existing: map[string]bool{}}
	handler, cctx := makeTestKit(bank, transfer, staking, accts)

	// create a new message
	msg := `{"type":"VLOCALCHAIN_ALLOCATE_ADDRESS"}`
	ret, err := handler.Receive(cctx, msg)
	if err != nil {
		t.Fatalf("unexpected error: %s", err)
	}
	if ret == "" {
		t.Fatalf("expected non-empty json")
	}
	var addr string
	if err := json.Unmarshal([]byte(ret), &addr); err != nil {
		t.Fatalf("unexpected error unmarshalling address string: %v: %s", ret, err)
	}
	if addr != firstAddr {
		t.Fatalf("expected address %v, got %v", firstAddr, addr)
	}

	testCases := []struct {
		name          string
		signerAddress string
		fromAddress   string
		toAddress     string
		failure       string
	}{
		{"valid", addr, addr, alreadyAddr, ""},
		{"parse error", `"` + addr, firstAddr, alreadyAddr, "invalid character 'c' after object key:value pair"},
		{"invalid address", addr, alreadyAddr, alreadyAddr, "required signer cosmos1v9k8yetpv3us7src8u does not match actual signer"},
		{"unauth", alreadyAddr, addr, alreadyAddr, "required signer cosmos1uupflqrldlpkktssnzgp3r03ff6kz4u4kzd92pjgsfddye7grrlqt9rmmt does not match actual signer"},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {

			// create a new message
			msg := `{"type":"VLOCALCHAIN_EXECUTE_TX","address":"` + tc.signerAddress +
				`","messages":[{"@type":"/cosmos.bank.v1beta1.MsgSend","from_address":"` +
				tc.fromAddress + `","to_address":"` + tc.toAddress +
				`","amount":[{"denom":"fresh","amount":"100"}]}]}`

			ret, err = handler.Receive(cctx, msg)
			if tc.failure != "" {
				if err == nil {
					t.Fatalf("expected error %v, not nil with return %v", tc.failure, ret)
				}
				if err.Error() != tc.failure {
					t.Fatalf("expected error %v, not %v", tc.failure, err)
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %s", err)
			}
			if ret == "" {
				t.Fatalf("expected non-empty json")
			}
			if ret != "[{}]" {
				t.Fatalf("expected response [{}], not %v", ret)
			}
		})
	}

	t.Run("MsgUndelegate", func(t *testing.T) {
		// create a new message
		msg := `{"type":"VLOCALCHAIN_EXECUTE_TX","address":"` + addr +
			`","messages":[{"@type":"/cosmos.staking.v1beta1.MsgUndelegate","delegatorAddress":"` +
			addr + `","validatorAddress":"cosmosvaloper1gghjut3ccd8ay0zduzj64hwre2fxs9ldmqhffj","amount":{"denom":"stake","amount":"100"}}]}`

		ret, err := handler.Receive(cctx, msg)
		if err != nil {
			t.Fatalf("unexpected error: %s", err)
		}
		if ret == "" {
			t.Fatalf("expected non-empty json")
		}

		// Unmarshal the response
		var resp []map[string]interface{}
		if err := json.Unmarshal([]byte(ret), &resp); err != nil {
			t.Fatalf("unexpected error unmarshalling response: %v", err)
		}

		// Check the response fields
		if len(resp) != 1 {
			t.Fatalf("expected 1 response, got %d", len(resp))
		}

		if _, ok := resp[0]["completionTime"]; !ok {
			t.Error("expected 'completionTime' field in response")
		}
	})
}
