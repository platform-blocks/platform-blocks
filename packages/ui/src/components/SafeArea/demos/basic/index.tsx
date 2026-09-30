import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeArea, Text } from '@plocks/ui';

export function Demo() {
  return (
    <SafeAreaProvider>
      <SafeArea bg="subtle" p="md">
        <Text>Content inside the safe area</Text>
      </SafeArea>
    </SafeAreaProvider>
  );
}
