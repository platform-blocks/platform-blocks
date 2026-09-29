import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, Text, View, StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import { a11yProps, type A11yProps } from '../../core/accessibility/a11yProps';
import { announce } from '../../core/accessibility/announce';
import { getNodeText, useA11yId } from '../../core/accessibility/useA11yId';
import { factory } from '../../core/factory/factory';
import { createThemedStyles } from '../../core/hooks/useThemedStyles';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { isWeb } from '../../core/platform';
import { webStyle } from '../../core/platform/webStyle';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize, onColor, resolveFontSize, resolveRadius, resolveSpacing } from '../../core/theme/tokens';
import type { PlatformBlocksTheme, SizeValue } from '../../core/theme/types';
import type { RadiusValue } from '../../core/types/base';
import { getLayoutStyles, extractLayoutProps } from '../../core/utils/layout';
import { devWarn } from '../../core/utils/logger';
import { resolveStyleProps, extractStyleProps } from '../../core/utils/spacing';
import { useDisclaimer, extractDisclaimerProps } from '../_internal/Disclaimer/disclaimerUtils';
import { Field, type FieldRenderProps } from '../_internal/Field/Field';
import { Icon } from '../Icon';
import { attachFileDropTarget, createImagePreview, pickFiles, preventWindowFileDrop } from './filePicker';
import type { DocumentPickerAssetLike, FileInputFile, FileInputProps, FileInputSource } from './types';
import { uploadFiles } from './upload';

const EMPTY_ACCEPT: string[] = [];
const DEFAULT_IMAGE_PREVIEW: NonNullable<FileInputProps['imagePreview']> = {
  enabled: true,
  maxWidth: 200,
  maxHeight: 200,
  quality: 0.8,
};

const isDocumentPickerAsset = (file: FileInputSource): file is DocumentPickerAssetLike =>
  typeof (file as DocumentPickerAssetLike)?.uri === 'string';

const getFileMetadata = (file: FileInputSource) => {
  if (isDocumentPickerAsset(file)) {
    const nameFromUri = file.uri?.split('/').pop();
    return {
      name: file.name ?? nameFromUri ?? 'Untitled file',
      size: file.size ?? 0,
      type: file.mimeType ?? '',
      uri: file.uri ?? undefined,
    };
  }
  const domFile = file as File;
  return { name: domFile.name, size: domFile.size, type: domFile.type, uri: undefined };
};

/** `1536` → `'1.5 KB'`. */
export const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const units = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
};

/** Validation message for `file`, or null when it passes size / type / custom checks. */
export function validateFileAgainst(
  file: FileInputSource,
  { maxSize, accept, validateFile }: Pick<FileInputProps, 'maxSize' | 'accept' | 'validateFile'>
): string | null {
  const { size, type, name } = getFileMetadata(file);

  if (maxSize !== undefined && size > maxSize) {
    return `File size exceeds ${(maxSize / 1024 / 1024).toFixed(1)}MB limit`;
  }

  if (accept && accept.length > 0) {
    const fileName = (name || '').toLowerCase();
    const isAccepted = accept.some((acceptType) => {
      if (acceptType.startsWith('.')) return fileName.endsWith(acceptType.toLowerCase());
      if (!type) return false;
      try {
        return new RegExp(`^${acceptType.replace('*', '.*')}$`).test(type);
      } catch (regexError) {
        devWarn('FileInput: invalid accept pattern', acceptType, regexError);
        return type.includes(acceptType.replace('*', ''));
      }
    });
    if (!isAccepted) return `File type not accepted. Accepted types: ${accept.join(', ')}`;
  }

  return validateFile ? validateFile(file) : null;
}

const generateFileId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

