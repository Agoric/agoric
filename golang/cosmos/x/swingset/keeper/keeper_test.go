package keeper

import (
	"fmt"
	"reflect"
	"testing"

	"cosmossdk.io/log"
	"cosmossdk.io/store"
	storemetrics "cosmossdk.io/store/metrics"
	prefixstore "cosmossdk.io/store/prefix"
	storetypes "cosmossdk.io/store/types"
	"github.com/Agoric/agoric-sdk/golang/cosmos/x/swingset/types"
	dbm "github.com/cosmos/cosmos-db"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

func mkcoin(denom string) func(amt int64) sdk.Coin {
	return func(amt int64) sdk.Coin {
		return sdk.NewInt64Coin(denom, amt)
	}
}

var (
	a          = mkcoin("coina")
	b          = mkcoin("coinb")
	cns        = sdk.NewCoins
	submitAddr = sdk.AccAddress([]byte("submitter"))
	utilAddr   = sdk.AccAddress([]byte("addr"))
)

func Test_calculateFees(t *testing.T) {
	type args struct {
		balances        sdk.Coins
		submitter, addr sdk.AccAddress
		powerFlags      []string
		powerFlagFees   []types.PowerFlagFee
	}
	tests := []struct {
		name   string
		args   args
		want   sdk.Coins
		errMsg string
	}{
		{
			name: "provision pass",
			args: args{
				balances:   privilegedProvisioningCoins,
				submitter:  submitAddr,
				addr:       utilAddr,
				powerFlags: []string{"powerflag1", "powerflag2"},
			},
			want: cns(),
		},
		{
			name: "provision pass and more",
			args: args{
				balances:   privilegedProvisioningCoins.Add(privilegedProvisioningCoins...).Add(a(1000)),
				submitter:  submitAddr,
				addr:       utilAddr,
				powerFlags: []string{"powerflag1", "powerflag2"},
			},
			want: cns(),
		},
		{
			name: "cannot pay fee to provision third party",
			args: args{
				submitter:  submitAddr,
				addr:       utilAddr,
				powerFlags: []string{"powerflag1"},
			},
			errMsg: "submitter is not the same as target address for fee-based provisioning",
		},
		{
			name: "need powerflags for fee provisioning",
			args: args{
				submitter: utilAddr,
				addr:      utilAddr,
			},
			errMsg: "must specify powerFlags for fee-based provisioning",
		},
		{
			name: "unrecognized powerFlag",
			args: args{
				submitter:  utilAddr,
				addr:       utilAddr,
				powerFlags: []string{"power1"},
			},
			errMsg: "unrecognized powerFlag: power1",
		},
		{
			name: "get fee for power1",
			args: args{
				submitter:  utilAddr,
				addr:       utilAddr,
				powerFlags: []string{"power1"},
				powerFlagFees: []types.PowerFlagFee{
					{
						PowerFlag: "power2",
						Fee:       cns(a(1000)),
					},
					{
						PowerFlag: "power1",
						Fee:       cns(a(1300)),
					},
				},
			},
			want: cns(a(1300)),
		},
		{
			name: "later menu entries do not override",
			args: args{
				submitter:  utilAddr,
				addr:       utilAddr,
				powerFlags: []string{"power1"},
				powerFlagFees: []types.PowerFlagFee{
					{
						PowerFlag: "power2",
						Fee:       cns(a(1000)),
					},
					{
						PowerFlag: "power1",
						Fee:       cns(a(1300)),
					},
					{
						PowerFlag: "power1",
						Fee:       cns(a(800)),
					},
				},
			},
			want: cns(a(1300)),
		},
		{
			name: "fees add up",
			args: args{
				submitter:  utilAddr,
				addr:       utilAddr,
				powerFlags: []string{"power1", "power2", "freepower"},
				powerFlagFees: []types.PowerFlagFee{
					{
						PowerFlag: "power2",
						Fee:       cns(a(1000), b(15)),
					},
					{
						PowerFlag: "power1",
						Fee:       cns(a(1300)),
					},
					{
						PowerFlag: "freepower",
					},
				},
			},
			want: cns(a(2300), b(15)),
		},
		{
			name: "multiple occurrences of same powerflag",
			args: args{
				submitter:  utilAddr,
				addr:       utilAddr,
				powerFlags: []string{"power1", "power1"},
				powerFlagFees: []types.PowerFlagFee{
					{
						PowerFlag: "power2",
						Fee:       cns(a(1000)),
					},
					{
						PowerFlag: "power1",
						Fee:       cns(a(1300)),
					},
				},
			},
			want: cns(a(2600)),
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := calculateFees(tt.args.balances, tt.args.submitter, tt.args.addr, tt.args.powerFlags, tt.args.powerFlagFees)
			var errMsg string
			if err != nil {
				errMsg = err.Error()
			}
			if errMsg != tt.errMsg {
				t.Errorf("calculateFees() error = %v, want %v", err, tt.errMsg)
				return
			}
			if !got.Equal(tt.want) {
				t.Errorf("calculateFees() = %v, want %v", got, tt.want)
			}
		})
	}
}

