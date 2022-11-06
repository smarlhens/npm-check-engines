# Changelog

## [0.7.2](https://github.com/smarlhens/npm-check-engines/compare/v0.7.1...v0.7.2) (2022-11-06)


### Bug Fixes

* use process working dir to retrieve package json ([ea5ada5](https://github.com/smarlhens/npm-check-engines/commit/ea5ada51f3d9bb51e577cc828c18646755a56868))

## [0.7.1](https://github.com/smarlhens/npm-check-engines/compare/v0.7.0...v0.7.1) (2022-11-05)


### Miscellaneous

* change imports, remove unused variables ([c94683d](https://github.com/smarlhens/npm-check-engines/commit/c94683d239f1194e0fbea1db3424dce80b76c8b1))
* move to vitest, chalk; remove babel, colorette, jest; es2022 ([3ff18da](https://github.com/smarlhens/npm-check-engines/commit/3ff18da7811b0e36be0b4682b654ffffafd62a1e))
* remove json imports, load json using fs-extra ([d73e09f](https://github.com/smarlhens/npm-check-engines/commit/d73e09f1eec615fa3d2212be4deaf1da7961c5bb))
* use tsup instead of tsc, export to esm, add .d.ts to package ([e475f45](https://github.com/smarlhens/npm-check-engines/commit/e475f454fb49476da6d4f75a3b02956868888004))


### Chores

* set node minimal version to v16.13 ([a13c29c](https://github.com/smarlhens/npm-check-engines/commit/a13c29c9b807196d23807d425f377bec536ea77b))

## [0.7.0](https://github.com/smarlhens/npm-check-engines/compare/v0.6.0...v0.7.0) (2022-07-03)


### Features

* tips to upgrade package.json when new computed range constraints are available ([17ea35f](https://github.com/smarlhens/npm-check-engines/commit/17ea35f2e0eb2240c85c46fc16fdef25411d0188))


### Documentation

* **readme:** add missing thanks link in toc ([0e579a4](https://github.com/smarlhens/npm-check-engines/commit/0e579a4d475936c59595ac18301c0ac0c600fe76))

## [0.6.0](https://github.com/smarlhens/npm-check-engines/compare/v0.5.0...v0.6.0) (2022-07-03)


### Features

* use update-notifier to check for tool updates ([17fa3d9](https://github.com/smarlhens/npm-check-engines/commit/17fa3d95a60f5234b3f1583a8a9c9f0616dd80df))


### Miscellaneous

* simplify imports ([084f677](https://github.com/smarlhens/npm-check-engines/commit/084f677d488f0cf3845a80d474d20d0773a04834))


### Chores

* clarify imports order using prettier plugin ([530dec3](https://github.com/smarlhens/npm-check-engines/commit/530dec38837d60d5dbf8fa8dd6a2fc87b646aa1c))
* **deps:** update dependency @types/node to v18 ([23efdfd](https://github.com/smarlhens/npm-check-engines/commit/23efdfddcda846b30a2c9cec6c2e9c156f0aec7f))
* **typescript:** enforce tsconfig & type checking ([b39f097](https://github.com/smarlhens/npm-check-engines/commit/b39f097b51e4aa130f0708276e16cc7096424c89))

## [0.5.0](https://github.com/smarlhens/npm-check-engines/compare/v0.4.3...v0.5.0) (2022-07-03)


### Features

* clarify computed engines range constraints using table with before & after ([e675e3b](https://github.com/smarlhens/npm-check-engines/commit/e675e3ba7de42b564d1b479573af12fa4c023485))


### Bug Fixes

* **npm:** remove minimist overrides ([78337f7](https://github.com/smarlhens/npm-check-engines/commit/78337f75a94f99d6504244ca784d5a7c3c6354ed))


### Documentation

* **readme:** add thanks section ([d4517d8](https://github.com/smarlhens/npm-check-engines/commit/d4517d816868314915d3d94e686ebb65cf1ab2c5))
* **readme:** reduce width of text ([ad721ed](https://github.com/smarlhens/npm-check-engines/commit/ad721ed304259cca43a0ef7022d684917246d162))


### Chores

* add format markdown files using prettier ([bae0798](https://github.com/smarlhens/npm-check-engines/commit/bae07988821c4a4009f38ef29aae3ed7f3a659ab))
* **deps:** update babel monorepo to v7.18.6 ([a869dcf](https://github.com/smarlhens/npm-check-engines/commit/a869dcf9e92ee0904e43192b5c0c4802bd4474b4))
* **deps:** update commitlint monorepo to v17.0.3 ([8ed112a](https://github.com/smarlhens/npm-check-engines/commit/8ed112a50300bb5965aaa6bf96620dad783f9c1e))
* **deps:** update dependency @types/jest to v28.1.3 ([f44cdbe](https://github.com/smarlhens/npm-check-engines/commit/f44cdbe1f299d3ff552b91f22e158e3d78968235))
* **deps:** update dependency @types/jest to v28.1.4 ([2280e9a](https://github.com/smarlhens/npm-check-engines/commit/2280e9a12db283775bd7f1cdb29157a61e095f3c))
* **deps:** update dependency lint-staged to v13.0.3 ([d02aea3](https://github.com/smarlhens/npm-check-engines/commit/d02aea3328de97105a88482e739d8e6e72d5392f))
* **deps:** update dependency ts-node to v10.8.2 ([94e2b98](https://github.com/smarlhens/npm-check-engines/commit/94e2b987b2ee7bc1b1b66a1e79d9a5289e9bb3a7))
* **deps:** update jest monorepo to v28.1.2 ([c72c044](https://github.com/smarlhens/npm-check-engines/commit/c72c0443f102a0944fc08f6181ae289cfbaf3588))
* **gh-actions:** pin-down node version used in ci jobs ([0dd7936](https://github.com/smarlhens/npm-check-engines/commit/0dd793631a8c7a6b1868b8d16c59c8ebf2794dd3))
* remove unused commitizen related dependency & badge ([b0cbf83](https://github.com/smarlhens/npm-check-engines/commit/b0cbf836dca5ee75b493e885bce37ce8d0849160))

## [0.4.3](https://github.com/smarlhens/npm-check-engines/compare/v0.4.2...v0.4.3) (2022-06-18)


### Bug Fixes

* **deps:** update dependency colorette to v2.0.19 ([281242c](https://github.com/smarlhens/npm-check-engines/commit/281242c59d04bb3c9fc1ff107d4b3dfdcdc8e99a))


### Chores

* **deps:** update dependency @babel/core to v7.18.5 ([601783a](https://github.com/smarlhens/npm-check-engines/commit/601783a96ae78057ff0111a036e69e0b869b0bcb))
* **deps:** update dependency @types/jest to v28.1.2 ([c072752](https://github.com/smarlhens/npm-check-engines/commit/c072752e5a1d88d8a49d07315985f569005eb883))
* **deps:** update dependency @types/semver to v7.3.10 ([841925a](https://github.com/smarlhens/npm-check-engines/commit/841925a060353105beb25f9218fc7cc29c58f855))
* **deps:** update dependency lint-staged to v13.0.1 ([7e3c509](https://github.com/smarlhens/npm-check-engines/commit/7e3c509c2d933e8bbed30996496e6da2458c7a91))
* **deps:** update dependency lint-staged to v13.0.2 ([e9c715e](https://github.com/smarlhens/npm-check-engines/commit/e9c715e665571927ebaeabf880d5361a2135d4d9))
* **deps:** update dependency prettier to v2.7.1 ([1cc780d](https://github.com/smarlhens/npm-check-engines/commit/1cc780dbf80055dd00129b11e4c4dc6fd3b49d41))
* **deps:** update dependency typescript to v4.7.4 ([d10a5d5](https://github.com/smarlhens/npm-check-engines/commit/d10a5d5559438b0d5499cea9c3a14597b17c7950))

## [0.4.2](https://github.com/smarlhens/npm-check-engines/compare/v0.4.1...v0.4.2) (2022-06-08)


### Chores

* **deps:** update dependency @types/jest to v28.1.1 ([990732b](https://github.com/smarlhens/npm-check-engines/commit/990732b13009c8350232d112822589d7a9f9301c))
* **deps:** update jest monorepo to v28.1.1 ([a05193b](https://github.com/smarlhens/npm-check-engines/commit/a05193b59324f417241b3e460f0e77fb322a9a5b))


### Documentation

* **readme:** add lgtm badges ([2dac6ac](https://github.com/smarlhens/npm-check-engines/commit/2dac6ac13c2b5568f1b84d3b623343275de3404f))


### Miscellaneous

* **release-please:** remove signoff option ([5ad0155](https://github.com/smarlhens/npm-check-engines/commit/5ad0155693846b1424e5592972aeee072cfddbb3))

## [0.4.1](https://github.com/smarlhens/npm-check-engines/compare/v0.4.0...v0.4.1) (2022-06-04)


### Bug Fixes

* **deps:** update dependency colorette to v2.0.17 ([624217c](https://github.com/smarlhens/npm-check-engines/commit/624217cb2dfdb56149fc29b8461e814f7186902c))


### Chores

* **deps:** move form dependencies to devDependencies ([310248f](https://github.com/smarlhens/npm-check-engines/commit/310248fb9fb5e4b621b73c7784ac49ff415f9d2a))
* **deps:** update commitlint monorepo to v17.0.2 ([9a05965](https://github.com/smarlhens/npm-check-engines/commit/9a059657a6a5a4a07e48323506a8d47360c7cf15))
* **deps:** update dependency @types/jest to v28 ([63ce9fc](https://github.com/smarlhens/npm-check-engines/commit/63ce9fce0c86eb37903d790f94dbea01d727ee5d))
* **deps:** update dependency lint-staged to v13 ([6b92d2e](https://github.com/smarlhens/npm-check-engines/commit/6b92d2eb4715d8832dc91262f500615562343878))
* **deps:** update dependency ts-node to v10.8.1 ([82538fb](https://github.com/smarlhens/npm-check-engines/commit/82538fbdd2cdb74fba73a6d2080a67706e311ba2))
* **deps:** update dependency typescript to v4.7.3 ([56913f7](https://github.com/smarlhens/npm-check-engines/commit/56913f7f21c0558564b1d6f43844489ad2fb7084))


### Miscellaneous

* **release-please:** update changelog-types, add documentation & chores sections ([710a11c](https://github.com/smarlhens/npm-check-engines/commit/710a11cb1c94b06e02d9bfa8399c9d29205ec6a4))

## [0.4.0](https://github.com/smarlhens/npm-check-engines/compare/v0.3.0...v0.4.0) (2022-05-31)


### Features

* add cli engines option to choose specific engine(s) ([ec06756](https://github.com/smarlhens/npm-check-engines/commit/ec06756f34f0189689bf56670d8ae79c97ec6ce9))
* add support for npm engine ([ae7df76](https://github.com/smarlhens/npm-check-engines/commit/ae7df76a7a695dd4d26e5ded05ecea3d85bde227))
* add yarn engine ([69a4268](https://github.com/smarlhens/npm-check-engines/commit/69a4268a948762c942eb2aadf75d8db029da46f5))

## [0.3.0](https://github.com/smarlhens/npm-check-engines/compare/v0.2.0...v0.3.0) (2022-05-31)


### Features

* prepare multiple engines support ([c4a26f5](https://github.com/smarlhens/npm-check-engines/commit/c4a26f58bb9df197a6cf15992c7317cbdcba7e1f))


### Miscellaneous

* **deps:** update dependency lint-staged to v12.4.3 ([ad00280](https://github.com/smarlhens/npm-check-engines/commit/ad002805f1abbf27d7058a5364a1ada300cf6a6a))
* **deps:** update dependency lint-staged to v12.5.0 ([811d8d8](https://github.com/smarlhens/npm-check-engines/commit/811d8d81e6936e15954cc78c264b8cb263b82871))
* **renovate:** remove limit on PR creation  & open PRs ([2eaf1c5](https://github.com/smarlhens/npm-check-engines/commit/2eaf1c557ca0e59d57b31d4cd02b5595a544b7c2))
* **renovate:** remove semantic-release labels ([73c7f73](https://github.com/smarlhens/npm-check-engines/commit/73c7f73c3f4407d4320c6d6c26f916746d0848ac))

## [0.2.0](https://github.com/smarlhens/npm-check-engines/compare/v0.1.5...v0.2.0) (2022-05-31)


### Features

* handle more complex ranges ([df52a90](https://github.com/smarlhens/npm-check-engines/commit/df52a906104fe2d18dd3ef8cd7780234ef73231e)), closes [#14](https://github.com/smarlhens/npm-check-engines/issues/14)


### Miscellaneous

* **bolt:** add .whitesource configuration file ([233fd7d](https://github.com/smarlhens/npm-check-engines/commit/233fd7d46a93decb19b8f16b725a85976a0e1465))
* **gh-actions:** add style to changelog miscellaneous ([8c3c13b](https://github.com/smarlhens/npm-check-engines/commit/8c3c13bac5436cfabffc48d00af71b2e73db5a26))
* **lint-staged:** lint yml & json files using prettier ([51ef943](https://github.com/smarlhens/npm-check-engines/commit/51ef943c470c69c0d7032fade69c9594db81f935))
* **release-please:** set bump strategies to default ([bb152ff](https://github.com/smarlhens/npm-check-engines/commit/bb152ffacd30941a18e0d8b230b4f921414ca5b0))

### [0.1.5](https://github.com/smarlhens/npm-check-engines/compare/v0.1.4...v0.1.5) (2022-05-30)


### Bug Fixes

* **npm:** remove latest changes regarding publish ([1f9c0d1](https://github.com/smarlhens/npm-check-engines/commit/1f9c0d15931d5696889ec4a50fd990276b676d6f))

### [0.1.4](https://github.com/smarlhens/npm-check-engines/compare/v0.1.3...v0.1.4) (2022-05-30)


### Miscellaneous

* **npm:** remove npmignore ([0b4662f](https://github.com/smarlhens/npm-check-engines/commit/0b4662f9a50b967edfcc68b8bd57364f3a0dbb2f))
* **publish:** revert publish script, move to release ci job ([a6288d3](https://github.com/smarlhens/npm-check-engines/commit/a6288d3a3882b09d34f18c1ddff5380fdbf2c027))

### [0.1.3](https://github.com/smarlhens/npm-check-engines/compare/v0.1.2...v0.1.3) (2022-05-30)


### Bug Fixes

* **npm:** update publish script, bin path ([5e65712](https://github.com/smarlhens/npm-check-engines/commit/5e65712ba43b9aa5a5c6b519bffffb80ba075fc3))


### Miscellaneous

* **gh-actions:** provide registry-url to setup-node ([14d4428](https://github.com/smarlhens/npm-check-engines/commit/14d4428ae4b185557b49b468350969ce19b5fdf5))

### [0.1.2](https://github.com/smarlhens/npm-check-engines/compare/v0.1.1...v0.1.2) (2022-05-30)


### Bug Fixes

* **npm:** provide NODE_AUTH_TOKEN ([1ce6ddc](https://github.com/smarlhens/npm-check-engines/commit/1ce6ddcc5872af3d179b9cc6ac925f1827c61d76))
* **npm:** publish config, auth, remove main entry ([09bf0ab](https://github.com/smarlhens/npm-check-engines/commit/09bf0aba33f1559ec200da491ed93fd62b9d4ad3))
* **npm:** registry auth ([bcfc95c](https://github.com/smarlhens/npm-check-engines/commit/bcfc95cc5a0436414f588919ae0fc0e022981134))


### Miscellaneous

* **CHANGELOG:** enhance commit description ([bb6c5ac](https://github.com/smarlhens/npm-check-engines/commit/bb6c5acad40999afcd28bd7adc3bb2ede2f1cf91))
* **gh-actions:** escaped colon char not interpreted as expected ([40b3242](https://github.com/smarlhens/npm-check-engines/commit/40b3242cd0a778a4f23f89cb193dc23909cd29f4))
* **gh-actions:** provide NPM_TOKEN ([fb9a53c](https://github.com/smarlhens/npm-check-engines/commit/fb9a53c7063de588eef75311e7a7c5fb4b177ed2))

### [0.1.1](https://github.com/smarlhens/npm-check-engines/compare/v0.1.0...v0.1.1) (2022-05-30)


### Miscellaneous

* **gitignore:** do not share idea config ([ecd59e0](https://github.com/smarlhens/npm-check-engines/commit/ecd59e0a16f27d8d187a160bbce27b0ea91cc442))
* **README:** add readme ([9828158](https://github.com/smarlhens/npm-check-engines/commit/9828158b52ab4b957b73e92b76677c61c45053c5))
* **gh-actions:** split publish job, refactor ci & manual release ([e394792](https://github.com/smarlhens/npm-check-engines/commit/e3947923d7d88d94cab789969154ab87fb2ed706))
* **yargs:** enhance options help ([13958a7](https://github.com/smarlhens/npm-check-engines/commit/13958a7ff3db35fa4b80952dc8cb968020508317))

## 0.1.0 (2022-05-29)


### Features

* initial commit ([4726940](https://github.com/smarlhens/npm-check-engines/commit/4726940760863bfdbbe937347d08087556eaa327))
