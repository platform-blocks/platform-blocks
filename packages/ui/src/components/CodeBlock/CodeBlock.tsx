import React from 'react';
import type { CSSProperties } from 'react';
import { View, TextStyle, Platform, FlatList, ListRenderItemInfo, ScrollView, StyleSheet } from 'react-native';

import { useTheme } from '../../core/theme';
import { surfaceInteractionTint } from '../../core/theme/surfaces';
import { extractSpacingProps, getSpacingStyles } from '../../core/utils';
import { useHover } from '../../hooks';
import { Text } from '../Text';
import { Spoiler } from '../Spoiler';
import { FileHeaderBar, FileTabsRow, FloatingCopyControls, InlineTitleRow } from './header';
import { getPrismHighlighter, initSyntaxHighlighter } from './prism';
import {
  DEFAULT_CODE_RADIUS,
  getCodeBlockStyles,
  resolveCodeBlockColors,
  resolveCodeSurface,
} from './styles';
import type { CodeBlockFile, CodeBlockProps } from './types';
import {
  buildPrismTheme,
  createNativeHighlighter,
  getSyntaxColors,
  languageFromFileName,
  normalizeLanguage,
  parseHighlightLines,
  toOpaqueHex,
} from './utils';

const NO_HIGHLIGHTS = new Set<number>();
/** Above this many lines, native switches from one <Text> to a virtualized list. */
const LONG_LIST_THRESHOLD = 80;