var (
	swingsetStoreKey = storetypes.NewKVStoreKey(types.StoreKey)
)

func makeTestStore() storetypes.KVStore {
	db := dbm.NewMemDB()
	logger := log.NewNopLogger()
	ms := store.NewCommitMultiStore(db, logger, storemetrics.NewNoOpMetrics())
	ms.MountStoreWithDB(swingsetStoreKey, storetypes.StoreTypeIAVL, db)
	err := ms.LoadLatestVersion()
	if err != nil {
		panic(err)
	}
	kvStore := ms.GetKVStore(swingsetStoreKey)
	prefixStore := prefixstore.NewStore(kvStore, []byte("swingStore."))
	return prefixStore
}

func TestSwingStore(t *testing.T) {
	store := makeTestStore()

	// Test that we can store and retrieve a value.
	store.Set([]byte("someKey"), []byte("someValue"))
	if got := string(store.Get([]byte("someKey"))); got != "someValue" {
		t.Errorf("got %q, want %q", got, "someValue")
	}

	// Test that we can update and retrieve an updated value.
	store.Set([]byte("someKey"), []byte("someNewValue"))
	if got := string(store.Get([]byte("someKey"))); got != "someNewValue" {
		t.Errorf("got %q, want %q", got, "someNewValue")
	}

	// Test that we can store and retrieve empty values
	store.Set([]byte("someEmptyKey"), []byte(""))
	if got := store.Get([]byte("someEmptyKey")); got == nil || string(got) != "" {
		t.Errorf("got %#v, want empty string", got)
	}

	// Test that we can store and delete values.
	store.Set([]byte("someOtherKey"), []byte("someOtherValue"))
	store.Delete([]byte("someOtherKey"))
	if store.Has([]byte("someOtherKey")) {
		t.Errorf("has value, expected not")
	}

	// Test that we can delete non existing keys (e.g. delete twice)
	store.Delete([]byte("someMissingKey"))

	// Check the iterated values
	expectedEntries := [][2]string{
		{"someEmptyKey", "[]byte{}"},
		{"someKey", "[]byte{0x73, 0x6f, 0x6d, 0x65, 0x4e, 0x65, 0x77, 0x56, 0x61, 0x6c, 0x75, 0x65}"},
	}

	iter := store.Iterator(nil, nil)
	gotEntries := [][2]string{}
	for ; iter.Valid(); iter.Next() {
		entry := [2]string{
			string(iter.Key()),
			fmt.Sprintf("%#v", iter.Value()),
		}
		gotEntries = append(gotEntries, entry)
	}
	iter.Close()

	if !reflect.DeepEqual(gotEntries, expectedEntries) {
		t.Errorf("got export %q, want %q", gotEntries, expectedEntries)
	}
}
