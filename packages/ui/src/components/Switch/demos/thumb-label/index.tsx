import { useState } from 'react';
import { Block, Icon, Switch, Text, useTheme } from '@platform-blocks/react-ui-library';

export function Demo() {
  const theme = useTheme();
  const [wifi, setWifi] = useState<boolean>(true);
  const [available, setAvailable] = useState<boolean>(true);

  return (
    <Block>
      <Block>
        <Text variant="small" color="muted">
          Icon on the thumb — swaps with the on/off state
        </Text>
        <Switch
          checked={wifi}
          onChange={setWifi}
          size="xl"
          label="Wi-Fi"
          onIcon={<Icon name="check" size={18} color={theme.colors.primary[3]} stroke={3} />}
          offIcon={<Icon name="close" size={18} color={theme.colors.gray[5]} stroke={3} />}
        />
      </Block>

      <Block>
        <Text variant="small" color="muted">
          Text label on the thumb
        </Text>
        <Switch
          checked={available}
          onChange={setAvailable}
          size="3xl"
          color="success"
          label="Availability"
          onIcon={
            <Text style={{ fontSize: 12, lineHeight: 11, fontWeight: '700', color: theme.colors.success[5] }}>
              ON
            </Text>
          }
          offIcon={
            <Text style={{ fontSize: 12, lineHeight: 11, fontWeight: '700', color: theme.colors.gray[5] }}>
              OFF
            </Text>
          }
        />
      </Block>
    </Block>
  );
}
