import { Block, Card, Icon, Title } from '@platform-blocks/ui';

export default function Demo() {
  return (
    <Card p="md">
      <Block>
        <Title prefix>Default bar prefix</Title>
        <Title prefix prefixVariant="dot">Dot prefix</Title>
        <Title prefix prefixVariant="bar" prefixSize={6} prefixLength={40} prefixColor="#6366f1">
          Custom bar size and color
        </Title>
        <Title prefix={<Icon name="star" />} prefixGap={8} prefixColor="#f59e0b">
          Icon prefix with custom color
        </Title>
      </Block>
    </Card>
  );
}
