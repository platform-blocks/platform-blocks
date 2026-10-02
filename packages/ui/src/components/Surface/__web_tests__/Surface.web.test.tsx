import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithPlocks } from '../../../__web_tests__/renderWithPlocks';
import { Surface, useSurfaceLevel } from '../index';

function Level() { return <span data-testid="level">{useSurfaceLevel()}</span>; }

test('raises nested surfaces by one level in the web tree', () => {
  renderWithPlocks(<Surface level={1} testID="outer"><Surface raised testID="inner"><Level /></Surface></Surface>);
  expect(screen.getByTestId('outer').contains(screen.getByTestId('inner'))).toBe(true);
  expect(screen.getByTestId('level').textContent).toBe('2');
});
