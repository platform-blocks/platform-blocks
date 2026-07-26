import React from 'react';
import { Linking } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { CodeBlock } from '../CodeBlock';

/**
 * The edit-on-GitHub control: which URL a block resolves for the file on screen,
 * and that every header treatment actually renders the button beside copy.
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

// Each header treatment reports the URL it was handed, so the resolution rules
// can be asserted without rendering the real rows.
jest.mock('../header', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');

  const report = (testID: string) => ({ githubUrl, files, activeName, onSelect }: any) =>
    React.createElement(
      View,
      { testID },
      React.createElement(Text, { testID: `${testID}-url` }, githubUrl ?? 'none'),
      (files ?? []).map((file: any) =>
        React.createElement(
          Pressable,
          { key: file.name, testID: `tab-${file.name}`, onPress: () => onSelect(file.name) },
          React.createElement(Text, null, `${file.name}${file.name === activeName ? ' (active)' : ''}`)
        )
      )
    );

  return {
    FileTabsRow: report('file-tabs'),
    InlineTitleRow: report('inline-title'),
    FileHeaderBar: report('file-header-bar'),
    FloatingCopyControls: report('floating-controls'),
    FileTypeIcon: () => null,
    HeaderControls: () => null,
  };
});

describe('CodeBlock - github url resolution', () => {
  it('passes no url when none is given', () => {
    render(<CodeBlock files={[{ name: 'index.tsx', code: 'const a = 1;' }]} />);
    expect(screen.getByTestId('file-tabs-url')).toHaveTextContent('none');
  });

  it('falls back to the block-level url', () => {
    render(
      <CodeBlock
        githubUrl="https://github.com/acme/repo/blob/main/index.tsx"
        files={[{ name: 'index.tsx', code: 'const a = 1;' }]}
      />
    );
    expect(screen.getByTestId('file-tabs-url')).toHaveTextContent(
      'https://github.com/acme/repo/blob/main/index.tsx'
    );
  });

  it('prefers a file url and follows the active tab', () => {
    render(
      <CodeBlock
        githubUrl="https://github.com/acme/repo/blob/main/fallback.tsx"
        files={[
          { name: 'index.tsx', code: 'const a = 1;', githubUrl: 'https://github.com/acme/repo/blob/main/index.tsx' },
          { name: 'data.ts', code: 'export const DATA = [];', githubUrl: 'https://github.com/acme/repo/blob/main/data.ts' },
          { name: 'plain.css', code: 'body {}' },
        ]}
      />
    );

    expect(screen.getByTestId('file-tabs-url')).toHaveTextContent(
      'https://github.com/acme/repo/blob/main/index.tsx'
    );

    fireEvent.press(screen.getByTestId('tab-data.ts'));
    expect(screen.getByTestId('file-tabs-url')).toHaveTextContent(
      'https://github.com/acme/repo/blob/main/data.ts'
    );

    // A file without its own URL falls back rather than keeping the last tab's.
    fireEvent.press(screen.getByTestId('tab-plain.css'));
    expect(screen.getByTestId('file-tabs-url')).toHaveTextContent(
      'https://github.com/acme/repo/blob/main/fallback.tsx'
    );
  });

  it('renders the floating layer for the edit button alone when copy is off', () => {
    render(
      <CodeBlock showCopyButton={false} githubUrl="https://github.com/acme/repo/blob/main/a.tsx">
        {'const a = 1;'}
      </CodeBlock>
    );
    expect(screen.getByTestId('floating-controls-url')).toHaveTextContent(
      'https://github.com/acme/repo/blob/main/a.tsx'
    );
  });

  it('renders no floating layer when neither control is available', () => {
    render(<CodeBlock showCopyButton={false}>{'const a = 1;'}</CodeBlock>);
    expect(screen.queryByTestId('floating-controls')).toBeNull();
  });
});

describe('HeaderControls', () => {
  const { HeaderControls: RealHeaderControls } = jest.requireActual('../header');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the edit button beside copy and opens the url', () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never);

    render(
      <RealHeaderControls
        showCopyButton
        code="const a = 1;"
        githubUrl="https://github.com/acme/repo/blob/main/index.tsx"
        size="xs"
      />
    );

    fireEvent.press(screen.getByLabelText('Edit this file on GitHub'));
    expect(openURL).toHaveBeenCalledWith('https://github.com/acme/repo/blob/main/index.tsx');
    expect(screen.getByLabelText('Copy')).toBeTruthy();
  });

  it('omits the edit button without a url', () => {
    render(<RealHeaderControls showCopyButton code="const a = 1;" size="xs" />);
    expect(screen.queryByLabelText('Edit this file on GitHub')).toBeNull();
  });

  it('renders nothing when neither control is enabled', () => {
    const { toJSON } = render(<RealHeaderControls showCopyButton={false} code="const a = 1;" size="xs" />);
    expect(toJSON()).toBeNull();
  });
});
