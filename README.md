# NPM check engines

[![CodeQL](https://github.com/smarlhens/npm-check-engines/workflows/codeql/badge.svg)](https://github.com/smarlhens/npm-check-engines/actions/workflows/codeql.yml)
[![GitHub CI](https://github.com/smarlhens/npm-check-engines/workflows/ci/badge.svg)](https://github.com/smarlhens/npm-check-engines/actions/workflows/ci.yml)
![node-current (scoped)](https://img.shields.io/node/v/@smarlhens/npm-check-engines)
[![GitHub license](https://img.shields.io/github/license/smarlhens/npm-check-engines)](https://github.com/smarlhens/npm-check-engines)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

**npm-check-engines upgrades your package.json node engines constraint to the most restrictive used by your dependencies.**

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
  - [CLI](#cli)
  - [Node](#node)
- [CLI Options](#cli-options)
- [Debug](#debug)
- [Thanks](#thanks)

---

## Prerequisites

- [Node.JS](https://nodejs.org/en/download/) **version ^16.14.0 || ^18.0.0**

---

## Installation

Install globally:

```sh
npm install -g @smarlhens/npm-check-engines
```

Or run with [npx](https://docs.npmjs.com/cli/v8/commands/npx):

```sh
npx @smarlhens/npm-check-engines
```

---

## Usage

### CLI

Show the most restrictive constraint (**opinionated**) of the node engine for the project in the current directory based on the npm `package-lock.json` file:

```sh
$ nce
✔ Computed engines range constraints:

 node  *  →  ^14.17.0 || ^16.10.0 || >=17.0.0

Run nce -u to upgrade package.json.
```

Upgrade a project's `package.json` file:

```sh
$ nce -u
✔ Computed engines range constraints:

 node  *  →  ^14.17.0 || ^16.10.0 || >=17.0.0
```

### Node

```typescript
import { checkEnginesFromString, validatePackageJson, validatePackageLock } from '@smarlhens/npm-check-engines';

let packageJsonString = ''; // load content of package.json as stringified JSON
let packageLockString = ''; // load content of package-lock.json as stringified JSON

validatePackageJson({ packageJsonString }); // can throw Errors if unexpected format
validatePackageLock({ packageLockString }); // can throw Errors if unexpected format

// packageJson is the content of your package.json with updated engines
// packageLock is the content of your package-lock.json with updated engines of the root project in packages
// enginesRangeToSet contains changes if you want to display them
const { enginesRangeToSet, packageJson, packageLock } = checkEnginesFromString({
  packageJsonString,
  packageLockString,
});
console.log(packageJson);
console.log(packageLock);
console.log(
  enginesRangeToSet
    .map(({ engine, range, rangeToSet }) => `${engine} range "${range}" replaced by "${rangeToSet}"`)
    .join('\n'),
);
```

---

## CLI Options

```text
Usage: nce [options]

Options:
  -p, --path     Path to the NPM package folder. Default will use current folder.                 [string]
  -q, --quiet    Enable quiet mode.                                             [boolean] [default: false]
  -d, --debug    Enable debug mode. Can be used with environment variable DEBUG=nce.
                                                                                [boolean] [default: false]
  -v, --verbose  A little more detailed than the default output.                [boolean] [default: false]
  -e, --engines  Select engines to check. Default will check all engines defined.                  [array]
  -u, --update   Update engines in package.json and package-lock.json.          [boolean] [default: false]
      --enableEngineStrict  Enable engine strict.                               [boolean] [default: false]
      --help     Show help                                                                       [boolean]
      --version  Show version number                                                             [boolean]

Examples:
  nce                 Check package-lock.json file in current working directory.
  nce -p examples -u  Check package-lock.json file and update engines in package.json in relative examples
                      directory.

© 2023 Samuel MARLHENS
```

---

## Debug

```sh
$ DEBUG=* nce -d
```

<details>

<summary>output with debug</summary>

```text
[STARTED] Checking npm package engines range constraints in package-lock.json file...
[TITLE] Checking npm package engines range constraints in examples\package-lock.json file...
[STARTED] Load package.json file...
  nce Relative path to package.json: examples\package.json +0ms
  nce Validate JSON schema of examples\package.json +3ms
[SUCCESS] Load package.json file...
[STARTED] Load package-lock.json file...
  nce Relative path to package-lock.json: examples\package-lock.json +7ms
  nce Validate JSON schema of examples\package-lock.json +1ms
[SUCCESS] Load package-lock.json file...
[STARTED] Compute engines range constraints...
  nce:node Package  has no constraints for current engine +0ms
  nce:node Final computed engine range constraint: * +0ms
  nce:node Package  has no constraints for current engine +0ms
  nce:node Compare: * and >=6.9.0 +1ms
  nce:node Range >=6.9.0 is a subset of * +1ms
  nce:node New most restrictive range: >=6.9.0 +0ms
  nce:node Compare: >=6.9.0 and >=12.22.0 +0ms
  nce:node Range >=12.22.0 is a subset of >=6.9.0 +1ms
  nce:node New most restrictive range: >=12.22.0 +0ms
  nce:node Ignored range: * +0ms
  nce:node Compare: >=12.22.0 and >=7.0.0 +0ms
  nce:node Range >=12.22.0 is a subset of >=7.0.0 +0ms
  nce:node Package node_modules/noengines has no constraints for current engine +1ms
  nce:node Compare: >=12.22.0 and >=12.13.0 <13.0.0-0||>=14.15.0 <15.0.0-0||>=16.10.0 <17.0.0-0||>=17.0.0 +1ms
  nce:node Applying minimal version 12.22.0 to both ranges. +0ms
  nce:node Compare: >=12.22.0 and >=12.22.0 <13.0.0-0||>=14.15.0 <15.0.0-0||>=16.10.0 <17.0.0-0||>=17.0.0 +1ms
  nce:node Range >=12.22.0 <13.0.0-0||>=14.15.0 <15.0.0-0||>=16.10.0 <17.0.0-0||>=17.0.0 is a subset of >=12.22.0 +1ms
  nce:node New most restrictive range: >=12.22.0 <13.0.0-0||>=14.15.0 <15.0.0-0||>=16.10.0 <17.0.0-0||>=17.0.0 +0ms
  nce:node Compare: >=12.22.0 <13.0.0-0||>=14.15.0 <15.0.0-0||>=16.10.0 <17.0.0-0||>=17.0.0 and >=16.0.0||>=14.17.0 <15.0.0-0 +0ms
  nce:node Applying minimal version 14.17.0 to both ranges. +1ms
  nce:node Compare: >=14.17.0 <15.0.0-0||>=16.10.0 <17.0.0-0||>=17.0.0 and >=14.17.0 <15.0.0-0||>=16.0.0 +0ms
  nce:node Range >=14.17.0 <15.0.0-0||>=16.10.0 <17.0.0-0||>=17.0.0 is a subset of >=14.17.0 <15.0.0-0||>=16.0.0 +0ms
  nce:node New most restrictive range: >=14.17.0 <15.0.0-0||>=16.10.0 <17.0.0-0||>=17.0.0 +0ms
  nce:node Final computed engine range constraint: >=14.17.0 <15.0.0-0||>=16.10.0 <17.0.0-0||>=17.0.0 +0ms
  nce:npm Package  has no constraints for current engine +0ms
  nce:npm Final computed engine range constraint: * +0ms
  nce:npm Package  has no constraints for current engine +0ms
  nce:npm Package node_modules/foo has no constraints for current engine +0ms
  nce:npm Package node_modules/bar has no constraints for current engine +0ms
  nce:npm Package node_modules/all has no constraints for current engine +0ms
  nce:npm Package node_modules/arr has no constraints for current engine +0ms
  nce:npm Package node_modules/noengines has no constraints for current engine +0ms
  nce:npm Package node_modules/complex1 has no constraints for current engine +1ms
  nce:npm Package node_modules/complex2 has no constraints for current engine +0ms
  nce:npm Final computed engine range constraint: * +0ms
  nce:yarn Package  has no constraints for current engine +0ms
  nce:yarn Final computed engine range constraint: * +0ms
  nce:yarn Package  has no constraints for current engine +0ms
  nce:yarn Package node_modules/foo has no constraints for current engine +0ms
  nce:yarn Package node_modules/bar has no constraints for current engine +0ms
  nce:yarn Package node_modules/all has no constraints for current engine +0ms
  nce:yarn Package node_modules/arr has no constraints for current engine +1ms
  nce:yarn Package node_modules/noengines has no constraints for current engine +0ms
  nce:yarn Package node_modules/complex1 has no constraints for current engine +0ms
  nce:yarn Package node_modules/complex2 has no constraints for current engine +0ms
  nce:yarn Final computed engine range constraint: * +0ms
[SUCCESS] Compute engines range constraints...
[STARTED] Output computed engines range constraints...
  nce:node Simplified computed engine range constraint: ^14.17.0 || ^16.10.0 || >=17.0.0 +0ms
[TITLE] Computed engines range constraints:
[TITLE]
[TITLE]  node  *  →  ^14.17.0 || ^16.10.0 || >=17.0.0
[TITLE]
[TITLE] Run nce -p examples -d -u to upgrade package.json.
[SUCCESS] Output computed engines range constraints...
[STARTED] Update package.json file...
[SKIPPED] Update is disabled by default.
[STARTED] Enabling engine-strict using .npmrc...
[SKIPPED] Enabling engine-strict is disabled by default.
[SUCCESS] Computed engines range constraints:
[SUCCESS]
[SUCCESS]  node  *  →  ^14.17.0 || ^16.10.0 || >=17.0.0
[SUCCESS]
[SUCCESS] Run nce -p examples -d -u to upgrade package.json.
```

</details>

---

## Thanks

This project is heavily inspired by the following awesome project: [npm-check-updates](https://github.com/raineorshine/npm-check-updates).

---
