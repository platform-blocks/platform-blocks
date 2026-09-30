import React from 'react';
import { render, screen } from '@testing-library/react';

import { QRCode } from '../QRCode';

describe('QRCode (react-native-web DOM)', () => {
  it('is an image named after the encoded value by default', () => {
    render(<QRCode value="https://example.com" />);
    expect(screen.getByRole('img', { name: 'QR code: https://example.com' })).toBeTruthy();
  });

  it('uses a string label as the name', () => {
    render(<QRCode value="https://example.com" label="Scan for tickets" />);
    expect(screen.getByRole('img', { name: 'Scan for tickets' })).toBeTruthy();
    expect(screen.getByText('Scan for tickets')).toBeTruthy();
  });

  it('is a button when copyOnPress is set', () => {
    render(<QRCode value="https://example.com" copyOnPress accessibilityLabel="Event code" />);
    expect(screen.getByRole('button', { name: 'Event code' })).toBeTruthy();
  });
});
