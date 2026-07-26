import React from 'react';
import { Linking, ScrollView, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import type { PlatformBlocksTheme } from '../../core/theme/types';
import { BrandIcon } from '../BrandIcon';
import { Button } from '../Button';
import { CopyButton } from '../CopyButton/CopyButton';
import { Icon } from '../Icon';
import { IconButton } from '../IconButton';
import { Text } from '../Text';
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

type ControlSize = 'xs' | 'sm';

/**
 * Opens the file on GitHub. `url` is whatever the caller supplied — a blob view,
 * an `/edit/` link, a permalink — this only navigates, it never rewrites the URL,
 * so the caller stays in control of where "edit" actually lands.
 */
export const EditOnGithubButton: React.FC<{
  url: string;
  size: ControlSize;
  boxStyle?: ViewStyle;
  iconColor?: string;
}> = ({ url, size, boxStyle, iconColor }) => {
  const openGithub = React.useCallback(() => {
    Linking.openURL(url).catch(() => undefined);
  }, [url]);

  return (
    <View style={boxStyle}>
      <IconButton
        icon="edit"
        variant="secondary"
        size={size}
        onPress={openGithub}
        iconColor={iconColor}
        tooltip="Edit on GitHub"
        accessibilityLabel="Edit this file on GitHub"
      />
    </View>
  );
};

type HeaderControlsProps = {
  showCopyButton: boolean;
  code: string;
  onCopy?: (code: string) => void;
  /** Resolved URL for the file currently on screen. Hides the edit button when absent. */
  githubUrl?: string;
  size: ControlSize;
  /** Minimum box each control occupies, so the pair keeps the header row's height. */
  boxStyle?: ViewStyle;
  containerStyle?: StyleProp<ViewStyle>;
  iconColor?: string;
};

/**
 * The trailing control pair shared by all three header treatments. Edit sits to
 * the left of copy: copy is the one readers reach for reflexively, so it keeps
 * the rightmost position it has always had.
 */
export const HeaderControls: React.FC<HeaderControlsProps> = ({
  showCopyButton,
  code,
  onCopy,
  githubUrl,
  size,
  boxStyle,
  containerStyle,
  iconColor,
}) => {
  if (!showCopyButton && !githubUrl) return null;

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 4 }, containerStyle]}>
      {githubUrl ? (
        <EditOnGithubButton url={githubUrl} size={size} boxStyle={boxStyle} iconColor={iconColor} />
      ) : null}
      {showCopyButton ? (
        <CopyButton
          value={code}
          onCopy={onCopy}
          iconOnly
          size={size}
          style={boxStyle}
          iconColor={iconColor}
        />
      ) : null}
    </View>
  );
};

type FileHeaderBarProps = {
  fileName: string;
  /** `styles.headerBar` — the theme-resolved bar, shared with the style sheet. */
  barStyle: ViewStyle;
  titleBaseStyle: TextStyle;
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
    <Text variant="small" colorVariant="secondary" style={[titleBaseStyle, titleStyle, { marginBottom: 0 }]}>
      {fileName}
    </Text>
    <HeaderControls
      showCopyButton={showCopyButton}
      code={code}
      onCopy={onCopy}
      githubUrl={githubUrl}
      size="xs"
      boxStyle={{ minHeight: 24, minWidth: 24 }}
    />
  </View>
);

type InlineTitleRowProps = {
  label: string;
  fileIcon?: React.ReactNode;
  theme: PlatformBlocksTheme;
  /** `styles.inlineTitleRow` — carries the theme's hairline. */
  rowStyle: ViewStyle;
  titleBaseStyle: TextStyle;
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
    {fileIcon ? <View style={{ marginRight: 8 }}>{fileIcon}</View> : null}
    <Text
      variant="small"
      style={[
        titleBaseStyle,
        titleStyle,
        {
          marginBottom: 0,
          color: theme.text.secondary,
          fontWeight: '500',
        },
      ]}
    >
      {label}
    </Text>
    <HeaderControls
      showCopyButton={showCopyButton}
      code={code}
      onCopy={onCopy}
      githubUrl={githubUrl}
      size="xs"
      boxStyle={{ minHeight: 20, minWidth: 20 }}
      containerStyle={{ marginLeft: 'auto', marginRight: 12 }}
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
  return <Icon name={iconFromFileName(fileName)} size={FILE_ICON_SIZE} color={color} />;
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
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexShrink: 1 }}
      contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingBottom: 6 }}
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
            textColor={labelColor}
            labelProps={{ weight: active ? '700' : '500' }}
            startIcon={file.icon ?? <FileTypeIcon fileName={file.name} color={labelColor} />}
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
      boxStyle={{ minHeight: 20, minWidth: 20 }}
      containerStyle={{ marginLeft: 'auto', marginRight: 12, paddingBottom: 6 }}
      iconColor={theme.text.secondary}
    />
  </View>
);

type FloatingCopyControlsProps = {
  visible: boolean;
  code: string;
  onCopy?: (code: string) => void;
  topOffset: number;
  isWeb: boolean;
  githubUrl?: string;
  showCopyButton: boolean;
};

/**
 * Hover-revealed controls for panels with no header of any kind: copy on top,
 * edit beneath it. Stacked rather than side by side so the pair stays clear of
 * the code's right edge on narrow panels.
 */
export const FloatingCopyControls: React.FC<FloatingCopyControlsProps> = ({
  visible,
  code,
  onCopy,
  topOffset,
  isWeb,
  githubUrl,
  showCopyButton,
}) => (
  <View
    style={{
      position: 'absolute',
      top: topOffset,
      right: 8,
      zIndex: 10,
      opacity: visible ? 1 : 0,
      gap: 4,
      pointerEvents: visible ? 'auto' : 'none',
      ...(isWeb
        ? { transition: 'opacity 120ms ease, transform 120ms ease', transform: `translateY(${visible ? 0 : -2}px)` }
        : {}),
    }}
  >
    {showCopyButton ? (
      <CopyButton
        value={code}
        onCopy={onCopy}
        iconOnly
        size="sm"
        tooltip="Copy code"
        tooltipPosition="left"
        style={{ minHeight: 32, minWidth: 32 }}
      />
    ) : null}
    {githubUrl ? (
      <EditOnGithubButton url={githubUrl} size="sm" boxStyle={{ minHeight: 32, minWidth: 32 }} />
    ) : null}
  </View>
);
