import React, { useMemo } from 'react';
import { Image, Linking, StyleSheet, View, type ViewStyle } from 'react-native';

import { factory } from '../../core/factory/factory';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { createThemedStyles } from '../../core/hooks/useThemedStyles';
import { isWeb } from '../../core/platform/flags';
import { useTheme } from '../../core/theme/ThemeProvider';
import type { PlatformBlocksTheme } from '../../core/theme/types';
import type { BaseProps } from '../../core/types/base';
import { useStyleProps } from '../../core/utils/spacing';
import { CodeBlock } from '../CodeBlock';
import { Text } from '../Text';
import type { HTMLTextVariant } from '../Text/Text';

// Lightweight markdown renderer without external deps.
// Supports: headings (#..######), bold ** **, italic _ _, inline code `code`, code fences ```lang, blockquote >, lists -, *, ordered lists 1., images ![alt](src), links [text](url)

export interface MarkdownProps extends BaseProps<ViewStyle> {
  /** Markdown source. */
  children: string;
  /** Language for code fences that don't name one (default `tsx`). */
  defaultCodeLanguage?: string;
  /** Deepest heading level rendered; deeper headings are clamped to it. */
  maxHeadingLevel?: number;
  /** Custom renderer overrides */
  components?: Partial<MarkdownComponentMap>;
  /**
   * Called when a markdown link is activated. Without it, links open with
   * `Linking.openURL`. On web, modified clicks (new tab / window) are left to
   * the browser.
   */
  onLinkPress?: (href: string) => void;
  /** Custom font family applied to all rendered prose (code keeps `theme.fontFamilyMono`) */
  ff?: string;
}

export type TableAlignment = 'left' | 'center' | 'right';

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

const HEADING_VARIANTS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

/** `h1`–`h6` for a heading level; `Text` renders it as a heading (web element / native role). */
const headingVariant = (level: number): HTMLTextVariant =>
  HEADING_VARIANTS[Math.min(Math.max(Math.round(level) || 1, 1), HEADING_VARIANTS.length) - 1];

/** Table alignment → cell content alignment (logical: `left`/`right` mirror in RTL). */
const ALIGN_ITEMS: Record<TableAlignment, ViewStyle> = {
  left: { alignItems: 'flex-start' },
  center: { alignItems: 'center' },
  right: { alignItems: 'flex-end' },
};

const getMarkdownStyles = createThemedStyles((theme: PlatformBlocksTheme) => {
  const styles = StyleSheet.create({
    heading: { marginTop: 16, marginBottom: 8 },
    headingFirstLevel: { marginTop: 24, marginBottom: 8 },
    paragraph: { marginBottom: 12 },
    codeInline: {
      paddingHorizontal: 5,
      paddingVertical: 2,
      // The recessed-well role CodeBlock paints its panel with, so inline and
      // fenced code read as the same material. Text stays `text.primary` (the
      // `code` variant's default) for full contrast.
      backgroundColor: theme.backgrounds.subtle,
      borderRadius: 4,
    },
    blockquote: {
      borderStartColor: theme.backgrounds.borderStrong ?? theme.backgrounds.border,
      borderStartWidth: 4,
      paddingStart: 12,
      marginVertical: 12,
    },
    list: { marginVertical: 8 },
    listRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
    listMarker: { width: 24 },
    listContent: { flex: 1 },
    listItem: { marginBottom: 0 },
    image: { width: '100%', height: 200, resizeMode: 'contain', marginVertical: 12 },
    thematicBreak: { height: 1, backgroundColor: theme.backgrounds.border, marginVertical: 24 },
    table: {
      marginVertical: 12,
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.backgrounds.border,
    },
    tableHeaderRow: { flexDirection: 'row', backgroundColor: theme.backgrounds.subtle },
    tableRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.backgrounds.border },
    tableCellBox: { flex: 1, padding: 12 },
    tableCellDivider: { borderEndWidth: 1, borderEndColor: theme.backgrounds.border },
    tableCellText: { fontSize: 14, lineHeight: 18, marginBottom: 0 },
  });
  return styles;
});

type MarkdownStyles = ReturnType<typeof getMarkdownStyles>;

