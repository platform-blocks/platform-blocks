import React from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type Insets,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { announce } from '../../core/accessibility/announce';
import { useReducedMotion } from '../../core/motion/useReducedMotion';
import { isNative } from '../../core/platform/flags';
import { webStyle } from '../../core/platform/webStyle';
import { surfaceInteractionTint } from '../../core/theme/surfaces';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize } from '../../core/theme/tokens';
import type { PlatformBlocksTheme } from '../../core/theme/types';
import { useClipboard } from '../../hooks/useClipboard';
import { BrandIcon } from '../BrandIcon';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { Tooltip } from '../Tooltip';
import type { CodeBlockFile } from './types';
import { brandFromFileName, iconFromFileName } from './utils';

/**
 * Everything that can sit above the code itself: the standalone file bar, the
 * inline filename row, and the multi-file tab strip. They share one contract —
 * the resolved style comes from the parent's style sheet, so all three follow
 * the theme without re-deriving colors.
 */

/** Tab and label glyph size — sits on the cap height of the 12px label. */
const FILE_ICON_SIZE = 13;

/** Smallest touch target on native (Apple HIG / Material: 44pt / 48dp). */
const MIN_NATIVE_TOUCH_TARGET = 44;

/** Accessible name (and tooltip) of the copy control, before and after copying. */
export const COPY_CODE_LABEL = 'Copy code';
export const COPIED_LABEL = 'Copied';

type ControlSize = 'xs' | 'sm';

/**
 * Header controls are compact (28/32px) — above the 24px web minimum, but under
 * the native 44pt one. `hitSlop` grows the native touch area without changing
 * the drawn button (web ignores it and gets the real size).
 */
const nativeHitSlop = (height: number): Insets | undefined => {
  if (!isNative) return undefined;
  const inset = Math.max(0, Math.ceil((MIN_NATIVE_TOUCH_TARGET - height) / 2));
  return inset > 0 ? { top: inset, bottom: inset, left: inset, right: inset } : undefined;
};

type HeaderIconButtonProps = Omit<PressableProps, 'children' | 'style' | 'hitSlop'> & {
  icon: string;
  /** Accessible name — the control is icon-only. */
  label: string;
  size: ControlSize;
  iconColor?: string;
};

/**
 * Square icon-only button for the header / floating controls. An opaque
 * surface fill (the floating pair sits over code) with the theme's hover /
 * pressed wash laid over it, so it reads the same on every code surface.
 * Forwards its ref and the remaining Pressable props, so a wrapping `Tooltip`
 * can attach its trigger handlers.
 */
const HeaderIconButton = React.forwardRef<View, HeaderIconButtonProps>(function HeaderIconButton(
  { icon, label, size, iconColor, onHoverIn, onHoverOut, ...pressableProps },
  ref
) {
  const theme = useTheme();
  const [hovered, setHovered] = React.useState(false);
  const metrics = getControlSize(theme, size);

  const handleHoverIn = React.useCallback<NonNullable<PressableProps['onHoverIn']>>(
    (event) => {
      setHovered(true);
      onHoverIn?.(event);
    },
    [onHoverIn]
  );
  const handleHoverOut = React.useCallback<NonNullable<PressableProps['onHoverOut']>>(
    (event) => {
      setHovered(false);
      onHoverOut?.(event);
    },
    [onHoverOut]
  );

  return (
    <Pressable
      {...pressableProps}
      ref={ref}
      role="button"
      accessibilityLabel={label}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      hitSlop={nativeHitSlop(metrics.height)}
      style={[
        styles.iconButton,
        {
          width: metrics.height,
          height: metrics.height,
          borderRadius: metrics.radius,
          backgroundColor: theme.backgrounds.surface,
          borderColor: theme.backgrounds.border,
        },
      ]}
    >
      {({ pressed }) => (
        <>
          {pressed || hovered ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: surfaceInteractionTint(theme, pressed ? 'pressed' : 'hover') },
              ]}
            />
          ) : null}
          <Icon name={icon} size={metrics.iconSize} color={iconColor ?? theme.text.secondary} decorative />
        </>
      )}
    </Pressable>
  );
});

/**
 * Opens the file on GitHub. `url` is whatever the caller supplied — a blob view,
 * an `/edit/` link, a permalink — this only navigates, it never rewrites the URL,
 * so the caller stays in control of where "edit" actually lands.
 */
export const EditOnGithubButton: React.FC<{
  url: string;
  size: ControlSize;
  iconColor?: string;
}> = ({ url, size, iconColor }) => {
  const openGithub = React.useCallback(() => {
    Linking.openURL(url).catch(() => undefined);
  }, [url]);

  return (
    <Tooltip label="Edit on GitHub" position="right">
      <HeaderIconButton
        icon="edit"
        label="Edit this file on GitHub"
        onPress={openGithub}
        size={size}
        iconColor={iconColor}
      />
    </Tooltip>
  );
};

