import { Block, Carousel, Text } from '@platform-blocks/ui';

const slides = ['#1D4ED8', '#0F766E', '#C026D3', '#B45309', '#7C3AED'];

export default function Demo() {
  return (
    <Carousel
      height={180}
      loop
      showDots
      slideGap={12}
      itemsPerPage={1}
      slidesToScroll={1}
      breakpoints={{
        '@media (min-width: 768px)': { itemsPerPage: 2 },
        '@media (min-width: 1200px)': { itemsPerPage: 4 },
      }}
    >
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
