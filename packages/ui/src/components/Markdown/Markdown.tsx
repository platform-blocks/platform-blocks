import React, { useMemo, useCallback, useRef } from 'react';
import { View, Image, Linking, Platform } from 'react-native';
import { Text } from '../Text';
import { CodeBlock } from '../CodeBlock';
import { useTheme, withAlpha } from '../../core/theme';
import type { PlatformBlocksTheme } from '../../core/theme/types';
import { extractSpacingProps, getSpacingStyles, SpacingProps } from '../../core/utils';

// Lightweight markdown renderer without external deps.
// Supports: headings (#..######), bold ** **, italic _ _, inline code `code`, code fences ```lang, blockquote >, lists -, *, ordered lists 1., images ![alt](src), links [text](url)

export interface MarkdownProps extends SpacingProps {
  children: string;
  /** Override default code block language guess */
  defaultCodeLanguage?: string;
  /** Max heading level to render (others downgraded) */
  maxHeadingLevel?: number;
  /** Whether to render inline HTML literally (ignored for now) */
  allowHtml?: boolean;
  /** Custom renderer overrides */
  components?: Partial<MarkdownComponentMap>;
  /** Optional handler invoked when a markdown link is pressed */
  onLinkPress?: (href: string) => void;
  /** Custom font family applied to all rendered text (overrides the theme font) */
  fontFamily?: string;
  /** Shorthand alias for `fontFamily` */
  ff?: string;
}

export interface MarkdownComponentMap {
  heading: (props: { level: number; children: React.ReactNode }) => React.ReactNode;
  paragraph: (props: { children: React.ReactNode }) => React.ReactNode;
  strong: (props: { children: React.ReactNode }) => React.ReactNode;
  em: (props: { children: React.ReactNode }) => React.ReactNode;
  codeInline: (props: { children: string }) => React.ReactNode;
  codeBlock: (props: { code: string; language?: string }) => React.ReactNode;
  blockquote: (props: { children: React.ReactNode }) => React.ReactNode;
  list: (props: { ordered: boolean; items: React.ReactNode[] }) => React.ReactNode;
  listItem: (props: { children: React.ReactNode; index?: number; ordered?: boolean }) => React.ReactNode;
  link: (props: { href: string; children: React.ReactNode }) => React.ReactNode;
  image: (props: { src: string; alt?: string }) => React.ReactNode;
  thematicBreak: () => React.ReactNode;
  table: (props: {
    headers: React.ReactNode[];
    rows: React.ReactNode[][];
    alignments?: (TableAlignment | undefined)[];
  }) => React.ReactNode;
  tableCell: (props: {
    children: React.ReactNode;
    isHeader?: boolean;
    align?: TableAlignment;
  }) => React.ReactNode;
}

