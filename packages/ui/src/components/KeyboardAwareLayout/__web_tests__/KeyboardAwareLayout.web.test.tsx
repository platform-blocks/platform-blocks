import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithPlocks } from '../../../__web_tests__/renderWithPlocks';
import { KeyboardAwareLayout } from '../KeyboardAwareLayout';

test('forwards scroll events from its scrollable content', () => {
  const onScroll = jest.fn();
  renderWithPlocks(<KeyboardAwareLayout testID="layout" onScroll={onScroll}><span>First</span><span>Last</span></KeyboardAwareLayout>);
  const root = screen.getByTestId('layout');
  const scroller = root.firstElementChild;
  expect(scroller).not.toBeNull();
  fireEvent.scroll(scroller as Element);
  expect(onScroll).toHaveBeenCalledTimes(1);
  expect(screen.getByText('Last')).toBeTruthy();
});
