import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { act, render } from '@testing-library/react-native';

import { Collapse } from '../Collapse';

/** Fires onLayout on every View that has one (Collapse measures its content wrapper). */
const layoutAll = (utils: ReturnType<typeof render>, height: number) => {
  act(() => {
    utils.UNSAFE_getAllByType(View)
      .filter((v: any) => typeof v.props.onLayout === 'function')
      .forEach((v: any) => v.props.onLayout({ nativeEvent: { layout: { height, width: 300 } } }));
  });
};

const clipStyle = (utils: ReturnType<typeof render>) => StyleSheet.flatten(utils.getByTestId('clip', { includeHiddenElements: true }).props.style);

describe('Collapse', () => {
  it('snaps to the measured height and back', () => {
    const utils = render(
      <Collapse isCollapsed={false} testID="clip">
        <Text>content</Text>
      </Collapse>
    );
    layoutAll(utils, 120);
    expect(clipStyle(utils).height).toBe(120);

    utils.rerender(
      <Collapse isCollapsed testID="clip">
        <Text>content</Text>
      </Collapse>
    );
    expect(clipStyle(utils).height).toBe(0);
  });

  it('does not restart the transition when inline callbacks change identity', () => {
    const onStart = jest.fn();
    const onEnd = jest.fn();
    const renderIt = (isCollapsed: boolean) => (
      <Collapse
        isCollapsed={isCollapsed}
        onAnimationStart={() => onStart()}
        onAnimationEnd={() => onEnd()}
        testID="clip"
      >
        <Text>content</Text>
      </Collapse>
    );
    const utils = render(renderIt(true));
    layoutAll(utils, 80);
    // The first measured pass jumps to the target without "animating".
    expect(onStart).not.toHaveBeenCalled();

    utils.rerender(renderIt(false));
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onEnd).toHaveBeenCalledTimes(1);

    // Unrelated re-renders with fresh callbacks start nothing new.
    utils.rerender(renderIt(false));
    utils.rerender(renderIt(false));
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('animateOnMount starts clipped and transparent, then unrolls to the measured height', () => {
    const utils = render(
      <Collapse isCollapsed={false} animateOnMount testID="clip">
        <Text>content</Text>
      </Collapse>
    );
    // No flash at full height before the first measurement.
    expect(clipStyle(utils).height).toBe(0);
    layoutAll(utils, 90);
    expect(clipStyle(utils).height).toBe(90);
  });

  it('hides fully collapsed content from assistive technology', () => {
    const utils = render(
      <Collapse isCollapsed testID="clip">
        <Text>secret</Text>
      </Collapse>
    );
    layoutAll(utils, 50);
    const clip = utils.getByTestId('clip', { includeHiddenElements: true });
    expect(clip.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(clip.props.accessibilityElementsHidden).toBe(true);
    expect(utils.queryByText('secret')).toBeNull();
    expect(utils.getByText('secret', { includeHiddenElements: true })).toBeTruthy();

    utils.rerender(
      <Collapse isCollapsed={false} testID="clip">
        <Text>secret</Text>
      </Collapse>
    );
    expect(utils.getByText('secret')).toBeTruthy();
  });

  it('keeps a partial reveal visible to assistive technology', () => {
    const utils = render(
      <Collapse isCollapsed collapsedHeight={20} testID="clip">
        <Text>teaser</Text>
      </Collapse>
    );
    layoutAll(utils, 100);
    expect(clipStyle(utils).height).toBe(20);
    expect(utils.getByText('teaser')).toBeTruthy();
  });

  it('applies spacing props: margins outside the clip, padding inside the measured content', () => {
    const utils = render(
      <Collapse isCollapsed={false} mt={10} p={4} testID="clip">
        <Text>content</Text>
      </Collapse>
    );
    expect(clipStyle(utils).marginTop).toBe(10);
    expect(clipStyle(utils).paddingTop).toBeUndefined();
  });
});
