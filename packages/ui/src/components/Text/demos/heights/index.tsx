import { Block, Text } from '@platform-blocks/ui';

const LINE_HEIGHTS = [1.2, 1.5, 1.8, 2, 24];

const SAMPLE_TEXT =
  'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. Sphinx of black quartz, judge my vow. How vexingly quick daft zebras jump.';

export function Demo() {
  return (
    <Block fullWidth gap="lg">
      {LINE_HEIGHTS.map((lineHeight) => (
        <Block key={lineHeight}>
          <Text variant="small" c="secondary">{lineHeight}</Text>
          <Text lh={lineHeight}>{SAMPLE_TEXT}</Text>
        </Block>
      ))}
    </Block>
  );
}
