import {
  checkCommandTasks,
  cliCommandTask,
  computeEnginesConstraints,
  loadLockFile,
  outputComputedConstraints,
  rangeOptions,
  restrictiveRange,
  humanizeRange,
  sortRangeSet,
  updatePackageJson,
} from '../../lib/tasks';
import Comparator from 'semver/classes/comparator';
import Range from 'semver/classes/range';
import { Debugger } from 'debug';
import { ListrRenderer, ListrTaskWrapper } from 'listr2';
import { CheckCommandContext, LockPackage, PackageLockJSONSchema } from '../../lib/types';
import SpyInstance = jest.SpyInstance;
import * as utils from '../../lib/utils';
const fsExtra = require('fs-extra');

describe('tasks', () => {
  it('should sort range', () => {
    expect(
      sortRangeSet([
        [new Comparator('>=16.10.0'), new Comparator('<17.0.0-0')],
        [new Comparator('>=14.17.0'), new Comparator('<15.0.0-0')],
      ]),
    ).toEqual([
      [new Comparator('>=14.17.0'), new Comparator('<15.0.0-0')],
      [new Comparator('>=16.10.0'), new Comparator('<17.0.0-0')],
    ]);
    expect(
      sortRangeSet([
        [new Comparator('>=14.17.0'), new Comparator('<15.0.0-0')],
        [new Comparator('>=16.10.0'), new Comparator('<17.0.0-0')],
      ]),
    ).toEqual([
      [new Comparator('>=14.17.0'), new Comparator('<15.0.0-0')],
      [new Comparator('>=16.10.0'), new Comparator('<17.0.0-0')],
    ]);
  });

  describe('should return restrictive range', () => {
    it('w/ r1 subset of r2', () => {
      expect(
        restrictiveRange(
          new Range('^14.17.0 || ^16.10.0'),
          new Range('^14.0.0 || ^16.0.0'),
          [],
          jest.fn() as unknown as Debugger,
        ),
      ).toEqual(new Range('^14.17.0 || ^16.10.0'));
    });

    it('w/ r2 subset of r1', () => {
      expect(
        restrictiveRange(
          new Range('^14.0.0 || ^16.0.0'),
          new Range('^14.17.0 || ^16.10.0'),
          [],
          jest.fn() as unknown as Debugger,
        ),
      ).toEqual(new Range('^14.17.0 || ^16.10.0'));
    });

    it('w/ r1 subset of r2 using min version', () => {
      expect(
        restrictiveRange(
          new Range('^14.13.0 || ^16.10.0'),
          new Range('^14.17.0 || ^16.0.0'),
          [],
          jest.fn() as unknown as Debugger,
        ),
      ).toEqual(new Range('>=14.17.0 <15.0.0-0||>=16.10.0 <17.0.0-0', rangeOptions));
      expect(
        restrictiveRange(
          new Range('^14.13.0 || ^16.10.0'),
          new Range('^12.22.0 || ^14.17.0 || ^16.0.0'),
          [],
          jest.fn() as unknown as Debugger,
        ),
      ).toEqual(new Range('>=14.17.0 <15.0.0-0||>=16.10.0 <17.0.0-0', rangeOptions));
      expect(
        restrictiveRange(
          new Range('^12.22.0 || ^14.17.0'),
          new Range('^14.13.0 || ^16.10.0'),
          [],
          jest.fn() as unknown as Debugger,
        ),
      ).toEqual(new Range('>=14.17.0 <15.0.0-0', rangeOptions));
    });

    it('w/ r2 subset of r1 using min version', () => {
      expect(
        restrictiveRange(
          new Range('^14.17.0 || ^16.0.0'),
          new Range('^14.13.0 || ^16.10.0'),
          [],
          jest.fn() as unknown as Debugger,
        ),
      ).toEqual(new Range('>=14.17.0 <15.0.0-0||>=16.10.0 <17.0.0-0', rangeOptions));
      expect(
        restrictiveRange(
          new Range('^12.22.0 || ^14.17.0 || ^16.0.0'),
          new Range('^14.13.0 || ^16.10.0'),
          [],
          jest.fn() as unknown as Debugger,
        ),
      ).toEqual(new Range('>=14.17.0 <15.0.0-0||>=16.10.0 <17.0.0-0', rangeOptions));
      expect(
        restrictiveRange(
          new Range('^14.13.0 || ^16.10.0'),
          new Range('^12.22.0 || ^14.17.0'),
          [],
          jest.fn() as unknown as Debugger,
        ),
      ).toEqual(new Range('>=14.17.0 <15.0.0-0', rangeOptions));
      expect(
        restrictiveRange(
          new Range('>=12.22.0'),
          new Range('^12.13.0 || ^14.15.0 || ^16.10.0 || >=17.0.0'),
          [],
          jest.fn() as unknown as Debugger,
        ),
      ).toEqual(new Range('>=12.22.0 <13.0.0-0||>=14.15.0 <15.0.0-0||>=16.10.0 <17.0.0-0||>=17.0.0'));
    });

    it('w/ mixed r1 r2', () => {
      expect(
        restrictiveRange(
          new Range('^14.13.0 || ^16.10.0'),
          new Range('^12.22.0 || >=14.17.0'),
          [],
          jest.fn() as unknown as Debugger,
        ),
      ).toEqual(new Range('>=14.17.0 <15.0.0-0||>=16.10.0 <17.0.0-0', rangeOptions));
    });
  });

  describe('should simplify range', () => {
    it('should return undefined if range is not defined', () => {
      expect(humanizeRange(undefined)).toEqual(undefined);
    });

    it('should simplify w/ caret', () => {
      expect(humanizeRange(new Range('>=14.17.0 <15.0.0-0||>=16.10.0 <17.0.0-0'))).toEqual('^14.17.0 || ^16.10.0');
      expect(humanizeRange(new Range('>=14.17.0 <15.0.0-0||>=16.10.0'))).toEqual('^14.17.0 || >=16.10.0');
    });

    it('should not simplify as no simplification implemented', () => {
      expect(humanizeRange(new Range('>14.17.0'))).toEqual('>14.17.0');
      expect(humanizeRange(new Range('14.17.0'))).toEqual('14.17.0');
    });
  });

  it('should return list of tasks', async () => {
    const cmd = checkCommandTasks(
      {} as unknown as Omit<ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>, 'skip' | 'enabled'>,
      jest.fn() as unknown as Debugger,
    );
    expect(cmd).toEqual([
      expect.objectContaining({
        title: 'Load package-lock.json file...',
        task: expect.any(Function),
      }),
      expect.objectContaining({
        title: 'Compute node engines constraints...',
        task: expect.any(Function),
      }),
      expect.objectContaining({
        title: 'Output computed node engines constraints...',
        task: expect.any(Function),
      }),
      expect.objectContaining({
        title: 'Update package.json file...',
        task: expect.any(Function),
      }),
    ]);
  });

  it('should return cliCommandTask', () => {
    expect(cliCommandTask({}, jest.fn() as unknown as Debugger)).toEqual(
      expect.objectContaining({
        tasks: [
          expect.objectContaining({
            title: 'Checking npm package node engines constraints in package-lock.json file...',
            task: expect.any(Function),
          }),
        ],
      }),
    );
  });

  describe('should output computed constraints', () => {
    it('should throw error', () => {
      const ctx: CheckCommandContext = {} as CheckCommandContext;
      expect.assertions(1);
      try {
        outputComputedConstraints({
          ctx,
          task: {} as ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>,
          parent: {} as Omit<ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>, 'skip' | 'enabled'>,
          debug: jest.fn() as unknown as Debugger,
        });
      } catch (e) {
        expect(e).toEqual(new Error('Simplified node engines range constraint is not defined.'));
      }
    });

    it('should simplifiedComputedRange in ctx', () => {
      const ctx: CheckCommandContext = {
        mostRestrictiveRange: new Range('>=14.17.0 <15.0.0-0||>=16.10.0 <17.0.0-0'),
      } as CheckCommandContext;
      const parent = {} as Omit<ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>, 'skip' | 'enabled'>;
      Object.defineProperty(parent, 'title', {
        get: jest.fn(() => ''),
        set: jest.fn(),
        configurable: true,
      });
      const spyOnTitle = jest.spyOn(parent, 'title', 'set');
      outputComputedConstraints({
        ctx,
        task: {} as ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>,
        parent,
        debug: jest.fn() as unknown as Debugger,
      });
      expect(spyOnTitle).toHaveBeenCalledWith('Computed node engines range: ^14.17.0 || ^16.10.0');
      expect(ctx).toEqual(
        expect.objectContaining({
          simplifiedComputedRange: '^14.17.0 || ^16.10.0',
        }),
      );
    });
  });

  describe('should compute engine constraint', () => {
    it('should throw error if lock obj not defined', () => {
      const ctx: CheckCommandContext = {} as CheckCommandContext;
      expect.assertions(1);
      try {
        computeEnginesConstraints({
          ctx,
          task: {} as ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>,
          parent: {} as Omit<ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>, 'skip' | 'enabled'>,
          debug: jest.fn() as unknown as Debugger,
        });
      } catch (e) {
        expect(e).toEqual(new Error('package-lock.json data is not defined.'));
      }
    });

    it('should throw error if packages is not defined in lock obj', () => {
      const ctx: CheckCommandContext = { packageLockObject: {} } as CheckCommandContext;
      expect.assertions(1);
      try {
        computeEnginesConstraints({
          ctx,
          task: {} as ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>,
          parent: {} as Omit<ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>, 'skip' | 'enabled'>,
          debug: jest.fn() as unknown as Debugger,
        });
      } catch (e) {
        expect(e).toEqual(new Error('package-lock.json does not contain packages property.'));
      }
    });

    it('should throw error if packages is empty', () => {
      const ctx: CheckCommandContext = { packageLockObject: { packages: {} } } as CheckCommandContext;
      expect.assertions(1);
      try {
        computeEnginesConstraints({
          ctx,
          task: {} as ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>,
          parent: {} as Omit<ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>, 'skip' | 'enabled'>,
          debug: jest.fn() as unknown as Debugger,
        });
      } catch (e) {
        expect(e).toEqual(new Error('Computed node engines range constraint is not defined.'));
      }
    });

    it('should throw error if pkg engines is undefined', () => {
      const ctx: CheckCommandContext = {
        packageLockObject: { packages: { foo: {} as LockPackage } } as PackageLockJSONSchema,
      } as CheckCommandContext;
      expect.assertions(1);
      try {
        computeEnginesConstraints({
          ctx,
          task: {} as ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>,
          parent: {} as Omit<ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>, 'skip' | 'enabled'>,
          debug: jest.fn() as unknown as Debugger,
        });
      } catch (e) {
        expect(e).toEqual(new Error('Computed node engines range constraint is not defined.'));
      }
    });

    it('should throw error if pkg engines is empty', () => {
      const ctx: CheckCommandContext = {
        packageLockObject: { packages: { foo: { engines: {} } as LockPackage } } as PackageLockJSONSchema,
      } as CheckCommandContext;
      expect.assertions(1);
      try {
        computeEnginesConstraints({
          ctx,
          task: {} as ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>,
          parent: {} as Omit<ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>, 'skip' | 'enabled'>,
          debug: jest.fn() as unknown as Debugger,
        });
      } catch (e) {
        expect(e).toEqual(new Error('Computed node engines range constraint is not defined.'));
      }
    });

    it('should throw error if pkg engines is empty array', () => {
      const ctx: CheckCommandContext = {
        packageLockObject: { packages: { foo: { engines: [] } } } as PackageLockJSONSchema,
      } as CheckCommandContext;
      expect.assertions(1);
      try {
        computeEnginesConstraints({
          ctx,
          task: {} as ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>,
          parent: {} as Omit<ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>, 'skip' | 'enabled'>,
          debug: jest.fn() as unknown as Debugger,
        });
      } catch (e) {
        expect(e).toEqual(new Error('Computed node engines range constraint is not defined.'));
      }
    });

    it('should set mrr in ctx using engines obj', () => {
      const ctx: CheckCommandContext = {
        packageLockObject: {
          packages: { foo: { engines: { node: '>=12.22.0' } } },
        } as PackageLockJSONSchema,
      } as CheckCommandContext;
      computeEnginesConstraints({
        ctx,
        task: {} as ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>,
        parent: {} as Omit<ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>, 'skip' | 'enabled'>,
        debug: jest.fn() as unknown as Debugger,
      });
      expect(ctx).toEqual(
        expect.objectContaining({
          mostRestrictiveRange: new Range('>=12.22.0', rangeOptions),
        }),
      );
    });

    it('should set mrr in ctx using engines arr', () => {
      const ctx: CheckCommandContext = {
        packageLockObject: {
          packages: { foo: { engines: ['node >=12.22.0'] } },
        } as PackageLockJSONSchema,
      } as CheckCommandContext;
      computeEnginesConstraints({
        ctx,
        task: {} as ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>,
        parent: {} as Omit<ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>, 'skip' | 'enabled'>,
        debug: jest.fn() as unknown as Debugger,
      });
      expect(ctx).toEqual(
        expect.objectContaining({
          mostRestrictiveRange: new Range('>=12.22.0', rangeOptions),
        }),
      );
    });

    it('should compute mrr & skip invalid range', () => {
      const ctx: CheckCommandContext = {
        packageLockObject: {
          packages: {
            foo: { engines: { node: '>=12.22.0' } },
            bar: { engines: { node: '>=a.b.c' } },
            lorem: { engines: { node: '>=14.17.0' } },
          },
        } as PackageLockJSONSchema,
      } as CheckCommandContext;
      computeEnginesConstraints({
        ctx,
        task: {} as ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>,
        parent: {} as Omit<ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>, 'skip' | 'enabled'>,
        debug: jest.fn() as unknown as Debugger,
      });
      expect(ctx).toEqual(
        expect.objectContaining({
          mostRestrictiveRange: new Range('>=14.17.0', rangeOptions),
        }),
      );
    });

    it('should compute mrr & using ignored range', () => {
      const ctx: CheckCommandContext = {
        packageLockObject: {
          packages: {
            foo: { engines: { node: '>=12.22.0' } },
            bar: { engines: { node: '>=14.17.0' } },
            lorem: { engines: { node: '>=12.22.0' } },
            ipsum: { engines: { node: '>=14.17.0' } },
          },
        } as PackageLockJSONSchema,
      } as CheckCommandContext;
      computeEnginesConstraints({
        ctx,
        task: {} as ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>,
        parent: {} as Omit<ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>, 'skip' | 'enabled'>,
        debug: jest.fn() as unknown as Debugger,
      });
      expect(ctx).toEqual(
        expect.objectContaining({
          mostRestrictiveRange: new Range('>=14.17.0', rangeOptions),
        }),
      );
    });
  });

  describe('should load lock file', () => {
    let getJsonSpy: SpyInstance;

    beforeEach(() => {
      getJsonSpy = jest.spyOn(utils, 'getJson');
    });

    it('should throw error if read json throw error', async () => {
      const ctx: CheckCommandContext = {
        path: '',
        workingDir: 'foo',
      } as CheckCommandContext;
      getJsonSpy.mockRejectedValueOnce('Oops');
      expect.assertions(1);
      try {
        await loadLockFile({
          ctx,
          task: {} as ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>,
          parent: {} as Omit<ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>, 'skip' | 'enabled'>,
          debug: jest.fn() as unknown as Debugger,
        });
      } catch (e) {
        expect(e).toEqual(new Error('package-lock.json is not defined.'));
      }
    });

    it('should throw error if json is undefined', async () => {
      const ctx: CheckCommandContext = {
        path: '',
        workingDir: 'foo',
      } as CheckCommandContext;
      getJsonSpy.mockReturnValueOnce(Promise.resolve(null));
      expect.assertions(1);
      try {
        await loadLockFile({
          ctx,
          task: {} as ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>,
          parent: {} as Omit<ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>, 'skip' | 'enabled'>,
          debug: jest.fn() as unknown as Debugger,
        });
      } catch (e) {
        expect(e).toEqual(new Error('package-lock.json is not defined.'));
      }
    });

    it('should throw error if json does not contain packages property', async () => {
      const ctx: CheckCommandContext = {
        path: '',
        workingDir: 'foo',
      } as CheckCommandContext;
      getJsonSpy.mockReturnValueOnce(Promise.resolve({}));
      expect.assertions(1);
      try {
        await loadLockFile({
          ctx,
          task: {} as ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>,
          parent: {} as Omit<ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>, 'skip' | 'enabled'>,
          debug: jest.fn() as unknown as Debugger,
        });
      } catch (e) {
        expect(e).toEqual(new Error(`must have required property 'packages'`));
      }
    });

    it('should throw error if json property packages is undefined', async () => {
      const ctx: CheckCommandContext = {
        path: '',
        workingDir: 'foo',
      } as CheckCommandContext;
      getJsonSpy.mockReturnValueOnce(Promise.resolve({ packages: undefined }));
      expect.assertions(1);
      try {
        await loadLockFile({
          ctx,
          task: {} as ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>,
          parent: {} as Omit<ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>, 'skip' | 'enabled'>,
          debug: jest.fn() as unknown as Debugger,
        });
      } catch (e) {
        expect(e).toEqual(new Error(`must have required property 'packages'`));
      }
    });

    it('should set package lock object with empty obj', async () => {
      const ctx: CheckCommandContext = {
        path: '',
        workingDir: 'foo',
      } as CheckCommandContext;
      getJsonSpy.mockReturnValueOnce(Promise.resolve({ packages: {} }));
      await loadLockFile({
        ctx,
        task: {} as ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>,
        parent: {} as Omit<ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>, 'skip' | 'enabled'>,
        debug: jest.fn() as unknown as Debugger,
      });
      expect(ctx).toEqual(
        expect.objectContaining({
          packageLockObject: {
            packages: {},
          },
        }),
      );
    });
  });

  describe('should update package.json file', () => {
    let getJsonSpy: SpyInstance;
    let writeJsonSpy: SpyInstance;

    beforeEach(() => {
      getJsonSpy = jest.spyOn(utils, 'getJson');
      writeJsonSpy = jest.spyOn(fsExtra, 'writeJson').mockReturnValueOnce(Promise.resolve());
    });

    it('should throw error if simplifiedComputedRange is undefined', async () => {
      const ctx: CheckCommandContext = {} as CheckCommandContext;
      expect.assertions(1);
      try {
        await updatePackageJson({
          ctx,
          task: {} as ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>,
          parent: {} as Omit<ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>, 'skip' | 'enabled'>,
          debug: jest.fn() as unknown as Debugger,
        });
      } catch (e) {
        expect(e).toEqual(new Error('Simplified computed node engines range constraint is not defined.'));
      }
    });

    it('should throw error if read json throw error', async () => {
      const ctx: CheckCommandContext = {
        simplifiedComputedRange: '^14.17.0',
        path: '',
        workingDir: 'foo',
      } as CheckCommandContext;
      getJsonSpy.mockRejectedValueOnce('Oops');
      expect.assertions(1);
      try {
        await updatePackageJson({
          ctx,
          task: {} as ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>,
          parent: {} as Omit<ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>, 'skip' | 'enabled'>,
          debug: jest.fn() as unknown as Debugger,
        });
      } catch (e) {
        expect(e).toEqual(new Error('package.json is not defined.'));
      }
    });

    it('should throw error if json is undefined', async () => {
      const ctx: CheckCommandContext = {
        simplifiedComputedRange: '^14.17.0',
        path: '',
        workingDir: 'foo',
      } as CheckCommandContext;
      getJsonSpy.mockReturnValueOnce(Promise.resolve(null));
      expect.assertions(1);
      try {
        await updatePackageJson({
          ctx,
          task: {} as ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>,
          parent: {} as Omit<ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>, 'skip' | 'enabled'>,
          debug: jest.fn() as unknown as Debugger,
        });
      } catch (e) {
        expect(e).toEqual(new Error('package.json is not defined.'));
      }
    });

    it('should throw error if json is malformed', async () => {
      const ctx: CheckCommandContext = {
        simplifiedComputedRange: '^14.17.0',
        path: '',
        workingDir: 'foo',
      } as CheckCommandContext;
      getJsonSpy.mockReturnValueOnce(Promise.resolve({ name: ' bar' }));
      expect.assertions(1);
      try {
        await updatePackageJson({
          ctx,
          task: {} as ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>,
          parent: {} as Omit<ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>, 'skip' | 'enabled'>,
          debug: jest.fn() as unknown as Debugger,
        });
      } catch (e) {
        expect(e).toEqual(expect.any(Error));
      }
    });

    it('should write json', async () => {
      const ctx: CheckCommandContext = {
        simplifiedComputedRange: '^14.17.0',
        path: '',
        workingDir: 'foo',
      } as CheckCommandContext;
      getJsonSpy.mockReturnValueOnce(Promise.resolve({ foo: 'bar' }));
      await updatePackageJson({
        ctx,
        task: {} as ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>,
        parent: {} as Omit<ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>, 'skip' | 'enabled'>,
        debug: jest.fn() as unknown as Debugger,
      });
      expect(writeJsonSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          engines: {
            node: '^14.17.0',
          },
        }),
        { encoding: 'utf8', replacer: null, spaces: 2 },
      );
    });
  });
});
