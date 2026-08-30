import { useState, type ComponentProps } from 'react';
import { StyleSheet } from 'react-native';
import { Block, Button, Card, Input, LoadingOverlay, Switch, Text } from '@platform-blocks/react-ui-library';

type TextFieldConfig = {
  key: string;
} & Pick<ComponentProps<typeof Input>, 'label' | 'placeholder' | 'keyboardType' | 'secureTextEntry'>;

const TEXT_FIELDS: TextFieldConfig[] = [
  { key: 'first-name', label: 'First name', placeholder: 'Jane' },
  { key: 'last-name', label: 'Last name', placeholder: 'Doe' },
  {
    key: 'email',
    label: 'Email',
    placeholder: 'jane@react-ui-library.com',
    keyboardType: 'email-address',
  },
  {
    key: 'password',
    label: 'Password',
    placeholder: '••••••••',
    secureTextEntry: true,
  },
];

export function Demo() {
  const [visible, setVisible] = useState(false);

  return (
    <Block align="center" style={styles.wrapper}>
      <Block style={styles.section}>
        <Card style={styles.card} shadow="lg">
          <LoadingOverlay
            visible={visible}
            overlayProps={{ blur: 12, radius: 'md', backgroundOpacity: 0.4 }}
            loaderProps={{ variant: 'dots', size: 'lg' }}
          />

          <Block>
            <Block>
              <Text variant="h4" weight="semibold">
                Account details
              </Text>
              <Text variant="p" color="muted">
                Pause form interaction while requests finish and keep the layout intact.
              </Text>
            </Block>

            <Block>
              {TEXT_FIELDS.map(({ key, ...field }) => (
                <Input key={key} disabled={visible} {...field} />
              ))}
              <Switch label="Subscribe to product updates" disabled={visible} />
            </Block>
          </Block>
        </Card>

        <Button onPress={() => setVisible((current) => !current)}>
          {visible ? 'Stop loading' : 'Simulate loading'}
        </Button>
      </Block>

      <Text variant="small" color="muted" align="center">
        LoadingOverlay anchors to a relative container and dims the content while the loader animates.
      </Text>
    </Block>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  section: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  card: {
    width: '100%',
  },
});
