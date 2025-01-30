package keeper

import (
	"bytes"
	"context"
	"cosmossdk.io/core/store"
	"fmt"
	"reflect"
	"strings"
	"unicode"

	"github.com/cosmos/gogoproto/jsonpb"
	"github.com/cosmos/gogoproto/proto"

	"github.com/cosmos/cosmos-sdk/codec"
	codectypes "github.com/cosmos/cosmos-sdk/codec/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkaddress "github.com/cosmos/cosmos-sdk/types/address"

	abci "github.com/cometbft/cometbft/abci/types"

	"github.com/Agoric/agoric-sdk/golang/cosmos/x/vlocalchain/types"
)

// Keeper maintains the link to data storage and exposes getter/setter methods for the various parts of the state machine
type Keeper struct {
	storeService store.KVStoreService
	cdc          codec.Codec
	msgRouter    types.MsgRouter
	queryRouter  types.GRPCQueryRouter
	acctKeeper   types.AccountKeeper
}

// NewKeeper creates a new dIBC Keeper instance
func NewKeeper(
	cdc codec.Codec,
	key store.KVStoreService,
	msgRouter types.MsgRouter,
	queryRouter types.GRPCQueryRouter,
	acctKeeper types.AccountKeeper,
) Keeper {
	return Keeper{
		storeService: key,
		cdc:          cdc,
		msgRouter:    msgRouter,
		queryRouter:  queryRouter,
		acctKeeper:   acctKeeper,
	}
}

// DeserializeRequests uses the global proto codec's proto3 JSON
// unmarshaller and then unpacks the Any types into actual objects.
func (k Keeper) DeserializeRequests(bz []byte) ([]types.QueryRequest, error) {
	var cosmosTx types.CosmosTx
	unmarshaler := &jsonpb.Unmarshaler{}

	// Convert the bz byte slice to an io.Reader
	rdr := bytes.NewReader(bz)
	if err := unmarshaler.Unmarshal(rdr, &cosmosTx); err != nil {
		return nil, err
	}

	msgs := make([]types.QueryRequest, len(cosmosTx.Messages))
	for i, anyMsg := range cosmosTx.Messages {
		// TODO: Generalize using proto service reflection.
		fullMethod, responseURL := parseRequestTypeURL(anyMsg.TypeUrl)
		msgs[i] = types.QueryRequest{
			FullMethod: fullMethod,
			ReplyType:  responseURL,
			Request:    anyMsg,
		}
	}
	return msgs, nil
}

const (
	requestSuffix  = "Request"
	responseSuffix = "Response"
)

// parseRequestTypeURL returns the full method and response type URL
//
// This is a hack that only works if the names are conventionally
// abc.def.1beta1.QueryFooBarRequest
// abc.def.1beta1.Query/FooBar
// abc.def.1beta1.QueryFooBarResponse
func parseRequestTypeURL(typeURL string) (string, string) {
	typePrefix := strings.TrimSuffix(typeURL, requestSuffix)
	responseURL := typePrefix + responseSuffix

	ifacePos := strings.LastIndex(typePrefix, ".") + 1
	iface := typePrefix[ifacePos:]

	// Find the second uppercase letter.
	first := true
	serviceEnd := strings.IndexFunc(iface, func(r rune) bool {
		if first {
			first = false
			return false
		}
		return unicode.IsUpper(r)
	})

	var fullMethod string
	serviceEnd += ifacePos
	if serviceEnd < 0 {
		fullMethod = typePrefix[0:ifacePos] + "/" + iface
	} else {
		fullMethod = typePrefix[0:serviceEnd] + "/" + typePrefix[serviceEnd:]
	}
	return fullMethod, responseURL
}

func (k Keeper) ResolveProtoMessage(typeUrl string) (proto.Message, error) {
	unprefixed := strings.TrimPrefix(typeUrl, "/")
	msgPointerType := proto.MessageType(unprefixed)
	if msgPointerType == nil {
		return nil, fmt.Errorf("unable to resolve type URL %s", typeUrl)
	}
	newMsg := reflect.New(msgPointerType.Elem())
	target, ok := newMsg.Interface().(proto.Message)
	if !ok {
		return nil, fmt.Errorf("unable to cast %s to proto.Message", typeUrl)
	}
	return target, nil
}

func (k Keeper) Query(cctx context.Context, qm types.QueryRequest) (*types.QueryResponse, error) {
	// We currently only handle a few kinds of requests.
	handler := k.queryRouter.Route(qm.FullMethod)
	if handler == nil {
		return nil, fmt.Errorf("unrecognized query route for method %s", qm.FullMethod)
	}

	ctx := sdk.UnwrapSDKContext(cctx)
	req := abci.RequestQuery{
		Data:   qm.Request.Value,
		Height: ctx.BlockHeight(),
	}

	abcires, err := handler(ctx, &req)
	if err != nil {
		return nil, err
	}

	res := types.QueryResponse{
		Height: abcires.Height,
	}

	if abcires.IsOK() {
		// Wrap the reply in an Any.
		res.Reply = &codectypes.Any{TypeUrl: qm.ReplyType, Value: abcires.Value}
	} else {
		res.Error = abcires.Info
	}

	return &res, nil
}

