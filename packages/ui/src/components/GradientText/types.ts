import { TextProps } from '../Text/Text';

export interface GradientTextProps extends Omit<TextProps, 'color'> {
  /** Array of colors for the gradient (at least 2 required) */
  colors: string[];
  
  /** Color stops (0-1) for each color. If not provided, colors are evenly distributed */
  locations?: number[];
  
  /** Gradient direction angle in degrees (0 = left to right, 90 = top to bottom, etc.) */
  angle?: number;
  
  /** Start point [x, y] (0-1). Overrides angle if provided */
  start?: [number, number];
  
  /** End point [x, y] (0-1). Overrides angle if provided */
  end?: [number, number];
  
  /** Gradient position offset (0-1). Moves the gradient along the line */
  position?: number;

  /**
   * Sweep the gradient position continuously (web only). Runs as a CSS
   * animation, so no JavaScript executes per frame. Overrides `position` while
   * it is running; on native the gradient stays static.
   */
  animation?: GradientTextAnimation;

  /** Custom testID for testing */
  testID?: string;
}

/** Declarative sweep for {@link GradientTextProps.animation}. */
export interface GradientTextAnimation {
  /** Position offset the sweep starts from (same space as `position`) */
  from: number;
  /** Position offset the sweep ends at */
  to: number;
  /** Seconds for a single sweep */
  duration: number;
  /** Seconds to wait before the first sweep */
  delay?: number;
  /** Repeat forever instead of running once */
  repeat?: boolean;
  /** Seconds held at `to` between repeats */
  repeatDelay?: number;
}

export interface GradientTextStyleProps {

  /** Array of colors for the gradient (at least 2 required) */
  colors: string[];

  /** Color stops (0-1) for each color. If not provided, colors are evenly distributed */
  locations?: number[];

  /** Gradient direction angle in degrees (0 = left to right, 90 = top to bottom, etc.) */
  angle?: number;

  /** Start point [x, y] (0-1). Overrides angle if provided */
  start?: [number, number];

  /** End point [x, y] (0-1). Overrides angle if provided */
  end?: [number, number];

  /** Gradient position offset (0-1) */
  position: number;
}
