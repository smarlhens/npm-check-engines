#!/usr/bin/env node
import process from 'node:process';
import updateNotifier, { Package } from 'update-notifier';

import { nce } from '../lib/index.js';
import { getJson, joinPath } from '../lib/utils.js';
import { cli } from '../lib/yargs.js';

(async () => {
  const packageJSON = './package.json' as const;
  const cliArgs = await cli;
  const pathToFile = joinPath(process.cwd(), packageJSON);
  const packageJson = await getJson<Package>(pathToFile);
  const notifier = updateNotifier({
    pkg: packageJson,
    updateCheckInterval: 1000 * 60,
    shouldNotifyInNpmScript: true,
  });

  if (notifier.update && notifier.update.latest !== packageJson.version) {
    notifier.notify({
      defer: false,
      isGlobal: true,
    });
  }

  await nce(cliArgs);
})();
