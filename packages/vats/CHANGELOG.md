# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