type CodeCopyButtonProps = {
  code: string;
  onCopy?: (code: string) => void;
  size: ControlSize;
  iconColor?: string;
};

/**
 * Copies the block's code. Its accessible name is "Copy code", and becomes
 * "Copied" while the confirmation shows; a successful copy is also announced,
 * since the icon swap alone is silent to a screen reader.
 */
export const CodeCopyButton: React.FC<CodeCopyButtonProps> = ({ code, onCopy, size, iconColor }) => {
  const theme = useTheme();
  const { copy, copied } = useClipboard();

  const handlePress = React.useCallback(() => {
    void Promise.resolve(copy(code)).then(() => onCopy?.(code));
  }, [copy, code, onCopy]);

  // `copied` only turns true once the clipboard write succeeded.
  React.useEffect(() => {
    if (copied) announce(COPIED_LABEL);
  }, [copied]);

  const successColor = theme.colors.success?.[5];

  return (
    <HeaderIconButton
      icon={copied ? 'check' : 'copy'}
      label={copied ? COPIED_LABEL : COPY_CODE_LABEL}
      onPress={handlePress}
      size={size}
      iconColor={copied ? successColor ?? iconColor : iconColor}
    />
  );
};

type HeaderControlsProps = {
  showCopyButton: boolean;
  code: string;
  onCopy?: (code: string) => void;
  /** Resolved URL for the file currently on screen. Hides the edit button when absent. */
  githubUrl?: string;
  size: ControlSize;
  containerStyle?: StyleProp<ViewStyle>;
  iconColor?: string;
};

/**
 * The trailing control pair shared by all three header treatments. Edit sits to
 * the start of copy: copy is the one readers reach for reflexively, so it keeps
 * the end position it has always had.
 */
export const HeaderControls: React.FC<HeaderControlsProps> = ({
  showCopyButton,
  code,
  onCopy,
  githubUrl,
  size,
  containerStyle,
  iconColor,
}) => {
  if (!showCopyButton && !githubUrl) return null;

  return (
    <View style={[styles.controls, containerStyle]}>
      {githubUrl ? <EditOnGithubButton url={githubUrl} size={size} iconColor={iconColor} /> : null}
      {showCopyButton ? <CodeCopyButton code={code} onCopy={onCopy} size={size} iconColor={iconColor} /> : null}
    </View>
  );
};

type FileHeaderBarProps = {
  fileName: string;
  /** `styles.headerBar` — the theme-resolved bar, shared with the style sheet. */
  barStyle: StyleProp<ViewStyle>;
  titleBaseStyle: StyleProp<TextStyle>;
  titleStyle?: StyleProp<TextStyle>;
  showCopyButton: boolean;
  code: string;
  onCopy?: (code: string) => void;
  githubUrl?: string;
};

/** Detached bar above the panel, opted into with `fileHeader`. */
export const FileHeaderBar: React.FC<FileHeaderBarProps> = ({
  fileName,
  barStyle,
  titleBaseStyle,
  titleStyle,
  showCopyButton,
  code,
  onCopy,
  githubUrl,
}) => (
  <View style={barStyle}>
    <Text variant="small" c="secondary" style={[titleBaseStyle, titleStyle, styles.flushTitle]}>
      {fileName}
    </Text>
    <HeaderControls
      showCopyButton={showCopyButton}
      code={code}
      onCopy={onCopy}
      githubUrl={githubUrl}
      size="xs"
    />
  </View>
);

type InlineTitleRowProps = {
  label: string;
  fileIcon?: React.ReactNode;
  theme: PlatformBlocksTheme;
  /** `styles.inlineTitleRow` — carries the theme's hairline. */
  rowStyle: StyleProp<ViewStyle>;
  titleBaseStyle: StyleProp<TextStyle>;
  titleStyle?: StyleProp<TextStyle>;
  showCopyButton: boolean;
  code: string;
  onCopy?: (code: string) => void;
  githubUrl?: string;
};

/** Title/filename row inside the panel — the default header treatment. */
export const InlineTitleRow: React.FC<InlineTitleRowProps> = ({
  label,
  fileIcon,
  theme,
  rowStyle,
  titleBaseStyle,
  titleStyle,
  showCopyButton,
  code,
  onCopy,
  githubUrl,
}) => (
  <View style={rowStyle}>
    {fileIcon ? <View style={styles.fileIcon}>{fileIcon}</View> : null}
    <Text
      variant="small"
      c="secondary"
      style={[titleBaseStyle, titleStyle, styles.flushTitle, styles.inlineTitle]}
    >
      {label}
    </Text>
    <HeaderControls
      showCopyButton={showCopyButton}
      code={code}
      onCopy={onCopy}
      githubUrl={githubUrl}
      size="xs"
      containerStyle={styles.trailingControls}
      iconColor={theme.text.secondary}
    />
  </View>
);

