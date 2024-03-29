/* istanbul ignore file */
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export type CLIArgs = {
  [p: string]: unknown;
  update?: boolean;
  quiet?: boolean;
  verbose?: boolean;
  debug?: boolean;
  enableEngineStrict?: boolean;
  engines?: string[];
  _?: Array<string | number>;
  $0?: string;
};

const argv = yargs(hideBin(process.argv));
export const cli: Promise<CLIArgs> = argv
  .scriptName('nce')
  .usage('Usage: $0 [options]')
  .example('$0', 'Check package-lock.json file in current working directory.')
  .strict()
  .options({
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
      description: 'Update engines in package.json and package-lock.json.',
    },
    enableEngineStrict: {
      boolean: true,
      default: false,
      description: 'Enable engine strict.',
    },
  })
  .help('help')
  .version()
  .wrap(argv.terminalWidth())
  .epilog('© 2023 Samuel MARLHENS').argv as Promise<CLIArgs>;
