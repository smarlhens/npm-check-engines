import { describe, expect, it, vi } from 'vitest';

import { debug, enableNamespaces, namespaces } from '../../lib/debug.js';

const Debug = require('debug');

describe('debug', () => {
  it('should instantiate debug namespace', () => {
    expect(debug).toBeTruthy();
    expect(debug.namespace).toEqual('nce');
  });

  it('should disable namespace', () => {
    const spy = vi.spyOn(Debug, 'disable');
    namespaces();
    expect(spy).toHaveBeenCalled();
  });

  it('should enable namespaces', () => {
    const spy = vi.spyOn(Debug, 'enable');
    enableNamespaces('nce');
    expect(spy).toHaveBeenCalledWith('nce');
  });
});
