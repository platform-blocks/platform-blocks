import React from 'react';
import { render } from '@testing-library/react-native';
import { FloatingIndicator } from '../FloatingIndicator';
it('renders nothing until both refs are available', () => {
  const view = render(<FloatingIndicator parent={null} target={null} />);
  expect(view.toJSON()).toBeNull();
});
