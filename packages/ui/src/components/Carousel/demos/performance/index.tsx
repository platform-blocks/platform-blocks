import { Block, Carousel, Text } from '@platform-blocks/ui';

const slides = ['#1E3A8A', '#047857', '#9333EA', '#B91C1C', '#B45309', '#0F766E'];

export default function Demo() {
  return (
    <Carousel height={180} loop showArrows windowSize={3} reducedMotion slideGap={12}>
      {slides.map((bg, index) => (
        <Block key={bg} bg={bg} radius="lg" h="full" align="center" justify="center">
          <Text variant="h4" color="white">
            Slide {index + 1}
          </Text>
        </Block>
      ))}
    </Carousel>
  );
}
