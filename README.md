# NPM check engines

[![GitHub CI](https://github.com/smarlhens/npm-check-engines/workflows/ci/badge.svg)](https://github.com/smarlhens/npm-check-engines/actions/workflows/ci.yml)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/smarlhens/npm-check-engines.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/smarlhens/npm-check-engines/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/smarlhens/npm-check-engines.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/smarlhens/npm-check-engines/context:javascript)
![node-current (scoped)](https://img.shields.io/node/v/@smarlhens/npm-check-engines)
[![GitHub license](https://img.shields.io/github/license/smarlhens/npm-check-engines)](https://github.com/smarlhens/npm-check-engines)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

**npm-check-engines upgrades your package.json node engines constraint to the most restrictive used by your dependencies.**

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [Debug](#debug)

---

## Prerequisites

- [Node.JS](https://nodejs.org/en/download/) **version ^14.17.0 || ^16.10.0 || ^18.0.0**

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

Show the most restrictive constraint (**opinionated**) of the node engine for the project in the current directory based on the npm `package-lock.json` file:

```sh
$ nce
✔ Computed engines range constraints:
  - node: ^14.17.0 || ^16.10.0 || >=17.0.0
```

Upgrade a project's `package.json` file:

```sh
$ nce -u
✔ Computed engines range constraints:
  - node: ^14.17.0 || ^16.10.0 || >=17.0.0
```

---

## Options

```text
Usage: nce [options]

Options:
  -p, --path     Path to the NPM package folder. Default will use current folder.                     [string]
  -q, --quiet    Enable quiet mode.                                                 [boolean] [default: false]
  -d, --debug    Enable debug mode. Can be used with environment variable DEBUG=nce.[boolean] [default: false]
  -v, --verbose  A little more detailed than the default output.                    [boolean] [default: false]
  -u, --update   Update engines in package.json file.                               [boolean] [default: false]
      --help     Show help                                                                           [boolean]
      --version  Show version number                                                                 [boolean]

Examples:
  nce                 Check package-lock.json file in current working directory.
  nce -p examples -u  Check package-lock.json file and update engines in package.json in relative examples
                      directory.

© 2022 Samuel MARLHENS
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
[STARTED] Load package-lock.json file...
[SUCCESS] Load package-lock.json file...
[STARTED] Compute engines range constraints...
  nce:node Package  has no constraints for current engine +0ms
  nce:node New most restrictive range: >=6.9.0 +2ms
  nce:node Compare: >=6.9.0 and >=12.22.0 +2ms
  nce:node Range >=12.22.0 is a subset of >=6.9.0 +0ms
  nce:node New most restrictive range: >=12.22.0 +0ms
  nce:node Compare: >=12.22.0 and * +1ms
  nce:node Range >=12.22.0 is a subset of * +0ms
  nce:node Compare: >=12.22.0 and >=7.0.0 +0ms
  nce:node Range >=12.22.0 is a subset of >=7.0.0 +0ms
  nce:node Package node_modules/noengines has no constraints for current engine +0ms
  nce:node Compare: >=12.22.0 and >=12.13.0 <13.0.0-0||>=14.15.0 <15.0.0-0||>=16.10.0 <17.0.0-0||>=17.0.0 +1ms
  nce:node Applying minimal version 12.22.0 to both ranges. +1ms
  nce:node Compare: >=12.22.0 and >=12.22.0 <13.0.0-0||>=14.15.0 <15.0.0-0||>=16.10.0 <17.0.0-0||>=17.0.0 +1ms
  nce:node Range >=12.22.0 <13.0.0-0||>=14.15.0 <15.0.0-0||>=16.10.0 <17.0.0-0||>=17.0.0 is a subset of >=12.22.0 +0ms
  nce:node New most restrictive range: >=12.22.0 <13.0.0-0||>=14.15.0 <15.0.0-0||>=16.10.0 <17.0.0-0||>=17.0.0 +0ms
  nce:node Compare: >=12.22.0 <13.0.0-0||>=14.15.0 <15.0.0-0||>=16.10.0 <17.0.0-0||>=17.0.0 and >=16.0.0||>=14.17.0 <15.0.0-0 +1ms
  nce:node Applying minimal version 14.17.0 to both ranges. +0ms
  nce:node Compare: >=14.17.0 <15.0.0-0||>=16.10.0 <17.0.0-0||>=17.0.0 and >=14.17.0 <15.0.0-0||>=16.0.0 +0ms
  nce:node Range >=14.17.0 <15.0.0-0||>=16.10.0 <17.0.0-0||>=17.0.0 is a subset of >=14.17.0 <15.0.0-0||>=16.0.0 +1ms
  nce:node New most restrictive range: >=14.17.0 <15.0.0-0||>=16.10.0 <17.0.0-0||>=17.0.0 +0ms
  nce:node Final computed engine range constraint: >=14.17.0 <15.0.0-0||>=16.10.0 <17.0.0-0||>=17.0.0 +0ms
[SUCCESS] Compute engines range constraints...
[STARTED] Output computed engines range constraints...
  nce:node Simplified computed engine range constraint: ^14.17.0 || ^16.10.0 || >=17.0.0 +0ms
[TITLE] Computed engines range constraints:
[TITLE] - node: ^14.17.0 || ^16.10.0 || >=17.0.0
[SUCCESS] Output computed engines range constraints...
[STARTED] Update package.json file...
[SKIPPED] Update is disabled by default.
[SUCCESS] Computed engines range constraints:
[SUCCESS] - node: ^14.17.0 || ^16.10.0 || >=17.0.0
```

</details>

---
