import React from 'react';
import { Block, Card, CodeBlock, useBreakpoint } from '@platform-blocks/ui';
import type { NewDemo } from '../utils/demosLoader';

export interface DemoRendererProps {
  demo: NewDemo & { code?: string };
  preview: React.ReactNode;
}

/**
 * Demo card: interactive preview on top, source code flush underneath, both
 * inside a single bordered container. There is no preview/code toggle — the
 * code for a demo is always visible.
 */
export const DemoRenderer: React.FC<DemoRendererProps> = ({ demo, preview }) => {
  const {
    code,
    files,
    codeCopy,
    codeLineNumbers = false,
    codeSpoiler,
    codeSpoilerMaxHeight,
    previewCenter = true,
    highlightLines,
    githubUrl,
    renderStyle = 'auto'
  } = demo as any;

  const hasCode = Boolean(code) && (demo as any).showCode !== false;

  const centerPreview = previewCenter !== false || renderStyle === 'center';

  // Subscribe to the shared breakpoint rather than raw window dimensions. A
  // resize inside one range no longer rebuilds every mounted demo card.
  const breakpoint = useBreakpoint();
  const cardPadding =
    breakpoint === 'base' || breakpoint === 'xs' || breakpoint === 'sm'
      ? 'sm'
      : breakpoint === 'md'
        ? 'lg'
        : '2xl';

  return (
    <Card variant="outline" radius="xl" clip fullWidth>
      {/* The card's padding covers the preview's top/sides; a section escapes it
          horizontally, so the gap above the code rule has to come from here. */}

      <Card.Section withBorder>

        <Block
          direction="column"
          justify="center"
          align={centerPreview ? 'center' : 'stretch'}
          p={cardPadding}
          // pb={hasCode ? '2xl' : undefined}
          fullWidth
        >
          {preview}
        </Block>

      </Card.Section>
      {hasCode && (
        // Full-bleed: the code panel drops its own radius/border and inherits
        // the card's, so it reads as one flush section rather than a nested box.
        <Card.Section >
          <CodeBlock
            showCopyButton={codeCopy !== false}
            showLineNumbers={codeLineNumbers === true}
            highlightLines={highlightLines as any}
            spoiler={codeSpoiler}
            spoilerMaxHeight={codeSpoilerMaxHeight}
            language="tsx"
            wrap={false}
            githubUrl={githubUrl}
            files={files}
            radius="none"
            withBorder={false}
            mb={0}
            fullWidth
          >
            {code}
          </CodeBlock>
        </Card.Section>
      )}
    </Card>
  );
};
