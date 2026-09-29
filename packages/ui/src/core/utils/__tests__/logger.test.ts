describe('core/utils/logger', () => {
  const g = globalThis as { __DEV__?: boolean };
  const originalDev = g.__DEV__;

  let warn: jest.SpyInstance;
  let error: jest.SpyInstance;
  let log: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    error = jest.spyOn(console, 'error').mockImplementation(() => {});
    log = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    g.__DEV__ = originalDev;
    jest.restoreAllMocks();
  });

  const load = (): typeof import('../logger') => {
    let mod: typeof import('../logger') | undefined;
    jest.isolateModules(() => {
      mod = require('../logger');
    });
    return mod!;
  };

  it('logs through the console in development', () => {
    g.__DEV__ = true;
    const logger = load();

    expect(logger.isDev).toBe(true);
    logger.devWarn('w', 1);
    logger.devError('e');
    logger.devLog('l');

    expect(warn).toHaveBeenCalledWith('w', 1);
    expect(error).toHaveBeenCalledWith('e');
    expect(log).toHaveBeenCalledWith('l');
  });

  it('is silent in production', () => {
    g.__DEV__ = false;
    const logger = load();

    expect(logger.isDev).toBe(false);
    logger.devWarn('w');
    logger.devError('e');
    logger.devLog('l');
    logger.warnOnce('k', 'w');

    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });

  it('falls back to NODE_ENV when __DEV__ is not defined', () => {
    delete g.__DEV__;
    const nodeEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'production';
      expect(load().isDev).toBe(false);
      process.env.NODE_ENV = 'development';
      expect(load().isDev).toBe(true);
    } finally {
      process.env.NODE_ENV = nodeEnv;
    }
  });

  it('warnOnce warns once per key', () => {
    g.__DEV__ = true;
    const logger = load();

    logger.warnOnce('a', 'first');
    logger.warnOnce('a', 'again');
    logger.warnOnce('b', 'other');

    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenNthCalledWith(1, 'first');
    expect(warn).toHaveBeenNthCalledWith(2, 'other');

    logger.resetWarnOnce();
    logger.warnOnce('a', 'after reset');
    expect(warn).toHaveBeenCalledTimes(3);
  });
});
