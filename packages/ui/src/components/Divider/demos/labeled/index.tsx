import { Block, Chip, Divider, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <Block>
      <Text variant="p">Sign in with email</Text>
      <Divider label="or" />
      <Text variant="p">Continue with social accounts</Text>

      <Divider
        label={<Chip size="sm" variant="outline">Settings</Chip>}
        labelPosition="left"
        color="secondary"
      />
      <Text variant="p">Manage notification preferences</Text>

      <Divider label="Advanced options" labelPosition="right" color="primary" />
      <Text variant="p">Invite admins or export account data</Text>
    </Block>
  );
}


