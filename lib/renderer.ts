import type { ListrDefaultRendererOptions, ListrRendererValue } from 'listr2';

export const renderer = (
  { debug, quiet, verbose }: { debug?: boolean; quiet?: boolean; verbose?: boolean },
  env = process.env,
): ListrDefaultRendererOptions<ListrRendererValue> => {
  if (quiet) {
    return { renderer: 'silent' };
  }

  if (verbose) {
    return { renderer: 'simple' };
  }

  const isDumbTerminal = env.TERM === 'dumb';

  if (debug || isDumbTerminal || env.NODE_ENV === 'test') {
    return { renderer: 'verbose' };
  }

  return { renderer: 'default', rendererOptions: { dateFormat: false } };
};
