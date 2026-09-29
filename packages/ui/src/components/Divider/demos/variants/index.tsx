import { Block, Divider, Text } from '@platform-blocks/ui';

const VARIANTS = ['solid', 'dashed', 'dotted', 'gradient'] as const;

export function Demo() {
  return (
    <Block fullWidth>
      {VARIANTS.map((variant) => (
        <Block key={variant} fullWidth>
          <Text variant="small" c="secondary">{variant}</Text>
          <Divider variant={variant} />
        </Block>
      ))}

      <Block direction="row" align="center" wrap="wrap">
        <Text variant="small" fw="medium">
          Published
        </Text>
        <Divider orientation="vertical" variant="solid" style={{ height: 48 }} />
        <Text variant="small" fw="medium">
          Drafts
        </Text>
        <Divider orientation="vertical" variant="dashed" style={{ height: 48 }} />
        <Text variant="small" fw="medium">
          Scheduled
        </Text>
        <Divider orientation="vertical" variant="dotted" style={{ height: 48 }} />
        <Text variant="small" fw="medium">
          Archived
        </Text>
      </Block>
    </Block>
  );
}
