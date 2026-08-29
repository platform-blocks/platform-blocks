import { View } from 'react-native';
import { Highlight, Text } from '@platform-blocks/ui';

const SENTENCE = 'Platform Blocks brings patterns, blocks, and building tools together.';

export function Demo() {
  return (
    <View>
      <Text variant="h5">Multiple values</Text>
      <Highlight highlight={['blocks', 'tools']}>{SENTENCE}</Highlight>
    </View>
  );
}