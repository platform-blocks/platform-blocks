import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Block, useReducedMotion, useTheme } from '@plocks/ui';
import { BOARD, DROP_ORDER, SLOT, type HeroMarkProps } from './heroMarkLayout';

export function HeroMark({ size }: HeroMarkProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const [run, setRun] = useState(0);
  const unit = size / BOARD.height;

  const board = useSharedValue(reduced ? 1 : 0);
  const click = useSharedValue(1);

  useEffect(() => {
    if (reduced) {
      board.set(1);
      return;
    }
    board.set(0);
    board.set(withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
    click.set(withDelay(1340, withSequence(withTiming(1.06, { duration: 140 }), withTiming(1, { duration: 220 }))));
  }, [board, click, reduced, run]);

  const boardStyle = useAnimatedStyle(() => ({ opacity: board.get() }));
  const clickStyle = useAnimatedStyle(() => ({ transform: [{ scale: click.get() }] }));

  return (
    <Pressable onPress={() => setRun((value) => value + 1)} aria-hidden accessible={false}>
      <Block style={{ width: BOARD.width * unit, height: size }}>
        <Animated.View style={[StyleSheet.absoluteFill, boardStyle]}>
          {BOARD.slots.map(({ x, y, opacity }) => (
            <Block key={`${x},${y}`} style={[slotBox(x, y, unit), { backgroundColor: theme.text.primary, opacity }]} />
          ))}
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, clickStyle]}>
          {DROP_ORDER.map((block, order) => (
            <DropBlock key={`${block.x},${block.y}`} {...block} order={order} unit={unit} run={run} reduced={reduced} />
          ))}
        </Animated.View>
      </Block>
    </Pressable>
  );
}

interface DropBlockProps {
  x: number;
  y: number;
  fill: string;
  tilt: number;
  order: number;
  unit: number;
  run: number;
  reduced: boolean;
}

/** One block falling into its slot; a spring past 1 carries it just below and back. */
function DropBlock({ x, y, fill, tilt, order, unit, run, reduced }: DropBlockProps) {
  const drop = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      drop.set(1);
      return;
    }
    drop.set(0);
    drop.set(withDelay(360 + order * 120, withSpring(1, { damping: 11, stiffness: 160 })));
  }, [drop, order, reduced, run]);

  const height = 2.4 * SLOT.size * unit;
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(drop.get(), [0, 0.3], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateY: (drop.get() - 1) * height }, { rotate: `${(1 - drop.get()) * tilt}deg` }],
  }));

  return <Animated.View style={[slotBox(x, y, unit), { backgroundColor: fill }, style]} />;
}

/** A slot's box in px, from its board units (the board's origin is one step up and left of the mark's). */
const slotBox = (x: number, y: number, unit: number) => ({
  position: 'absolute' as const,
  left: (x + SLOT.step) * unit,
  top: (y + SLOT.step) * unit,
  width: SLOT.size * unit,
  height: SLOT.size * unit,
  borderRadius: SLOT.radius * unit,
});
