import { Block, Chip, Divider, Text } from '@platform-blocks/ui';

export default function Demo() {
  return (
    <Block>
      <Text variant="p">Sign in with email</Text>
      <Divider label="or" />
      <Text variant="p">Continue with social accounts</Text>

      <Divider
        label={<Chip size="sm" variant="outline">Settings</Chip>}
        labelPosition="left"
        colorVariant="secondary"
      />
      <Text variant="p">Manage notification preferences</Text>

      <Divider label="Advanced options" labelPosition="right" colorVariant="primary" />
      <Text variant="p">Invite admins or export account data</Text>
    </Block>
  );
}


