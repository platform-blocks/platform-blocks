import React from 'react';
import { Text } from 'react-native';
import { act, render, screen } from '@testing-library/react';

import { Collapse } from '../Collapse';

/** jsdom has no layout: hand every onLayout listener a measured height. */
function layoutAll(height: number) {
  act(() => {
    document.querySelectorAll('*').forEach((el) => {
      const handler = (el as unknown as { __reactLayoutHandler?: (e: unknown) => void }).__reactLayoutHandler;
      if (typeof handler === 'function') {
        handler({ nativeEvent: { layout: { x: 0, y: 0, width: 300, height } }, timeStamp: Date.now() });
      }
    });
  });
}

/** The nearest ancestor (or self) with an inline `visibility`. */
const visibilityOf = (el: HTMLElement | null): string => {
  let node: HTMLElement | null = el;
  while (node) {
    if (node.style?.visibility) return node.style.visibility;
    node = node.parentElement;
  }
  return 'visible';
};

describe('Collapse (react-native-web DOM)', () => {
  it('takes fully collapsed content out of the accessibility tree and tab order', () => {
    const { rerender } = render(
      <Collapse isCollapsed transitionDuration={0}>
        <Text>Hidden details</Text>
      </Collapse>
    );
    layoutAll(80);
    expect(visibilityOf(screen.getByText('Hidden details'))).toBe('hidden');

    rerender(
      <Collapse isCollapsed={false} transitionDuration={0}>
        <Text>Hidden details</Text>
      </Collapse>
    );
    expect(visibilityOf(screen.getByText('Hidden details'))).toBe('visible');
  });

  it('keeps a partial reveal visible', () => {
    render(
      <Collapse isCollapsed collapsedHeight={24} transitionDuration={0}>
        <Text>Teaser</Text>
      </Collapse>
    );
    layoutAll(80);
    expect(visibilityOf(screen.getByText('Teaser'))).toBe('visible');
  });
});
