import { debug, enableNamespaces, namespaces } from '../../lib/debug';
const Debug = require('debug');

describe('debug', () => {
  it('should instantiate debug namespace', () => {
    expect(debug).toBeTruthy();
    expect(debug.namespace).toEqual('nce');
  });

  it('should disable namespace', () => {
    const spy = jest.spyOn(Debug, 'disable');
    namespaces();
    expect(spy).toHaveBeenCalled();
  });

  it('should enable namespaces', () => {
    const spy = jest.spyOn(Debug, 'enable');
    enableNamespaces('nce');
    expect(spy).toHaveBeenCalledWith('nce');
  });
});
