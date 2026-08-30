import { Block, Row, Skeleton } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <Block>
      <Skeleton shape="text" w="60%" />
      <Skeleton shape="text" w="80%" />
      <Skeleton shape="text" w="40%" />
      <Row gap="md" align="center">
        <Skeleton shape="avatar" size="lg" />
        <Block grow={1}>
          <Skeleton shape="text" w="40%" />
          <Skeleton shape="text" w="60%" />
        </Block>
      </Row>
      <Skeleton shape="rectangle" h={120} />
      <Skeleton shape="button" w={120} />
    </Block>
  );
}
