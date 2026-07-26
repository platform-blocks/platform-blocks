import { Pressable } from 'react-native';
import { Block, Card, Text, useHover } from '@platform-blocks/ui';

export default function Demo() {
  const [hovered, hoverHandlers] = useHover();

  return (
    <Block align="flex-start">
      <Text size="sm" colorVariant="muted">
        Hover the card below (web only — touch devices show no hover state).
      </Text>
      <Pressable {...hoverHandlers}>
        <Card p="md" variant={hovered ? 'elevated' : 'outline'} bg={hovered ? 'primary' : undefined}>
          <Text weight={hovered ? '700' : '500'}>{hovered ? 'Hovered' : 'Hover me'}</Text>
        </Card>
      </Pressable>
    </Block>
  );
}
