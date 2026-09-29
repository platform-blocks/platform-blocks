import { ImageBackground, StyleSheet } from 'react-native';
import { Block, Overlay, Text } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block fullWidth maw={520}>
      <ImageBackground source={require('../../../../assets/images/scene-city.png')} style={styles.image}>
        <Overlay color="#000" backgroundOpacity={0.5} center>
          <Text fw="semibold" c="white">
            Dim
          </Text>
        </Overlay>
      </ImageBackground>

      <ImageBackground source={require('../../../../assets/images/scene-aurora.png')} style={styles.image}>
        <Overlay gradient="linear-gradient(145deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0) 75%)" center>
          <Text fw="semibold" c="white">
            Gradient
          </Text>
        </Overlay>
      </ImageBackground>

      <ImageBackground source={require('../../../../assets/images/scene-desert.png')} style={styles.image}>
        <Overlay color="#000" backgroundOpacity={0.35} blur={18} center>
          <Text fw="semibold" c="white">
            Blur
          </Text>
        </Overlay>
      </ImageBackground>
    </Block>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 24,
    overflow: 'hidden',
  },
});
