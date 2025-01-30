package gaia

import (
	"encoding/json"
	"fmt"
	"reflect"
	"strings"
	"text/template"

	upgradetypes "cosmossdk.io/x/upgrade/types"
	"github.com/Agoric/agoric-sdk/golang/cosmos/vm"
	swingsetkeeper "github.com/Agoric/agoric-sdk/golang/cosmos/x/swingset/keeper"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/module"
)

var upgradeNamesOfThisVersion = []string{
	"UNRELEASED_BASIC", // no-frills
	"UNRELEASED_A3P_INTEGRATION",
	"UNRELEASED_main",
	"UNRELEASED_devnet",
	"UNRELEASED_emerynet",
	"UNRELEASED_REAPPLY",
}

// isUpgradeNameOfThisVersion returns whether the provided plan name is a
// known upgrade name of this software version
func isUpgradeNameOfThisVersion(name string) bool {
	for _, upgradeName := range upgradeNamesOfThisVersion {
		if upgradeName == name {
			return true
		}
	}
	return false
}

// validUpgradeName is an identity function that asserts the provided name
// is an upgrade name of this software version. It can be used as a sort of
// dynamic enum check.
func validUpgradeName(name string) string {
	if !isUpgradeNameOfThisVersion(name) {
		panic(fmt.Errorf("invalid upgrade name: %s", name))
	}
	return name
}

// isPrimaryUpgradeName returns wether the provided plan name is considered a
// primary for the purpose of applying store migrations for the first upgrade
// of this version.
// It is expected that only primary plan names are used for non testing chains.
func isPrimaryUpgradeName(name string) bool {
	if name == "" {
		// An empty upgrade name can happen if there are no upgrade in progress
		return false
	}
	switch name {
	case validUpgradeName("UNRELEASED_BASIC"),
		validUpgradeName("UNRELEASED_A3P_INTEGRATION"),
		validUpgradeName("UNRELEASED_main"),
		validUpgradeName("UNRELEASED_devnet"),
		validUpgradeName("UNRELEASED_emerynet"):
		return true
	case validUpgradeName("UNRELEASED_REAPPLY"):
		return false
	default:
		panic(fmt.Errorf("unexpected upgrade name %s", validUpgradeName(name)))
	}
}

// isFirstTimeUpgradeOfThisVersion looks up in the upgrade store whether no
// upgrade plan name of this version have previously been applied.
func isFirstTimeUpgradeOfThisVersion(app *GaiaApp, ctx sdk.Context) bool {
	for _, name := range upgradeNamesOfThisVersion {
		height, err := app.UpgradeKeeper.GetDoneHeight(ctx, name)
		if err != nil {
			panic(fmt.Errorf("error getting done height: %s", err))
		}
		if height != 0 {
			return false
		}
	}
	return true
}

func buildProposalStepWithArgs(moduleName string, entrypoint string, extra any) (vm.CoreProposalStep, error) {
	t := template.Must(template.New("").Parse(`{
  "module": "{{.moduleName}}",
  "entrypoint": "{{.entrypoint}}",
  "args": {{.args}}
}`))

	var args []byte
	var err error
	if extra == nil {
		// The specified entrypoint will be called with no extra arguments after powers.
		args = []byte(`[]`)
	} else if reflect.TypeOf(extra).Kind() == reflect.Map && reflect.TypeOf(extra).Key().Kind() == reflect.String {
		// The specified entrypoint will be called with this options argument after powers.
		args, err = json.Marshal([]any{extra})
	} else if reflect.TypeOf(extra).Kind() == reflect.Slice {
		// The specified entrypoint will be called with each of these arguments after powers.
		args, err = json.Marshal(extra)
	} else {
		return nil, fmt.Errorf("proposal extra must be nil, array, or string map, not %v", extra)
	}
	if err != nil {
		return nil, err
	}

	var result strings.Builder
	err = t.Execute(&result, map[string]any{
		"moduleName": moduleName,
		"entrypoint": entrypoint,
		"args":       string(args),
	})
	if err != nil {
		return nil, err
	}
	jsonStr := result.String()
	jsonBz := []byte(jsonStr)
	if !json.Valid(jsonBz) {
		return nil, fmt.Errorf("invalid JSON: %s", jsonStr)
	}
	proposal := vm.ArbitraryCoreProposal{Json: jsonBz}
	return vm.CoreProposalStepForModules(proposal), nil
}

