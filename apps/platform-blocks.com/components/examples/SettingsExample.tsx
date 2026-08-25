import React from 'react';
import { ScrollView } from 'react-native';
import {
  Avatar,
  Card,
  Column,
  ControlField,
  Flex,
  SegmentedControl,
  Text,
  Title,
  useTheme,
  useThemeMode,
} from '@platform-blocks/ui';

/**
 * Grouped preferences screen. The appearance selector drives the site's real
 * theme through useThemeMode, so switching it here re-themes the example live.
 */
export function SettingsExample() {
  const theme = useTheme();
  const { mode, setMode } = useThemeMode();
  const [pushEnabled, setPushEnabled] = React.useState(true);
  const [emailDigest, setEmailDigest] = React.useState(false);
  const [soundEffects, setSoundEffects] = React.useState(true);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgrounds.base }}
      contentContainerStyle={{ padding: 20, gap: 16, maxWidth: 640, width: '100%', alignSelf: 'center' }}
    >
      <Flex direction="row" align="center" gap="md" py="md">
        <Avatar size="lg" fallback="JS" />
        <Column gap="xs">
          <Title order={3}>Jordan Smith</Title>
          <Text variant="small" colorVariant="secondary">jordan@example.com</Text>
        </Column>
      </Flex>

      <Card variant="elevated" p="lg">
        <Column gap="md">
          <Title order={4}>Appearance</Title>
          <Text variant="small" colorVariant="secondary">
            Auto follows your device setting. Changing this re-themes the page for real.
          </Text>
          <SegmentedControl
            value={mode}
            onChange={value => setMode(value as typeof mode)}
            data={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'auto', label: 'Auto' },
            ]}
          />
        </Column>
      </Card>

      <Card variant="elevated" p="lg">
        <Column gap="sm">
          <Title order={4}>Notifications</Title>
          <ControlField
            variant="switch"
            label="Push notifications"
            description="Mentions, replies, and direct messages"
            checked={pushEnabled}
            onChange={setPushEnabled}
          />
          <ControlField
            variant="switch"
            label="Weekly email digest"
            description="A summary of activity, every Monday"
            checked={emailDigest}
            onChange={setEmailDigest}
          />
          <ControlField
            variant="switch"
            label="Sound effects"
            description="Play a sound for incoming messages"
            checked={soundEffects}
            onChange={setSoundEffects}
          />
        </Column>
      </Card>
    </ScrollView>
  );
}