const createDefaultComponents = (
  theme: PlatformBlocksTheme,
  handleLinkPress: (href: string) => void,
  fontFamily?: string,
): MarkdownComponentMap => ({
  heading: ({ level, children }) => (
    <Text
      variant={`h${Math.min(level, 6)}` as any}
      style={{ marginTop: level === 1 ? 24 : 16, marginBottom: 8 }}
      weight={level <= 2 ? '700' : '600'}
      ff={fontFamily}
    >
      {children}
    </Text>
  ),
  paragraph: ({ children }) => (
    <Text variant="p" as="div" style={{ marginBottom: 12 }} ff={fontFamily}>
      {children}
    </Text>
  ),
  strong: ({ children }) => (
    <Text variant="strong" ff={fontFamily}>{children}</Text>
  ),
  em: ({ children }) => (
    <Text variant="em" ff={fontFamily}>{children}</Text>
  ),
  codeInline: ({ children }) => (
    <Text
      variant="code"
      style={{
        paddingHorizontal: 5,
        paddingVertical: 2,
        // A wash of the theme's primary rather than a palette index: the light
        // and dark scales invert, but an alpha tint over the live surface reads
        // the same in both. Text stays `theme.text.primary` (the `code` variant's
        // default) — tinting it to the primary hue drops below 4.5:1 on light
        // backgrounds, where the brand blue is only ~3.5:1.
        backgroundColor: withAlpha(theme.colors.secondary[5], theme.colorScheme === 'dark' ? 0.24 : 0.12),
        borderRadius: 4,
      }}
    >
      {children}
    </Text>
  ),
  codeBlock: ({ code, language }) => (
    <CodeBlock language={(language as any) || 'tsx'}>{code}</CodeBlock>
  ),
  blockquote: ({ children }) => (
    <View
      style={{
        borderLeftColor: '#ccc',
        borderLeftWidth: 4,
        paddingLeft: 12,
        marginVertical: 12,
      }}
    >
      <Text variant="blockquote" ff={fontFamily}>{children}</Text>
    </View>
  ),
  list: ({ ordered, items }) => (
    <View style={{ marginVertical: 8 }}>
      {items.map((it, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 4,
          }}
        >
          {ordered ? (
            <Text variant="p" style={{ width: 24 }} ff={fontFamily}>
              {i + 1}.{' '}
            </Text>
          ) : (
            <Text variant="p" style={{ width: 24 }} ff={fontFamily}>
              •{' '}
            </Text>
          )}
          <View style={{ flex: 1 }}>{it}</View>
        </View>
      ))}
    </View>
  ),
  listItem: ({ children }) => (
    <Text variant="p" style={{ marginBottom: 0 }} ff={fontFamily}>
      {children}
    </Text>
  ),
  // A link has to stay in the paragraph's inline flow. Wrapping it in a
  // Pressable rendered a block-level box (View → div), which broke the line
  // before and after every link. Web gets a real <a> — inline, focusable, and
  // hoverable; native uses Text's own onPress, which nests inside the parent
  // Text without introducing a view.
  link: ({ href, children }) =>
    Platform.OS === 'web'
      ? React.createElement(
          'a',
          {
            href,
            style: { color: theme.text.link, textDecoration: 'underline', cursor: 'pointer' },
            onClick: (event: any) => {
              event?.preventDefault?.();
              handleLinkPress(href);
            },
          },
          children
        )
      : (
        <Text
          variant="u"
          style={{ color: theme.text.link }}
          ff={fontFamily}
          onPress={() => handleLinkPress(href)}
        >
          {children}
        </Text>
      ),
  image: ({ src, alt }) => (
    <Image
      source={{ uri: src }}
      accessibilityLabel={alt}
      style={{
        width: '100%',
        height: 200,
        resizeMode: 'contain',
        marginVertical: 12,
      }}
    />
  ),
  thematicBreak: () => (
    <View
      style={{
        height: 1,
        backgroundColor: theme.backgrounds.border,
        marginVertical: 24,
      }}
    />
  ),
  table: ({ headers, rows, alignments }) => {
    const getAlignmentStyle = (alignment?: TableAlignment) => {
      if (alignment === 'center') return { alignItems: 'center' as const };
      if (alignment === 'right') return { alignItems: 'flex-end' as const };
      return { alignItems: 'flex-start' as const };
    };
    return (
      <View
        style={{
          marginVertical: 12,
          borderRadius: 8,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: theme.colors.gray?.[3] || theme.backgrounds.border,
        }}
      >
        {/* Header row */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: theme.colors.gray?.[1] || theme.backgrounds.subtle,
          }}
        >
          {headers.map((header, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                padding: 12,
                borderRightWidth: i < headers.length - 1 ? 1 : 0,
                borderRightColor: theme.colors.gray?.[3] || theme.backgrounds.border,
                ...getAlignmentStyle(alignments?.[i]),
              }}
            >
              {header}
            </View>
          ))}
        </View>
        {/* Data rows */}
        {rows.map((row, rowIndex) => (
          <View
            key={rowIndex}
            style={{
              flexDirection: 'row',
              borderTopWidth: 1,
              borderTopColor: theme.colors.gray?.[3] || theme.backgrounds.border,
            }}
          >
            {row.map((cell, cellIndex) => (
              <View
                key={cellIndex}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRightWidth: cellIndex < row.length - 1 ? 1 : 0,
                  borderRightColor: theme.colors.gray?.[3] || theme.backgrounds.border,
                  ...getAlignmentStyle(alignments?.[cellIndex]),
                }}
              >
                {cell}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  },
  tableCell: ({ children, isHeader, align }) => (
    <Text
      variant={isHeader ? 'strong' : 'p'}
      style={{
        fontSize: 14,
        lineHeight: 18,
        marginBottom: 0,
        textAlign: align ?? 'left',
      }}
      ff={fontFamily}
    >
      {children}
    </Text>
  ),
});

interface InlineTextNode { type: 'text'; value: string; }
interface InlineStrongNode { type: 'strong'; value: string; }
interface InlineEmNode { type: 'em'; value: string; }
interface InlineStrongEmNode { type: 'strongEm'; value: string; }
interface InlineCodeNode { type: 'code'; value: string; }
interface InlineLinkNode { type: 'link'; href: string; label: string; }
interface InlineImageNode { type: 'image'; src: string; alt?: string; }

type InlineNode =
  | InlineTextNode
  | InlineStrongNode
  | InlineEmNode
  | InlineStrongEmNode
  | InlineCodeNode
  | InlineLinkNode
  | InlineImageNode;

type TableAlignment = 'left' | 'center' | 'right';

interface HeadingNode { type: 'heading'; level: number; inline: InlineNode[]; }
interface ParagraphNode { type: 'paragraph'; inline: InlineNode[]; }
interface CodeBlockNode { type: 'code'; code: string; language?: string; }
interface BlockquoteNode { type: 'blockquote'; children: BlockNode[]; }
interface ListNode { type: 'list'; ordered: boolean; items: InlineNode[][]; }
interface ThematicBreakNode { type: 'thematicBreak'; }
interface TableNode { type: 'table'; headers: InlineNode[][]; rows: InlineNode[][][]; alignments: (TableAlignment | undefined)[]; }

type BlockNode =
  | HeadingNode
  | ParagraphNode
  | CodeBlockNode
  | BlockquoteNode
  | ListNode
  | ThematicBreakNode
  | TableNode;

const createTokenKeyGenerator = () => {
  const occurrences = new Map<string, number>();
  return (token: BlockNode) => {
    const count = occurrences.get(token.type) ?? 0;
    occurrences.set(token.type, count + 1);
    return `${token.type}-${count}`;
  };
};

class LineIterator {
  private buffer: (string | null)[] = [];
  private position = 0;

  constructor(private readonly src: string) {}

  peek(offset = 0): string | null {
    while (this.buffer.length <= offset) {
      const next = this.readLine();
      if (next === null) break;
      this.buffer.push(next);
    }
    return this.buffer[offset] ?? null;
  }

  next(): string | null {
    if (this.buffer.length > 0) {
      return this.buffer.shift() ?? null;
    }
    return this.readLine();
  }

  private readLine(): string | null {
    if (this.position >= this.src.length) return null;
    const newlineIndex = this.src.indexOf('\n', this.position);
    let line: string;
    if (newlineIndex === -1) {
      line = this.src.slice(this.position);
      this.position = this.src.length;
    } else {
      line = this.src.slice(this.position, newlineIndex);
      this.position = newlineIndex + 1;
    }
    if (line.endsWith('\r')) {
      line = line.slice(0, -1);
    }
    return line;
  }
}

const isHeadingLine = (line: string | null) => !!line && /^(#{1,6})\s+/.test(line);
const isFenceLine = (line: string | null) => !!line && /^```/.test(line.trim());
const isThematicBreakLine = (line: string | null) => !!line && (/^(-\s?){3,}$/.test(line.trim()) || /^(\*\s?){3,}$/.test(line.trim()) || /^(\_\s?){3,}$/.test(line.trim()));
const isBlockquoteLine = (line: string | null) => !!line && /^>/.test(line.trim());
const isListLine = (line: string | null) => !!line && (/^\s*([*\-+] )/.test(line) || /^\s*\d+\.\s+/.test(line));
const isTableSeparatorLine = (line: string | null) => !!line && /^\s*\|?[\-: \|]+\|?\s*$/.test(line);
const hasTablePipes = (line: string | null) => !!line && line.includes('|');
const isIndentedContinuationLine = (line: string | null) => !!line && /^\s{2,}\S/.test(line);
const splitTableRow = (line: string): string[] => {
  const trimmed = line.trim();
  const hasLeading = trimmed.startsWith('|');
  const hasTrailing = trimmed.endsWith('|');
  const segments = trimmed.split('|');
  if (hasLeading) {
    segments.shift();
  }
  if (hasTrailing) {
    segments.pop();
  }
  const cells = segments.map(cell => cell.trim());
  return cells.length ? cells : [''];
};
const alignmentFromSeparator = (cell: string): TableAlignment | undefined => {
  const trimmed = cell.trim();
  const startsColon = trimmed.startsWith(':');
  const endsColon = trimmed.endsWith(':');
  if (startsColon && endsColon) return 'center';
  if (startsColon) return 'left';
  if (endsColon) return 'right';
  return undefined;
};

const tokenize = (src: string, getInlineNodes?: (value: string) => InlineNode[]): BlockNode[] => {
  const iter = new LineIterator(src);
  const tokens: BlockNode[] = [];
  const inlineFor = getInlineNodes ?? ((value: string) => parseInline(value));

  const consumeBlankLines = () => {
    let line = iter.peek();
    while (line !== null && line.trim().length === 0) {
      iter.next();
      line = iter.peek();
    }
  };

  const parseParagraph = () => {
    const lines: string[] = [];
    let line = iter.peek();
    while (line !== null && line.trim().length > 0) {
      if (isHeadingLine(line) || isFenceLine(line) || isBlockquoteLine(line) || isListLine(line) || isThematicBreakLine(line)) {
        break;
      }
      const nextLine = iter.peek(1);
      if (hasTablePipes(line) && hasTablePipes(nextLine) && isTableSeparatorLine(nextLine)) {
        break;
      }
      lines.push(iter.next() || '');
      line = iter.peek();
    }
    if (lines.length) {
      tokens.push({ type: 'paragraph', inline: inlineFor(lines.join(' ')) });
    }
  };

  while (iter.peek() !== null) {
    consumeBlankLines();
    const line = iter.peek();
    if (line === null) break;

    if (isFenceLine(line)) {
      const fence = iter.next() ?? '';
      const lang = fence.replace(/^```/, '').trim() || undefined;
      const codeLines: string[] = [];
      let nextLine = iter.peek();
      while (nextLine !== null) {
        if (isFenceLine(nextLine)) {
          iter.next();
          break;
        }
        codeLines.push(iter.next() || '');
        nextLine = iter.peek();
      }
      tokens.push({ type: 'code', code: codeLines.join('\n'), language: lang });
      continue;
    }

    if (isHeadingLine(line)) {
      const match = (iter.next() || '').match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        tokens.push({ type: 'heading', level: match[1].length, inline: inlineFor(match[2]) });
        continue;
      }
    }

    if (isThematicBreakLine(line)) {
      iter.next();
      tokens.push({ type: 'thematicBreak' });
      continue;
    }

    if (isBlockquoteLine(line)) {
      const quoteLines: string[] = [];
      while (isBlockquoteLine(iter.peek())) {
        const raw = iter.next() || '';
        quoteLines.push(raw.replace(/^>\s?/, ''));
      }
      const inner = tokenize(quoteLines.join('\n'), inlineFor);
      tokens.push({ type: 'blockquote', children: inner });
      continue;
    }

    if (isListLine(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: InlineNode[][] = [];
      while (isListLine(iter.peek())) {
        const raw = iter.next() || '';
        const cleaned = raw.replace(/^\s*([*\-+]|\d+\.)\s+/, '');
        const buffer: string[] = [cleaned];

        let continuationLine = iter.peek();
        while (continuationLine !== null) {
          if (isIndentedContinuationLine(continuationLine)) {
            buffer.push((iter.next() || '').trim());
            continuationLine = iter.peek();
            continue;
          }

          if (continuationLine.trim().length === 0) {
            const afterBlank = iter.peek(1);
            if (isIndentedContinuationLine(afterBlank)) {
              iter.next();
              buffer.push('');
              continuationLine = iter.peek();
              continue;
            }
          }
          break;
        }

        items.push(inlineFor(buffer.join(' ').replace(/\s{2,}/g, ' ').trim()));
      }
      tokens.push({ type: 'list', ordered, items });
      continue;
    }

    const nextLine = iter.peek(1);
    if (hasTablePipes(line) && hasTablePipes(nextLine) && isTableSeparatorLine(nextLine)) {
      const headerLine = iter.next() || '';
      const separatorLine = iter.next() || '';
      const headerCells = splitTableRow(headerLine);
      const separatorCells = splitTableRow(separatorLine);
      const columnCount = Math.max(headerCells.length, separatorCells.length, 1);
      const normalizedHeaders = [...headerCells];
      while (normalizedHeaders.length < columnCount) {
        normalizedHeaders.push('');
      }
      const alignments: (TableAlignment | undefined)[] = separatorCells.map(alignmentFromSeparator);
      while (alignments.length < columnCount) {
        alignments.push(undefined);
      }
      if (alignments.length > columnCount) {
        alignments.splice(columnCount);
      }

      const rows: InlineNode[][][] = [];
      let rowLine = iter.peek();
      while (rowLine !== null && rowLine.trim().length !== 0 && hasTablePipes(rowLine)) {
        const rawCells = splitTableRow(iter.next() || '');
        while (rawCells.length < columnCount) {
          rawCells.push('');
        }
        rows.push(rawCells.slice(0, columnCount).map(cell => inlineFor(cell)));
        rowLine = iter.peek();
      }
      const headerInline = normalizedHeaders.slice(0, columnCount).map(cell => inlineFor(cell));
      tokens.push({ type: 'table', headers: headerInline, rows, alignments });
      continue;
    }

    parseParagraph();
  }

  return tokens;
};

