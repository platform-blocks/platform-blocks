import { Block, Carousel, Text } from '@platform-blocks/ui';

function slides(colors: string[]) {
  return colors.map((bg, index) => (
    <Block key={bg} bg={bg} radius="lg" h="full" align="center" justify="center">
      <Text variant="h4" color="white">
        Slide {index + 1}
      </Text>
    </Block>
  ));
}

export function Demo() {
  return (
    <Block fullWidth gap="lg">
      <Text variant="h5">Free momentum (dragFree)</Text>
      <Carousel height={160} dragFree itemsPerPage={2} slideGap={12}>
        {slides(['#0EA5E9', '#6366F1', '#8B5CF6', '#A855F7'])}
      </Carousel>

      <Text variant="h5">Locked snaps (skipSnaps off)</Text>
      <Carousel
        height={160}
        itemsPerPage={2}
        slidesToScroll={1}
        skipSnaps={false}
        dragThreshold={45}
        duration={650}
        slideGap={12}
      >
        {slides(['#F97316', '#EA580C', '#C2410C', '#9A3412'])}
      </Carousel>
    </Block>
  );
}
