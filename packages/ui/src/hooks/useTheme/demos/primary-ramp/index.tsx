import { Block, Row, Text, readableTextOn, useTheme } from '@plocks/ui';

export function Demo() {
  const theme = useTheme();

  return (
    <Block fullWidth maw={560}>
      <Text size="sm" fw="600">
        colors.primary ({theme.colorScheme})
      </Text>
      <Row gap={4}>
        {theme.colors.primary.map((shade, index) => (
          <Block key={index} grow={1} h={48} radius="sm" bg={shade} align="center" justify="center">
            <Text size="xs" c={readableTextOn(shade)}>
              {index}
            </Text>
          </Block>
        ))}
      </Row>
    </Block>
  );
}