// Inline parsing: bold ** ** or __ __, italic * * or _ _, combined bold+italic *** *** or ___ ___, inline code `code`, images, links.
// Supports emphasis inside list items like: - **Bold** text
const parseInline = (text: string): InlineNode[] => {
  const parts: InlineNode[] = [];
  let remaining = text;
  const pushText = (t: string) => {
    if (!t) return;
    const last = parts[parts.length - 1];
    if (last && last.type === 'text') {
      last.value += t;
    } else {
      parts.push({ type: 'text', value: t });
    }
  };
  // Order matters: longer tokens first (***, ___) to avoid premature matching
  const regex = /(!\[[^\]]*\]\([^\)]+\)|\[[^\]]+\]\([^\)]+\)|`[^`]+`|\*\*\*[^*]+\*\*\*|___[^_]+___|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/;
  while(remaining.length){
    const m = remaining.match(regex);
    if(!m){ pushText(remaining); break; }
    const idx = m.index!;
    pushText(remaining.slice(0,idx));
    const token = m[0];
    if(token.startsWith('![')){
      const im = token.match(/^!\[([^\]]*)\]\(([^\)]+)\)/);
      if(im){ parts.push({ type: 'image', src: im[2], alt: im[1] || undefined }); }
    } else if(token.startsWith('[')){
      const lm = token.match(/^\[([^\]]+)\]\(([^\)]+)\)/);
      if(lm){ parts.push({ type: 'link', href: lm[2], label: lm[1] }); }
    } else if(token.startsWith('`')){
      parts.push({ type: 'code', value: token.slice(1,-1) });
    } else if(/^\*\*\*.*\*\*\*$/.test(token) || /^___.*___$/.test(token)){
      const content = token.slice(3,-3);
      parts.push({ type: 'strongEm', value: content });
    } else if(/^\*\*.*\*\*$/.test(token) || /^__.*__$/.test(token)){
      const content = token.slice(2,-2);
      parts.push({ type: 'strong', value: content });
    } else if(/^\*.*\*$/.test(token) || /^_.*_$/.test(token)){
      const content = token.slice(1,-1);
      parts.push({ type: 'em', value: content });
    } else {
      pushText(token);
    }
    remaining = remaining.slice(idx + token.length);
  }
  return parts;
};