func getVariantFromUpgradeName(upgradeName string) string {
	switch upgradeName {
	case "UNRELEASED_A3P_INTEGRATION":
		return "A3P_INTEGRATION"
	case "UNRELEASED_main":
		return "MAINNET"
	case "UNRELEASED_devnet":
		return "DEVNET"
	case "UNRELEASED_emerynet":
		return "EMERYNET"
		// Noupgrade for this version.
	case "UNRELEASED_BASIC":
		return ""
	default:
		return ""
	}
}

func replaceElectorateCoreProposalStep(upgradeName string) (vm.CoreProposalStep, error) {
	variant := getVariantFromUpgradeName(upgradeName)

	if variant == "" {
		return nil, nil
	}

	return buildProposalStepWithArgs(
		"@agoric/builders/scripts/inter-protocol/replace-electorate-core.js",
		"defaultProposalBuilder",
		map[string]any{
			"variant": variant,
		},
	)
}

func replacePriceFeedsCoreProposal(upgradeName string) (vm.CoreProposalStep, error) {
	variant := getVariantFromUpgradeName(upgradeName)

	if variant == "" {
		return nil, nil
	}

	return buildProposalStepWithArgs(
		"@agoric/builders/scripts/inter-protocol/updatePriceFeeds.js",
		"defaultProposalBuilder",
		map[string]any{
			"variant": variant,
		},
	)
}

func terminateGovernorCoreProposal(upgradeName string) (vm.CoreProposalStep, error) {
	// targets is a slice of "$boardID:$instanceKitLabel" strings.
	var targets []string
	switch getVariantFromUpgradeName(upgradeName) {
	case "MAINNET":
		targets = []string{"board052184:stkATOM-USD_price_feed"}
	case "A3P_INTEGRATION":
		targets = []string{"board04091:stATOM-USD_price_feed"}
	default:
		return nil, nil
	}

	return buildProposalStepWithArgs(
		"@agoric/builders/scripts/vats/terminate-governor-instance.js",
		// Request `defaultProposalBuilder(powers, targets)`.
		"defaultProposalBuilder",
		[]any{targets},
	)
}

// func upgradeMintHolderCoreProposal(upgradeName string) (vm.CoreProposalStep, error) {
// 	variant := getVariantFromUpgradeName(upgradeName)

// 	if variant == "" {
// 		return nil, nil
// 	}

// 	return buildProposalStepWithArgs(
// 		"@agoric/builders/scripts/vats/upgrade-mintHolder.js",
// 		"defaultProposalBuilder",
// 		map[string]any{
// 			"variant": variant,
// 		},
// 	)
// }

