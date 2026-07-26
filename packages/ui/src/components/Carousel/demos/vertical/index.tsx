import { Block, Carousel, Text } from '@platform-blocks/ui';

const slides = ['#DC2626', '#2563EB', '#0F766E'];

export default function Demo() {
  return (
    <Carousel
      orientation="vertical"
      style={{ height: 280 }}
      loop
      autoPlay
      autoPlayInterval={4500}
      showArrows
      showDots
    >
      {slides.map((bg, index) => (
        <Block key={bg} bg={bg} radius="lg" h="full" align="center" justify="center">
          <Text variant="h3" color="white">
            Slide {index + 1}
          </Text>
        </Block>
      ))}
    </Carousel>
  );
}
