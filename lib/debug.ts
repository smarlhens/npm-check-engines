import Debug, { Debugger } from 'debug';

const nce: string = 'nce' as const;
export const debug: Debugger = Debug(nce);
export const namespaces = () => Debug.disable();
export const enableNamespaces = (namespaces: string): void => Debug.enable(namespaces);
