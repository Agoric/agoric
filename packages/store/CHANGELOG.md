# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [0.6.9](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.6.8...@agoric/store@0.6.9) (2022-02-21)


### Features

* implement persistent stores ([e1050b0](https://github.com/Agoric/agoric-sdk/commit/e1050b010e095b23547a38d48a12e5c8841a7466))
* support element deletion during iteration over a store ([8bb9770](https://github.com/Agoric/agoric-sdk/commit/8bb97702fd478b0b47e2d5454373e80765042106)), closes [#4503](https://github.com/Agoric/agoric-sdk/issues/4503)


### Bug Fixes

* Remove extraneous eslint globals ([17087e4](https://github.com/Agoric/agoric-sdk/commit/17087e4605db7d3b30dfccf2434b2850b45e3408))
* **store:** use explicit `import('@endo/marshal')` JSDoc ([4795147](https://github.com/Agoric/agoric-sdk/commit/47951473d4679c7e95104f5ae32fe63c8547598e))
* Enhance TypeScript node_modules traversal depth ([000f738](https://github.com/Agoric/agoric-sdk/commit/000f73850d46dc7272b2399c06ad774dd3b8fe6e))
* extract early changes from PR 4136 ([#4190](https://github.com/Agoric/agoric-sdk/issues/4190)) ([fea822e](https://github.com/Agoric/agoric-sdk/commit/fea822ec75c27c8758b872730424c0a3f1a1c623))
* fullOrder leak. Semi-fungibles via CopyBags ([#4305](https://github.com/Agoric/agoric-sdk/issues/4305)) ([79c4276](https://github.com/Agoric/agoric-sdk/commit/79c4276da8c856674bd425c54715adec92648c48))
* keys but no patterns yet ([b1fe93b](https://github.com/Agoric/agoric-sdk/commit/b1fe93b0a6b6b04586e48439c596d2436af2f8f4))
* minor adjustments from purple day1 ([#4271](https://github.com/Agoric/agoric-sdk/issues/4271)) ([72cc8d6](https://github.com/Agoric/agoric-sdk/commit/72cc8d6bcf428596653593708959446fb0a29596))
* minor, from purple ([#4304](https://github.com/Agoric/agoric-sdk/issues/4304)) ([2984a74](https://github.com/Agoric/agoric-sdk/commit/2984a7487bcc6064c6cb899b7540e11159eedefd))
* missing Far on some iterables ([#4250](https://github.com/Agoric/agoric-sdk/issues/4250)) ([fe997f2](https://github.com/Agoric/agoric-sdk/commit/fe997f28467eb7f61b711e63a581f396f8390e91))
* ordered set operations ([#4196](https://github.com/Agoric/agoric-sdk/issues/4196)) ([bda9206](https://github.com/Agoric/agoric-sdk/commit/bda920694c7ab573822415653335e258b9c21281))
* Patterns and Keys ([#4210](https://github.com/Agoric/agoric-sdk/issues/4210)) ([cc99f7e](https://github.com/Agoric/agoric-sdk/commit/cc99f7ed7f6de1b6ee86b1b813649820e741e1dc))
* quick "fix" of a red squiggle problem ([#4447](https://github.com/Agoric/agoric-sdk/issues/4447)) ([ee39651](https://github.com/Agoric/agoric-sdk/commit/ee396514c14213a7c9dfa4f73919a9cfe77dd2e6))
* remove pureCopy deleted from endo 1061 ([#4458](https://github.com/Agoric/agoric-sdk/issues/4458)) ([50e8523](https://github.com/Agoric/agoric-sdk/commit/50e852346d0b4005c613e30d10b469d89a4e5564))
* sort preserving order for composite keys ([#4468](https://github.com/Agoric/agoric-sdk/issues/4468)) ([ba1b2ef](https://github.com/Agoric/agoric-sdk/commit/ba1b2efb4bc0f2ca8833ad821a72f400ecb12952))
* towards patterns and stores ([c241e39](https://github.com/Agoric/agoric-sdk/commit/c241e3978a36778197b1bf3874b07f1ed4df9ceb))
* update sort order so undefined comes last ([2d5ab57](https://github.com/Agoric/agoric-sdk/commit/2d5ab5780e83063e387955f8a8e940119c0a1a5c))



### [0.6.8](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.6.7...@agoric/store@0.6.8) (2021-12-22)

**Note:** Version bump only for package @agoric/store





### [0.6.7](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.6.6...@agoric/store@0.6.7) (2021-12-02)

**Note:** Version bump only for package @agoric/store





### [0.6.6](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.6.5...@agoric/store@0.6.6) (2021-10-13)

**Note:** Version bump only for package @agoric/store





### [0.6.5](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.6.4...@agoric/store@0.6.5) (2021-09-23)

**Note:** Version bump only for package @agoric/store





### [0.6.4](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.6.3...@agoric/store@0.6.4) (2021-09-15)

**Note:** Version bump only for package @agoric/store





### [0.6.3](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.6.2...@agoric/store@0.6.3) (2021-08-18)

**Note:** Version bump only for package @agoric/store





### [0.6.2](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.6.1...@agoric/store@0.6.2) (2021-08-17)

**Note:** Version bump only for package @agoric/store





### [0.6.1](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.6.0...@agoric/store@0.6.1) (2021-08-16)

**Note:** Version bump only for package @agoric/store





## [0.6.0](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.4.22...@agoric/store@0.6.0) (2021-08-15)


### ⚠ BREAKING CHANGES

* **swingset:** Convert RESM to NESM

### Code Refactoring

* **swingset:** Convert RESM to NESM ([bf7fd61](https://github.com/Agoric/agoric-sdk/commit/bf7fd6161a79e994c3bc48949e4ccb01b4048772))

### 0.26.10 (2021-07-28)



## [0.5.0](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.4.22...@agoric/store@0.5.0) (2021-08-14)


### ⚠ BREAKING CHANGES

* **swingset:** Convert RESM to NESM

### Code Refactoring

* **swingset:** Convert RESM to NESM ([bf7fd61](https://github.com/Agoric/agoric-sdk/commit/bf7fd6161a79e994c3bc48949e4ccb01b4048772))

### 0.26.10 (2021-07-28)



### [0.4.23](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.4.22...@agoric/store@0.4.23) (2021-07-28)

**Note:** Version bump only for package @agoric/store





### [0.4.22](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.4.21...@agoric/store@0.4.22) (2021-07-01)

**Note:** Version bump only for package @agoric/store





### [0.4.21](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.4.20...@agoric/store@0.4.21) (2021-06-28)

**Note:** Version bump only for package @agoric/store





### [0.4.20](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.4.19...@agoric/store@0.4.20) (2021-06-25)

**Note:** Version bump only for package @agoric/store





### [0.4.19](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.4.18...@agoric/store@0.4.19) (2021-06-24)

**Note:** Version bump only for package @agoric/store





### [0.4.18](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.4.17...@agoric/store@0.4.18) (2021-06-24)

**Note:** Version bump only for package @agoric/store





### [0.4.17](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.4.16...@agoric/store@0.4.17) (2021-06-23)

**Note:** Version bump only for package @agoric/store





### [0.4.16](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.4.15...@agoric/store@0.4.16) (2021-06-16)

**Note:** Version bump only for package @agoric/store





### [0.4.15](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.4.14...@agoric/store@0.4.15) (2021-06-15)


### Bug Fixes

* Pin ESM to forked version ([54dbb55](https://github.com/Agoric/agoric-sdk/commit/54dbb55d64d7ff7adb395bc4bd9d1461dd2d3c17))



## [0.4.14](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.4.13...@agoric/store@0.4.14) (2021-05-10)

**Note:** Version bump only for package @agoric/store





## [0.4.13](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.4.12...@agoric/store@0.4.13) (2021-05-05)

**Note:** Version bump only for package @agoric/store





## [0.4.12](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.4.11...@agoric/store@0.4.12) (2021-05-05)

**Note:** Version bump only for package @agoric/store





## [0.4.11](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.4.10...@agoric/store@0.4.11) (2021-04-22)

**Note:** Version bump only for package @agoric/store





## [0.4.10](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.4.9...@agoric/store@0.4.10) (2021-04-18)

**Note:** Version bump only for package @agoric/store





## [0.4.9](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.4.8...@agoric/store@0.4.9) (2021-04-16)

**Note:** Version bump only for package @agoric/store





## [0.4.8](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.4.7...@agoric/store@0.4.8) (2021-04-14)

**Note:** Version bump only for package @agoric/store





## [0.4.7](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.4.6...@agoric/store@0.4.7) (2021-04-13)

**Note:** Version bump only for package @agoric/store





## [0.4.6](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.4.5...@agoric/store@0.4.6) (2021-04-07)

**Note:** Version bump only for package @agoric/store





## [0.4.5](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.4.4...@agoric/store@0.4.5) (2021-04-06)


### Bug Fixes

* update to depend on ses 0.12.5 ([#2718](https://github.com/Agoric/agoric-sdk/issues/2718)) ([08dbe0d](https://github.com/Agoric/agoric-sdk/commit/08dbe0db5ce06944dc92c710865e441a60b31b5b))





## [0.4.4](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.4.3...@agoric/store@0.4.4) (2021-03-24)

**Note:** Version bump only for package @agoric/store





## [0.4.3](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.4.2...@agoric/store@0.4.3) (2021-03-16)


### Bug Fixes

* make separate 'test:xs' target, remove XS from 'test' target ([b9c1a69](https://github.com/Agoric/agoric-sdk/commit/b9c1a6987093fc8e09e8aba7acd2a1618413bac8)), closes [#2647](https://github.com/Agoric/agoric-sdk/issues/2647)
* **store:** reject empty-object keys which might not retain identity ([c38a4dc](https://github.com/Agoric/agoric-sdk/commit/c38a4dc8aca910d8a4ed5500f56f19ccdd3b43d1)), closes [#2018](https://github.com/Agoric/agoric-sdk/issues/2018)





## [0.4.2](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.4.1...@agoric/store@0.4.2) (2021-02-22)

**Note:** Version bump only for package @agoric/store





## [0.4.1](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.4.0...@agoric/store@0.4.1) (2021-02-16)


### Bug Fixes

* review comments ([7db7e5c](https://github.com/Agoric/agoric-sdk/commit/7db7e5c4c569dfedff8d748dd58893218b0a2458))





# [0.4.0](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.3.1...@agoric/store@0.4.0) (2020-12-10)


### Features

* **import-bundle:** Preliminary support Endo zip hex bundle format ([#1983](https://github.com/Agoric/agoric-sdk/issues/1983)) ([983681b](https://github.com/Agoric/agoric-sdk/commit/983681bfc4bf512b6bd90806ed9220cd4fefc13c))





## [0.3.1](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.3.1-dev.0...@agoric/store@0.3.1) (2020-11-07)


### Bug Fixes

* export `@agoric/store/exported` ([4dee52b](https://github.com/Agoric/agoric-sdk/commit/4dee52ba250564781150df2c24ec22006968ca1a))





## [0.3.1-dev.0](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.3.0...@agoric/store@0.3.1-dev.0) (2020-10-19)

**Note:** Version bump only for package @agoric/store





# [0.3.0](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.2.3-dev.2...@agoric/store@0.3.0) (2020-10-11)


### Bug Fixes

* improve API to punt serialization to the backing store ([fbfc0e7](https://github.com/Agoric/agoric-sdk/commit/fbfc0e75e910bc2fd36f0d60eac3929735d3fe68))
* update @agoric/store types and imports ([9e3493a](https://github.com/Agoric/agoric-sdk/commit/9e3493ad4d8c0a6a9230ad6a4c22a3254a867115))


### Features

* **store:** implement external store machinery ([df4f550](https://github.com/Agoric/agoric-sdk/commit/df4f550270894c75fe25f252ee5db66d4c77e8db))





## [0.2.3-dev.2](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.2.3-dev.1...@agoric/store@0.2.3-dev.2) (2020-09-18)

**Note:** Version bump only for package @agoric/store





## [0.2.3-dev.1](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.2.3-dev.0...@agoric/store@0.2.3-dev.1) (2020-09-18)

**Note:** Version bump only for package @agoric/store





## [0.2.3-dev.0](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.2.2...@agoric/store@0.2.3-dev.0) (2020-09-18)

**Note:** Version bump only for package @agoric/store





## [0.2.2](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.2.1...@agoric/store@0.2.2) (2020-09-16)

**Note:** Version bump only for package @agoric/store





## [0.2.1](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.2.0...@agoric/store@0.2.1) (2020-08-31)


### Bug Fixes

* reduce inconsistency among our linting rules ([#1492](https://github.com/Agoric/agoric-sdk/issues/1492)) ([b6b675e](https://github.com/Agoric/agoric-sdk/commit/b6b675e2de110e2af19cad784a66220cab21dacf))





# [0.2.0](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.1.2...@agoric/store@0.2.0) (2020-06-30)


### Bug Fixes

* replace openDetail with quoting q ([#1134](https://github.com/Agoric/agoric-sdk/issues/1134)) ([67808a4](https://github.com/Agoric/agoric-sdk/commit/67808a4df515630ef7dc77c59054382f626ece96))


### Features

* **zoe:** Zoe release 0.7.0 ([#1143](https://github.com/Agoric/agoric-sdk/issues/1143)) ([4a14455](https://github.com/Agoric/agoric-sdk/commit/4a14455e10f1e3807fd6633594c86a0f60026393))





## [0.1.2](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.1.1...@agoric/store@0.1.2) (2020-05-17)

**Note:** Version bump only for package @agoric/store





## [0.1.1](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.1.0...@agoric/store@0.1.1) (2020-05-10)

**Note:** Version bump only for package @agoric/store





# [0.1.0](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.0.4...@agoric/store@0.1.0) (2020-05-04)


### Bug Fixes

* use the new (typed) harden package ([2eb1af0](https://github.com/Agoric/agoric-sdk/commit/2eb1af08fe3967629a3ce165752fd501a5c85a96))


### Features

* implement channel host handler ([4e68f44](https://github.com/Agoric/agoric-sdk/commit/4e68f441b46d70dee481387ab96e88f1e0b69bfa))





## [0.0.4](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.0.4-alpha.0...@agoric/store@0.0.4) (2020-04-13)

**Note:** Version bump only for package @agoric/store





## [0.0.4-alpha.0](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.0.3...@agoric/store@0.0.4-alpha.0) (2020-04-12)

**Note:** Version bump only for package @agoric/store





## [0.0.3](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.0.3-alpha.0...@agoric/store@0.0.3) (2020-04-02)

**Note:** Version bump only for package @agoric/store





## [0.0.3-alpha.0](https://github.com/Agoric/agoric-sdk/compare/@agoric/store@0.0.2...@agoric/store@0.0.3-alpha.0) (2020-04-02)

**Note:** Version bump only for package @agoric/store





## 0.0.2 (2020-03-26)


### Bug Fixes

* introduce and use Store.entries() ([b572d51](https://github.com/Agoric/agoric-sdk/commit/b572d51df45641da59bc013a0f2e45a694e56cbc))
