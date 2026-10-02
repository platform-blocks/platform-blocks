import { useDeviceInfo } from '@plocks/ui';
import { Stack } from 'expo-router';

export default function ComponentsLayout() {
  const { platform: { isNative, isMobile } } = useDeviceInfo();
  const shouldDisableAnimation = isNative || isMobile;
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