func (k Keeper) DeserializeTxMessages(bz []byte) ([]sdk.Msg, error) {
	var cosmosTx types.CosmosTx
	if err := k.cdc.UnmarshalJSON(bz, &cosmosTx); err != nil {
		return nil, err
	}
	msgs := make([]sdk.Msg, len(cosmosTx.Messages))
	for i, anyMsg := range cosmosTx.Messages {
		err := k.cdc.UnpackAny(anyMsg, &msgs[i])
		if err != nil {
			return nil, err
		}
	}

	return msgs, nil
}

type HasValidateBasic interface {
	ValidateBasic() error
}

func (k Keeper) authenticateTx(msgs []sdk.Msg, actualSigner string) error {
	for _, msg := range msgs {
		// Validate that all required signers are satisfied (i.e. they match the actual signer).
		signers, _, err := k.cdc.GetMsgV1Signers(msg)
		if err != nil {
			panic(err)
		}
		for _, requiredSignerAddress := range signers {
			requiredSigner := sdk.AccAddress(requiredSignerAddress).String()
			if requiredSigner != actualSigner {
				err := fmt.Errorf("required signer %s does not match actual signer", requiredSigner)
				return err
			}
		}
	}
	return nil
}

func (k Keeper) ExecuteTx(origCtx sdk.Context, addr string, msgs []sdk.Msg) ([]interface{}, error) {
	// Do any preliminary basic stateless validation.
	for _, msg := range msgs {
		if m, ok := msg.(HasValidateBasic); ok {
			if err := m.ValidateBasic(); err != nil {
				return nil, err
			}
		}
	}

	if err := k.authenticateTx(msgs, addr); err != nil {
		return nil, err
	}

	resps := make([]interface{}, len(msgs))

	// CacheContext returns a new context with the multi-store branched into a cached storage object
	// writeCache is called only if all msgs succeed, performing state transitions atomically
	cacheCtx, writeCache := origCtx.CacheContext()

	for i, msg := range msgs {
		protoAny, err := k.executeMsg(cacheCtx, msg)
		if err != nil {
			return nil, err
		}

		if err = k.cdc.UnpackAny(protoAny, &resps[i]); err != nil {
			return nil, err
		}
	}

	// NOTE: The context returned by CacheContext() creates a new EventManager, so events must be correctly propagated back to the current context
	origCtx.EventManager().EmitEvents(cacheCtx.EventManager().Events())
	writeCache()

	return resps, nil
}

// Attempts to get the message handler from the router and if found will then execute the message.
// If the message execution is successful, the proto marshaled message response will be returned.
func (k Keeper) executeMsg(ctx sdk.Context, msg sdk.Msg) (*codectypes.Any, error) {
	handler := k.msgRouter.Handler(msg)
	if handler == nil {
		return nil, fmt.Errorf("invalid message route for msg %s", sdk.MsgTypeURL(msg))
	}

	res, err := handler(ctx, msg)
	if err != nil {
		return nil, err
	}

	if len(res.MsgResponses) != 1 {
		panic(fmt.Errorf("expected 1 MsgResponse, got %d", len(res.MsgResponses)))
	}

	// NOTE: The sdk msg handler creates a new EventManager, so events must be correctly propagated back to the current context
	ctx.EventManager().EmitEvents(res.GetEvents())

	// Each individual sdk.Result has exactly one Msg response. We aggregate here.
	msgResponse := res.MsgResponses[0]
	if msgResponse == nil {
		return nil, fmt.Errorf("got nil Msg response for msg %s", sdk.MsgTypeURL(msg))
	}

	return msgResponse, nil
}

// AllocateAddress returns an sdk.AccAddress derived using a host module account
// address, sequence number, the current block app hash, and the current block
// data hash.  The sdk.AccAddress returned is a sub-address of the host module
// account.
func (k Keeper) AllocateAddress(cctx context.Context) (sdk.AccAddress, error) {
	ctx := sdk.UnwrapSDKContext(cctx)
	s := k.storeService.OpenKVStore(ctx)

	localchainModuleAcc := sdkaddress.Module(types.ModuleName, []byte("localchain"))
	header := ctx.BlockHeader()

	// Loop until we find an unused address.
	for {
		// Increment our sequence number.
		seq, err := s.Get(types.KeyLastSequence)
		if err != nil {
			return nil, err
		}
		seq = types.NextSequence(seq)
		err = s.Set(types.KeyLastSequence, seq)
		if err != nil {
			return nil, err
		}
		buf := seq
		buf = append(buf, header.AppHash...)
		buf = append(buf, header.DataHash...)

		addr := sdkaddress.Derive(localchainModuleAcc, buf)
		if k.acctKeeper.HasAccount(ctx, addr) {
			continue
		}

		// We found an unused address, so create an account for it.
		acct := k.acctKeeper.NewAccountWithAddress(ctx, addr)
		k.acctKeeper.SetAccount(ctx, acct)

		// All good, return the address.
		return addr, nil
	}
}
