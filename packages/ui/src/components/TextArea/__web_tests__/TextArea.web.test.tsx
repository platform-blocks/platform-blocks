import React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { TextArea } from '../TextArea';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

describe('TextArea (react-native-web DOM)', () => {
  it('renders a labelled textarea described by its error', () => {
    render(<TextArea id="notes" label="Notes" required error="Please add a note" />);

    const textarea = screen.getByRole('textbox', { name: 'Notes' });
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
    expect(textarea.getAttribute('aria-required')).toBe('true');
    expect(textarea.getAttribute('aria-describedby')).toBe('notes-error');
    expect(screen.getByRole('alert').textContent).toBe('Please add a note');
    expect(textarea.getAttribute('data-plocks-input')).toBe('true');
  });

  it('describes the textarea by its description and helper text', () => {
    render(<TextArea id="bio" label="Bio" description="Shown on your profile" helperText="Max 200 characters" />);
    const textarea = screen.getByRole('textbox', { name: 'Bio' });
    expect(textarea.getAttribute('aria-describedby')).toBe('bio-description bio-helper');
  });
});
