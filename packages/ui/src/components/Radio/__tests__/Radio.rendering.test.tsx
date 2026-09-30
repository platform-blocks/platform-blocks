import React from 'react';
import { StyleSheet, View } from 'react-native';
import { render, configure } from '@testing-library/react-native';

import { DEFAULT_THEME } from '../../../core/theme/defaultTheme';
import { Radio, RadioGroup, getRadioPalette, getRadioSize } from '../Radio';
import { Icon } from '../../Icon';

configure({ defaultIncludeHiddenElements: true });

type StyleNode = { props?: { style?: unknown }; children?: unknown };

/** Every flattened style in a rendered tree, depth first. */
const collectStyles = (node: unknown): Record<string, unknown>[] => {
  if (!node || typeof node !== 'object') return [];
  const { props, children } = node as StyleNode;
  const own = props?.style ? [StyleSheet.flatten(props.style as never) as Record<string, unknown>] : [];
  const nested = Array.isArray(children) ? children.flatMap(collectStyles) : [];
  return [...own, ...nested];
};

describe('Radio - rendering', () => {
  it('sizes the circle from the theme control size', () => {
    const { toJSON } = render(<Radio value="lg" label="Large" size="lg" onChange={() => {}} />);

    const diameter = getRadioSize(DEFAULT_THEME, 'lg');
    const circle = collectStyles(toJSON()).find(
      (style) => style.width === diameter && style.height === diameter && style.borderRadius === diameter / 2
    );
    expect(circle).toBeTruthy();
  });

  it('resolves the accent for the checked disc and a readable dot', () => {
    const palette = getRadioPalette(DEFAULT_THEME, { disabled: false, error: false, color: 'success' });

    expect(palette.fillColor).toBe(DEFAULT_THEME.colors.success[6]);
    expect(palette.holeColor).toBe(DEFAULT_THEME.backgrounds.surface);
    expect(palette.dotColor).toMatch(/^#[0-9a-f]{6}$/i);
    expect(palette.ringColor).toBe(DEFAULT_THEME.text.muted);
  });

  it('switches to the error color when invalid and to neutral chrome when disabled', () => {
    expect(getRadioPalette(DEFAULT_THEME, { disabled: false, error: true }).ringColor).toBe(
      DEFAULT_THEME.colors.error[5]
    );
    expect(getRadioPalette(DEFAULT_THEME, { disabled: true, error: false }).fillColor).toBe(
      DEFAULT_THEME.backgrounds.borderStrong
    );
  });
});

describe('RadioGroup - rendering', () => {
  it('switches layout direction and gap for horizontal orientation', () => {
    const { UNSAFE_getAllByType } = render(
      <RadioGroup
        value="basic"
        orientation="horizontal"
        gap={16}
        options={[
          { label: 'Basic', value: 'basic' },
          { label: 'Pro', value: 'pro' },
        ]}
        testID="horizontal-group"
      />
    );

    const radiogroup = UNSAFE_getAllByType(View).find((node) => node.props.role === 'radiogroup');
    const styles = StyleSheet.flatten(radiogroup?.props.style);
    expect(styles.flexDirection).toBe('row');
    expect(styles.gap).toBe(16);
  });

  it('marks card options with the radio circle rather than a check icon', () => {
    const { toJSON, UNSAFE_queryAllByType } = render(
      <RadioGroup
        variant="card"
        value="basic"
        options={[
          { label: 'Basic', value: 'basic' },
          { label: 'Pro', value: 'pro' },
        ]}
        testID="cards"
      />
    );

    const diameter = getRadioSize(DEFAULT_THEME, 'md');
    // The track disc of each circle: absolutely positioned and round.
    const tracks = collectStyles(toJSON()).filter(
      (style) => style.position === 'absolute' && style.borderRadius === diameter / 2
    );

    expect(tracks).toHaveLength(2);
    expect(UNSAFE_queryAllByType(Icon)).toHaveLength(0);
  });

  it('dims the group label when disabled', () => {
    const { getByText } = render(
      <RadioGroup label="Choose plan" disabled value="basic" options={[{ label: 'Basic', value: 'basic' }]} />
    );

    const labelStyles = StyleSheet.flatten(getByText('Choose plan').props.style);
    expect(labelStyles.color).toBe(DEFAULT_THEME.text.disabled);
  });

  it('joins segmented options with logical corners', () => {
    const { getByTestId } = render(
      <RadioGroup
        variant="segmented"
        value="a"
        testID="seg"
        options={[
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ]}
      />
    );

    expect(StyleSheet.flatten(getByTestId('seg-option-0').props.style)).toMatchObject({
      borderTopStartRadius: 8,
      borderBottomStartRadius: 8,
    });
    expect(StyleSheet.flatten(getByTestId('seg-option-1').props.style)).toMatchObject({
      borderTopEndRadius: 8,
      borderBottomEndRadius: 8,
    });
  });
});

describe('Radio snapshots', () => {
  it('matches snapshot for checked radios with helper text', () => {
    const { toJSON } = render(
      <Radio
        value="snap"
        label="Snapshot radio"
        description="Helper copy"
        checked
        onChange={() => {}}
        size="sm"
        id="snap-radio"
      />
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot for vertical RadioGroup with description and error', () => {
    const { toJSON } = render(
      <RadioGroup
        id="subscription"
        label="Subscription"
        description="Choose carefully"
        error="Selection required"
        value="monthly"
        options={[
          { label: 'Monthly', value: 'monthly' },
          { label: 'Yearly', value: 'yearly', description: 'Best value' },
        ]}
      />
    );

    expect(toJSON()).toMatchSnapshot();
  });
});
