import { Block, Card, Text, Title } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Card p="md">
      <Block>
        <Title
          prefix
          underline
          afterline
          prefixVariant="bar"
          prefixSize={6}
          prefixLength={48}
          prefixColor="#10b981"
          underlineStroke={3}
        >
          Analytics overview
        </Title>
        <Text size="sm" color="secondary">
          Combine prefixes, underline, and afterline to create a structured page heading with a strong visual anchor.
        </Text>
        <Block>
          <Title
            order={3}
            prefix
            prefixVariant="dot"
            prefixColor="#ef4444"
            underline
            underlineColor="#ef4444"
            underlineStroke={2}
          >
            Active users
          </Title>
          <Title
            order={3}
            prefix
            prefixVariant="dot"
            prefixColor="#6366f1"
            underline
            underlineColor="#6366f1"
            underlineStroke={2}
          >
            Conversion rate
          </Title>
        </Block>
      </Block>
    </Card>
  );
}