const renderInlineNodes = (nodes: InlineNode[], components: MarkdownComponentMap): React.ReactNode[] => {
  const coalesced: InlineNode[] = [];
  nodes.forEach(node => {
    if (node.type === 'text' && coalesced.length) {
      const last = coalesced[coalesced.length - 1];
      if (last.type === 'text') {
        last.value += node.value;
        return;
      }
    }
    coalesced.push({ ...node });
  });

  return coalesced.map((node, idx) => {
    switch (node.type) {
      case 'text':
        return node.value;
      case 'strong':
        return (
          <React.Fragment key={idx}>
            {components.strong({ children: node.value })}
          </React.Fragment>
        );
      case 'em':
        return (
          <React.Fragment key={idx}>
            {components.em({ children: node.value })}
          </React.Fragment>
        );
      case 'strongEm': {
        const emphasized = components.em({ children: node.value });
        return (
          <React.Fragment key={idx}>
            {components.strong({ children: emphasized })}
          </React.Fragment>
        );
      }
      case 'code':
        return (
          <React.Fragment key={idx}>
            {components.codeInline({ children: node.value })}
          </React.Fragment>
        );
      case 'link':
        return (
          <React.Fragment key={idx}>
            {components.link({ href: node.href, children: node.label })}
          </React.Fragment>
        );
      case 'image':
        return (
          <React.Fragment key={idx}>
            {components.image({ src: node.src, alt: node.alt })}
          </React.Fragment>
        );
      default:
        return null;
    }
  });
};

