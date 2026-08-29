import { useState } from 'react';
import { Block, Switch, Text } from '@platform-blocks/ui';

const PREFERENCE_CONTROLS = [
  {
    key: 'scoreAlerts',
    label: 'Live score alerts',
    description: 'Push notifications for scoring plays.'
  },
  {
    key: 'newsEmails',
    label: 'Breaking news emails',
    description: 'Send a morning recap with roster updates.'
  },
  {
    key: 'audioHighlights',
    label: 'Audio highlights',
    description: 'Play broadcast clips after each match.'
  }
] as const;

type PreferenceKey = (typeof PREFERENCE_CONTROLS)[number]['key'];

const INITIAL_SETTINGS: Record<PreferenceKey, boolean> = {
  scoreAlerts: true,
  newsEmails: false,
  audioHighlights: false
};

export function Demo() {
  const [settings, setSettings] = useState<Record<PreferenceKey, boolean>>(
    () => ({ ...INITIAL_SETTINGS })
  );

  return (
    <Block>
      <Block>
        <Text variant="small" color="muted">
          Shared state
        </Text>
        {PREFERENCE_CONTROLS.map(({ key, label, description }) => (
          <Switch
            key={key}
            checked={settings[key]}
            onChange={(checked) =>
              setSettings((prev) => ({ ...prev, [key]: checked }))
            }
            label={label}
            description={description}
          />
        ))}
      </Block>
  <Block>
        <Text variant="small" color="muted">
          Summary
        </Text>
        <Text variant="p">
          Score alerts are {settings.scoreAlerts ? 'on' : 'off'}.
        </Text>
        <Text variant="p">
          Breaking news emails are {settings.newsEmails ? 'on' : 'off'}.
        </Text>
        <Text variant="p">
          Audio highlights are {settings.audioHighlights ? 'on' : 'off'}.
        </Text>
      </Block>
    </Block>
  );
}


