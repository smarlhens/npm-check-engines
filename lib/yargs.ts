/* istanbul ignore file */
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export type CLIArgs = {
  [p: string]: unknown;
  path?: string;
  update?: boolean;
  quiet?: boolean;
  verbose?: boolean;
  debug?: boolean;
  engines?: string[];
  _?: Array<string | number>;
  $0?: string;
};

const argv = yargs(hideBin(process.argv));
export const cli: Promise<CLIArgs> = argv
  .scriptName('nce')
  .usage('Usage: $0 [options]')
  .example('$0', 'Check package-lock.json file in current working directory.')
  .example(
    '$0 -p examples -u',
    'Check package-lock.json file and update engines in package.json in relative examples directory.',
  )
  .strict()
  .options({
    path: {
      alias: 'p',
      string: true,
      description: 'Path to the NPM package folder. Default will use current folder.',
    },
    quiet: {
      boolean: true,
      alias: 'q',
      default: false,
      description: 'Enable quiet mode.',
    },
    debug: {
      boolean: true,
      alias: 'd',
      default: false,
      description: 'Enable debug mode. Can be used with environment variable DEBUG=nce.',
    },
    verbose: {
      boolean: true,
      alias: 'v',
      default: false,
      description: 'A little more detailed than the default output.',
    },
    engines: {
      array: true,
      alias: 'e',
      description: 'Select engines to check. Default will check all engines defined.',
    },
    update: {
      boolean: true,
      alias: 'u',
      default: false,
      description: 'Update engines in package.json file.',
    },
  })
  .help('help')
  .version()
  .wrap(argv.terminalWidth())
  .epilog('© 2022 Samuel MARLHENS').argv as Promise<CLIArgs>;
