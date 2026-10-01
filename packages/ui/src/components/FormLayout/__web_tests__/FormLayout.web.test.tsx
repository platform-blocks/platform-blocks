import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithPlocks } from '../../../__web_tests__/renderWithPlocks';
import { FormLayout, FormSection } from '../index';

test('keeps a labelled form section and its field inside the card surface', () => {
  renderWithPlocks(<FormLayout variant="card" testID="layout"><FormSection title="Profile"><input aria-label="Name" /></FormSection></FormLayout>);
  const root = screen.getByTestId('layout');
  expect(root.contains(screen.getByRole('textbox', { name: 'Name' }))).toBe(true);
  expect(screen.getByText('Profile')).toBeTruthy();
  expect(root.style.backgroundColor).not.toBe('transparent');
});
