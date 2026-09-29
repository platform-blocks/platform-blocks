import React from 'react';
import { render, screen } from '@testing-library/react';

import { ReducedMotionProvider } from '../../../core/motion/ReducedMotionProvider';
import { GradientText } from '../GradientText';

const animation = { from: 0, to: 1, duration: 2, repeat: true };

describe('GradientText (web)', () => {
  it('paints the gradient through the text element and keeps one text node', () => {
    render(
      <GradientText testID="g" colors={['#ff0080', '#7928ca']}>
        Hello
      </GradientText>
    );
    const text = screen.getByText('Hello');
    expect(text.style.backgroundImage).toContain('linear-gradient');
    expect(screen.getAllByText('Hello')).toHaveLength(1);
  });

  it('animates the sweep with CSS', () => {
    render(
      <GradientText colors={['#ff0080', '#7928ca']} animation={animation}>
        Sweep
      </GradientText>
    );
    const style = screen.getByText('Sweep').style;
    expect(style.animationName).toMatch(/^pb-gradient-sweep-/);
    expect(style.animationIterationCount).toBe('infinite');
  });

  it('does not animate under reduced motion', () => {
    render(
      <ReducedMotionProvider reducedMotion>
        <GradientText colors={['#ff0080', '#7928ca']} animation={animation}>
          Still
        </GradientText>
      </ReducedMotionProvider>
    );
    expect(screen.getByText('Still').style.animationName).toBe('');
  });

  it('forwards its ref to the root element', () => {
    const ref = React.createRef<unknown>();
    render(
      <GradientText ref={ref as React.Ref<never>} testID="root" colors={['#000', '#fff']}>
        R
      </GradientText>
    );
    expect(ref.current).toBe(screen.getByTestId('root'));
  });
});
