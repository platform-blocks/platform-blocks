import { Block, Row, Skeleton } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <Block>
      <Row gap="lg" align="center" wrap="wrap">
        <Skeleton shape="avatar" size="sm" />
        <Skeleton shape="avatar" size="md" />
        <Skeleton shape="avatar" size="lg" />
        <Skeleton shape="avatar" size="xl" />
      </Row>
      <Block>
        <Skeleton shape="text" w="100%" />
        <Skeleton shape="text" w="90%" />
        <Skeleton shape="text" w="70%" />
      </Block>
      <Row gap="md" wrap="wrap">
        <Skeleton shape="button" w={80} />
        <Skeleton shape="button" w={100} />
        <Skeleton shape="button" w={120} />
      </Row>
      <Row gap="sm" wrap="wrap">
        <Skeleton shape="chip" />
        <Skeleton shape="chip" />
        <Skeleton shape="chip" />
      </Row>
      <Skeleton shape="rectangle" h={60} />
      <Skeleton shape="card" h={200} />
    </Block>
  );
}
