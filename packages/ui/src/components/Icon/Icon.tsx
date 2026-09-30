import React from 'react';
import { View, type ViewProps, type ViewStyle } from 'react-native';

import { a11yProps, type A11yProps } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory';
import { isWeb } from '../../core/platform';
import { useDirection } from '../../core/providers/DirectionProvider';
import { resolveAccentColor } from '../../core/theme/resolveColors';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveIconSize } from '../../core/theme/tokens';
import { isDev, warnOnce } from '../../core/utils/logger';
import { shouldMirrorIcon } from '../../core/utils/rtl';
import { resolveStyleProps } from '../../core/utils/spacing';
import { tablerIcons } from './icons/tabler';
import { iconRegistry, registerIcons } from './registry';
import type { ExternalIconComponent, IconProps } from './types';

// Initialize icons on first import. The default set is bundled with plocks;
// consumers can add more via `registerIcon(s)`.
let iconsInitialized = false;
const initializeIcons = () => {
  if (!iconsInitialized) {
    registerIcons(tablerIcons);
    iconsInitialized = true;
  }
};

const MIRROR_STYLE: ViewStyle = { transform: [{ scaleX: -1 }] };

type IconA11yProps = A11yProps & Pick<ViewProps, 'importantForAccessibility'>;

/**
 * A decorative icon is removed from the accessibility tree without hiding the
 * element itself from queries: `aria-hidden` on web (browsers otherwise may
 * announce an unlabelled `<svg>` as "image"), and `importantForAccessibility="no"`
 * on native — a plain View wrapping an unlabelled Svg is never an accessibility
 * element there, and `no` (unlike `no-hide-descendants`) keeps `testID` queryable.
 */
const DECORATIVE_A11Y: IconA11yProps = isWeb ? a11yProps({ hidden: true }) : { importantForAccessibility: 'no' };

/**
 * Accessibility for an icon: decorative (hidden from assistive technology)
 * unless it has an accessible name, in which case it is announced as an image.
 * Icons almost always sit inside a labelled control, where announcing
 * "chevron-down icon" would only add noise.
 */
function getIconA11y(name: string | undefined, decorative: boolean | undefined, accessibleName: string | undefined): IconA11yProps {
  const isDecorative = decorative ?? !accessibleName;
  if (isDecorative) return DECORATIVE_A11Y;
  if (!accessibleName) {
    warnOnce(
      `Icon.label:${name ?? 'custom'}`,
      `Icon "${name ?? 'custom'}" is marked decorative={false} but has no label; pass \`label\` (or \`accessibilityLabel\`) so screen readers can announce it.`
    );
  }
  return a11yProps({ role: 'img', label: accessibleName, accessible: true });
}

export const Icon = factory<{
  props: IconProps;
  ref: View;
}>((props, ref) => {
  const {
    name,
    icon,
    size = 'md',
    color,
    stroke = 1.5,
    variant,
    style,
    label,
    accessibilityLabel,
    title,
    decorative,
    mirrorInRTL,
    testID,
    ...spacingProps
  } = props;

  const theme = useTheme();
  const { isRTL } = useDirection();

  initializeIcons();

  const resolvedSize = resolveIconSize(theme, size);
  const resolvedColor = resolveAccentColor(theme, color) ?? theme.text?.primary;
  const spacingStyle = resolveStyleProps(spacingProps, theme);
  const iconA11y = getIconA11y(name, decorative, label ?? accessibilityLabel ?? title);

  const shouldMirror = mirrorInRTL !== undefined ? mirrorInRTL : shouldMirrorIcon(name ?? '', isRTL);
  const mirrorStyle = isRTL && shouldMirror ? MIRROR_STYLE : null;

  // Shared wrapper style for component-based icons (external libs + Tabler).
  const wrapperStyle = [mirrorStyle, spacingStyle, style];

  // Render a component-based icon (Tabler / external lib) with resolved props.
  // The wrapper carries the accessibility props; the glyph itself is never a
  // separate accessibility node.
  const renderComponentIcon = (Cmp: ExternalIconComponent) => (
    <View ref={ref} style={wrapperStyle} testID={testID} {...iconA11y}>
      <Cmp size={resolvedSize} color={resolvedColor} strokeWidth={stroke} />
    </View>
  );

  // 1) Explicit external icon via `icon` prop takes precedence over `name`.
  if (icon) {
    if (React.isValidElement(icon)) {
      return (
        <View ref={ref} style={wrapperStyle} testID={testID} {...iconA11y}>
          {icon}
        </View>
      );
    }
    return renderComponentIcon(icon as ExternalIconComponent);
  }

  const iconDef = name ? iconRegistry[name] : undefined;
  const boxStyle = { width: resolvedSize, height: resolvedSize };

  if (!iconDef) {
    if (!isDev) {
      return <View ref={ref} style={[boxStyle, spacingStyle, style]} testID={testID} {...DECORATIVE_A11Y} />;
    }
    warnOnce(`icon:${name}`, `Icon "${name}" not found in registry`);
    // Visible dev-only placeholder so a typo'd name is noticed.
    return (
      <View
        ref={ref}
        style={[boxStyle, { backgroundColor: theme.colors?.error?.[5], opacity: 0.3 }, spacingStyle, style]}
        testID={testID}
        {...DECORATIVE_A11Y}
      />
    );
  }

  const { outlined, filled, variant: defaultVariant = 'outlined' } = iconDef;

  const resolvedVariant = variant ?? defaultVariant;

  const Cmp = resolvedVariant === 'filled' ? (filled ?? outlined) : (outlined ?? filled);
  return Cmp
    ? renderComponentIcon(Cmp)
    : <View ref={ref} style={[boxStyle, spacingStyle, style]} testID={testID} {...DECORATIVE_A11Y} />;
}, { displayName: 'Icon' });
