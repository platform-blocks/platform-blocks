import type { DividerProps } from '@platform-blocks/ui';
import { Block, Divider, Text } from '@platform-blocks/ui';

const COLOR_VARIANTS: Array<{ label: string; tone?: DividerProps['colorVariant'] }> = [
  { label: 'Border (default)' },
  { label: 'Subtle', tone: 'subtle' },
  { label: 'Muted', tone: 'muted' },
  { label: 'Gray', tone: 'gray' },
  { label: 'Primary', tone: 'primary' },
  { label: 'Secondary', tone: 'secondary' },
  { label: 'Success', tone: 'success' },
  { label: 'Warning', tone: 'warning' },
  { label: 'Error', tone: 'error' },
];

export default function Demo() {
  return (
    <Block>
      <Block>
        <Text variant="small" weight="medium">
          Semantic color variants
        </Text>
        {COLOR_VARIANTS.map(({ label, tone }) => (
          <Block key={label}>
            <Text variant="p" colorVariant="muted">
              {label}
            </Text>
            <Divider colorVariant={tone} />
          </Block>
        ))}
      </Block>

      <Block>
        <Text variant="small" weight="medium">
          Labeled dividers
        </Text>
        <Divider colorVariant="primary" label="Quarterly results" />
        <Divider colorVariant="success" label="Customer satisfaction" />
        <Divider colorVariant="error" label="Risks" />
      </Block>

      <Block>
        <Text variant="small" weight="medium">
          Variant styles
        </Text>
        <Divider colorVariant="primary" variant="solid" label="Solid" />
        <Divider colorVariant="primary" variant="dashed" label="Dashed" />
        <Divider colorVariant="primary" variant="dotted" label="Dotted" />
        <Divider colorVariant="primary" variant="gradient" label="Gradient" />
      </Block>
    </Block>
  );
}
