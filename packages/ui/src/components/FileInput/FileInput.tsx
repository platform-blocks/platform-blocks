import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { FileInputProps, FileInputFile } from './types';
import type { DocumentPickerAssetLike } from './types';
import { Icon } from '../Icon';
import { DESIGN_TOKENS } from '../../core/design-tokens';
import { useTheme } from '../../core/theme';
import { FieldHeader } from '../_internal/FieldHeader';
import { resolveDocumentPicker } from '../../utils/optionalDependencies';

const { DocumentPicker: DocumentPickerModule, hasDocumentPicker } = resolveDocumentPicker();

const FILE_INPUT_VARIANTS = {
  /** Standard file input with browse button */
  standard: 'standard',
  /** Drag-and-drop zone */
  dropzone: 'dropzone',
  /** Compact button style */
  compact: 'compact',
} as const;

type NativeSelectableFile = File | DocumentPickerAssetLike;

const isDocumentPickerAsset = (file: NativeSelectableFile): file is DocumentPickerAssetLike =>
  typeof (file as DocumentPickerAssetLike)?.uri === 'string';

const getFileMetadata = (file: NativeSelectableFile) => {
  if (isDocumentPickerAsset(file)) {
    const nameFromUri = file.uri?.split('/').pop();
    return {
      name: file.name ?? nameFromUri ?? 'Untitled file',
      size: file.size ?? 0,
      type: file.mimeType ?? '',
      uri: file.uri,
    };
  }

  return {
    name: file.name,
    size: file.size,
    type: file.type,
    uri: undefined as string | undefined,
  };
};