/**
 * Glyph for one file: the language's own logo when the brand registry has one
 * (TypeScript, CSS), otherwise a Tabler glyph tinted to the caller's state.
 */
export const FileTypeIcon: React.FC<{ fileName: string; color: string }> = ({ fileName, color }) => {
  const brand = brandFromFileName(fileName);
  if (brand) return <BrandIcon brand={brand} size={FILE_ICON_SIZE} decorative />;
  return <Icon name={iconFromFileName(fileName)} size={FILE_ICON_SIZE} color={color} decorative />;
};

type FileTabsRowProps = {
  files: CodeBlockFile[];
  activeName: string;
  onSelect: (fileName: string) => void;
  theme: PlatformBlocksTheme;
  showCopyButton: boolean;
  code: string;
  onCopy?: (code: string) => void;
  /** URL for the *active* tab — the edit button follows the tab strip. */
  githubUrl?: string;
};

/**
 * Header strip of file tabs: one xs button per file, each with an icon derived
 * from its extension. Scrolls horizontally so a demo with many files never
 * widens the code panel.
 */
export const FileTabsRow: React.FC<FileTabsRowProps> = ({
  files,
  activeName,
  onSelect,
  theme,
  showCopyButton,
  code,
  onCopy,
  githubUrl,
}) => (
  <View style={styles.tabsRow}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.tabsScroll}
      contentContainerStyle={styles.tabsContent}
    >
      {files.map((file) => {
        const active = file.name === activeName;
        const labelColor = active ? theme.text.primary : theme.text.secondary;
        return (
          <Button
            key={file.name}
            title={file.name}
            size="xs"
            variant={active ? 'secondary' : 'default'}
            onPress={() => onSelect(file.name)}
            accessibilityLabel={`Show ${file.name}`}
            {...a11yProps({ pressed: active })}
            textColor={labelColor}
            labelProps={{ fw: active ? '700' : '500' }}
            startSection={file.icon ?? <FileTypeIcon fileName={file.name} color={labelColor} />}
          />
        );
      })}
    </ScrollView>
    <HeaderControls
      showCopyButton={showCopyButton}
      code={code}
      onCopy={onCopy}
      githubUrl={githubUrl}
      size="xs"
      containerStyle={[styles.trailingControls, styles.tabsControls]}
      iconColor={theme.text.secondary}
    />
  </View>
);

type FloatingCopyControlsProps = {
  /** Whether the pointer is over the panel (web) — native always passes `true`. */
  visible: boolean;
  code: string;
  onCopy?: (code: string) => void;
  topOffset: number;
  githubUrl?: string;
  showCopyButton: boolean;
};

const FLOATING_TRANSITION = webStyle({ transition: 'opacity 120ms ease, transform 120ms ease' });

/**
 * Hover-revealed controls for panels with no header of any kind: copy on top,
 * edit beneath it. Stacked rather than side by side so the pair stays clear of
 * the code's end edge on narrow panels. Keyboard focus reveals them too, so a
 * control is never focused while invisible.
 */
export const FloatingCopyControls: React.FC<FloatingCopyControlsProps> = ({
  visible,
  code,
  onCopy,
  topOffset,
  githubUrl,
  showCopyButton,
}) => {
  const reduceMotion = useReducedMotion();
  const [focusWithin, setFocusWithin] = React.useState(false);
  const shown = visible || focusWithin;

  return (
    <View
      onFocus={() => setFocusWithin(true)}
      onBlur={() => setFocusWithin(false)}
      style={[
        styles.floating,
        {
          top: topOffset,
          opacity: shown ? 1 : 0,
          pointerEvents: shown ? 'auto' : 'none',
          transform: [{ translateY: shown ? 0 : -2 }],
        },
        reduceMotion ? null : FLOATING_TRANSITION,
      ]}
    >
      {showCopyButton ? <CodeCopyButton code={code} onCopy={onCopy} size="sm" /> : null}
      {githubUrl ? <EditOnGithubButton url={githubUrl} size="sm" /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  controls: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  flushTitle: { marginBottom: 0 },
  inlineTitle: { fontWeight: '500' },
  fileIcon: { marginEnd: 8 },
  trailingControls: { marginStart: 'auto', marginEnd: 12 },
  tabsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tabsScroll: { flexShrink: 1 },
  tabsContent: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingBottom: 6 },
  tabsControls: { paddingBottom: 6 },
  floating: { position: 'absolute', end: 8, zIndex: 10, gap: 4 },
  iconButton: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, overflow: 'hidden' },
});
