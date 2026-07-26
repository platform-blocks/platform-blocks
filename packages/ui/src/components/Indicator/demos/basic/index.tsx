import { Avatar, Block, Indicator, Text } from '@platform-blocks/ui';

export default function Demo() {
  return (
    <Block>
      <Block>
        <Text size="sm" weight="medium">
          Corner indicator
        </Text>

        <Block bg="#f5f5f7" radius="lg" p="lg" position="relative">
          <Text size="xs" colorVariant="secondary">
            Panel
          </Text>
          <Indicator placement="top-right" />
        </Block>
      </Block>

      <Block>
        <Text size="sm" weight="medium">
          Avatar status
        </Text>

        <Block position="relative" w={72} h={72} align="center" justify="center">
          <Avatar size="lg" fallback="JS" backgroundColor="#6366F1" />
          <Indicator placement="bottom-right" size="md" color="#22c55e" offset={2} />
        </Block>
      </Block>

      <Block>
        <Text size="sm" weight="medium">
          Numeric counter
        </Text>

        <Block
          w={72}
          h={72}
          bg="#e5e7eb"
          radius="lg"
          position="relative"
          align="center"
          justify="center"
        >
          <Text size="xs" colorVariant="secondary">
            Inbox
          </Text>
          <Indicator placement="top-right" size={20} offset={4}>
            <Text size="xs" weight="bold" color="white">
              5
            </Text>
          </Indicator>
        </Block>
      </Block>
    </Block>
  );
}
