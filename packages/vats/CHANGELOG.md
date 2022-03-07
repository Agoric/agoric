# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.7.0](https://github.com/Agoric/agoric-sdk/compare/@agoric/vats@0.6.0...@agoric/vats@0.7.0) (2022-02-24)


### ⚠ BREAKING CHANGES

* **vats:** decentral-config.json config file is no longer
available. Use decentral-core-config.js, which starts core
services by not RUN protocol etc., or decentral-demo-config.js,
which does start the RUN protocol and provides demo funds in
wallets, AMM.

### Features

* **cosmic-swingset:** add tools for core-eval governance ([7368aa6](https://github.com/Agoric/agoric-sdk/commit/7368aa6c22be840733843b1da125eb659cc21d84))
* **vats:** pass some module namespaces to core eval ([7b063db](https://github.com/Agoric/agoric-sdk/commit/7b063dbc5894657035cd654b7d0cca01475463d5))
* overhaul the virtual object API ([e40674b](https://github.com/Agoric/agoric-sdk/commit/e40674b0b19f29adde2f5e6a460bafb7340d42b6)), closes [#4606](https://github.com/Agoric/agoric-sdk/issues/4606)
* **vats:** core bootstrap behaviors: addBankAssets, ... ([613aff6](https://github.com/Agoric/agoric-sdk/commit/613aff68d1a40ef277871e29879db3b2c807358d))
* **vats:** demo bootstrap behaviors: connectFaucet, fundAMM ([b6776ab](https://github.com/Agoric/agoric-sdk/commit/b6776abd9224bc006b93223b93314b0f7d4c0279))
* **vats:** reserve depositFacet for each client ([806ed5a](https://github.com/Agoric/agoric-sdk/commit/806ed5a4dfc3160570250f4b1ef5ff5cc8d1bdcf))


### Bug Fixes

* **vats:** don't dup / clobber client/home properties ([9ddf290](https://github.com/Agoric/agoric-sdk/commit/9ddf290668c5ecfbdb8337834eaf6f48d30b638a))
* **vats:** parse coreEval permits correctly ([eb04df5](https://github.com/Agoric/agoric-sdk/commit/eb04df554dc9f052724925b13690d7b508a05031))
* **vats:** prune bootstrap config that mixed prod with test/demo ([d90251d](https://github.com/Agoric/agoric-sdk/commit/d90251d83f9324635f40a823a728e734ea0c4bbc)), closes [#4165](https://github.com/Agoric/agoric-sdk/issues/4165)
* **vats:** reserve Treasury uiConfig for compatibility ([943fba5](https://github.com/Agoric/agoric-sdk/commit/943fba55794f54adb13296ef163e898d6942c4be))
* **vats:** reserve: is noop if key already exists (NEEDSTEST) ([668ef1e](https://github.com/Agoric/agoric-sdk/commit/668ef1ef960ba68bd7e031d298d826d3856d1277))



## [0.6.0](https://github.com/Agoric/agoric-sdk/compare/@agoric/vats@0.5.1...@agoric/vats@0.6.0) (2022-02-21)


### ⚠ BREAKING CHANGES

* **vats:** use `pegasus` port for Pegasus implementation

### Features

* **ibc:** reimplement `relativeTimeoutNs`, per `ibc-go` ([4673493](https://github.com/Agoric/agoric-sdk/commit/4673493df11f51e9aa018b0ded9632776759f1ee))
* **pegasus:** properly abort on connection close ([1b17f7a](https://github.com/Agoric/agoric-sdk/commit/1b17f7aa4de11ccd5a1ec26fc7b6fff017d70ac1))
* implement persistent stores ([e1050b0](https://github.com/Agoric/agoric-sdk/commit/e1050b010e095b23547a38d48a12e5c8841a7466))
* **vats:** add attestationMaker to home (WIP) ([ad5501b](https://github.com/Agoric/agoric-sdk/commit/ad5501b9fd52b805964b945487963c9ef1b3664a))
* **vats:** agoricNames, namesByAddress, myAddressNameAdmin ([4535c8d](https://github.com/Agoric/agoric-sdk/commit/4535c8da8db373022a9837fabbae12abf16af196))
* **vats:** assign client properties on a per-address basis ([48194ed](https://github.com/Agoric/agoric-sdk/commit/48194ed4dc3584870e95237c79eec7efc5c352b6))
* **vats:** boostrap-core connects vattp<->mailbox (WIP) ([2be2939](https://github.com/Agoric/agoric-sdk/commit/2be2939dc648988e7a8d7fdb7db9c7334c285f40))
* **vats:** build Zoe as bootstrap step ([bb8d0a8](https://github.com/Agoric/agoric-sdk/commit/bb8d0a8ab308c0f6cd1a0eec4fabe39db5463353))
* **vats:** choose bootstrap behaviors by name ([13627b2](https://github.com/Agoric/agoric-sdk/commit/13627b2e3698e879677d136ccfacff9086bd4c2c))
* **vats:** connectFaucet bootstrap behavior ([9e53f4f](https://github.com/Agoric/agoric-sdk/commit/9e53f4f6bcc5d19cabe1e44dea2e9f8bb374e475))
* **vats:** Cosmos chain core bootstrap with ag-solo client ([a4ab506](https://github.com/Agoric/agoric-sdk/commit/a4ab5062fb5e50026772d82504fcaeb8e2bc76d4))
* **vats:** demo-config to install economy automatically ([a948b16](https://github.com/Agoric/agoric-sdk/commit/a948b169ff754e3df3c9b07f1f7a71e2c7abbf99))
* **vats:** in sim-chain, delegate economy bootstrap to REPL user ([116ccbd](https://github.com/Agoric/agoric-sdk/commit/116ccbdf3f04b41357458c2384d2d08e2798ba34))
* **vats:** installSimEgress ([a438f47](https://github.com/Agoric/agoric-sdk/commit/a438f4721a1f45419c692f92be3e33251c67307c))
* **vats:** makeBLDKit ([4dac138](https://github.com/Agoric/agoric-sdk/commit/4dac138f4c78df7e67768e50a73ffad2b938d678))
* **vats:** makeBoard in core bootstrap ([af1b920](https://github.com/Agoric/agoric-sdk/commit/af1b920531988dbd5117c2e0ed51893e9fdb5a8e))
* **vats:** produce priceAuthorityAdmin from startVaultFactory ([29f6324](https://github.com/Agoric/agoric-sdk/commit/29f63245a8308599e2e021ef04ba930fd9dc51e1))
* **vats:** provide home.zoe via makePromiseSpace ([a50c727](https://github.com/Agoric/agoric-sdk/commit/a50c7270b52f3d4d07c23152fce5c473c6082850))
* **vats:** provide noop agoric.faucet in local-chain ([5c990a3](https://github.com/Agoric/agoric-sdk/commit/5c990a3fbcffef79b041b3c495fc5b116af95954))
* **vats:** put RUN, BLD issuer, brand in agoricNames ([3c9eef2](https://github.com/Agoric/agoric-sdk/commit/3c9eef20ce8819cd5e3307b65f67c7a318c1f984))
* **vats:** start attestation contract (WIP) ([1c44623](https://github.com/Agoric/agoric-sdk/commit/1c44623692920d4cf24354a1f7251baa76813952))
* **vats:** start getRUN protocol ([2c97f86](https://github.com/Agoric/agoric-sdk/commit/2c97f8673ba8c3160da6a0d2cc0d7ad6b2c6881a))
* **vats:** start VaultFactory in core bootstrap ([8d56eaf](https://github.com/Agoric/agoric-sdk/commit/8d56eaf797f37d9ded23b34b68599a57681290a5))
* **vats:** visualize bootstrap (WIP) ([2489f1d](https://github.com/Agoric/agoric-sdk/commit/2489f1d8b1dfedfed75a3bb7a3dac0eeab165bed))


### Bug Fixes

* **vats:** improved IBC network protocol ([0cd94c3](https://github.com/Agoric/agoric-sdk/commit/0cd94c3dc1147f7aaa9a15c23991e448ae253891))
* **vats:** use `pegasus` port for Pegasus implementation ([4256c54](https://github.com/Agoric/agoric-sdk/commit/4256c5447d3d3ab9a8c8db8e4250e1c41a96c56d))
* Enhance TypeScript node_modules search depth ([113d31b](https://github.com/Agoric/agoric-sdk/commit/113d31b2ea12c48546218c6bc8d86c8620d9036c))
* Enhance TypeScript node_modules traversal depth ([000f738](https://github.com/Agoric/agoric-sdk/commit/000f73850d46dc7272b2399c06ad774dd3b8fe6e))
* **vats:** buildDistributor call; refactor bootstrap.js ([d854298](https://github.com/Agoric/agoric-sdk/commit/d854298aaa227c0fea1791adb039677ab4aabcaa)), closes [#1](https://github.com/Agoric/agoric-sdk/issues/1)
* **vats:** ensure `nameHub` API returns arrays ([fac4476](https://github.com/Agoric/agoric-sdk/commit/fac4476caf85f4eac1555e20b6285da7df41a375))
* **vats:** fix lint problems ([ce94710](https://github.com/Agoric/agoric-sdk/commit/ce947104773be94335ef1394e7bc79fbfd7f5027))
* **vats:** get `configuration.clientHome` updates to `agoric` ([c50248e](https://github.com/Agoric/agoric-sdk/commit/c50248e74e77cc6f62a7a849b90b239548d9c49d))
* **vats:** minor adjustments to legacy bootstrap ([877f30a](https://github.com/Agoric/agoric-sdk/commit/877f30aea8f782254157946750fd3b0a6b79b316))
* **vats:** move to `decentral-core-config.json` to prevent breakage ([63c7541](https://github.com/Agoric/agoric-sdk/commit/63c754147da870d8d73f847545e25856610f7300))
* **vats:** unstaked BLD should not be a vault collateral type ([1d24556](https://github.com/Agoric/agoric-sdk/commit/1d2455676ff0499eaa442c1fc9cd53fb923ef66e))



### [0.5.1](https://github.com/Agoric/agoric-sdk/compare/@agoric/vats@0.5.0...@agoric/vats@0.5.1) (2021-12-22)

**Note:** Version bump only for package @agoric/vats





## [0.5.0](https://github.com/Agoric/agoric-sdk/compare/@agoric/vats@0.4.2...@agoric/vats@0.5.0) (2021-12-02)


### ⚠ BREAKING CHANGES

* **repl:** add `@endo/far` exports to REPL, remove `ui-agent`
* **ERTP:** NatValues now only accept bigints, lower-case amountMath is removed, and AmountMath methods always follow the order of: brand, value

* chore: fix up INPUT_VALIDATON.md

* chore: address PR comments

### Features

* **repl:** add `@endo/far` exports to REPL, remove `ui-agent` ([3f41296](https://github.com/Agoric/agoric-sdk/commit/3f41296865dadbf7d7fe50291b86d972bc3caabd))
* tweak fictional BLD price to suggest early phase ([472912e](https://github.com/Agoric/agoric-sdk/commit/472912e507a4d83b41734b9110e3127b1bd40755))
* **walletManager:** enable `agoric.chainWallet` deployment power ([93b290b](https://github.com/Agoric/agoric-sdk/commit/93b290b6eb3db3bdf36116e4f78907091e5b9d24))


### Bug Fixes

* **wallet:** allow sync `dateNow` via timerService or timerDevice ([8b6069a](https://github.com/Agoric/agoric-sdk/commit/8b6069aa4100f3c1f2c5ec9a098243913dd8b066))


### Miscellaneous Chores

* **ERTP:** additional input validation and clean up ([#3892](https://github.com/Agoric/agoric-sdk/issues/3892)) ([067ea32](https://github.com/Agoric/agoric-sdk/commit/067ea32b069596202d7f8e7c5e09d5ea7821f6b2))



### [0.4.2](https://github.com/Agoric/agoric-sdk/compare/@agoric/vats@0.4.1...@agoric/vats@0.4.2) (2021-10-13)


### Bug Fixes

* **vats:** Fork polycrc for ESM compat with Endo/Zip ([6d9df0e](https://github.com/Agoric/agoric-sdk/commit/6d9df0e482c2cae3fd52a06fa166f78e0b44b90d))



### [0.4.1](https://github.com/Agoric/agoric-sdk/compare/@agoric/vats@0.4.0...@agoric/vats@0.4.1) (2021-09-23)


### Features

* **solo:** make client objects appear earlier, parallelise chain ([656514e](https://github.com/Agoric/agoric-sdk/commit/656514e5937389c57e139bc1302fa435edd2e674))



## [0.4.0](https://github.com/Agoric/agoric-sdk/compare/@agoric/vats@0.3.2...@agoric/vats@0.4.0) (2021-09-15)


### ⚠ BREAKING CHANGES

* **issuers:** clean up issuers for demo

### Features

* **issuers:** clean up issuers for demo ([228cf1a](https://github.com/Agoric/agoric-sdk/commit/228cf1a80d100e653460823cae62fdd547447cb3))


### Bug Fixes

* more missing Fars. kill "this" ([#3746](https://github.com/Agoric/agoric-sdk/issues/3746)) ([7bd027a](https://github.com/Agoric/agoric-sdk/commit/7bd027a879f98a9a3f30429ee1b54e6057efec42))



### [0.3.2](https://github.com/Agoric/agoric-sdk/compare/@agoric/vats@0.3.1...@agoric/vats@0.3.2) (2021-08-21)

**Note:** Version bump only for package @agoric/vats





### [0.3.1](https://github.com/Agoric/agoric-sdk/compare/@agoric/vats@0.3.0...@agoric/vats@0.3.1) (2021-08-18)

**Note:** Version bump only for package @agoric/vats





## [0.3.0](https://github.com/Agoric/agoric-sdk/compare/@agoric/vats@0.2.15...@agoric/vats@0.3.0) (2021-08-17)


### ⚠ BREAKING CHANGES

* make the run mint within Zoe, and give only the treasury the ability to create a ZCFMint with it

* chore: change 'makeZoe' to 'makeZoeKit'

* chore: add "shutdownZoeVat" argument to Zoe, and pass it to `makeIssuerKit` for invitation issuerKit and fee issuerKit

* chore: manually lint-fix install-on-chain.js

See https://github.com/Agoric/agoric-sdk/issues/3672 for the issue to fix the root problem

### Features

* create feePurse in bootstrap and import to wallet ([4e9d5b0](https://github.com/Agoric/agoric-sdk/commit/4e9d5b0980cae94fdf6d8f78445da5282cbd974f))
* **cosmic-swingset:** provide RUN for sim-chain ([6d27815](https://github.com/Agoric/agoric-sdk/commit/6d2781520b1987c0a9529b300c3a368c09557ee9)), closes [#3266](https://github.com/Agoric/agoric-sdk/issues/3266)


### Bug Fixes

* threshold must be a bigint ([102da87](https://github.com/Agoric/agoric-sdk/commit/102da874e9c62fb4a0acbad208445ffd9b68f0a3))
* **vats:** properly wire in the Zoe kit ([4b926e8](https://github.com/Agoric/agoric-sdk/commit/4b926e86b6d3814fb8e91bc83c1dd91be29cab83))
* **wallet:** never fail to suggestPetname ([dd4fbc1](https://github.com/Agoric/agoric-sdk/commit/dd4fbc166565e7ba1f1a0c06f513570305acefe7))


* BREAKING CHANGE: create the RUN Mint within Zoe (#3647) ([48762aa](https://github.com/Agoric/agoric-sdk/commit/48762aa83a30eaa0a14b2fd87777456758594262)), closes [#3647](https://github.com/Agoric/agoric-sdk/issues/3647)



### [0.2.15](https://github.com/Agoric/agoric-sdk/compare/@agoric/vats@0.2.14...@agoric/vats@0.2.15) (2021-08-16)

**Note:** Version bump only for package @agoric/vats





### [0.2.14](https://github.com/Agoric/agoric-sdk/compare/@agoric/vats@0.2.11...@agoric/vats@0.2.14) (2021-08-15)


### Bug Fixes

* Update packages/vats/src/ibc.js ([d6d5ae2](https://github.com/Agoric/agoric-sdk/commit/d6d5ae2c7517dad53439d7f14f32a0b760b52fa1))
* **vats:** vat-ibc must use LegacyMap, not Store, to hold a Set ([2479017](https://github.com/Agoric/agoric-sdk/commit/2479017af56a352574a3fba4027a055b15336a75)), closes [#3621](https://github.com/Agoric/agoric-sdk/issues/3621)
* Add zcf extensions ([862aefe](https://github.com/Agoric/agoric-sdk/commit/862aefe17d0637114aee017be79a84dbcacad48d))

### 0.26.10 (2021-07-28)


### Features

* improve ag-solo robustness and performance ([b101d3a](https://github.com/Agoric/agoric-sdk/commit/b101d3a4cd4fc97c4a6c794877efc47d43b12f02))



### [0.2.13](https://github.com/Agoric/agoric-sdk/compare/@agoric/vats@0.2.11...@agoric/vats@0.2.13) (2021-08-14)


### Bug Fixes

* Update packages/vats/src/ibc.js ([d6d5ae2](https://github.com/Agoric/agoric-sdk/commit/d6d5ae2c7517dad53439d7f14f32a0b760b52fa1))
* **vats:** vat-ibc must use LegacyMap, not Store, to hold a Set ([2479017](https://github.com/Agoric/agoric-sdk/commit/2479017af56a352574a3fba4027a055b15336a75)), closes [#3621](https://github.com/Agoric/agoric-sdk/issues/3621)
* Add zcf extensions ([862aefe](https://github.com/Agoric/agoric-sdk/commit/862aefe17d0637114aee017be79a84dbcacad48d))

### 0.26.10 (2021-07-28)


### Features

* improve ag-solo robustness and performance ([b101d3a](https://github.com/Agoric/agoric-sdk/commit/b101d3a4cd4fc97c4a6c794877efc47d43b12f02))



### [0.2.12](https://github.com/Agoric/agoric-sdk/compare/@agoric/vats@0.2.11...@agoric/vats@0.2.12) (2021-07-28)


### Features

* improve ag-solo robustness and performance ([b101d3a](https://github.com/Agoric/agoric-sdk/commit/b101d3a4cd4fc97c4a6c794877efc47d43b12f02))



### [0.2.11](https://github.com/Agoric/agoric-sdk/compare/@agoric/vats@0.2.10...@agoric/vats@0.2.11) (2021-07-01)


### Bug Fixes

* retreat from `xs-worker-no-gc` to `xs-worker` ([ce5ce00](https://github.com/Agoric/agoric-sdk/commit/ce5ce00c6a07d59ee249bfd736a3d5a66c8b903f))



### [0.2.10](https://github.com/Agoric/agoric-sdk/compare/@agoric/vats@0.2.9...@agoric/vats@0.2.10) (2021-07-01)

**Note:** Version bump only for package @agoric/vats





### [0.2.9](https://github.com/Agoric/agoric-sdk/compare/@agoric/vats@0.2.8...@agoric/vats@0.2.9) (2021-06-28)

**Note:** Version bump only for package @agoric/vats





### [0.2.8](https://github.com/Agoric/agoric-sdk/compare/@agoric/vats@0.2.7...@agoric/vats@0.2.8) (2021-06-25)


### Features

* **swingset:** introduce 'xs-worker-no-gc' for forward compat ([e46cd88](https://github.com/Agoric/agoric-sdk/commit/e46cd883449c02559e2c0c49b66e26695b4b99da))



### [0.2.7](https://github.com/Agoric/agoric-sdk/compare/@agoric/vats@0.2.6...@agoric/vats@0.2.7) (2021-06-24)


### Bug Fixes

* maybe the best of both worlds: xs-worker but no explicit gc() ([8d38e9a](https://github.com/Agoric/agoric-sdk/commit/8d38e9a3d50987cd21e642e330d482e6e733cd3c))



### [0.2.6](https://github.com/Agoric/agoric-sdk/compare/@agoric/vats@0.2.5...@agoric/vats@0.2.6) (2021-06-24)


### Bug Fixes

* use 'local' worker, not xsnap, on both solo and chain ([a061a3e](https://github.com/Agoric/agoric-sdk/commit/a061a3e92f4ab90d293dfb5bff0223a24ed12d87)), closes [#3403](https://github.com/Agoric/agoric-sdk/issues/3403)



### [0.2.5](https://github.com/Agoric/agoric-sdk/compare/@agoric/vats@0.2.4...@agoric/vats@0.2.5) (2021-06-23)

**Note:** Version bump only for package @agoric/vats





### [0.2.4](https://github.com/Agoric/agoric-sdk/compare/@agoric/vats@0.2.3...@agoric/vats@0.2.4) (2021-06-16)

**Note:** Version bump only for package @agoric/vats





### [0.2.3](https://github.com/Agoric/agoric-sdk/compare/@agoric/vats@0.2.2...@agoric/vats@0.2.3) (2021-06-15)


### Features

* create a feeCollectorDepositFacet ([60f7ea0](https://github.com/Agoric/agoric-sdk/commit/60f7ea0b3fc9f12a8192284695e7c454833ced15))
* tackle the [@erights](https://github.com/erights) challenge ([d4b8d34](https://github.com/Agoric/agoric-sdk/commit/d4b8d343bbf4cb39237f2e6901bf02cf7ca51a57))
* use feeCollectorDepositFacet ([7e97cc1](https://github.com/Agoric/agoric-sdk/commit/7e97cc1e86ae5b4bf35ae5cb592529bffdf2658c))
* **repl:** better stringification of Symbols ([658cf1b](https://github.com/Agoric/agoric-sdk/commit/658cf1b6a5e330b9d3fddf0a2b3ee8242614d373))


### Bug Fixes

* have supplyCoins decide amount to escrow for the bank purses ([c7cba64](https://github.com/Agoric/agoric-sdk/commit/c7cba64ccbead69ea74920b5bfbf7d7a17cd0e9b))
* Pin ESM to forked version ([54dbb55](https://github.com/Agoric/agoric-sdk/commit/54dbb55d64d7ff7adb395bc4bd9d1461dd2d3c17))
* remove references to @agoric/babel-parser ([e4b1e2b](https://github.com/Agoric/agoric-sdk/commit/e4b1e2b4bb13436ef53f055136a4a1d5d933d99e))
* **repl:** render the unjsonable things described in [#2278](https://github.com/Agoric/agoric-sdk/issues/2278) ([bef7d37](https://github.com/Agoric/agoric-sdk/commit/bef7d3746c1ba03fa95ac9c696d602e88ad05f6d))
* remove references to @agoric/registrar ([ec6cc6d](https://github.com/Agoric/agoric-sdk/commit/ec6cc6d8f1da9ec5a38420b501562eaebfbdc76c))



## [0.2.2](https://github.com/Agoric/agoric-sdk/compare/@agoric/vats@0.2.1...@agoric/vats@0.2.2) (2021-05-10)


### Bug Fixes

* simplify scheduling in distributeFees ([#3051](https://github.com/Agoric/agoric-sdk/issues/3051)) ([eb6b8fe](https://github.com/Agoric/agoric-sdk/commit/eb6b8fe5fd6013e854b81198916d13a333e8ab59)), closes [#3044](https://github.com/Agoric/agoric-sdk/issues/3044)
* update AMM liquidity ([56884f1](https://github.com/Agoric/agoric-sdk/commit/56884f19ca95df4586880afa717d06d09a5d5c1b))





## [0.2.1](https://github.com/Agoric/agoric-sdk/compare/@agoric/vats@0.2.0...@agoric/vats@0.2.1) (2021-05-05)

**Note:** Version bump only for package @agoric/vats





# 0.2.0 (2021-05-05)


### Bug Fixes

* add brand to `depositMultiple` mock bank ([0d1f22d](https://github.com/Agoric/agoric-sdk/commit/0d1f22d2f091ccf330428a1573e0043820b21ac2))
* polishing touches ([334a253](https://github.com/Agoric/agoric-sdk/commit/334a253c02dc1c74117237f6ae18b31505e635af))
* remove awaita from `depositMultiple` ([a7da714](https://github.com/Agoric/agoric-sdk/commit/a7da714e54f2c6e2427ac44c26e5c359ebde92aa))
* update types and implementation now that Far preserves them ([a4695c4](https://github.com/Agoric/agoric-sdk/commit/a4695c43a09abc92a20c12104cfbfefb4cae2ff2))


### Features

* add bank assets for "cosmos" issuers (currently BLD) ([3148b83](https://github.com/Agoric/agoric-sdk/commit/3148b8337db517e0908b07df93c9b7d497ddcf40))
* add home.bank and home.bankManager ([276a1d3](https://github.com/Agoric/agoric-sdk/commit/276a1d3eb28fe83b1f59ca329e645aa1e9686849))
* default to xs-worker in chain ([#2995](https://github.com/Agoric/agoric-sdk/issues/2995)) ([7ebb5d8](https://github.com/Agoric/agoric-sdk/commit/7ebb5d8dac86662e167ff0333cc655bd511d2c58))
* donate RUN from the bootstrap payment on each provision ([43c5db5](https://github.com/Agoric/agoric-sdk/commit/43c5db5d819a3be059a5ead074aa96c3d87416c4))
* first cut at a virtual purse API ([0c46a9d](https://github.com/Agoric/agoric-sdk/commit/0c46a9ddacbb5b06217104414ebd4cca6cb2e410))
* handle VPURSE_BALANCE_UPDATE as return value from GIVE/GRAB ([6e62c24](https://github.com/Agoric/agoric-sdk/commit/6e62c244b2e1c07fbcfca8e4882ff9c1135f457e))
* have the bank use normal purses when not on chain ([90ab888](https://github.com/Agoric/agoric-sdk/commit/90ab888c5cdc71a2322ca05ad813c6411c876a74))
* implement vat-bank and test ([e7c342a](https://github.com/Agoric/agoric-sdk/commit/e7c342aa27b6d4090e4f9f922637d5621c35a9a5))
* wire up vats.distributeFees ([9e16332](https://github.com/Agoric/agoric-sdk/commit/9e163327602fad3a6ba3264c7fa29c02e07af765))
* **vats:** fully-working decentral services ([3525283](https://github.com/Agoric/agoric-sdk/commit/3525283edb8f24718f35c942684ec2feca8ebbb7))
* **vpurse:** connect to golang ([d2f719d](https://github.com/Agoric/agoric-sdk/commit/d2f719dce9936a129817a3781bc1de8c4367bb46))