export const FileInput = React.memo(React.forwardRef<View, FileInputProps>(({
  accept = [],
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
  enableDragDrop = Platform.OS === 'web',
  validateFile,
  imagePreview = {
    enabled: true,
    maxWidth: 200,
    maxHeight: 200,
    quality: 0.8,
  },
  uploadSettings,
  variant = 'standard',
  disabled = false,
  error,
  helperText,
  style,
  label,
  description,
  required,
  withAsterisk,
  size = 'md',
  labelProps,
  descriptionProps,
  ...props
}, ref) => {
  const theme = useTheme();
  const [files, setFiles] = useState<FileInputFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<any>(null);

  // Prevent default browser drag and drop behavior on the document
  useEffect(() => {
    if (Platform.OS === 'web' && enableDragDrop) {
      const preventDefault = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
      };

      // Prevent default drag over and drop on the entire document
      document.addEventListener('dragover', preventDefault);
      document.addEventListener('drop', preventDefault);

      return () => {
        document.removeEventListener('dragover', preventDefault);
        document.removeEventListener('drop', preventDefault);
      };
    }
  }, [enableDragDrop]);

  const generateFileId = useCallback(() => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }, []);

  const validateFileInput = useCallback((file: NativeSelectableFile): string | null => {
    const { size, type, name } = getFileMetadata(file);

    if (size > maxSize) {
      return `File size exceeds ${(maxSize / 1024 / 1024).toFixed(1)}MB limit`;
    }

    if (accept.length > 0) {
      const normalizedType = type || '';
      const fileName = (name || '').toLowerCase();

      const isAccepted = accept.some(acceptType => {
        if (acceptType.startsWith('.')) {
          return fileName.endsWith(acceptType.toLowerCase());
        }

        if (!normalizedType) {
          return false;
        }

        const pattern = acceptType.replace('*', '.*');
        try {
          return new RegExp(`^${pattern}$`).test(normalizedType);
        } catch (regexError) {
          console.warn('FileInput: invalid accept pattern', acceptType, regexError);
          return normalizedType.includes(acceptType.replace('*', ''));
        }
      });

      if (!isAccepted) {
        return `File type not accepted. Accepted types: ${accept.join(', ')}`;
      }
    }

    if (validateFile) {
      return validateFile(file);
    }

    return null;
  }, [accept, maxSize, validateFile]);

  const createFilePreview = useCallback(async (file: NativeSelectableFile): Promise<string | undefined> => {
    if (Platform.OS !== 'web' || !imagePreview?.enabled) {
      return undefined;
    }

    if (typeof File === 'undefined' || !(file instanceof File) || !file.type.startsWith('image/')) {
      return undefined;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(undefined);
            return;
          }

          const { maxWidth = 200, maxHeight = 200, quality = 0.8 } = imagePreview;

          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(undefined);
        img.src = (e.target?.result as string) ?? '';
      };
      reader.readAsDataURL(file);
    });
  }, [imagePreview]);

  const processFiles = useCallback(async (fileList: FileList | NativeSelectableFile[]) => {
    const filesToProcess: NativeSelectableFile[] = Array.isArray(fileList)
      ? [...fileList]
      : Array.from(fileList ?? []);
    const newFiles: FileInputFile[] = [];

    // Check file count limit
    if (!multiple && filesToProcess.length > 1) {
      filesToProcess.splice(1);
    }

    const totalFiles = files.length + filesToProcess.length;
    if (totalFiles > maxFiles) {
      const allowedCount = maxFiles - files.length;
      filesToProcess.splice(allowedCount);
    }

    for (const file of filesToProcess) {
      const validationError = validateFileInput(file);
      let previewUrl = await createFilePreview(file);
      const metadata = getFileMetadata(file);

      if (!previewUrl && Platform.OS !== 'web' && isDocumentPickerAsset(file) && metadata.type?.startsWith('image/')) {
        previewUrl = metadata.uri ?? undefined;
      }

      const fileInput: FileInputFile = {
        file,
        id: generateFileId(),
        name: metadata.name,
        size: metadata.size,
        type: metadata.type,
        uri: metadata.uri ?? undefined,
        previewUrl,
        status: validationError ? 'error' : 'pending',
        error: validationError || undefined,
      };

      newFiles.push(fileInput);
    }

    const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);

    // Auto-upload if handler provided and no errors
    if (onUpload) {
      const validFiles = newFiles.filter(f => !f.error);
      if (validFiles.length > 0) {
        await handleUpload(validFiles);
      }
    }
  }, [files, multiple, maxFiles, validateFileInput, createFilePreview, onFilesChange, onUpload]);

  const handleUpload = useCallback(async (filesToUpload: FileInputFile[]) => {
    if (!onUpload) return;

    // Update status to uploading
    setFiles(prev => prev.map(f => 
      filesToUpload.find(uploadFile => uploadFile.id === f.id)
        ? { ...f, status: 'uploading' as const, progress: 0 }
        : f
    ));

    try {
      await onUpload(filesToUpload);
      
      // Update status to success
      setFiles(prev => prev.map(f => 
        filesToUpload.find(uploadFile => uploadFile.id === f.id)
          ? { ...f, status: 'success' as const, progress: 100 }
          : f
      ));
    } catch (error) {
      // Update status to error
      setFiles(prev => prev.map(f => 
        filesToUpload.find(uploadFile => uploadFile.id === f.id)
          ? { ...f, status: 'error' as const, error: error instanceof Error ? error.message : 'Upload failed' }
          : f
      ));
    }
  }, [onUpload]);

  const handleFileRemove = useCallback((fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFileRemove?.(fileId);
    onFilesChange?.(updatedFiles);
  }, [files, onFileRemove, onFilesChange]);

  const handleBrowseFiles = useCallback(async () => {
    if (disabled) {
      return;
    }

    if (Platform.OS === 'web') {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
      return;
    }

    const picker = DocumentPickerModule;
    if (!hasDocumentPicker || !picker?.getDocumentAsync) {
      console.warn('FileInput: expo-document-picker not installed, native file picker is disabled.');
      return;
    }

    try {
      const pickerTypes = accept.filter(type => !type.startsWith('.'));

      const result = await picker.getDocumentAsync({
        multiple,
        copyToCacheDirectory: true,
        type: pickerTypes.length > 0 ? pickerTypes : undefined,
      });

      if (result.canceled) {
        return;
      }

      if (result.assets?.length) {
        await processFiles(result.assets as DocumentPickerAssetLike[]);
        return;
      }

      if (result.output?.length) {
        await processFiles(result.output);
      }
    } catch (pickerError) {
      console.warn('FileInput: native document picker error', pickerError);
    }
  }, [accept, disabled, multiple, processFiles]);

  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      processFiles(files);
    }
    // Reset input value to allow selecting same file again
    event.target.value = '';
  }, [processFiles]);

  // HTML5 Drag and drop handlers (web only)
  const handleDragOver = useCallback((event: any) => {
    if (!enableDragDrop || Platform.OS !== 'web') return;
    
    event.preventDefault();
    event.stopPropagation();
    
    // Check if the drag contains files
    if (event.dataTransfer && event.dataTransfer.types && event.dataTransfer.types.includes('Files')) {
      event.dataTransfer.dropEffect = 'copy';
      
      if (!isDragOver) {
        setIsDragOver(true);
      }
    }
  }, [enableDragDrop, isDragOver]);

  const handleDragLeave = useCallback((event: any) => {
    if (!enableDragDrop || Platform.OS !== 'web') return;
    
    event.preventDefault();
    event.stopPropagation();
    
    // Only trigger drag leave if we're leaving the dropzone completely
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  }, [enableDragDrop]);

  const handleDragEnter = useCallback((event: any) => {
    if (!enableDragDrop || Platform.OS !== 'web') return;
    
    event.preventDefault();
    event.stopPropagation();
    
    // Check if the drag contains files
    if (event.dataTransfer && event.dataTransfer.types && event.dataTransfer.types.includes('Files')) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }, [enableDragDrop]);

  const handleDrop = useCallback((event: any) => {
    if (!enableDragDrop || Platform.OS !== 'web') return;
    
    event.preventDefault();
    event.stopPropagation();
    
    setIsDragOver(false);

    const files = event.dataTransfer && event.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [enableDragDrop, processFiles]);

  // Set up drag and drop event listeners for the dropzone
  useEffect(() => {
    if (Platform.OS === 'web' && enableDragDrop && dropZoneRef.current) {
      const element = dropZoneRef.current;
      
      // Get the actual DOM element if it's a React Native Web component
      const domElement = element._nativeTag ? element._nativeTag : element;
      
      if (domElement && domElement.addEventListener) {
        domElement.addEventListener('dragover', handleDragOver);
        domElement.addEventListener('dragenter', handleDragEnter);
        domElement.addEventListener('dragleave', handleDragLeave);
        domElement.addEventListener('drop', handleDrop);

        return () => {
          domElement.removeEventListener('dragover', handleDragOver);
          domElement.removeEventListener('dragenter', handleDragEnter);
          domElement.removeEventListener('dragleave', handleDragLeave);
          domElement.removeEventListener('drop', handleDrop);
        };
      }
    }
  }, [enableDragDrop, handleDragOver, handleDragEnter, handleDragLeave, handleDrop]);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const getStatusIcon = useCallback((status?: string) => {
    switch (status) {
      case 'uploading':
        return 'plus'; // Using available icon
      case 'success':
        return 'check';
      case 'error':
        return 'close';
      default:
        return 'star'; // Using available icon as file placeholder
    }
  }, []);

  const getStatusColor = useCallback((status?: string) => {
    switch (status) {
      case 'uploading':
        return theme.colors.primary[5];
      case 'success':
        return theme.colors.success[5];
      case 'error':
      case 'close':
        return theme.colors.error[5];
      default:
        return theme.text.secondary;
    }
  }, [theme]);

  const renderFilePreview = useCallback((file: FileInputFile) => {
    if (PreviewComponent) {
      return (
        <PreviewComponent
          key={file.id}
          file={file}
          onRemove={() => handleFileRemove(file.id)}
        />
      );
    }

    const previewSource = file.previewUrl ?? ((file.type || '').startsWith('image/') ? file.uri : undefined);

    return (
      <View key={file.id} style={styles.fileItem}>
        {previewSource ? (
          <Image
            source={{ uri: previewSource }}
            style={styles.filePreview}
            resizeMode="cover"
            accessible
            accessibilityLabel={file.name}
          />
        ) : (
          <Icon
            name="star"
            size={24}
            color={getStatusColor(file.status)}
          />
        )}

        <View style={styles.fileInfo}>
          <Text style={[styles.fileName, { color: theme.text.primary }]}>
            {file.name}
          </Text>
          <Text style={[styles.fileSize, { color: theme.text.secondary }]}>
            {formatFileSize(file.size)}
          </Text>
          {file.error && (
            <Text style={[styles.fileError, { color: theme.colors.error[5] }]}>
              {file.error}
            </Text>
          )}
        </View>

        <View style={styles.fileActions}>
          <Icon
            name={getStatusIcon(file.status)}
            size={16}
            color={getStatusColor(file.status)}
          />
          
          {!disabled && (
            <TouchableOpacity
              onPress={() => handleFileRemove(file.id)}
              style={styles.removeButton}
            >
              <Icon
                name="close"
                size={16}
                color={theme.colors.error[5]}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }, [PreviewComponent, handleFileRemove, getStatusColor, getStatusIcon, formatFileSize, theme, disabled]);

  const renderDropZone = () => {
    const dropZoneStyle = [
      styles.dropZone,
      {
        borderColor: isDragOver ? theme.colors.primary[5] : theme.colors.gray[2],
        backgroundColor: isDragOver ? `${theme.colors.primary[5]}10` : theme.colors.gray[0],
      },
      disabled && styles.disabled,
    ];

    const content = children || (
      <View style={styles.dropZoneContent}>
        <Icon
          name="plus"
          size={32}
          color={isDragOver ? theme.colors.primary[5] : theme.text.secondary}
        />
        <Text style={[styles.dropZoneText, { color: theme.text.primary }]}>
          {isDragOver ? 'Drop files here' : 'Drag and drop files here'}
        </Text>
        <Text style={[styles.dropZoneSubtext, { color: theme.text.secondary }]}>
          or
        </Text>
        <TouchableOpacity
          onPress={handleBrowseFiles}
          disabled={disabled}
          style={[styles.browseButton, { borderColor: theme.colors.primary[5] }]}
        >
          <Text style={[styles.browseButtonText, { color: theme.colors.primary[5] }]}>
            Browse Files
          </Text>
        </TouchableOpacity>
      </View>
    );

    if (Platform.OS !== 'web') {
      return (
        <TouchableOpacity
          activeOpacity={0.9}
          disabled={disabled}
          style={dropZoneStyle}
          onPress={handleBrowseFiles}
        >
          {content}
        </TouchableOpacity>
      );
    }

    return (
      <View
        ref={dropZoneRef}
        style={dropZoneStyle}
      >
        {content}
      </View>
    );
  };

  const renderStandardInput = () => (
    <View style={styles.standardContainer}>
      <TouchableOpacity
        onPress={handleBrowseFiles}
        disabled={disabled}
        style={[
          styles.standardButton,
          {
            borderColor: theme.colors.gray[2],
            backgroundColor: theme.colors.gray[0],
          },
          disabled && styles.disabled,
        ]}
      >
        <Icon name="plus" size={16} color={theme.text.secondary} />
        <Text style={[styles.standardButtonText, { color: theme.text.primary }]}>
          Choose {multiple ? 'Files' : 'File'}
        </Text>
      </TouchableOpacity>
      
      {files.length > 0 && (
        <Text style={[styles.fileCount, { color: theme.text.secondary }]}>
          {files.length} file{files.length !== 1 ? 's' : ''} selected
        </Text>
      )}
    </View>
  );

  const renderCompactInput = () => (
    <TouchableOpacity
      onPress={handleBrowseFiles}
      disabled={disabled}
      style={[
        styles.compactButton,
        { backgroundColor: theme.colors.primary[5] },
        disabled && styles.disabled,
      ]}
    >
      <Icon name="plus" size={16} color="#FFFFFF" />
      <Text style={[styles.compactButtonText, { color: '#FFFFFF' }]}>
        Upload
      </Text>
    </TouchableOpacity>
  );

  return (
    <View ref={ref} style={[styles.container, style]}>
      {/* Hidden file input for web */}
      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept.join(',')}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
      )}

      <FieldHeader
        label={label}
        description={description}
        required={required}
        withAsterisk={withAsterisk ?? required}
        disabled={disabled}
        error={!!error}
        size={size as any}
        labelProps={labelProps}
        descriptionProps={descriptionProps}
      />

      {/* File input UI */}
      {variant === 'dropzone' && renderDropZone()}
      {variant === 'standard' && renderStandardInput()}
      {variant === 'compact' && renderCompactInput()}

      {/* Error message */}
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error[5] }]}>
          {error}
        </Text>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <Text style={[styles.helperText, { color: theme.text.secondary }]}>
          {helperText}
        </Text>
      )}

      {/* File list */}
      {showFileList && files.length > 0 && (
        <View style={styles.fileList}>
          {files.map(renderFilePreview)}
        </View>
      )}
    </View>
  );
}));

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  
  // Drop zone styles
  dropZone: {
    alignItems: 'center',
    borderRadius: DESIGN_TOKENS.radius.lg,
    borderStyle: 'dashed',
    borderWidth: DESIGN_TOKENS.radius.xs,
    justifyContent: 'center',
    minHeight: 200,
    padding: DESIGN_TOKENS.spacing['3xl'],
  },
  dropZoneContent: {
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.md,
  },
  dropZoneText: {
    fontSize: DESIGN_TOKENS.typography.fontSize.md,
    fontWeight: DESIGN_TOKENS.typography.fontWeight.medium as any,
  },
  dropZoneSubtext: {
    fontSize: DESIGN_TOKENS.typography.fontSize.sm,
  },
  browseButton: {
    borderRadius: DESIGN_TOKENS.radius.md,
    borderWidth: 1,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    paddingVertical: DESIGN_TOKENS.spacing.sm,
  },
  browseButtonText: {
    fontSize: DESIGN_TOKENS.typography.fontSize.sm,
    fontWeight: DESIGN_TOKENS.typography.fontWeight.medium as any,
  },

  // Standard input styles
  standardContainer: {
    gap: DESIGN_TOKENS.spacing.sm,
  },
  standardButton: {
    alignItems: 'center',
    borderRadius: DESIGN_TOKENS.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: DESIGN_TOKENS.spacing.sm,
    padding: DESIGN_TOKENS.spacing.md,
  },
  standardButtonText: {
    fontSize: DESIGN_TOKENS.typography.fontSize.sm,
    fontWeight: DESIGN_TOKENS.typography.fontWeight.medium as any,
  },
  fileCount: {
    fontSize: DESIGN_TOKENS.typography.fontSize.xs,
  },

  // Compact input styles
  compactButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: DESIGN_TOKENS.radius.md,
    flexDirection: 'row',
    gap: DESIGN_TOKENS.spacing.xs,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    paddingVertical: DESIGN_TOKENS.spacing.sm,
  },
  compactButtonText: {
    fontSize: DESIGN_TOKENS.typography.fontSize.sm,
    fontWeight: DESIGN_TOKENS.typography.fontWeight.medium as any,
  },

  // File list styles
  fileList: {
    gap: DESIGN_TOKENS.spacing.sm,
    marginTop: DESIGN_TOKENS.spacing.md,
  },
  fileItem: {
    alignItems: 'center',
    borderRadius: DESIGN_TOKENS.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: DESIGN_TOKENS.spacing.md,
    padding: DESIGN_TOKENS.spacing.md,
  },
  filePreview: {
    borderRadius: DESIGN_TOKENS.radius.sm,
    height: 40,
    width: 40,
  },
  fileInfo: {
    flex: 1,
    gap: DESIGN_TOKENS.spacing.xs,
  },
  fileName: {
    fontSize: DESIGN_TOKENS.typography.fontSize.sm,
    fontWeight: DESIGN_TOKENS.typography.fontWeight.medium as any,
  },
  fileSize: {
    fontSize: DESIGN_TOKENS.typography.fontSize.xs,
  },
  fileError: {
    fontSize: DESIGN_TOKENS.typography.fontSize.xs,
  },
  fileActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: DESIGN_TOKENS.spacing.sm,
  },
  removeButton: {
    padding: DESIGN_TOKENS.component.clearButton.padding,
  },

  // State styles
  disabled: {
    opacity: DESIGN_TOKENS.opacity.disabled,
  },

  // Message styles
  errorText: {
    fontSize: DESIGN_TOKENS.typography.fontSize.xs,
    marginTop: DESIGN_TOKENS.spacing.xs,
  },
  helperText: {
    fontSize: DESIGN_TOKENS.typography.fontSize.xs,
    marginTop: DESIGN_TOKENS.spacing.xs,
  },
});

FileInput.displayName = 'FileInput';
