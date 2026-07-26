import { View } from 'react-native';
import { Avatar, Block, Indicator, Row, Text } from '@platform-blocks/ui';

const Anchor = ({ children }: { children?: React.ReactNode }) => (
  <View
    style={{
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#e5e7eb',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}
  >
    {children}
  </View>
);

export default function Demo() {
  return (
    <Block>
      <Block>
        <Text size="sm" colorVariant="muted">Numeric counts</Text>
        <Row gap="lg">
          <Anchor>
            <Indicator size={20} color="#ef4444" label={3} />
          </Anchor>
          <Anchor>
            <Indicator size={20} color="#ef4444" label={12} />
          </Anchor>
          <Anchor>
            <Indicator size={20} color="#ef4444" label="99+" />
          </Anchor>
        </Row>
      </Block>

      <Block>
        <Text size="sm" colorVariant="muted">
          Monospace badge with custom label styling
        </Text>
        <Row gap="lg">
          <Avatar fallback="JS" backgroundColor="#a855f7" />
          <Anchor>
            <Indicator
              size={22}
              color="#0ea5e9"
              label="42"
              labelProps={{ ff: 'monospace', weight: '700' }}
            />
          </Anchor>
          <Anchor>
            <Indicator
              size={22}
              color="#10b981"
              label="NEW"
              labelProps={{ uppercase: true, tracking: 1, size: 9 }}
            />
          </Anchor>
        </Row>
      </Block>

      <Block>
        <Text size="sm" colorVariant="muted">Custom child content (children, not label)</Text>
        <Row gap="lg">
          <Anchor>
            <Indicator size={16} color="#10b981">
              {/* anything you want — icon, custom shape, etc. */}
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' }} />
            </Indicator>
          </Anchor>
        </Row>
      </Block>
    </Block>
  );
}
