import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { CodeBlock } from '../CodeBlock';

/**
 * Multi-file behavior: which source is on screen, and which header treatment
 * renders. These are the paths `files` added on top of the original
 * `children`-only block, plus the deprecated `fileName` spelling it replaced.
 */

const mockTheme = {
  colorScheme: 'light',
  colors: {
    primary: ['#E6F4FF', '#CDE8FF', '#9CD3FF', '#6BBEFF', '#3AA9FF', '#1890FF', '#096DD9', '#0050B3'],
    gray: ['#F9FAFB', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151'],
  },
  text: { primary: '#111', secondary: '#666', muted: '#999', disabled: '#aaa', onPrimary: '#fff' },
  backgrounds: { base: '#F7F8FA', subtle: '#EDEFF3', surface: '#FFFFFF', elevated: '#FFFFFF', border: '#E5E7EB' },
  fontFamily: 'System',
};

jest.mock('../../../core/theme', () => ({ useTheme: () => mockTheme }));
jest.mock('../../../core/theme/ThemeProvider', () => ({ useTheme: () => mockTheme }));

// The tab strip and header rows only matter here as labels and press targets.
jest.mock('../header', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');
  return {
    FileTabsRow: ({ files, activeName, onSelect }: any) =>
      React.createElement(
        View,
        { testID: 'file-tabs' },
        files.map((file: any) =>
          React.createElement(
            Pressable,
            {
              key: file.name,
              testID: `tab-${file.name}`,
              accessibilityState: { selected: file.name === activeName },
              onPress: () => onSelect(file.name),
            },
            React.createElement(Text, null, file.name)
          )
        )
      ),
    InlineTitleRow: ({ label }: any) =>
      React.createElement(Text, { testID: 'inline-title' }, label),
    FileHeaderBar: ({ fileName }: any) =>
      React.createElement(Text, { testID: 'file-header-bar' }, fileName),
    FileTypeIcon: () => null,
    FloatingCopyControls: () => null,
  };
});

const FILES = [
  { name: 'index.tsx', code: 'const entry = 1;' },
  { name: 'data.ts', code: 'export const DATA = [];' },
  { name: 'theme.json', code: '{ "radius": "md" }' },
];

describe('CodeBlock - files', () => {
  it('renders children when no files are given', () => {
    render(<CodeBlock>{'const plain = true;'}</CodeBlock>);
    expect(screen.getByText(/const plain = true;/)).toBeTruthy();
    expect(screen.queryByTestId('file-tabs')).toBeNull();
  });

  it('renders the first file and a tab per file', () => {
    render(<CodeBlock files={FILES} />);
    expect(screen.getByTestId('file-tabs')).toBeTruthy();
    expect(screen.getByText(/const entry = 1;/)).toBeTruthy();
    expect(screen.queryByText(/export const DATA/)).toBeNull();
  });

  it('swaps the rendered source when a tab is pressed', () => {
    render(<CodeBlock files={FILES} />);
    fireEvent.press(screen.getByTestId('tab-data.ts'));
    expect(screen.getByText(/export const DATA/)).toBeTruthy();
    expect(screen.queryByText(/const entry = 1;/)).toBeNull();
  });

  it('starts on defaultFile', () => {
    render(<CodeBlock files={FILES} defaultFile="theme.json" />);
    expect(screen.getByText(/"radius": "md"/)).toBeTruthy();
  });

  it('falls back to the first file when defaultFile names nothing', () => {
    render(<CodeBlock files={FILES} defaultFile="missing.ts" />);
    expect(screen.getByText(/const entry = 1;/)).toBeTruthy();
  });

  it('honors activeFile and reports changes instead of self-navigating', () => {
    const onFileChange = jest.fn();
    render(<CodeBlock files={FILES} activeFile="data.ts" onFileChange={onFileChange} />);
    expect(screen.getByText(/export const DATA/)).toBeTruthy();

    fireEvent.press(screen.getByTestId('tab-theme.json'));
    expect(onFileChange).toHaveBeenCalledWith('theme.json');
    // Controlled: the parent decides, so the view stays put until activeFile moves.
    expect(screen.getByText(/export const DATA/)).toBeTruthy();
  });

  it('gives a lone file the same chip as a tab, not a plain label', () => {
    render(<CodeBlock files={[{ name: 'App.tsx', code: 'const solo = 1;' }]} />);
    expect(screen.getByTestId('tab-App.tsx')).toBeTruthy();
    expect(screen.queryByTestId('inline-title')).toBeNull();
  });

  it('keeps children as the source for a file entry with no code', () => {
    render(<CodeBlock files={[{ name: 'App.tsx' }]}>{'const fromChildren = 1;'}</CodeBlock>);
    expect(screen.getByText(/const fromChildren = 1;/)).toBeTruthy();
    expect(screen.getByTestId('tab-App.tsx')).toBeTruthy();
  });

  it('keeps title as a plain label — it names a section, not a file', () => {
    render(<CodeBlock title="Usage">{'const used = 1;'}</CodeBlock>);
    expect(screen.getByTestId('inline-title')).toHaveTextContent('Usage');
    expect(screen.queryByTestId('file-tabs')).toBeNull();
  });

  it('ignores malformed entries', () => {
    const files = [{ name: 'ok.ts', code: 'const ok = 1;' }, { code: 'orphan' } as any];
    render(<CodeBlock files={files} />);
    expect(screen.getByTestId('tab-ok.ts')).toBeTruthy();
    expect(screen.queryByTestId('tab-undefined')).toBeNull();
    expect(screen.getByText(/const ok = 1;/)).toBeTruthy();
  });

  it('moves a lone file label into a detached bar with fileHeader, not both places', () => {
    render(<CodeBlock fileHeader files={[{ name: 'App.tsx', code: 'const a = 1;' }]} />);
    expect(screen.getByTestId('file-header-bar')).toHaveTextContent('App.tsx');
    expect(screen.queryByTestId('inline-title')).toBeNull();
    expect(screen.queryByTestId('file-tabs')).toBeNull();
  });
});
