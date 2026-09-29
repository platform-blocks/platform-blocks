import { View } from 'react-native';
import { Block, Indicator, Row } from '@platform-blocks/ui';

const Anchor = ({ children }: { children?: React.ReactNode }) => (
  <Block w={48} h={48} radius="full" bg="subtle" position="relative" align="center" justify="center">
    {children}
  </Block>
);

export function Demo() {
  return (
    <Row gap="lg" wrap="wrap">
      <Anchor>
        <Indicator size={20} color="#ef4444" label={3} />
      </Anchor>
      <Anchor>
        <Indicator size={20} color="#ef4444" label={12} />
      </Anchor>
      <Anchor>
        <Indicator size={20} color="#ef4444" label="99+" />
      </Anchor>
      <Anchor>
        <Indicator size={22} color="#0ea5e9" label="42" labelProps={{ ff: 'monospace' }} />
      </Anchor>
      <Anchor>
        <Indicator
          size={22}
          color="#10b981"
          label="NEW"
          labelProps={{ tt: 'uppercase', lts: 1, size: 9 }}
        />
      </Anchor>
      <Anchor>
        <Indicator size={16} color="#10b981">
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' }} />
        </Indicator>
      </Anchor>
    </Row>
  );
}
