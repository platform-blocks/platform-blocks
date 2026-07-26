import { Block, Carousel, Text } from '@platform-blocks/ui';

const slides = ['#4C1D95', '#155E75', '#166534'];

export default function Demo() {
  return (
    <Carousel height={200} loop autoPlay autoPlayInterval={4500} showDots>
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
