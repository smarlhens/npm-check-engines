import { normalize } from 'node:path';

import { debug, enableNamespaces, namespaces } from './debug';
import { renderer } from './renderer';
import { cliCommandTask } from './tasks';
import { CLIContext, packageJSONFilename, packageLockJSONFilename } from './types';
import { CLIArgs } from './yargs';

export const nce = async (args: CLIArgs): Promise<CLIContext> => {
  const cliArgs = args;

  let context: CLIContext = {
    workingDir: normalize(process.cwd()),
    path: normalize(cliArgs.path || ''),
    update: cliArgs.update || false,
    verbose: cliArgs.verbose || false,
    quiet: cliArgs.quiet || false,
    debug: cliArgs.debug || false,
    engines: cliArgs.engines,
    packageObject: { filename: packageJSONFilename },
    packageLockObject: { filename: packageLockJSONFilename },
  };

  const options = {
    ...renderer({ quiet: context.quiet, debug: context.debug, verbose: context.verbose }),
    ctx: context,
  };

  const debugNamespaces = namespaces();
  if (context.debug) {
    enableNamespaces(debugNamespaces);
  }

  return cliCommandTask(options, debug).run();
};
