import { Block, Divider, Text } from '@platform-blocks/react-ui-library';
import type { DividerProps } from '@platform-blocks/react-ui-library';

const COLORS: Array<{ label: string; tone?: DividerProps['color'] }> = [
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

export function Demo() {
  return (
    <Block>
      <Block>
        <Text variant="small" weight="medium">
          Semantic color variants
        </Text>
        {COLORS.map(({ label, tone }) => (
          <Block key={label}>
            <Text variant="p" color="muted">
              {label}
            </Text>
            <Divider color={tone} />
          </Block>
        ))}
      </Block>

      <Block>
        <Text variant="small" weight="medium">
          Labeled dividers
        </Text>
        <Divider color="primary" label="Quarterly results" />
        <Divider color="success" label="Customer satisfaction" />
        <Divider color="error" label="Risks" />
      </Block>

      <Block>
        <Text variant="small" weight="medium">
          Variant styles
        </Text>
        <Divider color="primary" variant="solid" label="Solid" />
        <Divider color="primary" variant="dashed" label="Dashed" />
        <Divider color="primary" variant="dotted" label="Dotted" />
        <Divider color="primary" variant="gradient" label="Gradient" />
      </Block>
    </Block>
  );
}