export const CodeBlock = React.forwardRef<View, CodeBlockProps>((props, ref) => {
  // Initialize syntax highlighter on first render (web only)
  React.useMemo(() => initSyntaxHighlighter(), []);

  const {
    children,
    title,
    files,
    defaultFile,
    activeFile,
    onFileChange,
    language = 'tsx',
    showLineNumbers = false,
    highlight = true,
    fullWidth = true,
    radius = DEFAULT_CODE_RADIUS,
    withBorder = true,
    showCopyButton = true,
    onCopy,
    style,
    textStyle,
    titleStyle,
    highlightLines,
    spoiler = false,
    spoilerMaxHeight = 160,
    variant = 'code',
    promptSymbol = '$',
    githubUrl,
    fileHeader = false,
    colors,
    wrap = true,
    fontFamily,
    ff,
    ...rest
  } = props;

  const customCodeFontFamily = ff ?? fontFamily;

  // Files drive the header and, past the first one, what gets rendered: the
  // active file's own code, language and highlight lines win over the top-level
  // props.
  const fileList = React.useMemo<CodeBlockFile[]>(
    () => (Array.isArray(files) ? files.filter(f => f && typeof f.name === 'string') : []),
    [files],
  );

  const [selectedFile, setSelectedFile] = React.useState<string | undefined>(defaultFile);
  const requestedFile = activeFile ?? selectedFile;
  const activeFileEntry = fileList.find(f => f.name === requestedFile) ?? fileList[0];
  const handleFileChange = React.useCallback((name: string) => {
    if (activeFile === undefined) setSelectedFile(name);
    onFileChange?.(name);
  }, [activeFile, onFileChange]);

  const activeCode = activeFileEntry?.code ?? children;
  // The edit button follows the visible tab: a file's own URL wins, and the
  // block-level one covers single-file blocks and any tab that omits it.
  const activeGithubUrl = activeFileEntry?.githubUrl ?? githubUrl;
  const activeLanguage = activeFileEntry
    ? activeFileEntry.language ?? languageFromFileName(activeFileEntry.name)
    : language;
  const activeHighlightLines = activeFileEntry?.highlightLines ?? highlightLines;

  const { spacingProps, otherProps } = extractSpacingProps(rest);
  const spacingStyles = getSpacingStyles(spacingProps);
  const theme = useTheme();
  const isDark = theme.colorScheme === 'dark';
  const resolvedColors = React.useMemo(() => resolveCodeBlockColors(theme, colors), [theme, colors]);
  const styles = React.useMemo(() => {
    const base = getCodeBlockStyles(theme, fullWidth, variant, resolvedColors, radius, withBorder);
    if (!customCodeFontFamily) return base;
    return {
      ...base,
      codeText: { ...base.codeText, fontFamily: customCodeFontFamily },
    };
  }, [theme, fullWidth, variant, resolvedColors, customCodeFontFamily, radius, withBorder]);
  const highlightBackgroundColor = React.useMemo(
    () => resolvedColors.highlightBackground ?? surfaceInteractionTint(theme, 'selected'),
    [resolvedColors.highlightBackground, theme]
  );
  const highlightColors = React.useMemo(
    () => ({ background: highlightBackgroundColor }),
    [highlightBackgroundColor]
  );
  // Token shades are picked for contrast against the surface they land on, so a
  // themed (or `colors.background`-overridden) panel stays legible without a
  // hand-tuned palette per variant.
  const codeSurface = React.useMemo(
    () => toOpaqueHex(resolveCodeSurface(theme, variant, resolvedColors), theme.backgrounds.base),
    [theme, variant, resolvedColors]
  );
  const baseTextColor = (styles.codeText.color as string) ?? theme.text.primary;
  const syntaxColors = React.useMemo(
    () => getSyntaxColors(theme, isDark, variant, resolvedColors.tokenOverrides, { surface: codeSurface }),
    [theme, isDark, variant, resolvedColors.tokenOverrides, codeSurface]
  );
  // Declared here rather than beside its other use below: the fallback tokenizer
  // picks its grammar from it, and Prism takes the same value.
  const normalizedLang = normalizeLanguage(activeLanguage);
  const nativeHighlighter = React.useMemo(
    () => createNativeHighlighter(theme, isDark, variant, resolvedColors.tokenOverrides, {
      surface: codeSurface,
      baseColor: baseTextColor,
      language: normalizedLang,
    }),
    [theme, isDark, variant, resolvedColors.tokenOverrides, codeSurface, baseTextColor, normalizedLang]
  );

  const [hovered, hoverHandlers] = useHover();
  const [codeHeight, setCodeHeight] = React.useState<number | null>(null);
  const isWeb = Platform.OS === 'web';
  const webWhitespaceStyle = React.useMemo(() => (
    isWeb ? { whiteSpace: wrap ? 'pre-wrap' : 'pre', display: 'block' } : null
  ), [isWeb, wrap]);
  // File names always render as chips in the strip — one file or ten, they look
  // the same, so a single-file block and the active tab of a multi-file one are
  // not two different treatments. `title` (a heading, not a file) keeps the
  // plain label row.
  const showFileStrip = fileList.length > 0;
  const soloFile = fileList.length === 1 ? fileList[0] : undefined;
  // A headerless block still needs somewhere to hang the edit button, so the
  // floating layer appears for either control — not for copy alone.
  const showFloatingCopy = (showCopyButton || Boolean(activeGithubUrl)) && !title && !showFileStrip;
  const showCopyVisible = !isWeb ? showFloatingCopy : showFloatingCopy && hovered;

  const codeData = React.useMemo(() => {
    const rawInput = typeof activeCode === 'string' ? activeCode : String(activeCode || '');
    const processed = rawInput.trim();
    const transformed =
      variant !== 'terminal'
        ? processed
        : processed
            .split('\n')
            .map((line: string) => (line.trim().length && !/^([>#]|\s)/.test(line) ? `${promptSymbol} ${line}` : line))
            .join('\n');
    const lines = transformed.split('\n');
    return {
      processed,
      transformed,
      lines,
      lineCount: lines.length,
    };
  }, [activeCode, promptSymbol, variant]);

  const highlightSet = React.useMemo(() => {
    if (!highlight || !activeHighlightLines?.length) return NO_HIGHLIGHTS;
    return parseHighlightLines(activeHighlightLines, codeData.lineCount);
  }, [highlight, activeHighlightLines, codeData.lineCount]);

  const hideLineNumbersVisually = highlight && !showLineNumbers && highlightSet.size > 0;
  const prismShowLineNumbers = showLineNumbers || hideLineNumbersVisually;

  const baseLineStyle = React.useMemo<CSSProperties>(() => ({
    display: 'block',
    width: wrap ? '100%' : 'auto',
    boxSizing: 'border-box',
    paddingLeft: showLineNumbers ? 0 : 12,
    paddingRight: showLineNumbers ? 0 : 12,
    whiteSpace: wrap ? 'pre-wrap' : 'pre',
  }), [showLineNumbers, wrap]);

  const fallbackColor = baseTextColor;
  // Gutter recedes exactly as far as comments do — same contrast floor, so it
  // tracks the theme instead of a fixed gray shade.
  const lineNumberColor = syntaxColors.comment;
  const lineNumberWidth = React.useMemo(
    () => Math.max(2, String(Math.max(1, codeData.lineCount)).length),
    [codeData.lineCount]
  );

  const tokenLines = React.useMemo(
    () => (highlight ? nativeHighlighter(codeData.transformed) : null),
    [highlight, nativeHighlighter, codeData.transformed]
  );

  const shouldVirtualizeNative = !isWeb && codeData.lineCount >= LONG_LIST_THRESHOLD;
  const lineHeight = styles.codeText.lineHeight ?? 18;

  // <Text> resolves its own typography rather than inheriting it: with no
  // `variant`/`size` it falls back to the `p` defaults (16px / 1.4 line-height)
  // and `theme.fontFamily`. Nested token spans therefore override the parent
  // line's mono font and code font size unless we re-assert them explicitly.
  const codeTypography = React.useMemo(() => {
    const flat = (StyleSheet.flatten([styles.codeText, textStyle]) ?? {}) as TextStyle;
    return {
      fontFamily: flat.fontFamily,
      fontSize: flat.fontSize,
      lineHeight: flat.lineHeight,
    };
  }, [styles.codeText, textStyle]);

  const normalizeTokenText = React.useCallback((text: string, tokenIndex: number) => {
    if (!isWeb || !text) return text;
    const replaceSpaces = (value: string) => value.replace(/\t/g, '  ').replace(/ /g, ' ');
    if (tokenIndex === 0) {
      return text.replace(/^[\t ]+/, (match) => replaceSpaces(match));
    }
    if (text.trim().length === 0) {
      return replaceSpaces(text);
    }
    return text;
  }, [isWeb]);

  const buildNativeLine = React.useCallback(
    (line: string, index: number, appendNewline: boolean, includeKey: boolean) => {
      const lineNumber = index + 1;
      const tokens = tokenLines?.[index] ?? [{ text: line || ' ', color: fallbackColor }];
      const isLineHighlighted = highlightSet.has(lineNumber);

      const lineStyles: any[] = [
        styles.codeText,
        textStyle,
        webWhitespaceStyle,
        wrap ? { flexWrap: 'wrap' as const } : { flexWrap: 'nowrap' as const, width: 'auto' as const },
      ];
      if (isLineHighlighted) {
        lineStyles.push(styles.highlightedLine(highlightColors, {
          isFirst: !highlightSet.has(lineNumber - 1),
          isLast: !highlightSet.has(lineNumber + 1),
        }));
      }

      return (
        <Text key={includeKey ? `line-${lineNumber}` : undefined} selectable style={lineStyles}>
          {showLineNumbers ? (
            <Text style={{ ...codeTypography, color: lineNumberColor, opacity: 0.7 }}>
              {`${String(lineNumber).padStart(lineNumberWidth, ' ')} | `}
            </Text>
          ) : null}
          {tokens.map((token, tokenIdx) => (
            <Text
              key={`${lineNumber}-${tokenIdx}`}
              style={{
                ...codeTypography,
                color: token.color,
                ...(token.fontStyle ? { fontStyle: token.fontStyle } : null),
                ...(token.fontWeight ? { fontWeight: token.fontWeight } : null),
              }}
            >
              {normalizeTokenText(token.text || ' ', tokenIdx)}
            </Text>
          ))}
          {appendNewline ? '\n' : null}
        </Text>
      );
    },
    [codeTypography, fallbackColor, highlightColors, highlightSet, lineNumberColor, lineNumberWidth, normalizeTokenText, showLineNumbers, styles.codeText, styles.highlightedLine, textStyle, tokenLines, webWhitespaceStyle, wrap]
  );

  const renderWebCode = React.useMemo(() => {
    const PrismSyntaxHighlighter = getPrismHighlighter();
    if (!(isWeb && highlight && PrismSyntaxHighlighter)) {
      return null;
    }
    const prismTheme = buildPrismTheme(
      syntaxColors,
      (styles.codeText.color as string) ?? theme.text.primary,
      styles.codeText.fontFamily as string | undefined
    );

    return (
      <PrismSyntaxHighlighter
        language={normalizedLang}
        style={prismTheme}
        PreTag="div"
        customStyle={{
          background: 'transparent',
          padding: 0,
          margin: 0,
          fontSize: 13,
          lineHeight: '18px',
          display: 'block',
          width: '100%',
          whiteSpace: wrap ? 'pre-wrap' : 'pre',
        }}
        codeTagProps={{
          style: {
            fontFamily: styles.codeText.fontFamily,
            whiteSpace: wrap ? 'pre-wrap' : 'pre',
          },
        }}
        wrapLongLines={wrap}
        wrapLines={wrap}
        showLineNumbers={prismShowLineNumbers}
        lineNumberStyle={
          hideLineNumbersVisually
            ? { display: 'none' }
            : { opacity: 0.55, paddingRight: 12, userSelect: 'none' }
        }
        lineProps={(lineNumber: number) => {
          const style: CSSProperties = { ...baseLineStyle };
          if (highlightSet.has(lineNumber)) {
            Object.assign(style, styles.highlightedLine(highlightColors, {
              isFirst: !highlightSet.has(lineNumber - 1),
              isLast: !highlightSet.has(lineNumber + 1),
            }));
            return { style, 'data-highlighted': 'true' };
          }
          return { style };
        }}
      >
        {codeData.transformed}
      </PrismSyntaxHighlighter>
    );
  }, [
    baseLineStyle,
    codeData.transformed,
    highlight,
    highlightColors,
    highlightSet,
    hideLineNumbersVisually,
    isWeb,
    normalizedLang,
    prismShowLineNumbers,
    styles.codeText.color,
    styles.highlightedLine,
    styles.codeText.fontFamily,
    syntaxColors,
    theme.text.primary,
    wrap,
  ]);

  const renderNativeCode = React.useMemo(() => {
    if (!codeData.lineCount) {
      return (
        <Text selectable style={[styles.codeText, textStyle, webWhitespaceStyle]}>
          {' '}
        </Text>
      );
    }

    if (shouldVirtualizeNative) {
      return (
        <FlatList
          data={codeData.lines}
          keyExtractor={(_, index) => `line-${index}`}
          renderItem={({ item, index }: ListRenderItemInfo<string>) => buildNativeLine(item, index, false, false)}
          initialNumToRender={20}
          maxToRenderPerBatch={40}
          windowSize={7}
          removeClippedSubviews
          getItemLayout={(_, index) => ({ length: lineHeight, offset: lineHeight * index, index })}
        />
      );
    }

    return (
      <Text selectable style={[styles.codeText, textStyle, webWhitespaceStyle]}>
        {codeData.lines.map((line, idx) => buildNativeLine(line, idx, idx < codeData.lineCount - 1, true))}
      </Text>
    );
  }, [buildNativeLine, codeData.lineCount, codeData.lines, lineHeight, shouldVirtualizeNative, styles.codeText, textStyle, webWhitespaceStyle]);

  const codeContent = renderWebCode ?? renderNativeCode;

  const scrollableCodeContent = wrap ? (
    codeContent
  ) : (
    <ScrollView
      horizontal
      bounces={false}
      showsHorizontalScrollIndicator
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
      style={{ width: '100%' }}
    >
      <View style={{ flexGrow: 1 }}>{codeContent}</View>
    </ScrollView>
  );

  const wrappedCodeContent: React.ReactNode = spoiler
    ? <Spoiler maxHeight={spoilerMaxHeight}>{scrollableCodeContent}</Spoiler>
    : scrollableCodeContent;

  const flatStyle = StyleSheet.flatten(style);
  const userHasWidth = Boolean(flatStyle && (flatStyle.width !== undefined || flatStyle.flex !== undefined));
  const containerStyle = userHasWidth ? [{ marginBottom: 20 }, style, spacingStyles] : [styles.container, spacingStyles, style];
  // `fileHeader` lifts a single file's name out of the panel into its own bar.
  const showHeaderBar = Boolean(fileHeader && soloFile && variant !== 'terminal');
  const showFileChips = showFileStrip && !showHeaderBar;
  const inlineTitleVisible = variant === 'code' && !showFileChips && !showHeaderBar && Boolean(title);
  const floatingTop = codeHeight && codeHeight < 40 ? 4 : 8;

  return (
    <View ref={ref} style={containerStyle} {...otherProps}>
      {showHeaderBar && soloFile ? (
        <FileHeaderBar
          fileName={soloFile.name}
          barStyle={styles.headerBar}
          titleBaseStyle={styles.title}
          titleStyle={titleStyle}
          showCopyButton={showCopyButton}
          code={codeData.processed}
          onCopy={onCopy}
          githubUrl={activeGithubUrl}
        />
      ) : null}
      <View
        style={styles.codeBlock}
        onLayout={(event) => {
          if (showFloatingCopy) setCodeHeight(event.nativeEvent.layout.height);
        }}
        {...(isWeb
          ? {
              onMouseEnter: hoverHandlers.onMouseEnter,
              onMouseLeave: hoverHandlers.onMouseLeave,
            }
          : {})}
      >
        {showFileChips ? (
          <FileTabsRow
            files={fileList}
            activeName={activeFileEntry?.name ?? fileList[0].name}
            onSelect={handleFileChange}
            theme={theme}
            showCopyButton={showCopyButton}
            code={codeData.processed}
            onCopy={onCopy}
            githubUrl={activeGithubUrl}
          />
        ) : null}
        {inlineTitleVisible ? (
          <InlineTitleRow
            label={title ?? ''}
            fileIcon={soloFile?.icon}
            theme={theme}
            rowStyle={styles.inlineTitleRow}
            titleBaseStyle={styles.title}
            titleStyle={titleStyle}
            showCopyButton={showCopyButton}
            code={codeData.processed}
            onCopy={onCopy}
            githubUrl={activeGithubUrl}
          />
        ) : null}
        {wrappedCodeContent}
        {showFloatingCopy ? (
          <FloatingCopyControls
            visible={showCopyVisible}
            code={codeData.processed}
            onCopy={onCopy}
            topOffset={floatingTop}
            isWeb={isWeb}
            githubUrl={activeGithubUrl}
            showCopyButton={showCopyButton}
          />
        ) : null}
      </View>
    </View>
  );
});

CodeBlock.displayName = 'CodeBlock';

export default CodeBlock;
