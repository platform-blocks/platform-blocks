import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { LoadingOverlay } from '../LoadingOverlay';

describe('LoadingOverlay', () => {
  it('exposes a named progress indicator only while visible', () => {
    const { rerender } = render(<LoadingOverlay visible loadingLabel="Saving profile" loader={<Text>Working</Text>} announceAfter={false} />);
    expect(screen.getByRole('progressbar', { name: 'Saving profile' })).toBeTruthy();
    expect(screen.getByText('Working')).toBeTruthy();
    rerender(<LoadingOverlay visible={false} loadingLabel="Saving profile" />);
    expect(screen.queryByRole('progressbar')).toBeNull();
  });
});
