import { Block, Row, Skeleton, useTheme } from '@platform-blocks/ui';

export function Demo() {
  const theme = useTheme();

  return (
    <Block
      p="lg"
      radius="lg"
      borderWidth={1}
      borderColor={theme.backgrounds.border}
      bg={theme.backgrounds.surface}
    >
      <Block>
        <Row gap="md" align="center">
          <Skeleton shape="avatar" size="lg" />
          <Block grow={1}>
            <Skeleton shape="text" w="32%" />
            <Skeleton shape="text" w="48%" />
          </Block>
        </Row>
        <Skeleton shape="rectangle" h={120} />
        <Block>
          <Skeleton shape="text" w="100%" />
          <Skeleton shape="text" w="78%" />
        </Block>
        <Row gap="sm" wrap="wrap">
          <Skeleton shape="chip" />
          <Skeleton shape="chip" />
          <Skeleton shape="chip" />
        </Row>
      </Block>
    </Block>
  );
}
