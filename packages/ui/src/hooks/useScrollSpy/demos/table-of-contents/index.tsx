import { ScrollView, View } from 'react-native';
import { Badge, Block, Row, Text, TitleRegistryProvider, useScrollSpy, useTitleRegistration } from '@platform-blocks/ui';

const SECTIONS = [
  { title: 'Overview', order: 1, copy: 'Introduce the feature and set expectations for what the rest of the document covers.' },
  { title: 'Installation', order: 2, copy: 'List required packages and platform caveats so teams can get started quickly.' },
  { title: 'Usage patterns', order: 3, copy: 'Highlight the most common ways to use the feature with short inline examples.' },
  { title: 'Troubleshooting', order: 4, copy: 'Capture the top issues support sees and the fix steps that usually resolve them.' }
] as const;

function Section({ title, order, copy }: { title: string; order: number; copy: string }) {
  const { elementRef, id } = useTitleRegistration({ text: title, order });

  return (
    <View ref={elementRef} nativeID={id}>
      <Text weight="semibold">{title}</Text>
      <Text size="sm" color="secondary">{copy}</Text>
    </View>
  );
}

function TocList() {
  const { items, activeId } = useScrollSpy();

  if (!items.length) {
    return <Text size="sm" color="muted">No headings detected yet.</Text>;
  }

  return (
    <Row gap="xs" wrap="wrap">
      {items.map(item => (
        <Badge
          key={item.id}
          variant={activeId === item.id ? 'light' : 'outline'}
          color={activeId === item.id ? 'primary' : 'gray'}
        >
          {item.value}
        </Badge>
      ))}
    </Row>
  );
}

export function Demo() {
  return (
    <TitleRegistryProvider>
      <Block gap="lg">
        <TocList />
        <ScrollView style={{ maxHeight: 280 }} contentContainerStyle={{ gap: 24 }}>
          {SECTIONS.map(section => (
            <Section key={section.title} {...section} />
          ))}
        </ScrollView>
      </Block>
    </TitleRegistryProvider>
  );
}
