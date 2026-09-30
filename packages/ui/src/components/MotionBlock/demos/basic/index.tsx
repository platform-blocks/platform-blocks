import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { MotionBlock, Text } from '@plocks/ui';

export function Demo() {
  const offset = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.timing(offset, { toValue: 0, duration: 500, useNativeDriver: true }).start();
  }, [offset]);

  return (
    <MotionBlock translateY={offset} bg="subtle" p="md" radius="md">
      <Text>Animated entrance</Text>
    </MotionBlock>
  );
}