const createDefaultComponents = (
  theme: PlatformBlocksTheme,
  styles: MarkdownStyles,
  handleLinkPress: (href: string) => void,
  fontFamily?: string,
): MarkdownComponentMap => ({
  heading: ({ level, children }) => (
    <Text
      variant={headingVariant(level)}
      style={level === 1 ? styles.headingFirstLevel : styles.heading}
      fw={level <= 2 ? '700' : '600'}
      ff={fontFamily}
    >
      {children}
    </Text>
  ),
  // `Text` renders a <p> on web, and falls back to a <div> by itself when the
  // paragraph holds something a <p> can't (inline code, images).
  paragraph: ({ children }) => (
    <Text variant="p" style={styles.paragraph} ff={fontFamily}>
      {children}
    </Text>
  ),
  strong: ({ children }) => (
    <Text variant="strong" ff={fontFamily}>{children}</Text>
  ),
  em: ({ children }) => (
    <Text variant="em" ff={fontFamily}>{children}</Text>
  ),
  // The `code` variant sets `theme.fontFamilyMono`.
  codeInline: ({ children }) => (
    <Text variant="code" style={styles.codeInline}>
      {children}
    </Text>
  ),
  codeBlock: ({ code, language }) => (
    <CodeBlock language={language || 'tsx'}>{code}</CodeBlock>
  ),
  blockquote: ({ children }) => (
    <View style={styles.blockquote}>
      <Text variant="blockquote" ff={fontFamily}>{children}</Text>
    </View>
  ),
  list: ({ ordered, items }) => (
    <View role="list" style={styles.list}>
      {items.map((it, i) => (
        <View key={i} role="listitem" style={styles.listRow}>
          {/* The list semantics already convey position; the glyph is visual only. */}
          <Text variant="p" style={styles.listMarker} ff={fontFamily} aria-hidden>
            {ordered ? `${i + 1}. ` : '• '}
          </Text>
          <View style={styles.listContent}>{it}</View>
        </View>
      ))}
    </View>
  ),
  listItem: ({ children }) => (
    <Text variant="p" style={styles.listItem} ff={fontFamily}>
      {children}
    </Text>
  ),
  // A link has to stay in the paragraph's inline flow. Wrapping it in a
  // Pressable rendered a block-level box (View → div), which broke the line
  // before and after every link. Web gets a real <a href> — inline, focusable,
  // exposed as a link, and middle-/modifier-click still open a new tab; native
  // uses Text's own onPress with the link role, which nests inside the parent
  // Text without introducing a view.
  link: ({ href, children }) =>
    isWeb ? (
      <a
        href={href}
        style={{ color: theme.text.link, textDecoration: 'underline', cursor: 'pointer' }}
        onClick={(event) => {
          if (event.defaultPrevented || event.button !== 0) return;
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          handleLinkPress(href);
        }}
      >
        {children}
      </a>
    ) : (
      <Text variant="u" role="link" c="link" ff={fontFamily} onPress={() => handleLinkPress(href)}>
        {children}
      </Text>
    ),
  image: ({ src, alt }) => (
    <Image source={{ uri: src }} accessibilityLabel={alt} style={styles.image} />
  ),
  thematicBreak: () => <View role="separator" style={styles.thematicBreak} />,
  table: ({ headers, rows, alignments }) => (
    <View role="table" style={styles.table}>
      <View role="row" style={styles.tableHeaderRow}>
        {headers.map((header, i) => (
          <View
            key={i}
            role="columnheader"
            style={[
              styles.tableCellBox,
              i < headers.length - 1 ? styles.tableCellDivider : null,
              ALIGN_ITEMS[alignments?.[i] ?? 'left'],
            ]}
          >
            {header}
          </View>
        ))}
      </View>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} role="row" style={styles.tableRow}>
          {row.map((cell, cellIndex) => (
            <View
              key={cellIndex}
              role="cell"
              style={[
                styles.tableCellBox,
                cellIndex < row.length - 1 ? styles.tableCellDivider : null,
                ALIGN_ITEMS[alignments?.[cellIndex] ?? 'left'],
              ]}
            >
              {cell}
            </View>
          ))}
        </View>
      ))}
    </View>
  ),
  tableCell: ({ children, isHeader, align }) => (
    <Text
      variant={isHeader ? 'strong' : 'p'}
      ta={align ?? 'left'}
      style={styles.tableCellText}
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

interface RenderContext {
  components: MarkdownComponentMap;
  maxHeadingLevel: number;
  defaultCodeLanguage: string;
  getKey: (token: BlockNode) => string;
}

const renderBlock = (t: BlockNode, key: string, ctx: RenderContext): React.ReactNode => {
  const { components } = ctx;
  switch (t.type) {
    case 'heading': {
      const level = Math.min(t.level, ctx.maxHeadingLevel);
      return (
        <React.Fragment key={key}>
          {components.heading({ level, children: renderInlineNodes(t.inline, components) })}
        </React.Fragment>
      );
    }
    case 'paragraph': {
      return (
        <React.Fragment key={key}>
          {components.paragraph({ children: renderInlineNodes(t.inline, components) })}
        </React.Fragment>
      );
    }
    case 'code': {
      return (
        <React.Fragment key={key}>
          {components.codeBlock({ code: t.code, language: t.language || ctx.defaultCodeLanguage })}
        </React.Fragment>
      );
    }
    case 'blockquote': {
      return (
        <React.Fragment key={key}>
          {components.blockquote({ children: t.children.map((child) => renderBlock(child, ctx.getKey(child), ctx)) })}
        </React.Fragment>
      );
    }
    case 'list': {
      return (
        <React.Fragment key={key}>
          {components.list({
            ordered: t.ordered,
            items: t.items.map((inlineNodes, idx) =>
              components.listItem({
                children: renderInlineNodes(inlineNodes, components),
                index: idx,
                ordered: t.ordered,
              })
            ),
          })}
        </React.Fragment>
      );
    }
    case 'thematicBreak': {
      return <React.Fragment key={key}>{components.thematicBreak()}</React.Fragment>;
    }
    case 'table': {
      const headers = t.headers.map((inlineHeader, headerIndex) =>
        components.tableCell({
          children: renderInlineNodes(inlineHeader, components),
          isHeader: true,
          align: t.alignments?.[headerIndex],
        })
      );
      const rows = t.rows.map((row) =>
        row.map((cellInline, cellIndex) =>
          components.tableCell({
            children: renderInlineNodes(cellInline, components),
            isHeader: false,
            align: t.alignments?.[cellIndex],
          })
        )
      );
      return (
        <React.Fragment key={key}>
          {components.table({ headers, rows, alignments: t.alignments })}
        </React.Fragment>
      );
    }
    default:
      return null;
  }
};

export const Markdown = factory<{ props: MarkdownProps; ref: View }>(
  (props, ref) => {
    const {
      children,
      defaultCodeLanguage = 'tsx',
      maxHeadingLevel = 6,
      components,
      onLinkPress,
      ff: fontFamily,
      style,
      testID,
      ...spacingProps
    } = props;
    const customFontFamily = fontFamily;
    const spacingStyles = useStyleProps(spacingProps);
    const theme = useTheme();
    const styles = getMarkdownStyles(theme);

    // Stable identity, always the latest `onLinkPress` — an inline handler must
    // not rebuild every renderer (and re-render the document) on each render.
    const handleLinkPress = useLatestCallback((href: string) => {
      if (onLinkPress) {
        onLinkPress(href);
        return;
      }
      Linking.openURL(href).catch(() => undefined);
    });

    const merged = useMemo<MarkdownComponentMap>(() => {
      const defaults = createDefaultComponents(theme, styles, handleLinkPress, customFontFamily);
      if (!components) return defaults;
      // Explicitly `undefined` overrides keep the default renderer.
      const overrides = Object.fromEntries(
        Object.entries(components).filter(([, renderer]) => Boolean(renderer))
      ) as Partial<MarkdownComponentMap>;
      return { ...defaults, ...overrides };
    }, [theme, styles, handleLinkPress, customFontFamily, components]);

    const tokens = useMemo(() => tokenize(children ?? ''), [children]);

    const content = useMemo(() => {
      const ctx: RenderContext = {
        components: merged,
        maxHeadingLevel,
        defaultCodeLanguage,
        getKey: createTokenKeyGenerator(),
      };
      return tokens.map((token) => renderBlock(token, ctx.getKey(token), ctx));
    }, [tokens, merged, maxHeadingLevel, defaultCodeLanguage]);

    return (
      <View ref={ref} testID={testID} style={[spacingStyles, style]}>
        {content}
      </View>
    );
  },
  { displayName: 'Markdown' }
);

export default Markdown;
