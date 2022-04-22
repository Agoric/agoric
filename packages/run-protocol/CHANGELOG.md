# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.9.0](https://github.com/Agoric/agoric-sdk/compare/@agoric/run-protocol@0.8.0...@agoric/run-protocol@0.9.0) (2022-04-18)


### ⚠ BREAKING CHANGES

* atomically update multiple parameters via governance (#5063)
* fix a bug in addLiquidity (#5091)
* add collateral Reserve to hold collateral and add to AMM under governance control (#4635)
* add the ability to invoke an API to contract governance (#4869)
* **run-protocol:** vaults hold liquidation proceeds until closed
* **run-protocol:** return assetNotifier instead of notifying on uiNotifier
* **run-protocol:** rename uiNotifier to vaultNotifier
* consistent Node engine requirement (>=14.15.0)
* **run-protocol:** remove liquidated flag from vault notifications

### Features

* **bundleTool:** memoize load() ([9624665](https://github.com/Agoric/agoric-sdk/commit/96246659ebe9baef4fbabb02ffe3e74210428537))
* **run-protocol:** charge penalty for liquidation ([#4996](https://github.com/Agoric/agoric-sdk/issues/4996)) ([5467be4](https://github.com/Agoric/agoric-sdk/commit/5467be4fb5c4cc47f34736eb669e207b26eb711d))
* **run-protocol:** debt limit for RUNstake ([c6a2b68](https://github.com/Agoric/agoric-sdk/commit/c6a2b6825c40b94e03a2bd5c34be7aad473e54a6))
* **run-protocol:** debtLimit governed param ([#4948](https://github.com/Agoric/agoric-sdk/issues/4948)) ([161e968](https://github.com/Agoric/agoric-sdk/commit/161e9689ea13fae8559a8915a87a5ec031969d5f))
* **run-protocol:** expose wrapLienedAmount on attestationTool ([766984e](https://github.com/Agoric/agoric-sdk/commit/766984e5f4265731abbd4ef826f180c568838d91))
* **run-protocol:** first cut at governance-induced RUN ([7500218](https://github.com/Agoric/agoric-sdk/commit/75002188c106370bc0b3d71ecb8b9a2ecb00ac8d))
* implement the durable kind API ([56bad98](https://github.com/Agoric/agoric-sdk/commit/56bad985275787d18c34ac14b377a4d0348d699b)), closes [#4495](https://github.com/Agoric/agoric-sdk/issues/4495)
* split single- and multi-faceted VO definitions into their own functions ([fcf293a](https://github.com/Agoric/agoric-sdk/commit/fcf293a4fcdf64bf30b377c7b3fb8b728efbb4af)), closes [#5093](https://github.com/Agoric/agoric-sdk/issues/5093)
* yet another overhaul of the `defineKind` API ([3e02d42](https://github.com/Agoric/agoric-sdk/commit/3e02d42312b2963c165623c8cd559b431e5ecdce)), closes [#4905](https://github.com/Agoric/agoric-sdk/issues/4905)
* **cosmic-swingset:** grant addVaultType based on addr ([#4641](https://github.com/Agoric/agoric-sdk/issues/4641)) ([e439024](https://github.com/Agoric/agoric-sdk/commit/e439024788f27ea668b2ff0c5e486ab901807eb0))
* **run-protocol:** distinct vault phase for liquidated ([26593e4](https://github.com/Agoric/agoric-sdk/commit/26593e4eca7aa7997d56470c7892c30d6d9b6f93))
* **run-protocol:** liquidate serially ([#4931](https://github.com/Agoric/agoric-sdk/issues/4931)) ([91a62a5](https://github.com/Agoric/agoric-sdk/commit/91a62a57b34a4967209f1a7f88ea5dd0a085fb46)), closes [#4715](https://github.com/Agoric/agoric-sdk/issues/4715)
* **run-protocol:** RUNstake contract only, without payoff from rewards ([#4741](https://github.com/Agoric/agoric-sdk/issues/4741)) ([52f60eb](https://github.com/Agoric/agoric-sdk/commit/52f60eb192217ff3e4cf84a5a2ff8ada19fb5dcc))
* add collateral Reserve to hold collateral and add to AMM under governance control ([#4635](https://github.com/Agoric/agoric-sdk/issues/4635)) ([3e3f55f](https://github.com/Agoric/agoric-sdk/commit/3e3f55f48365d614c2215d8f311f973ff54b6cd0)), closes [#4188](https://github.com/Agoric/agoric-sdk/issues/4188) [#4188](https://github.com/Agoric/agoric-sdk/issues/4188)
* add the ability to invoke an API to contract governance ([#4869](https://github.com/Agoric/agoric-sdk/issues/4869)) ([3123665](https://github.com/Agoric/agoric-sdk/commit/312366518471238430c79313f79e57aee1c551cd)), closes [#4188](https://github.com/Agoric/agoric-sdk/issues/4188)


### Bug Fixes

* **bundleTool:** harden loaded bundles ([d77cea2](https://github.com/Agoric/agoric-sdk/commit/d77cea26f50e46833cd5cbde780f6393e616a4ec))
* **run-protocol:** more support for governance boot ([711d80d](https://github.com/Agoric/agoric-sdk/commit/711d80d6f4b854ca9dadb0bae764a9a0cc65fa59))
* **run-protocol:** re-structure vault notifiers to work with wallet ([9ac3f00](https://github.com/Agoric/agoric-sdk/commit/9ac3f00462cff6cfc20ab3325dad6798f3a8560f))
* **run-protocol:** shuffle around to fix types ([1c06bbd](https://github.com/Agoric/agoric-sdk/commit/1c06bbd71c39b09bb0e8007b0a96febf3bfbd771))
* **run-protocol:** store Presences, not Promises, in VaultManager ([5aee8af](https://github.com/Agoric/agoric-sdk/commit/5aee8af34fb1fab54633fc9a1acbf2818414de9a)), closes [#5106](https://github.com/Agoric/agoric-sdk/issues/5106) [#5121](https://github.com/Agoric/agoric-sdk/issues/5121) [#5106](https://github.com/Agoric/agoric-sdk/issues/5106)
* **run-protocol:** use wallet-friendly offer result notifiers ([b08330b](https://github.com/Agoric/agoric-sdk/commit/b08330b5bbb040979a68c19c8609e715e468b905))
* **vaults:** check args before acting in addVaultType ([12d5cfb](https://github.com/Agoric/agoric-sdk/commit/12d5cfbc9abfa553e40b7b458ce99420c7c54a85))
* Encode Passables, not just keys ([#4470](https://github.com/Agoric/agoric-sdk/issues/4470)) ([715950d](https://github.com/Agoric/agoric-sdk/commit/715950d6bfcbe6bc778b65a256dc5d26299172db))
* fix a bug in addLiquidity ([#5091](https://github.com/Agoric/agoric-sdk/issues/5091)) ([512db54](https://github.com/Agoric/agoric-sdk/commit/512db545c4e88fa4126c44a29f3a8775c330264f))
* renamings [#4470](https://github.com/Agoric/agoric-sdk/issues/4470) missed ([#4896](https://github.com/Agoric/agoric-sdk/issues/4896)) ([98c9f0e](https://github.com/Agoric/agoric-sdk/commit/98c9f0eabf6f0a85581e34ca0adf24f9805d1f0c))
* two isolated cases where a missing argument did not default ([531d367](https://github.com/Agoric/agoric-sdk/commit/531d367600e97652babff1ee8ffa4e4665f50baa))
* update types to specify ERef<Issuer> on addPool() ([6c13d99](https://github.com/Agoric/agoric-sdk/commit/6c13d997f89d914516dd6d4821d95364bd715b39)), closes [#4810](https://github.com/Agoric/agoric-sdk/issues/4810)
* **vats:** move `startPriceAuthority` earlier in the boot sequence ([bf93171](https://github.com/Agoric/agoric-sdk/commit/bf93171c69eb1a19b04c24c9283e0d433ca9d411))
* **vault:** make vault transfer invitation legible ([#4844](https://github.com/Agoric/agoric-sdk/issues/4844)) ([325ef39](https://github.com/Agoric/agoric-sdk/commit/325ef399cc9b65eedca71c2d2d7c42a4c6ec5191))
* **zoe:** pass brands (not issuers) to priceAggregator ([5800711](https://github.com/Agoric/agoric-sdk/commit/580071189bb60d83ceaa806bf85035173ae9563c))


### Reverts

* Revert "refactor(run-protocol): virtual kind for vault manager (#5052)" ([b08dc58](https://github.com/Agoric/agoric-sdk/commit/b08dc5836e8bea98de4316edc7ac5eef698c7072)), closes [#5052](https://github.com/Agoric/agoric-sdk/issues/5052)


### Miscellaneous Chores

* consistent Node engine requirement (>=14.15.0) ([ddc40fa](https://github.com/Agoric/agoric-sdk/commit/ddc40fa525f845ed900512c38b99f01458a3d131))
* **run-protocol:** remove liquidated flag from vault notifications ([6456af2](https://github.com/Agoric/agoric-sdk/commit/6456af25e154f01820efbdc1afb343902e385384))


### Code Refactoring

* atomically update multiple parameters via governance ([#5063](https://github.com/Agoric/agoric-sdk/issues/5063)) ([8921f59](https://github.com/Agoric/agoric-sdk/commit/8921f59bcdf217b311670c509b8500074eafd77a))
* **run-protocol:** rename uiNotifier to vaultNotifier ([554d41e](https://github.com/Agoric/agoric-sdk/commit/554d41ed9f9b35cd59133818e428d3055006e1ca))
* **run-protocol:** return assetNotifier instead of notifying on uiNotifier ([35d2d41](https://github.com/Agoric/agoric-sdk/commit/35d2d41f5345f593a647390c6f3dee5ccb44bf15))
* **run-protocol:** vaults hold liquidation proceeds until closed ([de32be9](https://github.com/Agoric/agoric-sdk/commit/de32be9b27780e75b70f06780872994fce7da02a))



## [0.8.0](https://github.com/Agoric/agoric-sdk/compare/@agoric/run-protocol@0.7.2...@agoric/run-protocol@0.8.0) (2022-02-24)


### ⚠ BREAKING CHANGES

* **run-protocol:** removes getBootstrapPayment from VaultFactory

### Features

* overhaul the virtual object API ([e40674b](https://github.com/Agoric/agoric-sdk/commit/e40674b0b19f29adde2f5e6a460bafb7340d42b6)), closes [#4606](https://github.com/Agoric/agoric-sdk/issues/4606)
* **run-protocol:** startRewardDistributor bootstrap behavior ([ad038ff](https://github.com/Agoric/agoric-sdk/commit/ad038ffa831f6be858cb2ebe8a429557e09186c2))


### Bug Fixes

* **run-protocol:** harden results from collection utilities ([5d8b4c1](https://github.com/Agoric/agoric-sdk/commit/5d8b4c14e798be5358530c5b0f7b5b59505431c9))
* **run-protocol:** produce priceAuthorityVat for fake authorities ([ba1b367](https://github.com/Agoric/agoric-sdk/commit/ba1b36792d45e96a8746e9b62b488cb404a2c72b))


### Miscellaneous Chores

* **run-protocol:** centralSupply contract for bootstrapPayment ([e526a7d](https://github.com/Agoric/agoric-sdk/commit/e526a7d8f01811560804cb48f77fce1347d8836b)), closes [#4021](https://github.com/Agoric/agoric-sdk/issues/4021)



### 0.7.2 (2022-02-21)


### Features

* **run-protocol:** interest charging O(1) for all vaults in a manager ([#4527](https://github.com/Agoric/agoric-sdk/issues/4527)) ([58103ac](https://github.com/Agoric/agoric-sdk/commit/58103ac216f4ce28cbbe73494af2ea11b5a110c0))
* implement persistent stores ([e1050b0](https://github.com/Agoric/agoric-sdk/commit/e1050b010e095b23547a38d48a12e5c8841a7466))
* **run-protocol:** variable rate vault/loan ([54d509e](https://github.com/Agoric/agoric-sdk/commit/54d509e74517c4385183b13cbf30c2976944ddd0))


### Bug Fixes

* dropping the max on the property-based tests led to problems ([#4600](https://github.com/Agoric/agoric-sdk/issues/4600)) ([3ddd160](https://github.com/Agoric/agoric-sdk/commit/3ddd160f343a7ad6faebeee8e09787310a63e211))
* Remove extraneous eslint globals ([17087e4](https://github.com/Agoric/agoric-sdk/commit/17087e4605db7d3b30dfccf2434b2850b45e3408))
* **amm:** Prevent creation of constant product AMM with non-fungible central token ([#4476](https://github.com/Agoric/agoric-sdk/issues/4476)) ([4f2d036](https://github.com/Agoric/agoric-sdk/commit/4f2d03612b2130c3fa053d239bde0c927245d1ff))
* Enhance TypeScript node_modules traversal depth ([000f738](https://github.com/Agoric/agoric-sdk/commit/000f73850d46dc7272b2399c06ad774dd3b8fe6e))
* when trades for zero are requested don't throw ([4516e5b](https://github.com/Agoric/agoric-sdk/commit/4516e5b6a2ab9176033956ee197687b5c6574647))
* **run-protocol:** update `makeRatio` import ([20965f1](https://github.com/Agoric/agoric-sdk/commit/20965f14c2212024cee9796a2454b5435aa3fcb8))



### [0.7.1](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.7.0...@agoric/treasury@0.7.1) (2021-12-22)


### Features

* refactor parameter governance support to allow for Invitations ([#4121](https://github.com/Agoric/agoric-sdk/issues/4121)) ([159596b](https://github.com/Agoric/agoric-sdk/commit/159596b8d44b8cbdaf6e19513cb3e716febfae7b))


### Bug Fixes

* **treasury:** use liquidationMargin for maxDebt calculation ([#4163](https://github.com/Agoric/agoric-sdk/issues/4163)) ([c749af8](https://github.com/Agoric/agoric-sdk/commit/c749af86232029c0abc8b031366251a05e482930))



## [0.7.0](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.6.5...@agoric/treasury@0.7.0) (2021-12-02)


### ⚠ BREAKING CHANGES

* **zoe:** must harden `amountKeywordRecord` before passing to ZCF objects

* chore: fix treasury errors, etc.

Co-authored-by: mergify[bot] <37929162+mergify[bot]@users.noreply.github.com>
* **ERTP:** NatValues now only accept bigints, lower-case amountMath is removed, and AmountMath methods always follow the order of: brand, value

* chore: fix up INPUT_VALIDATON.md

* chore: address PR comments

### Bug Fixes

* **zoe:** assert that amountKeywordRecord is a copyRecord ([#4069](https://github.com/Agoric/agoric-sdk/issues/4069)) ([fe9a9ff](https://github.com/Agoric/agoric-sdk/commit/fe9a9ff3de86608a0b1f8f9547059f89d45b948d))


### Miscellaneous Chores

* **ERTP:** additional input validation and clean up ([#3892](https://github.com/Agoric/agoric-sdk/issues/3892)) ([067ea32](https://github.com/Agoric/agoric-sdk/commit/067ea32b069596202d7f8e7c5e09d5ea7821f6b2))



### [0.6.5](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.6.4...@agoric/treasury@0.6.5) (2021-10-13)

**Note:** Version bump only for package @agoric/treasury





### [0.6.4](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.6.3...@agoric/treasury@0.6.4) (2021-09-23)

**Note:** Version bump only for package @agoric/treasury





### [0.6.3](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.6.2...@agoric/treasury@0.6.3) (2021-09-15)

**Note:** Version bump only for package @agoric/treasury





### [0.6.2](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.6.1...@agoric/treasury@0.6.2) (2021-08-21)

**Note:** Version bump only for package @agoric/treasury





### [0.6.1](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.6.0...@agoric/treasury@0.6.1) (2021-08-18)

**Note:** Version bump only for package @agoric/treasury





## [0.6.0](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.5.12...@agoric/treasury@0.6.0) (2021-08-17)


### ⚠ BREAKING CHANGES

* make the run mint within Zoe, and give only the treasury the ability to create a ZCFMint with it

* chore: change 'makeZoe' to 'makeZoeKit'

* chore: add "shutdownZoeVat" argument to Zoe, and pass it to `makeIssuerKit` for invitation issuerKit and fee issuerKit

* chore: manually lint-fix install-on-chain.js

See https://github.com/Agoric/agoric-sdk/issues/3672 for the issue to fix the root problem

### Features

* **treasury:** assert getBootstrapPayment amount ([3ed8e69](https://github.com/Agoric/agoric-sdk/commit/3ed8e695deb9a0f6c5d924374e61ceb8d9aaff1c))


### Bug Fixes

* return funds from liquidation via a seat payout ([#3656](https://github.com/Agoric/agoric-sdk/issues/3656)) ([d1a142d](https://github.com/Agoric/agoric-sdk/commit/d1a142d47ae0cf3db6512e85ac2de583193a2fdf))


* BREAKING CHANGE: create the RUN Mint within Zoe (#3647) ([48762aa](https://github.com/Agoric/agoric-sdk/commit/48762aa83a30eaa0a14b2fd87777456758594262)), closes [#3647](https://github.com/Agoric/agoric-sdk/issues/3647)



### [0.5.12](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.5.11...@agoric/treasury@0.5.12) (2021-08-16)

**Note:** Version bump only for package @agoric/treasury





### [0.5.11](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.5.8...@agoric/treasury@0.5.11) (2021-08-15)


### Bug Fixes

* Treasury burn debt repayment before zeroing the amount owed ([#3604](https://github.com/Agoric/agoric-sdk/issues/3604)) ([f0bc4cb](https://github.com/Agoric/agoric-sdk/commit/f0bc4cb0c7e419cafc0105869d287d571202448d)), closes [#3495](https://github.com/Agoric/agoric-sdk/issues/3495)

### 0.26.10 (2021-07-28)


### Bug Fixes

* **treasury:** use xs-worker and metered=true on all swingset tests ([f76405e](https://github.com/Agoric/agoric-sdk/commit/f76405e09a29f4975cda00a33bbde4761dbe958e))
* some missing Fars ([#3498](https://github.com/Agoric/agoric-sdk/issues/3498)) ([8f77271](https://github.com/Agoric/agoric-sdk/commit/8f77271b41a4589679ad95ff907126778466aba8))



### [0.5.10](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.5.8...@agoric/treasury@0.5.10) (2021-08-14)


### Bug Fixes

* Treasury burn debt repayment before zeroing the amount owed ([#3604](https://github.com/Agoric/agoric-sdk/issues/3604)) ([f0bc4cb](https://github.com/Agoric/agoric-sdk/commit/f0bc4cb0c7e419cafc0105869d287d571202448d)), closes [#3495](https://github.com/Agoric/agoric-sdk/issues/3495)

### 0.26.10 (2021-07-28)


### Bug Fixes

* **treasury:** use xs-worker and metered=true on all swingset tests ([f76405e](https://github.com/Agoric/agoric-sdk/commit/f76405e09a29f4975cda00a33bbde4761dbe958e))
* some missing Fars ([#3498](https://github.com/Agoric/agoric-sdk/issues/3498)) ([8f77271](https://github.com/Agoric/agoric-sdk/commit/8f77271b41a4589679ad95ff907126778466aba8))



### [0.5.9](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.5.8...@agoric/treasury@0.5.9) (2021-07-28)


### Bug Fixes

* **treasury:** use xs-worker and metered=true on all swingset tests ([f76405e](https://github.com/Agoric/agoric-sdk/commit/f76405e09a29f4975cda00a33bbde4761dbe958e))
* some missing Fars ([#3498](https://github.com/Agoric/agoric-sdk/issues/3498)) ([8f77271](https://github.com/Agoric/agoric-sdk/commit/8f77271b41a4589679ad95ff907126778466aba8))



### [0.5.8](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.5.7...@agoric/treasury@0.5.8) (2021-07-01)

**Note:** Version bump only for package @agoric/treasury





### [0.5.7](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.5.6...@agoric/treasury@0.5.7) (2021-07-01)

**Note:** Version bump only for package @agoric/treasury





### [0.5.6](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.5.5...@agoric/treasury@0.5.6) (2021-06-28)

**Note:** Version bump only for package @agoric/treasury





### [0.5.5](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.5.4...@agoric/treasury@0.5.5) (2021-06-25)

**Note:** Version bump only for package @agoric/treasury





### [0.5.4](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.5.3...@agoric/treasury@0.5.4) (2021-06-24)

**Note:** Version bump only for package @agoric/treasury





### [0.5.3](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.5.2...@agoric/treasury@0.5.3) (2021-06-24)

**Note:** Version bump only for package @agoric/treasury





### [0.5.2](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.5.1...@agoric/treasury@0.5.2) (2021-06-23)

**Note:** Version bump only for package @agoric/treasury





### [0.5.1](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.5.0...@agoric/treasury@0.5.1) (2021-06-16)

**Note:** Version bump only for package @agoric/treasury





## [0.5.0](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.4.2...@agoric/treasury@0.5.0) (2021-06-15)


### ⚠ BREAKING CHANGES

* **zoe:** new reallocate API to assist with reviewing conservation of rights (#3184)

### Bug Fixes

* Pin ESM to forked version ([54dbb55](https://github.com/Agoric/agoric-sdk/commit/54dbb55d64d7ff7adb395bc4bd9d1461dd2d3c17))
* Preinitialize Babel ([bb76808](https://github.com/Agoric/agoric-sdk/commit/bb768089c3588e54612d7c9a4528972b5688f4e6))


### Code Refactoring

* **zoe:** new reallocate API to assist with reviewing conservation of rights ([#3184](https://github.com/Agoric/agoric-sdk/issues/3184)) ([f34e5ea](https://github.com/Agoric/agoric-sdk/commit/f34e5eae0812a9823d40d2d05ba98522c7846f2a))



## [0.4.2](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.4.1...@agoric/treasury@0.4.2) (2021-05-10)

**Note:** Version bump only for package @agoric/treasury





## [0.4.1](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.4.0...@agoric/treasury@0.4.1) (2021-05-05)

**Note:** Version bump only for package @agoric/treasury





# [0.4.0](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.3.4...@agoric/treasury@0.4.0) (2021-05-05)


### Bug Fixes

* default and propagate the poolFee and protocolFee in treasury ([d210bcf](https://github.com/Agoric/agoric-sdk/commit/d210bcf1427bee73c9a13f0a00ee2a757d978cd2))
* have the treasury use the newSwap AMM implementation ([ed6b84a](https://github.com/Agoric/agoric-sdk/commit/ed6b84ad02cdf59431aa92d3d1e8c8e669379881))
* polishing touches ([334a253](https://github.com/Agoric/agoric-sdk/commit/334a253c02dc1c74117237f6ae18b31505e635af))


### Features

* share one instance of liquidation across all vaultManagers ([#2869](https://github.com/Agoric/agoric-sdk/issues/2869)) ([0ae776a](https://github.com/Agoric/agoric-sdk/commit/0ae776a91d0ec77443073f6340e714b8e161e062))





## [0.3.4](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.3.3...@agoric/treasury@0.3.4) (2021-04-22)

**Note:** Version bump only for package @agoric/treasury





## [0.3.3](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.3.2...@agoric/treasury@0.3.3) (2021-04-18)

**Note:** Version bump only for package @agoric/treasury





## [0.3.2](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.3.1...@agoric/treasury@0.3.2) (2021-04-16)

**Note:** Version bump only for package @agoric/treasury





## [0.3.1](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.3.0...@agoric/treasury@0.3.1) (2021-04-14)

**Note:** Version bump only for package @agoric/treasury





# [0.3.0](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.2.1...@agoric/treasury@0.3.0) (2021-04-13)


### Features

* move Pegasus contract to SDK ([d0ca2cc](https://github.com/Agoric/agoric-sdk/commit/d0ca2cc155953c63eef5f56f236fa9280984730a))





## [0.2.1](https://github.com/Agoric/agoric-sdk/compare/@agoric/treasury@0.2.0...@agoric/treasury@0.2.1) (2021-04-07)

**Note:** Version bump only for package @agoric/treasury





# 0.2.0 (2021-04-06)


### Bug Fixes

* allow liq margin plus fees for new loans ([#2813](https://github.com/Agoric/agoric-sdk/issues/2813)) ([5284548](https://github.com/Agoric/agoric-sdk/commit/52845480aa18dd76165b7997bcb2b4fad3e7c3be))
* improve factoring and assertions ([e7b356d](https://github.com/Agoric/agoric-sdk/commit/e7b356d608e7a774fb326e0b8988c7c79b938e72))
* update install-on-chain to use RUN instead of SCONES ([#2815](https://github.com/Agoric/agoric-sdk/issues/2815)) ([6ba74e9](https://github.com/Agoric/agoric-sdk/commit/6ba74e98e6cea423098646426bb136780f6f8ff4))
* update to ses 0.12.7, ses-ava 0.1.1 ([#2820](https://github.com/Agoric/agoric-sdk/issues/2820)) ([6d81775](https://github.com/Agoric/agoric-sdk/commit/6d81775715bc80e6033d75cb65edbfb1452b1608))


### Features

* add collateralConfig to issuer entries and enact ([8ce966b](https://github.com/Agoric/agoric-sdk/commit/8ce966bdb4f74960189b73d0721e92ae3c5912f0))
* add more collateral types, pivot to BLD/RUN and decimals ([7cbce9f](https://github.com/Agoric/agoric-sdk/commit/7cbce9f53fc81d273d3ebd7c78d93caedbd23b2e))
* introduce @agoric/treasury and pass tests ([6257231](https://github.com/Agoric/agoric-sdk/commit/6257231e23cd501e6e20ef16e4f4d569ff30b265))
* use multipoolAutoswap as the treasury priceAuthority ([a37c795](https://github.com/Agoric/agoric-sdk/commit/a37c795a98f38ac99581d441e00177364f404bd3))
