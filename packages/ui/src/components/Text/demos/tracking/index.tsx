import { Block, Card, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <Block>
      <Card p="md">
        <Block>
          <Text variant="p" weight="medium">
            Negative tracking (tighter)
          </Text>
          <Text tracking={-1}>This text uses -1px letter spacing.</Text>
          <Text tracking={-0.5}>This text uses -0.5px letter spacing.</Text>
        </Block>
      </Card>

      <Card p="md">
        <Block>
          <Text variant="p" weight="medium">
            Default tracking
          </Text>
          <Text>This text keeps the default letter spacing.</Text>
        </Block>
      </Card>

      <Card p="md">
        <Block>
          <Text variant="p" weight="medium">
            Positive tracking (looser)
          </Text>
          <Text tracking={0.5}>This text uses 0.5px letter spacing.</Text>
          <Text tracking={1}>This text uses 1px letter spacing.</Text>
          <Text tracking={2}>This text uses 2px letter spacing.</Text>
          <Text tracking={4}>This text uses 4px letter spacing.</Text>
        </Block>
      </Card>

      <Card p="md">
        <Block>
          <Text variant="p" weight="medium">
            Different sizes with tracking
          </Text>
          <Text size="xs" tracking={1}>Extra small with 1px tracking.</Text>
          <Text size="sm" tracking={1}>Small with 1px tracking.</Text>
          <Text size="md" tracking={1}>Medium with 1px tracking.</Text>
          <Text size="lg" tracking={1}>Large with 1px tracking.</Text>
          <Text size="xl" tracking={2}>Extra large with 2px tracking.</Text>
        </Block>
      </Card>

      <Card p="md">
        <Block>
          <Text variant="p" weight="medium">
            Headings with tracking
          </Text>
          <Text variant="h1" tracking={-1}>H1 heading with -1px tracking</Text>
          <Text variant="h2" tracking={0}>H2 heading with default tracking</Text>
          <Text variant="h3" tracking={1}>H3 heading with 1px tracking</Text>
        </Block>
      </Card>

      <Card p="md">
        <Block>
          <Text variant="p" weight="medium">
            Uppercase spacing
          </Text>
          <Text weight="bold" tracking={3} uppercase>
            Uppercase text with wide tracking
          </Text>
        </Block>
      </Card>
    </Block>
  );
}