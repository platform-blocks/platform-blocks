type PrismModule = typeof import('../prism');

const HIGHLIGHTER = 'react-syntax-highlighter/dist/esm/prism-light';
const LANGUAGES = ['jsx', 'tsx', 'typescript', 'javascript', 'json', 'bash'];
const languagePath = (language: string) => `react-syntax-highlighter/dist/esm/languages/prism/${language}`;

/** Fresh copy of the loader (it caches its first init) with Platform.OS set. */
const loadPrism = (os: string): PrismModule => {
  jest.resetModules();
  const { Platform } = require('react-native');
  Platform.OS = os;
  return require('../prism');
};

// react-syntax-highlighter's builds import ESM-only refractor, which this
// Jest setup doesn't transform, so the package is stood in for by fakes with
// its module shape (ES module namespace, component on `.default`).
const mockInstalled = () => {
  const registerLanguage = jest.fn();
  const Highlighter = Object.assign(() => null, { registerLanguage });
  jest.doMock(HIGHLIGHTER, () => ({ __esModule: true, default: Highlighter }));
  LANGUAGES.forEach((language) => {
    jest.doMock(languagePath(language), () => ({ __esModule: true, default: { grammar: language } }));
  });
  return { Highlighter, registerLanguage };
};

describe('CodeBlock prism loader', () => {
  afterEach(() => {
    jest.dontMock(HIGHLIGHTER);
    LANGUAGES.forEach((language) => jest.dontMock(languagePath(language)));
    jest.restoreAllMocks();
    jest.resetModules();
  });

  it('loads the Prism light build on web and registers each grammar', () => {
    const { Highlighter, registerLanguage } = mockInstalled();
    const prism = loadPrism('web');

    prism.initSyntaxHighlighter();

    expect(prism.getPrismHighlighter()).toBe(Highlighter);
    expect(registerLanguage).toHaveBeenCalledTimes(LANGUAGES.length);
    expect(registerLanguage).toHaveBeenCalledWith('tsx', { grammar: 'tsx' });
  });

  it('never loads the highlighter on native', () => {
    const { registerLanguage } = mockInstalled();
    const prism = loadPrism('ios');

    prism.initSyntaxHighlighter();

    expect(prism.getPrismHighlighter()).toBeNull();
    expect(registerLanguage).not.toHaveBeenCalled();
  });

  it('falls back to null when react-syntax-highlighter is not installed', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.doMock(HIGHLIGHTER, () => {
      throw new Error(`Cannot find module '${HIGHLIGHTER}'`);
    });
    const prism = loadPrism('web');

    expect(() => prism.initSyntaxHighlighter()).not.toThrow();
    expect(prism.getPrismHighlighter()).toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('react-syntax-highlighter not found'));
  });

  it('keeps the highlighter when a grammar is missing', () => {
    const { Highlighter, registerLanguage } = mockInstalled();
    jest.doMock(languagePath('bash'), () => {
      throw new Error('missing');
    });
    const prism = loadPrism('web');

    prism.initSyntaxHighlighter();

    expect(prism.getPrismHighlighter()).toBe(Highlighter);
    expect(registerLanguage).toHaveBeenCalledTimes(LANGUAGES.length - 1);
  });
});
