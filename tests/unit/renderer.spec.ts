import { renderer } from '../../lib/renderer';

describe('renderer', () => {
  it('should return silent renderer when quiet', () => {
    expect(renderer({ quiet: true }, {})).toEqual({ renderer: 'silent' });
  });

  it('should return simple renderer when verbose', () => {
    expect(renderer({ verbose: true }, {})).toEqual({ renderer: 'simple' });
  });

  it('should return verbose renderer when NODE_ENV=test', () => {
    expect(renderer({}, { NODE_ENV: 'test' })).toEqual({ renderer: 'verbose' });
  });

  it('should return test renderer when TERM=dumb', () => {
    expect(renderer({}, { TERM: 'dumb' })).toEqual({ renderer: 'verbose' });
  });

  it('should return verbose renderer when debug', () => {
    expect(renderer({ debug: true }, {})).toEqual({ renderer: 'verbose' });
  });

  it('renderer return default renderer by default', () => {
    expect(renderer({}, {})).toEqual({
      renderer: 'default',
      rendererOptions: {
        dateFormat: false,
      },
    });
  });
});