// unreleasedUpgradeHandler performs standard upgrade actions plus custom actions for the unreleased upgrade.
func unreleasedUpgradeHandler(app *GaiaApp, targetUpgrade string) func(sdk.Context, upgradetypes.Plan, module.VersionMap) (module.VersionMap, error) {
	return func(ctx sdk.Context, plan upgradetypes.Plan, fromVm module.VersionMap) (module.VersionMap, error) {
		app.CheckControllerInited(false)

		CoreProposalSteps := []vm.CoreProposalStep{}

		// These CoreProposalSteps are not idempotent and should only be executed
		// as part of the first upgrade using this handler on any given chain.
		if isFirstTimeUpgradeOfThisVersion(app, ctx) {
			// The storeUpgrades defined in app.go only execute for the primary upgrade name
			// If we got here and this first upgrade of this version does not use the
			// primary upgrade name, stores have not been initialized correctly.
			if !isPrimaryUpgradeName(plan.Name) {
				return module.VersionMap{}, fmt.Errorf("cannot run %s as first upgrade", plan.Name)
			}

			replaceElectorateStep, err := replaceElectorateCoreProposalStep(targetUpgrade)
			if err != nil {
				return nil, err
			} else if replaceElectorateStep != nil {
				CoreProposalSteps = append(CoreProposalSteps, replaceElectorateStep)
			}

			priceFeedUpdate, err := replacePriceFeedsCoreProposal(targetUpgrade)
			if err != nil {
				return nil, err
			} else if priceFeedUpdate != nil {
				CoreProposalSteps = append(CoreProposalSteps,
					priceFeedUpdate,
					// The following have a dependency onto the price feed proposal
					vm.CoreProposalStepForModules(
						"@agoric/builders/scripts/vats/add-auction.js",
					),
					vm.CoreProposalStepForModules(
						"@agoric/builders/scripts/vats/upgradeVaults.js",
					),
				)
			}

			// Each CoreProposalStep runs sequentially, and can be constructed from
			// one or more modules executing in parallel within the step.
			CoreProposalSteps = append(CoreProposalSteps,
				vm.CoreProposalStepForModules(
					// Upgrade Zoe (no new ZCF needed).
					"@agoric/builders/scripts/vats/upgrade-zoe.js",
				),
				// Revive KREAd characters
				vm.CoreProposalStepForModules(
					"@agoric/builders/scripts/vats/revive-kread.js",
				),
				vm.CoreProposalStepForModules(
					// Upgrade to include a cleanup from https://github.com/Agoric/agoric-sdk/pull/10319
					"@agoric/builders/scripts/smart-wallet/build-wallet-factory2-upgrade.js",
				),
				vm.CoreProposalStepForModules(
					"@agoric/builders/scripts/vats/upgrade-board.js",
				),
			)

			// Upgrade vats using Vows in Upgrade 18 in order to use a new liveslots that
			// avoids a memory leak in watchPromise.
			CoreProposalSteps = append(CoreProposalSteps,
				vm.CoreProposalStepForModules(
					"@agoric/builders/scripts/vats/upgrade-orchestration.js",
				),
			)

			// CoreProposals for Upgrade 19. These should not be introduced
			// before upgrade 18 is done because they would be run in n:upgrade-next
			//
			// upgradeMintHolderStep, err := upgradeMintHolderCoreProposal(targetUpgrade)
			// if err != nil {
			// 	return nil, err
			// } else if upgradeMintHolderStep != nil {
			// 	CoreProposalSteps = append(CoreProposalSteps, upgradeMintHolderStep)
			// }
			//
			// CoreProposalSteps = append(CoreProposalSteps,
			// 	vm.CoreProposalStepForModules(
			// 		"@agoric/builders/scripts/inter-protocol/replace-feeDistributor.js",
			// 	),
			// 	vm.CoreProposalStepForModules(
			// 		"@agoric/builders/scripts/vats/upgrade-paRegistry.js",
			// 	),
			// 	vm.CoreProposalStepForModules(
			// 		"@agoric/builders/scripts/vats/upgrade-provisionPool.js",
			// 	),
			// 	vm.CoreProposalStepForModules(
			// 		"@agoric/builders/scripts/vats/upgrade-bank.js",
			// 	),
			// 	vm.CoreProposalStepForModules(
			// 		"@agoric/builders/scripts/vats/upgrade-agoricNames.js",
			// 	),
			// 	vm.CoreProposalStepForModules(
			// 		"@agoric/builders/scripts/vats/upgrade-asset-reserve.js",
			// 	),
			// 	vm.CoreProposalStepForModules(
			// 		"@agoric/builders/scripts/vats/upgrade-psm.js",
			// 	),
			// )

			terminateOldGovernor, err := terminateGovernorCoreProposal(targetUpgrade)
			if err != nil {
				return nil, err
			} else if terminateOldGovernor != nil {
				CoreProposalSteps = append(CoreProposalSteps, terminateOldGovernor)
			}
		}

		app.upgradeDetails = &upgradeDetails{
			// Record the plan to send to SwingSet
			Plan: plan,
			// Core proposals that should run during the upgrade block
			// These will be merged with any coreProposals specified in the
			// upgradeInfo field of the upgrade plan ran as subsequent steps
			CoreProposals: vm.CoreProposalsFromSteps(CoreProposalSteps...),
		}

		// Always run module migrations
		mvm, err := app.mm.RunMigrations(ctx, app.configurator, fromVm)
		if err != nil {
			return mvm, err
		}

		m := swingsetkeeper.NewMigrator(app.SwingSetKeeper)
		err = m.MigrateParams(ctx)
		if err != nil {
			return mvm, err
		}

		return mvm, nil
	}
}
