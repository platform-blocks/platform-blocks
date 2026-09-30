import { useEffect, useState } from 'react';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Block, ReducedMotionProvider, Row, Switch, Text, useReducedMotion } from '@plocks/ui';

function SpinningSquare() {
  const reduced = useReducedMotion();
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = 0;
    if (!reduced) {
      rotation.value = withRepeat(withTiming(360, { duration: 1200, easing: Easing.linear }), -1);
    }
    return () => cancelAnimation(rotation);
  }, [reduced, rotation]);

  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  return (
    <Row gap="md" align="center">
      <Animated.View style={spinStyle}>
        <Block w={40} h={40} radius="sm" bg="primary.5" />
      </Animated.View>
      <Text size="sm">useReducedMotion(): {String(reduced)}</Text>
    </Row>
  );
}

export function Demo() {
  const [reduce, setReduce] = useState(false);

  return (
    <Block align="flex-start">
      <Switch label="Reduce motion" checked={reduce} onChange={setReduce} />
      <ReducedMotionProvider reducedMotion={reduce ? true : 'system'}>
        <SpinningSquare />
      </ReducedMotionProvider>
    </Block>
  );
}
