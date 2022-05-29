import { CLIArgs } from './yargs';
import { CheckCommandContext, CLIContext } from './types';
import { cliCommandTask } from './tasks';
import { renderer } from './renderer';
import { debug, enableNamespaces, namespaces } from './debug';
import { normalize } from 'path';

export const nce = async (args: Promise<CLIArgs>): Promise<CLIContext> => {
  const cliArgs = await args;

  let context: CLIContext = {
    workingDir: normalize(process.cwd()),
    path: normalize(cliArgs.path || ''),
    update: cliArgs.update || false,
    verbose: cliArgs.verbose || false,
    quiet: cliArgs.quiet || false,
    debug: cliArgs.debug || false,
  };

  const options = { ...renderer({ quiet: context.quiet, debug: context.debug, verbose: context.verbose }) };

  if (context.debug) {
    enableNamespaces(namespaces());
  }

  const cmd = cliCommandTask(options, debug);
  const ctx: CheckCommandContext = context;

  return cmd.run(ctx);
};
