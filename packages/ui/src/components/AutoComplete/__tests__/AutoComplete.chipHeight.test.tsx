import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';

import { OverlayProvider } from '../../../core/providers/OverlayProvider';
import { AutoComplete } from '../AutoComplete';
import { getBorderRadius, getComponentDefaultRadius } from '../../../core/theme/radius';

const data = [
  { label: 'Apple', value: 'apple' },
  { label: 'Apricot', value: 'apricot' },
];

/**
 * The multiSelect field used to add its own `paddingVertical: 10` on top of the
 * shared input padding, so an AutoComplete with chips stood taller than every
 * other input beside it. Its height must now come from the same tokens a plain
 * Input uses — chips only add height once they wrap onto a second row.
 */
const renderField = (props: Record<string, unknown>) =>
  render(
    <OverlayProvider>
      <AutoComplete data={data} size="md" useModal={false} usePortal={false} testID="ac-input" {...props} />
    </OverlayProvider>
  );

/** Climb from the TextInput to the field shell — the ancestor carrying the border. */
const fieldShellStyle = (utils: ReturnType<typeof renderField>) => {
  // The TextInput itself also declares a minHeight, but with a zeroed border —
  // the shell is the first ancestor that actually strokes a border.
  let node: any = utils.getByTestId('ac-input');
  while (node) {
    const flat = StyleSheet.flatten(node.props?.style) as any;
    if (flat?.minHeight != null && flat?.borderWidth > 0) return flat;
    node = node.parent;
  }
  throw new Error('field shell not found');
};

describe('AutoComplete multiSelect height', () => {
  it('matches a single-select field of the same size', () => {
    const single = fieldShellStyle(renderField({}));
    const multi = fieldShellStyle(renderField({ multiSelect: true, selectedValues: [data[0]] }));

    expect(multi.minHeight).toBe(single.minHeight);
    expect(multi.paddingVertical ?? 0).toBe(single.paddingVertical ?? 0);
    expect(multi.paddingHorizontal ?? 0).toBe(single.paddingHorizontal ?? 0);
  });

  it('spaces chips with gaps rather than margins, so one row costs no height', () => {
    const utils = renderField({ multiSelect: true, selectedValues: [data[0], data[1]] });
    const shell = fieldShellStyle(utils);

    // Content box left for the chip row: a `sm` chip is shorter than this, so a
    // single row can't push the field past its minHeight.
    const contentHeight = shell.minHeight - (shell.paddingVertical ?? 0) * 2 - (shell.borderWidth ?? 0) * 2;
    expect(contentHeight).toBeGreaterThanOrEqual(22);
  });
});

describe('AutoComplete radius', () => {
  it('uses the shared input radius token rather than a hardcoded default', () => {
    const shell = fieldShellStyle(renderField({}));
    expect(shell.borderRadius).toBe(getBorderRadius(getComponentDefaultRadius('input')));
  });
});
