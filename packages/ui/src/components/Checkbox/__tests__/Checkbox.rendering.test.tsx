import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { render, configure } from '@testing-library/react-native';

import { Checkbox } from '../Checkbox';

// The visual label is hidden from native screen readers (the control's own
// accessible name carries it), so text queries must include hidden elements.
configure({ defaultIncludeHiddenElements: true });

const flatStyle = (node: { props: { style?: unknown } }) => StyleSheet.flatten(node.props.style as never) || {};

describe('Checkbox rendering', () => {
  it('renders label and description text when provided', () => {
    const { getByText } = render(<Checkbox label="Marketing" description="Choose if you agree" />);

    expect(getByText('Marketing')).toBeTruthy();
    expect(getByText('Choose if you agree')).toBeTruthy();
  });

  it('shows the error text when the error prop is set', () => {
    const { getByText } = render(<Checkbox label="Terms" error="Required field" />);

    expect(getByText('Required field')).toBeTruthy();
  });

  it('renders custom children in place of label content', () => {
    const { getByTestId, queryByText } = render(
      <Checkbox>
        <Text testID="custom-label">Custom Label</Text>
      </Checkbox>
    );

    expect(getByTestId('custom-label')).toBeTruthy();
    expect(queryByText('Custom Label')).toBeTruthy();
  });

  it('renders a custom indeterminate icon when provided', () => {
    const { getByTestId } = render(
      <Checkbox indeterminate indeterminateIcon={<Text testID="dash">-</Text>} />
    );

    expect(getByTestId('dash')).toBeTruthy();
  });

  it('forwards labelProps to the label Text', () => {
    const { getByText } = render(
      <Checkbox label="Custom" labelProps={{ style: { fontWeight: '700', letterSpacing: 2 } }} />
    );
    expect(flatStyle(getByText('Custom'))).toMatchObject({ fontWeight: '700', letterSpacing: 2 });
  });

  it('forwards descriptionProps to the description Text', () => {
    const { getByText } = render(
      <Checkbox label="Custom" description="Helpful copy" descriptionProps={{ style: { fontStyle: 'italic' } }} />
    );
    expect(flatStyle(getByText('Helpful copy'))).toMatchObject({ fontStyle: 'italic' });
  });

  it.each(['left', 'right', 'top', 'bottom'] as const)('renders the label at labelPosition="%s"', (position) => {
    const { getByText, getByRole } = render(<Checkbox label="Placed" labelPosition={position} />);
    expect(getByText('Placed')).toBeTruthy();
    expect(getByRole('checkbox')).toBeTruthy();
  });
});
