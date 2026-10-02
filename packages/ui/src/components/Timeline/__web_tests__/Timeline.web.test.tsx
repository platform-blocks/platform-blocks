import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithPlocks } from '../../../__web_tests__/renderWithPlocks';
import { Timeline } from '../Timeline';

test('renders event titles and details in chronological DOM order', () => {
  renderWithPlocks(<Timeline active={1}><Timeline.Item title="Plan" timestamp="Monday">Scope</Timeline.Item><Timeline.Item title="Build" timestamp="Tuesday">Implementation</Timeline.Item></Timeline>);
  const text = document.body.textContent ?? '';
  expect(text.indexOf('Plan')).toBeLessThan(text.indexOf('Build'));
  expect(screen.getByText('Monday')).toBeTruthy();
  expect(screen.getByText('Implementation')).toBeTruthy();
});
