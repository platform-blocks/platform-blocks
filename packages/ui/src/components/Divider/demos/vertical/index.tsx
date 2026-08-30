import { Block, Divider, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <Block>
      <Block align="center" direction="row" h={100}>
        <Block align="center">
          <Text variant="p" weight="medium">
            Profile
          </Text>
          <Text variant="small" color="muted">
            View details
          </Text>
        </Block>

        <Divider orientation="vertical" />

        <Block align="center">
          <Text variant="p" weight="medium">
            Settings
          </Text>
          <Text variant="small" color="muted">
            Preferences
          </Text>
        </Block>

        <Divider orientation="vertical" label="Pro" color="success" />

        <Block align="center">
          <Text variant="p" weight="medium">
            Support
          </Text>
          <Text variant="small" color="muted">
            Help center
          </Text>
        </Block>
      </Block>

      <Block align="center" wrap="wrap" direction="row" h={100}>
        <Text variant="p">Home</Text>
        <Divider orientation="vertical" />
        <Text variant="p">Fixtures</Text>
        <Divider orientation="vertical" color="primary" />
        <Text variant="p">Standings</Text>
        <Divider orientation="vertical" label="Live" color="warning" />
        <Text variant="p">Highlights</Text>
      </Block>
    </Block>
  );
}


