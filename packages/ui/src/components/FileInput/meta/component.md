---
playground: true
title: FileInput
description: A file upload component with drag-and-drop, validation, and preview capabilities
source: ui/src/components/FileInput
status: stable
category: input
props:
  - name: onFilesChange
    type: function
    description: Callback when files are selected or removed
  - name: multiple
    type: boolean
    description: Whether to allow multiple file selection
    default: false
  - name: accept
    type: string[]
    description: File types to accept (MIME types like `image/*`, or extensions like `.pdf`)
  - name: maxSize
    type: number
    description: Maximum file size in bytes
  - name: maxFiles
    type: number
    description: Maximum number of files allowed
  - name: disabled
    type: boolean
    description: Whether the input is disabled
    default: false
  - name: label
    type: ReactNode
    description: Label rendered above the input via the shared Field frame (also names the picker button)
  - name: description
    type: ReactNode
    description: Helper text rendered between the label and the input
  - name: required
    type: boolean
    description: Whether the field is required
  - name: withAsterisk
    type: boolean
    description: Show the required asterisk (defaults to `required`)
  - name: size
    type: SizeValue
    description: Controls the label fontSize (also forwarded to inner controls)
  - name: labelProps
    type: "Omit<TextProps, 'children'>"
    description: Override props applied to the label `<Text>`
  - name: descriptionProps
    type: "Omit<TextProps, 'children'>"
    description: Override props applied to the description `<Text>`
  - name: helperText
    type: ReactNode
    description: Additional help text (replaced by the error while there is one)
  - name: error
    type: ReactNode
    description: Error message, announced to assistive technology and linked to the picker
  - name: placeholder
    type: string
    description: Picker button text (standard / compact) or the drop zone's prompt (dropzone)
  - name: variant
    type: "'standard' | 'dropzone' | 'compact'"
    description: Visual variant
    default: standard
  - name: readOnly
    type: boolean
    description: Show the selected files but don't allow picking or removing
    default: false
  - name: imagePreview
    type: "{ enabled?, maxWidth?, maxHeight?, quality? }"
    description: Downscaled image previews in the file list
  - name: enableDragDrop
    type: boolean
    description: Accept files dropped on the drop zone (web)
    default: true on web
  - name: onUpload
    type: "(files, { onProgress }) => Promise<void>"
    description: Upload newly added valid files; report progress with helpers.onProgress(fileId, percent)
  - name: onProgress
    type: "(fileId, progress) => void"
    description: Upload progress callback
  - name: uploadSettings
    type: "{ url, method?, headers?, fieldName?, formData? }"
    description: Built-in multipart uploader (one request per file) used when there is no onUpload
examples:
  - basic
  - fileTypes
  - imagePreview
  - upload
  - validation
  - variants
---

The FileInput component provides a user-friendly interface for file uploads with drag-and-drop functionality, file validation, and preview capabilities.
