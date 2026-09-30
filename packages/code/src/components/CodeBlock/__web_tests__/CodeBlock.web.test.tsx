import React from 'react';
import { act, fireEvent, render as rtlRender, screen, waitFor } from '@testing-library/react';

import { PlocksProvider } from '@plocks/ui';
import { clearAnnouncer } from '@plocks/ui/test-utils';
import { CodeBlock } from '../CodeBlock';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

const politeRegion = () => document.querySelector('[data-plocks-announcer] [aria-live="polite"]');

describe('CodeBlock (react-native-web DOM)', () => {
  let writeText: jest.Mock;
  let warn: jest.SpyInstance;

  beforeEach(() => {
    writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, 'clipboard', { value: { writeText }, configurable: true });
    // The optional Prism build is ESM-only and not transformed here, so the
    // block falls back to its built-in tokenizer (and says so once).
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // The live region's clear timer outlives the test otherwise.
    clearAnnouncer();
    warn.mockRestore();
  });

  it('names the copy button, copies on click, and confirms with "Copied"', async () => {
    const onCopy = jest.fn();
    render(<CodeBlock onCopy={onCopy}>{'const answer = 42;'}</CodeBlock>);

    const button = screen.getByRole('button', { name: 'Copy code' });
    expect(button.getAttribute('aria-label')).toBe('Copy code');

    fireEvent.click(button);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy());
    expect(writeText).toHaveBeenCalledWith('const answer = 42;');
    expect(onCopy).toHaveBeenCalledWith('const answer = 42;');
    // Screen readers hear the confirmation through the shared live region.
    await waitFor(() => expect(politeRegion()?.textContent).toBe('Copied'));
  });

  it('puts the copy button in the title row when the block has a title', async () => {
    render(<CodeBlock title="Usage">{'npm install @plocks/ui'}</CodeBlock>);
    expect(screen.getByText('Usage')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('npm install @plocks/ui'));
  });

  it('reveals the hover-only controls while keyboard focus is inside them', () => {
    render(<CodeBlock>{'const hidden = true;'}</CodeBlock>);
    const button = screen.getByRole('button', { name: 'Copy code' });
    const layer = button.parentElement as HTMLElement;
    expect(getComputedStyle(layer).opacity).toBe('0');

    act(() => {
      button.focus();
    });
    expect(getComputedStyle(layer).opacity).toBe('1');
  });

  it('renders the source text and no copy button when disabled', () => {
    const { container } = render(<CodeBlock showCopyButton={false}>{'const plain = 1;'}</CodeBlock>);
    // Web keeps whitespace runs as no-break spaces so indentation survives.
    expect(container.textContent?.replace(/\u00a0/g, ' ')).toContain('const plain = 1;');
    expect(screen.queryByRole('button', { name: 'Copy code' })).toBeNull();
  });

  it('applies padding to the code pane and margin to the outer block', () => {
    render(<CodeBlock testID="code-block" p={0} m={0} showCopyButton={false}>{'const plain = 1;'}</CodeBlock>);
    const outer = screen.getByTestId('code-block');
    const pane = outer.firstElementChild as HTMLElement;

    expect(getComputedStyle(outer).marginBottom).toBe('0px');
    expect(getComputedStyle(pane).paddingTop).toBe('0px');
    expect(getComputedStyle(pane).paddingLeft).toBe('0px');
  });
});