const getFileInputStyles = createThemedStyles(
  (theme: PlatformBlocksTheme, size: SizeValue, radius: RadiusValue | undefined, dragOver: boolean) => {
    const metrics = getControlSize(theme, size);
    const onPrimary = theme.text.onPrimary ?? onColor(theme, theme.colors.primary[5]);
    const space = (token: 'xs' | 'sm' | 'md' | '3xl') => resolveSpacing(theme, token) as number;
    const buttonRadius = resolveRadius(theme, radius ?? 'md');
    const text = (fontSize: number, color: string, weight?: TextStyle['fontWeight']): TextStyle => ({
      fontSize,
      color,
      fontFamily: theme.fontFamily,
      ...(weight ? { fontWeight: weight } : null),
    });

    const styles = StyleSheet.create({
      standardContainer: { gap: space('sm') },
      standardButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: space('sm'),
        minHeight: metrics.height,
        paddingHorizontal: space('md'),
        paddingVertical: space('sm'),
        borderRadius: buttonRadius,
        borderWidth: 1,
        borderColor: theme.backgrounds.borderStrong,
        backgroundColor: theme.backgrounds.subtle,
        ...webStyle({ cursor: 'pointer' }),
      },
      buttonText: text(metrics.fontSize, theme.text.primary, '500'),
      fileCount: text(resolveFontSize(theme, 'xs'), theme.text.secondary),
      compactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: space('xs'),
        minHeight: metrics.height,
        paddingHorizontal: space('md'),
        paddingVertical: space('sm'),
        borderRadius: buttonRadius,
        backgroundColor: theme.colors.primary[5],
        ...webStyle({ cursor: 'pointer' }),
      },
      compactText: text(metrics.fontSize, onPrimary, '500'),
      dropZone: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
        padding: space('3xl'),
        borderRadius: resolveRadius(theme, radius ?? 'lg'),
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: dragOver ? theme.colors.primary[5] : theme.backgrounds.borderStrong,
        backgroundColor: dragOver ? theme.backgrounds.selected : theme.backgrounds.subtle,
        ...webStyle({ cursor: 'pointer' }),
      },
      dropZoneContent: { alignItems: 'center', gap: space('md') },
      dropZoneText: text(resolveFontSize(theme, 'md'), theme.text.primary, '500'),
      dropZoneSubtext: text(resolveFontSize(theme, 'sm'), theme.text.secondary),
      browseChip: {
        borderRadius: buttonRadius,
        borderWidth: 1,
        borderColor: theme.colors.primary[5],
        paddingHorizontal: space('md'),
        paddingVertical: space('sm'),
      },
      browseText: text(resolveFontSize(theme, 'sm'), theme.colors.primary[5], '500'),
      pressed: { opacity: 0.85 },
      disabled: { opacity: 0.5, ...webStyle({ cursor: 'not-allowed' }) },
      fileList: { gap: space('sm'), marginTop: space('md') },
      fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: space('md'),
        padding: space('md'),
        borderRadius: resolveRadius(theme, 'md'),
        borderWidth: 1,
        borderColor: theme.backgrounds.border,
      },
      filePreview: { width: 40, height: 40, borderRadius: resolveRadius(theme, 'sm') },
      fileInfo: { flex: 1, gap: space('xs') },
      fileName: text(resolveFontSize(theme, 'sm'), theme.text.primary, '500'),
      fileSize: text(resolveFontSize(theme, 'xs'), theme.text.secondary),
      fileError: text(resolveFontSize(theme, 'xs'), theme.colors.error[5]),
      fileActions: { flexDirection: 'row', alignItems: 'center', gap: space('sm') },
      removeButton: {
        minWidth: 24,
        minHeight: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        ...webStyle({ cursor: 'pointer' }),
      } as ViewStyle,
    });
    return styles;
  }
);

const STATUS_ICON: Record<NonNullable<FileInputFile['status']>, { name: string; label: string } | null> = {
  pending: null,
  uploading: { name: 'loader', label: 'Uploading' },
  success: { name: 'check', label: 'Uploaded' },
  error: { name: 'alert-circle', label: 'Failed' },
};

/**
 * File picker field: a button (`standard`, `compact`) or a drop zone
 * (`dropzone`, with drag-and-drop on web), validation by type/size, image
 * previews, and optional upload with progress. Label / description / error /
 * helper text come from the shared `Field` frame. `ref` points at the root View.
 */
