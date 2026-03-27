module.exports = {
  reject: [],
  target: name => {
    const targets = {
      // breaking changes to check
      typescript: 'minor',

      // following .nvmrc
      '@types/node': 'minor',

      // v10 requires node 22
      listr2: 'minor',
    };

    const keys = Object.keys(targets);
    if (keys.some(key => new RegExp(key).test(name))) {
      return targets[keys.find(key => new RegExp(key).test(name))];
    }

    return 'latest';
  },
};
