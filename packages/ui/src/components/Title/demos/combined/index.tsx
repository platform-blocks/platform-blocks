import { Block, Title } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Title
        prefix
        underline
        afterline
        prefixSize={6}
        prefixLength={48}
        prefixColor="#10b981"
        underlineStroke={3}
      >
        Analytics overview
      </Title>
      <Title
        order={3}
        prefix
        prefixVariant="dot"
        prefixColor="#ef4444"
        underline
        underlineColor="#ef4444"
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
      >
        Conversion rate
      </Title>
    </Block>
  );
}
