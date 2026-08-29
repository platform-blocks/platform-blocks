import { View } from 'react-native';
import { Highlight, Text } from '@platform-blocks/ui';

const PARAGRAPH = 'Highlight This, definitely THIS and also this!';

export function Demo() {
  return (
    <View>
      <Text variant="h5">Case-insensitive match</Text>
      <Highlight highlight="this">{PARAGRAPH}</Highlight>
    </View>
  );
}