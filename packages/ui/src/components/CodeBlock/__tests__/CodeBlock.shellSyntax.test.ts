import { DEFAULT_THEME as theme } from '../../../core/theme/defaultTheme';
import { createNativeHighlighter, getSyntaxColors, isShellLanguage } from '../utils';

const colors = getSyntaxColors(theme, false, 'code');

/** Token color for the run whose text is exactly `text`, on the given line. */
function colorOf(lines: ReturnType<ReturnType<typeof createNativeHighlighter>>, line: number, text: string) {
  return lines[line].find((token) => token.text === text)?.color;
}

const highlightShell = createNativeHighlighter(theme, false, 'code', undefined, {
  language: 'bash',
});

describe('shell tokenizer', () => {
  it('recognizes the shell dialects', () => {
    expect(isShellLanguage('bash')).toBe(true);
    expect(isShellLanguage('zsh')).toBe(true);
    expect(isShellLanguage('tsx')).toBe(false);
    expect(isShellLanguage(undefined)).toBe(false);
  });

  it('colors the command but not the package name', () => {
    const [line] = highlightShell('$ npm install @platform-blocks/react-ui-library');

    expect(colorOf([line], 0, '$')).toBe(colors.punctuation);
    expect(colorOf([line], 0, 'npm')).toBe(colors.function);
    expect(colorOf([line], 0, 'install')).toBe(colors.keyword);
    // Tokenizing is lossless, and the argument survives as one unbroken plain
    // run: the JS grammar used to split it on its hyphens and slash, colored
    // those as operators, and left everything else the base color — which is
    // what made a `bash` block read as plain text with a few specks in it.
    expect(line.map((token) => token.text).join('')).toBe('$ npm install @platform-blocks/react-ui-library');
    const argument = line[line.length - 1];
    expect(argument.text).toBe(' @platform-blocks/react-ui-library');
    expect(argument.color).toBe(theme.text.primary);
  });

  it('colors a tool named after another command, and leaves lookalikes alone', () => {
    const [line] = highlightShell('$ npx expo install react-native-svg');

    expect(colorOf([line], 0, 'npx')).toBe(colors.function);
    expect(colorOf([line], 0, 'expo')).toBe(colors.function);
    expect(colorOf([line], 0, 'install')).toBe(colors.keyword);
    expect(colorOf([line], 0, 'svg')).toBeUndefined();
  });

  it('colors flags but not hyphens inside package names', () => {
    const [line] = highlightShell('npm i --save-dev react-native-reanimated');

    expect(colorOf([line], 0, '--save-dev')).toBe(colors.attribute);
    expect(colorOf([line], 0, '-native-')).toBeUndefined();
  });

  it('handles comments, strings, variables and pipes', () => {
    const lines = highlightShell(
      ['# install first', 'echo "$HOME/bin" | grep -q bin'].join('\n')
    );

    expect(colorOf(lines, 0, '# install first')).toBe(colors.comment);
    expect(colorOf(lines, 1, 'echo')).toBe(colors.function);
    expect(colorOf(lines, 1, '|')).toBe(colors.operator);
    expect(colorOf(lines, 1, 'grep')).toBe(colors.function);
    expect(colorOf(lines, 1, '-q')).toBe(colors.attribute);
  });

  it('treats a terminal-variant block as shell even without a language', () => {
    const terminal = createNativeHighlighter(theme, false, 'terminal');
    const [line] = terminal('$ npm start');

    expect(colorOf([line], 0, 'npm')).toBe(getSyntaxColors(theme, false, 'terminal').function);
  });

  it('still tokenizes non-shell code as JavaScript', () => {
    const js = createNativeHighlighter(theme, false, 'code', undefined, { language: 'tsx' });
    const [line] = js('const x = 1;');

    expect(colorOf([line], 0, 'const')).toBe(colors.keyword);
  });
});
