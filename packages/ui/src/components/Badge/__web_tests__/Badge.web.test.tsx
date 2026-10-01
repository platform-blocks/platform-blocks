import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { Badge } from '../Badge';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

describe('Badge (react-native-web DOM)', () => {
  it('renders its label with no interactive role by default', () => {
    render(<Badge testID="badge">New</Badge>);
    expect(screen.getByTestId('badge').textContent).toBe('New');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('uses a tint without a colored stroke for light and clears subtle at rest', () => {
    render(
      <>
        <Badge testID="light-badge" variant="light">Light</Badge>
        <Badge testID="subtle-badge" variant="subtle">Subtle</Badge>
        <Badge testID="outline-badge" variant="outline">Outline</Badge>
      </>
    );
    const light = screen.getByTestId('light-badge');
    const subtle = screen.getByTestId('subtle-badge');
    const outline = screen.getByTestId('outline-badge');
    expect(light.style.backgroundColor).toMatch(/^rgba\(/);
    expect(light.style.borderTopColor).toBe('rgba(0, 0, 0, 0)');
    expect(subtle.style.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(outline.style.borderTopColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  it('keeps its light tint scheme-aware on a statically rendered page', () => {
    rtlRender(
      <PlocksProvider colorsAsCssVariables>
        <Badge testID="scheme-badge" variant="light">Light</Badge>
      </PlocksProvider>
    );
    expect(screen.getByTestId('scheme-badge').style.backgroundColor)
      .toMatch(/^var\(--plocks-variant-primary-light-fill,/);
  });

  it('the remove button is labelled "Remove <label>"', () => {
    const onRemove = jest.fn();
    render(<Badge onRemove={onRemove}>Beta</Badge>);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Beta' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('onPress makes it a button (disabled state exposed)', () => {
    render(
      <Badge onPress={() => {}} disabled>
        Filter
      </Badge>
    );
    expect(screen.getByRole('button', { name: 'Filter' }).getAttribute('aria-disabled')).toBe('true');
  });
});
