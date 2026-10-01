import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithPlocks } from '../../../__web_tests__/renderWithPlocks';
import { Row, Column } from '../Layout';

test('uses distinct row and column layouts in the web DOM', () => {
  renderWithPlocks(<><Row testID="row"><span>One</span><span>Two</span></Row><Column testID="column"><span>Three</span><span>Four</span></Column></>);
  expect(screen.getByTestId('row').style.flexDirection).toBe('row');
  expect(screen.getByTestId('column').style.flexDirection).toBe('column');
  expect(screen.getByTestId('column').style.width).toBe('100%');
});
