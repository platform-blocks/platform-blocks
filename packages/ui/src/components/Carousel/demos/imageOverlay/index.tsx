import { Block, Carousel, Image, Text } from '@platform-blocks/react-ui-library';

const scenes = [
  { title: 'Mountain escape', src: require('../../../../assets/images/scene-mountains.png') },
  { title: 'Forest retreat', src: require('../../../../assets/images/scene-forest.png') },
  { title: 'Desert journey', src: require('../../../../assets/images/scene-desert.png') },
];

export function Demo() {
  return (
    <Carousel height={280} loop showArrows showDots>
      {scenes.map(({ title, src }) => (
        <Block key={title} h="full" radius="lg" style={{ overflow: 'hidden' }}>
          <Image src={src} w="100%" h="100%" resizeMode="cover" />
          <Block
            position="absolute"
            top={0}
            right={0}
            bottom={0}
            left={0}
            bg="rgba(15,23,42,0.45)"
            p="lg"
            justify="flex-end"
          >
            <Text variant="h3" color="white">
              {title}
            </Text>
          </Block>
        </Block>
      ))}
    </Carousel>
  );
}
