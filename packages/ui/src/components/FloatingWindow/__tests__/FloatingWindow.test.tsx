import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { FloatingWindow } from '../FloatingWindow';
it('renders a window and its handles', () => {
  const view = render(<FloatingWindow withinPortal={false} dimensions={{ initialWidth: 200, initialHeight: 120 }}><FloatingWindow.DragHandle><Text>Header</Text></FloatingWindow.DragHandle><FloatingWindow.ResizeHandle /></FloatingWindow>);
  expect(view.getByText('Header')).toBeTruthy();
});
