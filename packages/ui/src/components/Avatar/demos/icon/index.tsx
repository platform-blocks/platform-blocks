import { Avatar, Block, Icon, Row, Text } from '@platform-blocks/ui';

export default function IconAvatarDemo() {
  return (
    <Block>
      <Block>
        <Text size="sm" colorVariant="muted">
          Render an icon inside the avatar via the `fallback` prop
        </Text>
        <Row gap="md" align="center">
          <Avatar
            fallback={<Icon name="user" color="white" />}
            backgroundColor="#6366f1"
          />
          <Avatar
            fallback={<Icon name="camera" color="white" />}
            backgroundColor="#10b981"
          />
          <Avatar
            fallback={<Icon name="bell" color="white" />}
            backgroundColor="#f59e0b"
          />
          <Avatar
            fallback={<Icon name="settings" color="white" />}
            backgroundColor="#ef4444"
          />
        </Row>
      </Block>

      <Block>
        <Text size="sm" colorVariant="muted">
          Scales with the avatar size
        </Text>
        <Row gap="md" align="center">
          <Avatar
            size="sm"
            fallback={<Icon name="user" size="sm" color="white" />}
            backgroundColor="#6366f1"
          />
          <Avatar
            size="md"
            fallback={<Icon name="user" size="md" color="white" />}
            backgroundColor="#6366f1"
          />
          <Avatar
            size="lg"
            fallback={<Icon name="user" size="lg" color="white" />}
            backgroundColor="#6366f1"
          />
          <Avatar
            size="xl"
            fallback={<Icon name="user" size="xl" color="white" />}
            backgroundColor="#6366f1"
          />
        </Row>
      </Block>

      <Block>
        <Text size="sm" colorVariant="muted">
          Icon avatar with label and online status
        </Text>
        <Avatar
          fallback={<Icon name="user" color="white" />}
          backgroundColor="#6366f1"
          label="Jane Doe"
          description="Product Designer"
          online
        />
      </Block>
    </Block>
  );
}
