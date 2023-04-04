import * as semver from 'semver';
import { describe, expect, it } from 'vitest';

import { restrictiveRange } from '../lib/nce.js';

describe('restrictive range', () => {
  it('should set minimum version', async () => {
    const a = new semver.Range('^16.14.0 || >=18.0.0');
    const b = new semver.Range('^16.13.0 || ^18.10.0');
    const expected = new semver.Range('^16.14.0 || ^18.10.0');
    const result = restrictiveRange(a, b, [], (_: string) => {});
    expect(result.range).toEqual(expected.range);
  });

  it('should a if no intersection', async () => {
    const a = new semver.Range('^1.0.0');
    const b = new semver.Range('>=2.0.0');
    const expected = new semver.Range('^1.0.0');
    const result = restrictiveRange(a, b, [], (_: string) => {});
    expect(result.range).toEqual(expected.range);
  });

  it('should drop major and apply min version', async () => {
    const a = new semver.Range('^14.18.0 || ^16.14.0 || >=18.0.0');
    const b = new semver.Range('^16.13.0 || ^18.10.0');
    const expected = new semver.Range('^16.14.0 || ^18.10.0');
    const result = restrictiveRange(a, b, [], (_: string) => {});
    expect(result.range).toEqual(expected.range);
  });
});
