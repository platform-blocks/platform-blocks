import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithPlocks } from '../../../__web_tests__/renderWithPlocks';
import { MotionBlock } from '../MotionBlock';

test('applies web transform and opacity while preserving its content', () => {
  renderWithPlocks(<MotionBlock testID="motion" translateY={12} motionOpacity={0.5}><span>Moving</span></MotionBlock>);
  const root = screen.getByTestId('motion');
  expect(root.style.transform).toContain('translateY');
  expect(root.style.opacity).toBe('0.5');
  expect(root.textContent).toContain('Moving');
});
