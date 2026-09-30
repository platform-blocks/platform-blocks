import React from 'react';
import { StyleSheet, type StyleProp, type Text as RNText, type TextStyle } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { DEFAULT_THEME } from '../../../core/theme/defaultTheme';
import { Highlight } from '../Highlight';

const flatStyle = (node: { props: { style?: StyleProp<TextStyle> } }): TextStyle =>
  StyleSheet.flatten(node.props.style) ?? {};

describe('Highlight (native)', () => {
  it('marks every match with the theme mark background and forwards the ref', () => {
    const ref = React.createRef<RNText>();
    render(
      <Highlight ref={ref} highlight={['react', 'native']} testID="hl">
        React Native renders native views
      </Highlight>
    );

    expect(ref.current).toBeTruthy();
    const root = screen.getByTestId('hl');
    expect(root).toHaveTextContent('React Native renders native views');
    for (const word of ['React', 'Native', 'native']) {
      expect(flatStyle(screen.getByText(word)).backgroundColor).toBe(DEFAULT_THEME.backgrounds.mark);
    }
  });

  it('applies highlightStyles (object or theme callback) after the defaults', () => {
    render(
      <Highlight highlight="bold" highlightStyles={(theme) => ({ fontWeight: '700', color: theme.text.link })}>
        Make it bold
      </Highlight>
    );
    const mark = flatStyle(screen.getByText('bold'));
    expect(mark.fontWeight).toBe('700');
    expect(mark.color).toBe(DEFAULT_THEME.text.link);
  });

  it('renders the text untouched when there is nothing to highlight', () => {
    render(<Highlight testID="plain">Nothing to mark</Highlight>);
    expect(screen.getByTestId('plain')).toHaveTextContent('Nothing to mark');
  });
});
