import { Block, Icon, Ring, Row, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Row gap="lg" justify="center" wrap="wrap">
      <Ring value={86} caption="Pipeline">
        {({ percent }) => (
          <Block align="center">
            <Icon name="rocket" size="lg" color="primary" />
            <Text fw="700">{Math.round(percent)}%</Text>
          </Block>
        )}
      </Ring>

      <Ring value={0} neutral caption="Design system">
        <Block align="center">
          <Icon name="clock" size="lg" color="gray" />
          <Text size="xs" c="secondary">
            On hold
          </Text>
        </Block>
      </Ring>
    </Row>
  );
}
