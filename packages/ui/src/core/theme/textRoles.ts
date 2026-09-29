import type { TextStyle } from 'react-native';

import { resolveTextColor } from './resolveColors';
import { resolveFontSize, resolveLineHeight } from './tokens';
import type { PlatformBlocksTheme, TextRoleName, TextRoleStyle } from './types';

/**
 * The built-in text roles. Both step back from the items they label —
 * secondary color, one size below the md body text of rows and options —
 * so a title or group header never reads as one more item.
 *
 * `sectionLabel` matches what AutoComplete group headers and the Calendar
 * weekday row already used; `panelTitle` is the same without the caps, since
 * it names the whole panel rather than a slice of it.
 */
export const DEFAULT_TEXT_ROLES: Readonly<Record<TextRoleName, Readonly<Required<TextRoleStyle>>>> = {
  panelTitle: { color: 'secondary', fontSize: 'sm', fontWeight: '600', letterSpacing: 0, uppercase: false },
  sectionLabel: { color: 'secondary', fontSize: 'sm', fontWeight: '600', letterSpacing: 0.5, uppercase: true },
};

function assignDefined(target: TextRoleStyle, source: TextRoleStyle | undefined): void {
  if (!source) return;
  for (const key of Object.keys(source) as (keyof TextRoleStyle)[]) {
    if (source[key] !== undefined) (target as Record<string, unknown>)[key] = source[key];
  }
}

/**
 * A role's settings, merged field by field:
 * built-in role < `context` < `theme.textRoles[role]`.
 *
 * `context` carries what the calling component knows — a font size that tracks
 * the control's `size`, say — so the built-in look can adapt while a value the
 * theme sets explicitly still wins everywhere.
 *
 * An unknown role with nothing in the theme resolves to `{}`.
 */
export function getTextRole(
  theme: PlatformBlocksTheme,
  role: TextRoleName | (string & {}),
  context?: TextRoleStyle
): TextRoleStyle {
  const merged: TextRoleStyle = {};
  assignDefined(merged, (DEFAULT_TEXT_ROLES as Record<string, TextRoleStyle | undefined>)[role]);
  assignDefined(merged, context);
  assignDefined(merged, theme?.textRoles?.[role]);
  return merged;
}

/**
 * A role as a React Native text style: color resolved against the theme (so a
 * CSS-variable theme stays live on web), size in px with a matching line
 * height, and the theme font. For raw `Text` from react-native; the library's
 * `Text` takes the role directly (`<Text textRole="sectionLabel">`), which
 * keeps explicit props like `fw` or `c` above the role.
 *
 * @example
 * <RNText style={[resolveTextRole(theme, 'panelTitle'), styles.title]}>Sport</RNText>
 */
export function resolveTextRole(
  theme: PlatformBlocksTheme,
  role: TextRoleName | (string & {}),
  context?: TextRoleStyle
): TextStyle {
  const spec = getTextRole(theme, role, context);
  const style: TextStyle = {};
  if (theme?.fontFamily) style.fontFamily = theme.fontFamily;
  const color = resolveTextColor(theme, spec.color);
  if (color) style.color = color;
  if (spec.fontSize !== undefined) {
    style.fontSize = resolveFontSize(theme, spec.fontSize);
    style.lineHeight = resolveLineHeight(theme, spec.fontSize);
  }
  if (spec.fontWeight !== undefined) style.fontWeight = spec.fontWeight;
  if (spec.letterSpacing !== undefined) style.letterSpacing = spec.letterSpacing;
  if (spec.uppercase !== undefined) style.textTransform = spec.uppercase ? 'uppercase' : 'none';
  return style;
}
