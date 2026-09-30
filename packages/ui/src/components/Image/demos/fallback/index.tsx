import { Block, Icon, Image, Row, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Row align="flex-start" gap="lg" wrap="wrap">
      <Block align="center">
        <Image
          src="https://invalid-url-that-will-fail.com/image.jpg"
          w={120}
          h={80}
          fallback={<Icon name="image-off" size={24} color="gray.5" />}
          alt="Failed to load"
        />
        <Text variant="small">Icon fallback</Text>
      </Block>

      <Block align="center">
        <Image
          src="https://another-invalid-url.com/image.jpg"
          w={120}
          h={80}
          fallback={
            <Text size="sm" c="gray.6" ta="center">
              Image not found
            </Text>
          }
          alt="Failed to load"
        />
        <Text variant="small">Text fallback</Text>
      </Block>
    </Row>
  );
}
