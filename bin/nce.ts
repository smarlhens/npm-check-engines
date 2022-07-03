#!/usr/bin/env node
import updateNotifier from 'update-notifier';

import { nce } from '../lib/index';
import { cli } from '../lib/yargs';
import packageJson from '../package.json';

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

nce(cli);
