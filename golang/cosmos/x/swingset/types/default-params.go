package types

import (
	sdkmath "cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

// This should roughly match the values in
// `agoric-sdk/packages/cosmic-swingset/src/sim-params.js`.
//
// Nothing bad happens if they diverge, but it makes for a truer simulation
// experience if they don't.

const (
	BeansPerFeeUnit              = "feeUnit"
	BeansPerInboundTx            = "inboundTx"
	BeansPerBlockComputeLimit    = "blockComputeLimit"
	BeansPerMessage              = "message"
	BeansPerMessageByte          = "messageByte"
	BeansPerMinFeeDebit          = "minFeeDebit"
	BeansPerStorageByte          = "storageByte"
	BeansPerVatCreation          = "vatCreation"
	BeansPerXsnapComputron       = "xsnapComputron"
	BeansPerSmartWalletProvision = "smartWalletProvision"

	// PowerFlags.
	PowerFlagSmartWallet = "SMART_WALLET"

	// QueueSize keys.
	// Keep up-to-date with updateQueueAllowed() in packages/cosmic-swingset/src/launch-chain.js
	QueueInbound        = "inbound"
	QueueInboundMempool = "inbound_mempool"

	// Vat cleanup budget keys.
	// Keep up-to-date with CleanupBudget in packages/cosmic-swingset/src/launch-chain.js
	VatCleanupDefault     = "default"
	VatCleanupExports     = "exports"
	VatCleanupImports     = "imports"
	VatCleanupPromises    = "promises"
	VatCleanupKv          = "kv"
	VatCleanupSnapshots   = "snapshots"
	VatCleanupTranscripts = "transcripts"
)

var (
	DefaultBeansPerXsnapComputron = sdkmath.NewUint(100)

	// DefaultBeansPerBlockComputeLimit is how many computron beans we allow
	// before starting a new block.  Some analysis (#3459) suggests this leads to
	// about 2/3rds utilization, based on 5 sec voting time and up to 10 sec of
	// computation.
	DefaultBeansPerBlockComputeLimit = sdkmath.NewUint(8000000).Mul(DefaultBeansPerXsnapComputron)
	// observed: 0.385 sec
	DefaultBeansPerVatCreation = sdkmath.NewUint(300000).Mul(DefaultBeansPerXsnapComputron)

	// Fees are denominated in this unit.
	DefaultFeeUnitPrice = sdk.NewCoins(sdk.NewInt64Coin("uist", 1_000_000)) // $1

	// TODO: create the cost model we want, and update these to be more principled.
	// These defaults currently make deploying an ag-solo cost less than $1.00.
	DefaultBeansPerFeeUnit              = sdkmath.NewUint(1_000_000_000_000)                  // $1
	DefaultBeansPerInboundTx            = DefaultBeansPerFeeUnit.Quo(sdkmath.NewUint(100))    // $0.01
	DefaultBeansPerMessage              = DefaultBeansPerFeeUnit.Quo(sdkmath.NewUint(1_000))  // $0.001
	DefaultBeansPerMessageByte          = DefaultBeansPerFeeUnit.Quo(sdkmath.NewUint(50_000)) // $0.00002
	DefaultBeansPerMinFeeDebit          = DefaultBeansPerFeeUnit.Quo(sdkmath.NewUint(5))      // $0.2
	DefaultBeansPerStorageByte          = DefaultBeansPerFeeUnit.Quo(sdkmath.NewUint(500))    // $0.002
	DefaultBeansPerSmartWalletProvision = DefaultBeansPerFeeUnit                              // $1

	DefaultBootstrapVatConfig = "@agoric/vm-config/decentral-core-config.json"

	DefaultPowerFlagFees = []PowerFlagFee{
		NewPowerFlagFee(PowerFlagSmartWallet, sdk.NewCoins(sdk.NewInt64Coin("ubld", 10_000_000))),
	}

	DefaultInboundQueueMax = int32(1_000)
	DefaultQueueMax        = []QueueSize{
		NewQueueSize(QueueInbound, DefaultInboundQueueMax),
	}

	DefaultVatCleanupDefault = sdkmath.NewUint(5)
	// DefaultVatCleanupExports     = DefaultVatCleanupDefault
	// DefaultVatCleanupImports     = DefaultVatCleanupDefault
	// DefaultVatCleanupPromises    = DefaultVatCleanupDefault
	DefaultVatCleanupKv = sdkmath.NewUint(50)
	// DefaultVatCleanupSnapshots   = DefaultVatCleanupDefault
	// DefaultVatCleanupTranscripts = DefaultVatCleanupDefault
	DefaultVatCleanupBudget = []UintMapEntry{
		UintMapEntry{VatCleanupDefault, DefaultVatCleanupDefault},
		// UintMapEntry{VatCleanupExports, DefaultVatCleanupExports},
		// UintMapEntry{VatCleanupImports, DefaultVatCleanupImports},
		// UintMapEntry{VatCleanupPromises, DefaultVatCleanupPromises},
		UintMapEntry{VatCleanupKv, DefaultVatCleanupKv},
		// UintMapEntry{VatCleanupSnapshots, DefaultVatCleanupSnapshots},
		// UintMapEntry{VatCleanupTranscripts, DefaultVatCleanupTranscripts},
	}
)

// move DefaultBeansPerUnit to a function to allow for boot overriding of the Default params
func DefaultBeansPerUnit() []StringBeans {
	return []StringBeans{
		NewStringBeans(BeansPerBlockComputeLimit, DefaultBeansPerBlockComputeLimit),
		NewStringBeans(BeansPerFeeUnit, DefaultBeansPerFeeUnit),
		NewStringBeans(BeansPerInboundTx, DefaultBeansPerInboundTx),
		NewStringBeans(BeansPerMessage, DefaultBeansPerMessage),
		NewStringBeans(BeansPerMessageByte, DefaultBeansPerMessageByte),
		NewStringBeans(BeansPerMinFeeDebit, DefaultBeansPerMinFeeDebit),
		NewStringBeans(BeansPerStorageByte, DefaultBeansPerStorageByte),
		NewStringBeans(BeansPerVatCreation, DefaultBeansPerVatCreation),
		NewStringBeans(BeansPerXsnapComputron, DefaultBeansPerXsnapComputron),
		NewStringBeans(BeansPerSmartWalletProvision, DefaultBeansPerSmartWalletProvision),
	}
}
