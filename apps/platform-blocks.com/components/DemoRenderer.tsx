import React from 'react';
import { useWindowDimensions } from 'react-native';
import { Block, Card, CodeBlock } from '@platform-blocks/ui';
import { BREAKPOINTS } from '@platform-blocks/ui/core/responsive';
import type { NewDemo } from '../utils/demosLoader';

export interface DemoRendererProps {
  demo: NewDemo & { code?: string };
  preview: React.ReactNode;
  /**
   * Horizontal gutter, in px, that the card should cancel out so it runs to the
   * screen edge. The owning screen passes its own container padding — only it
   * knows that number. Corners square off when bleeding, since a radius at the
   * viewport edge has nothing to sit against.
   */
  bleed?: number;
}

/**
 * Demo card: interactive preview on top, source code flush underneath, both
 * inside a single bordered container. There is no preview/code toggle — the
 * code for a demo is always visible.
 */
export const DemoRenderer: React.FC<DemoRendererProps> = ({ demo, preview, bleed = 0 }) => {
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

  // Phone widths can't afford 24px of card padding on top of the page gutters.
  const { width } = useWindowDimensions();
  const cardPadding = width < BREAKPOINTS.md ? 'sm' : '2xl';

  return (
    <Card
      variant="outline"
      radius={bleed ? 'none' : 'xl'}
      clip
      fullWidth
      style={bleed ? { marginHorizontal: -bleed } : undefined}
    >
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
