import { View, useWindowDimensions } from 'react-native';
import { Card, Title, Text, CodeBlock, GradientText, KeyCap, ShimmerText, Block } from 'platform-blocks/components';

const sampleParagraph = 'Lorem ipsum dolor sit amet, consectetur adipiscing elia.';

export function TypographyShowcase() {
  const { width } = useWindowDimensions();
  const isSmall = width < 768;
  return (
    <View>
      <Block direction={isSmall ? 'column' : 'row'} gap={24} wrap={isSmall ? undefined : 'wrap'}>
        <Card padding={20}>
          <Block direction="column" gap={8}>
            <Text fw="100">Weight 100 - Thin</Text>
            <Text fw="200">Weight 200 - Extra Light</Text>
            <Text fw="300">Weight 300 - Light</Text>
            <Text fw="400">Weight 400 - Normal (default)</Text>
            <Text fw="500">Weight 500 - Medium</Text>
            <Text fw="600">Weight 600 - Semibold</Text>
            <Text fw="700">Weight 700 - Bold</Text>
            <Text fw="800">Weight 800 - Extra Bold</Text>
            <Text fw="900">Weight 900 - Black</Text>
          </Block>
        </Card>

        <Card padding={20}>
          <Block direction="column" gap={16}>
            <Text fw="bold" size="lg" c="primary">Color Variants</Text>
            <Block direction="column" gap={8}>
              <Text c="primary">{sampleParagraph}</Text>
              <Text c="secondary">{sampleParagraph}</Text>
              <Text c="muted">{sampleParagraph}</Text>
              <Text c="success">{sampleParagraph}</Text>
              <Text c="warning">{sampleParagraph}</Text>
              <Text c="error">{sampleParagraph}</Text>
              <Text c="info">{sampleParagraph}</Text>
            </Block>
          </Block>
        </Card>


        <Card padding={20}>
          <Block direction="column" gap={16}>
            <Block direction="column" gap={16}>
              <Text fw="bold" size="lg" c="primary">CodeBlock</Text>
              <CodeBlock language="tsx">
                {`<Tabs
  items=[
    { key: 'tab1', label: 'Tab 1', content: <Text>Content 1</Text> },
    { key: 'tab2', label: 'Tab 2', content: <Text>Content 2</Text> }
  ]
  variant="line"
/>`}
              </CodeBlock>
            </Block>
          </Block>
        </Card>

        <Card padding={20}>
          <Block direction="column" gap={16}>
            <Text fw="bold" size="lg" c="primary">Enhanced Typography</Text>
            <Block direction="column" gap={12}>
              <GradientText colors={['#22d3ee', '#6366f1']} fw="bold" size="xl">
                GradientText brings motion to headlines
              </GradientText>
              <ShimmerText fw="600" shimmerColor="#34d399">
                ShimmerText highlights loading states gracefully
              </ShimmerText>
              <Block direction="row" align="center" gap={8} wrap="wrap">
                <Text fw="600">Keyboard shortcut:</Text>
                <KeyCap>⌘</KeyCap>
                <KeyCap>Shift</KeyCap>
                <KeyCap>P</KeyCap>
              </Block>
            </Block>
          </Block>
        </Card>
      </Block>
    </View>
  );
}

