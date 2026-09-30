/**
 * The text-role contract: a title or group label steps back from the items it
 * labels, the same way everywhere, and one theme key moves every one of them.
 *
 *  1. **The roles resolve per field.** Built-in role < the calling component's
 *     context (a size that tracks the control) < `theme.textRoles`, so a theme
 *     can change one property without restating the rest.
 *  2. **`Text` takes a role, and its own props still win.** That keeps the
 *     `labelProps` / `titleProps` slot pattern working on top of a role.
 *  3. **Components read the theme, not constants.** The regression this guards
 *     against: the mobile Select sheet title matched its option rows exactly
 *     (primary, md, 600) and read as one more option.
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { Checkbox } from '../../../components/Checkbox';
import { ControlField } from '../../../components/ControlField';
import { MenuLabel } from '../../../components/Menu';
import { RadioGroup } from '../../../components/Radio';
import { Rating } from '../../../components/Rating';
import { Text } from '../../../components/Text';
import { Tree } from '../../../components/Tree';
import { DropdownSheet } from '../../../components/_internal/DropdownSheet/DropdownSheet';
import { DARK_THEME } from '../darkTheme';
import { DEFAULT_THEME } from '../defaultTheme';
import { DEFAULT_TEXT_ROLES, getTextRole, resolveTextRole } from '../textRoles';
import { ThemeScope } from '../ThemeProvider';
import type { PlocksThemeOverride } from '../types';

const wrap = (ui: React.ReactElement, theme?: PlocksThemeOverride) =>
  render(<ThemeScope theme={theme}>{ui}</ThemeScope>);

const styleOf = (el: { props: { style?: unknown } }) => (StyleSheet.flatten(el.props.style as never) ?? {}) as Record<string, unknown>;

const withRoles = (textRoles: PlocksThemeOverride['textRoles']) => ({ ...DEFAULT_THEME, textRoles });

describe('resolveTextRole', () => {
  it.each([
    ['light', DEFAULT_THEME],
    ['dark', DARK_THEME],
  ])('steps both roles back from md primary body text (%s)', (_scheme, theme) => {
    for (const role of ['panelTitle', 'sectionLabel'] as const) {
      const style = resolveTextRole(theme, role);
      expect(style.color).toBe(theme.text.secondary);
      expect(style.color).not.toBe(theme.text.primary);
      expect(style.fontSize).toBe(12);
      expect(style.fontWeight).toBe('600');
    }
  });

  it('caps and tracks section labels, not panel titles', () => {
    expect(resolveTextRole(DEFAULT_THEME, 'sectionLabel')).toMatchObject({ textTransform: 'uppercase', letterSpacing: 0.5 });
    expect(resolveTextRole(DEFAULT_THEME, 'panelTitle')).toMatchObject({ textTransform: 'none', letterSpacing: 0 });
  });

  it('merges a theme override field by field', () => {
    const style = resolveTextRole(withRoles({ sectionLabel: { uppercase: false } }), 'sectionLabel');
    expect(style.textTransform).toBe('none');
    expect(style.color).toBe(DEFAULT_THEME.text.secondary);
    expect(style.fontWeight).toBe('600');
  });

  it('reads text tokens and palette syntax, and passes raw colors through', () => {
    expect(resolveTextRole(withRoles({ panelTitle: { color: 'primary' } }), 'panelTitle').color)
      .toBe(DEFAULT_THEME.text.primary);
    expect(resolveTextRole(withRoles({ panelTitle: { color: 'primary.6' } }), 'panelTitle').color)
      .toBe(DEFAULT_THEME.colors.primary[6]);
    expect(resolveTextRole(withRoles({ panelTitle: { color: '#123456' } }), 'panelTitle').color).toBe('#123456');
  });

  it('lets component context adapt the built-in look, and the theme beat both', () => {
    expect(getTextRole(DEFAULT_THEME, 'sectionLabel', { fontSize: 14 }).fontSize).toBe(14);
    expect(getTextRole(withRoles({ sectionLabel: { fontSize: 'xs' } }), 'sectionLabel', { fontSize: 14 }).fontSize)
      .toBe('xs');
  });

  it('ignores undefined fields rather than erasing the built-in value', () => {
    expect(getTextRole(withRoles({ panelTitle: { color: undefined } }), 'panelTitle').color)
      .toBe(DEFAULT_TEXT_ROLES.panelTitle.color);
  });

  it('resolves an unknown role to nothing, and a theme-defined one to its values', () => {
    expect(getTextRole(DEFAULT_THEME, 'eyebrow')).toEqual({});
    expect(getTextRole(withRoles({ eyebrow: { uppercase: true } }), 'eyebrow')).toEqual({ uppercase: true });
  });

  it('reads the text token at resolve time, so a CSS-variable theme stays live on web', () => {
    const cssTheme = { ...DEFAULT_THEME, text: { ...DEFAULT_THEME.text, secondary: 'var(--plocks-text-secondary)' } };
    expect(resolveTextRole(cssTheme, 'panelTitle').color).toBe('var(--plocks-text-secondary)');
  });
});

describe('Text textRole', () => {
  it('applies the role', () => {
    const style = styleOf(wrap(<Text textRole="sectionLabel">Recent</Text>).getByText('Recent'));
    expect(style).toMatchObject({
      color: DEFAULT_THEME.text.secondary,
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    });
  });

  it('keeps explicit props above the role', () => {
    const style = styleOf(
      wrap(
        <Text textRole="sectionLabel" c="primary" fw="400" size="md" lts={0} tt="none">
          Recent
        </Text>
      ).getByText('Recent')
    );
    expect(style).toMatchObject({ color: DEFAULT_THEME.text.primary, fontWeight: '400', fontSize: 14, letterSpacing: 0 });
    expect(style.textTransform).toBe('none');
  });

  it('follows the theme', () => {
    const style = styleOf(
      wrap(<Text textRole="sectionLabel">Recent</Text>, { textRoles: { sectionLabel: { color: 'muted', uppercase: false } } })
        .getByText('Recent')
    );
    expect(style.color).toBe(DEFAULT_THEME.text.muted);
    expect(style.textTransform).not.toBe('uppercase');
  });
});

describe('components read the roles from the theme', () => {
  it('DropdownSheet (Select / AutoComplete mobile sheet): the title steps back from the options', () => {
    const { getByText } = wrap(<DropdownSheet opened onClose={() => {}} title="Sport" />);
    const style = styleOf(getByText('Sport'));
    expect(style.color).toBe(DEFAULT_THEME.text.secondary);
    expect(style.fontSize).toBe(12);
  });

  it('DropdownSheet: a theme can restore the old primary/md title', () => {
    const { getByText } = wrap(<DropdownSheet opened onClose={() => {}} title="Sport" />, {
      textRoles: { panelTitle: { color: 'primary', fontSize: 'md' } },
    });
    const style = styleOf(getByText('Sport'));
    expect(style.color).toBe(DEFAULT_THEME.text.primary);
    expect(style.fontSize).toBe(14);
  });

  it('Menu.Label: a section label, and textProps win', () => {
    const { getByText } = wrap(
      <>
        <MenuLabel>Rows per page</MenuLabel>
        <MenuLabel textProps={{ c: 'primary' }}>Sort</MenuLabel>
      </>
    );
    expect(styleOf(getByText('Rows per page'))).toMatchObject({
      color: DEFAULT_THEME.text.secondary,
      fontWeight: '600',
      textTransform: 'uppercase',
    });
    expect(styleOf(getByText('Sort')).color).toBe(DEFAULT_THEME.text.primary);
  });

  it('Tree disclosure="nested": top-level branches read as headings, their rows do not', () => {
    const data = [{ id: 'start', label: 'Getting started', children: [{ id: 'install', label: 'Install' }] }];
    const { getByText } = wrap(<Tree data={data} disclosure="nested" expandAll />);
    expect(styleOf(getByText('Getting started'))).toMatchObject({ textTransform: 'uppercase', color: DEFAULT_THEME.text.secondary });
    expect(styleOf(getByText('Install')).textTransform).toBeUndefined();
    expect(styleOf(getByText('Install')).color).toBe(DEFAULT_THEME.text.primary);
  });

  it('ControlField.Group: the title is a section label, and titleProps win', () => {
    const { getByText, rerender } = wrap(
      <ControlField.Group title="Notifications">
        <ControlField label="Email" />
      </ControlField.Group>
    );
    expect(styleOf(getByText('Notifications'))).toMatchObject({ textTransform: 'uppercase', color: DEFAULT_THEME.text.secondary });

    rerender(
      <ThemeScope>
        <ControlField.Group title="Notifications" titleProps={{ tt: 'none' }}>
          <ControlField label="Email" />
        </ControlField.Group>
      </ThemeScope>
    );
    expect(styleOf(getByText('Notifications')).textTransform).toBe('none');
  });
});

// On native the visual choice labels are hidden from assistive tech (the
// control carries the name), so they are queried with hidden elements included.
const hidden = { includeHiddenElements: true } as const;

describe('choice labels sit under their group label', () => {
  it('RadioGroup: the group label stays semibold, the options go regular', () => {
    const { getByText } = wrap(
      <RadioGroup
        label="Plan"
        options={[
          { label: 'Monthly', value: 'monthly' },
          { label: 'Yearly', value: 'yearly' },
        ]}
      />
    );
    expect(styleOf(getByText('Plan', hidden)).fontWeight).toBe('600');
    expect(styleOf(getByText('Monthly', hidden)).fontWeight).toBe('400');
    expect(styleOf(getByText('Yearly', hidden)).fontWeight).toBe('400');
  });

  it('Checkbox: regular by default, labelProps.fw still wins', () => {
    const { getByText } = wrap(
      <>
        <Checkbox label="Remember me" />
        <Checkbox label="Bold" labelProps={{ fw: '700' }} />
      </>
    );
    expect(styleOf(getByText('Remember me', hidden)).fontWeight).toBe('400');
    expect(styleOf(getByText('Bold', hidden)).fontWeight).toBe('700');
  });

  it('Rating: a field label, so it stays semibold', () => {
    const { getByText } = wrap(<Rating label="Your rating" />);
    expect(styleOf(getByText('Your rating', hidden)).fontWeight).toBe('600');
  });
});
