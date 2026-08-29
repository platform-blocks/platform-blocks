import React from 'react';
import { ScrollView, View } from 'react-native';
import { 
  Text,
  Card,
  Row,
  Grid,
  GridItem,
  Block,
  Title,
  Divider,
  Button,
  Icon
} from '@platform-blocks/ui';
import { PageLayout } from '../PageLayout';
import { useRouter } from 'expo-router';

export default function LayoutShowcase() {
  const router = useRouter();
  return (
    <ScrollView>
      {/* Block Section */}
      <Title text="Block" variant="h2" afterline action={<Button title="Learn more" variant="ghost" endIcon={<Icon name="arrow-right" />} onPress={() => router.push('/components/Block')} />} />
      <Text variant="p" color="secondary">
        Block is a low-level layout primitive with universal props. It can act as a flexible container or item.
      </Text>
      <Card>
        <Block direction="row" justify="space-between" align="center" gap="md">
          <Block p="sm" bg="surface.1"><Text>Item 1</Text></Block>
          <Block p="sm" bg="surface.1"><Text>Item 2</Text></Block>
          <Block p="sm" bg="surface.1"><Text>Item 3</Text></Block>
        </Block>
      </Card>

      {/* Row Section */}
      <Title text="Row" variant="h2" afterline action={<Button title="Learn more" variant="ghost" endIcon={<Icon name="arrow-right" />} onPress={() => router.push('/components/Row')} />} />
      <Text variant="p" color="secondary">
        Row is a layout component that arranges its children in a horizontal line.
      </Text>
      <Card>
        <Row gap="md">
          <Card p="sm"><Text>Item A</Text></Card>
          <Card p="sm"><Text>Item B</Text></Card>
          <Card p="sm"><Text>Item C</Text></Card>
        </Row>
      </Card>

      {/* Flex Section */}
      <Title text="Flex" variant="h2" afterline action={<Button title="Learn more" variant="ghost" endIcon={<Icon name="arrow-right" />} onPress={() => router.push('/components/Flex')} />} />
      <Text variant="p" color="secondary">
        Flex wraps flexbox with simplified props like direction, gap, justify, and align.
      </Text>
      <Card>
        <Block direction="row" gap="md">
          <Card p="sm"><Text>Item A</Text></Card>
          <Card p="sm"><Text>Item B</Text></Card>
          <Card p="sm"><Text>Item C</Text></Card>
        </Block>
      </Card>

      {/* Grid Section */}
      <Title text="Grid" variant="h2" afterline action={<Button title="Learn more" variant="ghost" endIcon={<Icon name="arrow-right" />} onPress={() => router.push('/components/Grid')} />} />
      <Text variant="p" color="secondary">
        Grid provides a 12-column layout. Each GridItem declares its span.
      </Text>
      <Card>
        <Grid columns={12} gap="md">
          <GridItem span={8}><Card p="sm"><Text>span=8</Text></Card></GridItem>
          <GridItem span={4}><Card p="sm"><Text>span=4</Text></Card></GridItem>
          <GridItem span={3}><Card p="sm"><Text>span=3</Text></Card></GridItem>
          <GridItem span={6}><Card p="sm"><Text>span=6</Text></Card></GridItem>
          <GridItem span={3}><Card p="sm"><Text>span=3</Text></Card></GridItem>
        </Grid>
      </Card>

      {/* PageLayout Section */}
      <Title text="PageLayout" variant="h2" afterline action={<Button title="Learn more" variant="ghost" endIcon={<Icon name="arrow-right" />} onPress={() => router.push('/components/PageLayout')} />} />
      <Text variant="p" color="secondary">
        PageLayout gives you a consistent page container with optional content container styling.
      </Text>
      <Card>
        <PageLayout>
          <View style={{ padding: 12 }}>
            <Text weight="semibold">Inside PageLayout</Text>
            <Text size="sm" color="secondary">Use this as a base for documentation pages.</Text>
            <Divider my="sm" />
            <Row gap="sm">
              <Button title="Primary" />
              <Button title="Secondary" variant="secondary" />
            </Row>
          </View>
        </PageLayout>
      </Card>
    </ScrollView>
  );
}
