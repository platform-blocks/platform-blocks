import { Platform } from 'react-native';
import { Stack } from 'expo-router';

const shouldDisableAnimation = (() => {
  if (Platform.OS !== 'web') {
    return true;
  }
  if (typeof navigator === 'undefined') {
    return false;
  }
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
})();

export default function ComponentsLayout() {
  const animationOptions = shouldDisableAnimation ? { animation: 'none' as const } : {};

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{ title: 'Components', ...animationOptions }}
      />
      <Stack.Screen
        name="[componentName]"
        options={{ title: 'Component Detail', ...animationOptions }}
      />
    </Stack>
  );
}
