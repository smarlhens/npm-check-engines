module.exports = {
  reject: [],
  target: name => {
    const targets = {
      // breaking changes to check
      typescript: 'minor',

      // following .nvmrc
      '@types/node': 'minor',

      // require node 20
      '@trivago/prettier-plugin-sort-imports': 'minor',
      'find-up': 'minor',
      'lint-staged': 'minor',
      rimraf: 'minor',
      'sort-package-json': 'minor',
      vitest: 'minor',
      '@vitest/': 'minor',
      yargs: 'minor',

      // require node 22
      listr2: 'minor',
    };

    const keys = Object.keys(targets);
    if (keys.some(key => new RegExp(key).test(name))) {
      return targets[keys.find(key => new RegExp(key).test(name))];
    }

    return 'latest';
  },
};