const getThemeSignature = (theme: PlatformBlocksTheme): string => {
  const { primaryColor, colorScheme, fontFamily, text, backgrounds, colors } = theme;
  return [
    primaryColor,
    // The inline-code tint reads this directly, so a palette override without a
    // matching `primaryColor` change still busts the cache.
    colors?.primary?.[5],
    colorScheme,
    fontFamily,
    text?.primary,
    text?.link,
    backgrounds?.base,
    backgrounds?.surface,
    backgrounds?.border,
  ].join('|');
};

const getOverrideFingerprint = (overrides?: Partial<MarkdownComponentMap>): string => {
  if (!overrides) return 'none';
  return Object.keys(overrides)
    .filter(key => Boolean(overrides[key as keyof MarkdownComponentMap]))
    .sort()
    .join('|');
};

export const Markdown = React.forwardRef<View, MarkdownProps>((allProps, ref) => {
  const { spacingProps, otherProps } = extractSpacingProps(allProps);
  const { children, defaultCodeLanguage='tsx', maxHeadingLevel=6, allowHtml=false, components, onLinkPress, fontFamily, ff } = otherProps;
  const customFontFamily = ff ?? fontFamily;
  const spacingStyles = getSpacingStyles(spacingProps);
  const theme = useTheme();

  const handleLinkPress = useCallback(
    (href: string) => {
      if (onLinkPress) {
        onLinkPress(href);
        return;
      }
      Linking.openURL(href).catch(() => undefined);
    },
    [onLinkPress]
  );

  const themeSignature = useMemo(() => getThemeSignature(theme), [theme]);
  const overrideFingerprint = useMemo(() => getOverrideFingerprint(components), [components]);

  const merged = useMemo(() => {
    const defaults = createDefaultComponents(theme, handleLinkPress, customFontFamily);
    if (!components) {
      return defaults;
    }
    const next: MarkdownComponentMap = { ...defaults };
    Object.entries(components).forEach(([key, renderer]) => {
      if (renderer) {
        (next as any)[key] = renderer;
      }
    });
    return next;
  }, [themeSignature, overrideFingerprint, theme, components, handleLinkPress, customFontFamily]);

  const inlineCache = useMemo(() => new Map<string, InlineNode[]>(), []);
  const getInlineNodes = useCallback((value: string) => {
    if (!inlineCache.has(value)) {
      inlineCache.set(value, parseInline(value));
    }
    return inlineCache.get(value)!;
  }, [inlineCache]);

  const tokenCacheRef = useRef<{ input: string; tokens: BlockNode[] }>({ input: '', tokens: [] });
  const tokens = useMemo(() => {
    if (tokenCacheRef.current.input !== children) {
      tokenCacheRef.current = {
        input: children,
        tokens: tokenize(children, getInlineNodes),
      };
    }
    return tokenCacheRef.current.tokens;
  }, [children, getInlineNodes]);

  const getKeyForToken = createTokenKeyGenerator();

  const renderToken = (t: BlockNode, key: string): React.ReactNode => {
    switch (t.type) {
      case 'heading': {
        const level = Math.min(t.level, maxHeadingLevel);
        return (
          <React.Fragment key={key}>
            {merged.heading({ level, children: renderInlineNodes(t.inline, merged) })}
          </React.Fragment>
        );
      }
      case 'paragraph': {
        return (
          <React.Fragment key={key}>
            {merged.paragraph({ children: renderInlineNodes(t.inline, merged) })}
          </React.Fragment>
        );
      }
      case 'code': {
        return (
          <React.Fragment key={key}>
            {merged.codeBlock({ code: t.code, language: t.language || defaultCodeLanguage })}
          </React.Fragment>
        );
      }
      case 'blockquote': {
        return (
          <React.Fragment key={key}>
            {merged.blockquote({ children: t.children.map(child => renderToken(child, getKeyForToken(child))) })}
          </React.Fragment>
        );
      }
      case 'list': {
        return (
          <React.Fragment key={key}>
            {merged.list({
              ordered: t.ordered,
              items: t.items.map((inlineNodes, idx) =>
                merged.listItem({
                  children: renderInlineNodes(inlineNodes, merged),
                  index: idx,
                  ordered: t.ordered,
                })
              ),
            })}
          </React.Fragment>
        );
      }
      case 'thematicBreak': {
        return <React.Fragment key={key}>{merged.thematicBreak()}</React.Fragment>;
      }
      case 'table': {
        const headers = t.headers.map((inlineHeader, headerIndex) =>
          merged.tableCell({
            children: renderInlineNodes(inlineHeader, merged),
            isHeader: true,
            align: t.alignments?.[headerIndex],
          })
        );
        const rows = t.rows.map(row =>
          row.map((cellInline, cellIndex) =>
            merged.tableCell({
              children: renderInlineNodes(cellInline, merged),
              isHeader: false,
              align: t.alignments?.[cellIndex],
            })
          )
        );
        return (
          <React.Fragment key={key}>
            {merged.table({ headers, rows, alignments: t.alignments })}
          </React.Fragment>
        );
      }
      default:
        return null;
    }
  };

  return (
    <View ref={ref} style={spacingStyles}>
      {tokens.map(token => renderToken(token, getKeyForToken(token)))}
    </View>
  );
});

Markdown.displayName = 'Markdown';

export default Markdown;