export const FileInput = factory<{ props: FileInputProps; ref: View }>(
  (props, ref) => {
    const { styleProps, otherProps: propsAfterSpacing } = extractStyleProps(props);
    const { layoutProps, otherProps: propsAfterLayout } = extractLayoutProps(propsAfterSpacing);
    const { disclaimerProps: disclaimerData, otherProps } = extractDisclaimerProps(propsAfterLayout);
    const {
      id,
      accept = EMPTY_ACCEPT,
      multiple = false,
      maxSize = 10 * 1024 * 1024, // 10MB
      maxFiles = 10,
      onUpload,
      onProgress,
      onFilesChange,
      onFileRemove,
      PreviewComponent,
      children,
      showFileList = true,
      enableDragDrop = isWeb,
      validateFile,
      imagePreview = DEFAULT_IMAGE_PREVIEW,
      uploadSettings,
      variant = 'standard',
      placeholder,
      disabled = false,
      readOnly = false,
      error,
      helperText,
      style,
      testID,
      label,
      description,
      required,
      withAsterisk,
      size = 'md',
      radius,
      labelProps,
      descriptionProps,
      accessibilityLabel,
      accessibilityHint,
    } = otherProps;

    const theme = useTheme();
    const renderDisclaimer = useDisclaimer(disclaimerData.disclaimer, disclaimerData.disclaimerProps);
    const [files, setFiles] = useState<FileInputFile[]>([]);
    const filesRef = useRef<FileInputFile[]>(files);
    const [isDragOver, setIsDragOver] = useState(false);
    const dropZoneRef = useRef<View>(null);
    const buttonTextId = useA11yId(undefined, 'file-input-action');
    const inactive = disabled || readOnly;

    const styles = getFileInputStyles(theme, size, radius, isDragOver);

    /** Updates the list (ref first, so async steps see the latest). */
    const updateFiles = useCallback((next: (previous: FileInputFile[]) => FileInputFile[]) => {
      const updated = next(filesRef.current);
      filesRef.current = updated;
      setFiles(updated);
      return updated;
    }, []);

    const reportProgress = useCallback(
      (fileId: string, progress: number) => {
        updateFiles((previous) => previous.map((f) => (f.id === fileId ? { ...f, progress } : f)));
        onProgress?.(fileId, progress);
      },
      [updateFiles, onProgress]
    );

    const handleUpload = useCallback(
      async (toUpload: FileInputFile[]) => {
        const ids = new Set(toUpload.map((f) => f.id));
        const setStatus = (patch: Partial<FileInputFile>) =>
          updateFiles((previous) => previous.map((f) => (ids.has(f.id) ? { ...f, ...patch } : f)));

        setStatus({ status: 'uploading', progress: 0 });
        try {
          if (onUpload) {
            await onUpload(toUpload, { onProgress: reportProgress });
          } else if (uploadSettings?.url) {
            await uploadFiles(toUpload, uploadSettings, reportProgress);
          }
          setStatus({ status: 'success', progress: 100 });
        } catch (uploadError) {
          const message = uploadError instanceof Error ? uploadError.message : 'Upload failed';
          setStatus({ status: 'error', error: message });
          announce(`Upload failed: ${message}`, { politeness: 'assertive' });
        }
      },
      [onUpload, uploadSettings, reportProgress, updateFiles]
    );

    const processFiles = useCallback(
      async (sources: FileInputSource[]) => {
        const room = multiple ? Math.max(0, maxFiles - filesRef.current.length) : Math.min(1, maxFiles);
        const toProcess = sources.slice(0, room);
        if (toProcess.length === 0) return;

        const newFiles: FileInputFile[] = [];
        for (const file of toProcess) {
          const validationError = validateFileAgainst(file, { maxSize, accept, validateFile });
          const metadata = getFileMetadata(file);
          let previewUrl = imagePreview?.enabled ? await createImagePreview(file, imagePreview) : undefined;
          if (!previewUrl && metadata.uri && metadata.type.startsWith('image/')) {
            previewUrl = metadata.uri;
          }
          newFiles.push({
            file,
            id: generateFileId(),
            name: metadata.name,
            size: metadata.size,
            type: metadata.type,
            uri: metadata.uri,
            previewUrl,
            status: validationError ? 'error' : 'pending',
            error: validationError || undefined,
          });
        }

        const updated = updateFiles((previous) => (multiple ? [...previous, ...newFiles] : newFiles));
        onFilesChange?.(updated);
        announce(`${newFiles.length} file${newFiles.length === 1 ? '' : 's'} selected`);

        const validFiles = newFiles.filter((f) => !f.error);
        if (validFiles.length > 0 && (onUpload || uploadSettings?.url)) {
          await handleUpload(validFiles);
        }
      },
      [multiple, maxFiles, maxSize, accept, validateFile, imagePreview, updateFiles, onFilesChange, onUpload, uploadSettings, handleUpload]
    );

    const handleFileRemove = useCallback(
      (fileId: string) => {
        const updated = updateFiles((previous) => previous.filter((f) => f.id !== fileId));
        onFileRemove?.(fileId);
        onFilesChange?.(updated);
      },
      [updateFiles, onFileRemove, onFilesChange]
    );

    const handleBrowseFiles = useCallback(async () => {
      if (inactive) return;
      try {
        const picked = await pickFiles({ accept, multiple });
        if (picked && picked.length > 0) await processFiles(picked);
      } catch (pickerError) {
        devWarn('FileInput: file picker error', pickerError);
      }
    }, [inactive, accept, multiple, processFiles]);

    // Web drag-and-drop on the drop zone (no-ops on native).
    const dropFiles = useLatestCallback((dropped: FileInputSource[]) => {
      void processFiles(dropped);
    });
    const dragDropActive = enableDragDrop && variant === 'dropzone' && !inactive;
    useEffect(() => {
      if (!dragDropActive) return undefined;
      const detachTarget = attachFileDropTarget(dropZoneRef.current, {
        onDragStateChange: setIsDragOver,
        onDrop: dropFiles,
      });
      const restoreWindow = preventWindowFileDrop();
      return () => {
        detachTarget();
        restoreWindow();
        setIsDragOver(false);
      };
    }, [dragDropActive, dropFiles]);

    const actionText =
      variant === 'dropzone'
        ? 'Browse files'
        : (placeholder ?? (variant === 'compact' ? 'Upload' : `Choose ${multiple ? 'Files' : 'File'}`));
    const dropPrompt = placeholder ?? (enableDragDrop ? 'Drag and drop files here' : 'Select files');

    /** Button semantics for the picker trigger, named by the field label plus the action. */
    const triggerA11y = (field: FieldRenderProps): A11yProps => {
      const { 'aria-labelledby': _labelledBy, 'aria-label': _label, ...controlRest } = field.controlProps;
      const labelText = getNodeText(label);
      return {
        ...controlRest,
        ...a11yProps({
          role: 'button',
          disabled: inactive,
          label: accessibilityLabel ?? (isWeb ? undefined : [labelText, actionText].filter(Boolean).join(', ')),
          labelledBy: isWeb && !accessibilityLabel ? [labelText ? field.ids.label : null, buttonTextId] : undefined,
        }),
      };
    };

    const renderStandard = (field: FieldRenderProps) => (
      <View style={styles.standardContainer}>
        <Pressable
          onPress={handleBrowseFiles}
          disabled={inactive}
          {...triggerA11y(field)}
          style={({ pressed }) => [styles.standardButton, pressed && styles.pressed, inactive && styles.disabled]}
        >
          <Icon name="upload" size={getControlSize(theme, size).iconSize} color={theme.text.secondary} />
          <Text id={buttonTextId} style={styles.buttonText}>
            {actionText}
          </Text>
        </Pressable>
        {files.length > 0 ? (
          <Text style={styles.fileCount}>
            {files.length} file{files.length !== 1 ? 's' : ''} selected
          </Text>
        ) : null}
      </View>
    );

    const renderCompact = (field: FieldRenderProps) => (
      <Pressable
        onPress={handleBrowseFiles}
        disabled={inactive}
        {...triggerA11y(field)}
        style={({ pressed }) => [styles.compactButton, pressed && styles.pressed, inactive && styles.disabled]}
      >
        <Icon name="upload" size={getControlSize(theme, size).iconSize} color={theme.text.onPrimary ?? onColor(theme, theme.colors.primary[5])} />
        <Text id={buttonTextId} style={styles.compactText}>
          {actionText}
        </Text>
      </Pressable>
    );

    const renderDropZone = (field: FieldRenderProps) => (
      // The whole zone opens the picker (and, on web, takes dropped files).
      <Pressable
        ref={dropZoneRef}
        onPress={handleBrowseFiles}
        disabled={inactive}
        {...triggerA11y(field)}
        style={({ pressed }) => [styles.dropZone, pressed && styles.pressed, inactive && styles.disabled]}
      >
        {children ?? (
          <View style={styles.dropZoneContent}>
            <Icon name="upload" size={32} color={isDragOver ? theme.colors.primary[5] : theme.text.secondary} />
            <Text style={styles.dropZoneText}>
              {isDragOver ? 'Drop files here' : dropPrompt}
            </Text>
            {enableDragDrop ? <Text style={styles.dropZoneSubtext}>or</Text> : null}
            <View style={styles.browseChip}>
              <Text id={buttonTextId} style={styles.browseText}>
                {actionText}
              </Text>
            </View>
          </View>
        )}
      </Pressable>
    );

    const renderFile = (file: FileInputFile) => {
      if (PreviewComponent) {
        return <PreviewComponent key={file.id} file={file} onRemove={() => handleFileRemove(file.id)} />;
      }

      const previewSource = file.previewUrl ?? ((file.type || '').startsWith('image/') ? file.uri : undefined);
      const status = file.status ? STATUS_ICON[file.status] : null;
      const statusColor =
        file.status === 'success'
          ? theme.colors.success[5]
          : file.status === 'error'
            ? theme.colors.error[5]
            : theme.colors.primary[5];

      return (
        <View key={file.id} style={styles.fileItem} {...a11yProps({ role: 'listitem' })}>
          {previewSource ? (
            <Image source={{ uri: previewSource }} style={styles.filePreview} resizeMode="cover" {...a11yProps({ hidden: true })} />
          ) : (
            <Icon name="file" size={24} color={theme.text.secondary} />
          )}

          <View style={styles.fileInfo}>
            <Text style={styles.fileName}>{file.name}</Text>
            <Text style={styles.fileSize}>
              {formatFileSize(file.size)}
              {file.status === 'uploading' && typeof file.progress === 'number' ? ` · ${file.progress}%` : ''}
            </Text>
            {file.error ? <Text style={styles.fileError}>{file.error}</Text> : null}
          </View>

          <View style={styles.fileActions}>
            {status ? <Icon name={status.name} size={16} color={statusColor} label={status.label} /> : null}
            {!inactive ? (
              <Pressable
                onPress={() => handleFileRemove(file.id)}
                {...a11yProps({ role: 'button', label: `Remove ${file.name}` })}
                hitSlop={isWeb ? undefined : 10}
                style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
              >
                <Icon name="close" size={16} color={theme.colors.error[5]} />
              </Pressable>
            ) : null}
          </View>
        </View>
      );
    };

    return (
      <Field
        id={id}
        label={label}
        description={description}
        error={error}
        helperText={helperText}
        required={required}
        withAsterisk={withAsterisk}
        disabled={disabled}
        readOnly={readOnly}
        size={size}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        labelProps={labelProps}
        descriptionProps={descriptionProps}
        testID={testID}
        rootRef={ref}
        // `fullWidth` first, so an explicit `w` wins.
        style={[getLayoutStyles(layoutProps), resolveStyleProps(styleProps, theme), style]}
      >
        {(field) => (
          <>
            {variant === 'dropzone' ? renderDropZone(field) : variant === 'compact' ? renderCompact(field) : renderStandard(field)}
            {renderDisclaimer()}
            {showFileList && files.length > 0 ? (
              <View style={styles.fileList} {...a11yProps({ role: 'list' })}>
                {files.map(renderFile)}
              </View>
            ) : null}
          </>
        )}
      </Field>
    );
  },
  { displayName: 'FileInput' }
);
