---
name: TextArea
title: TextArea
category: input
tags: [input, textarea, multiline, text, form, validation]
playground: true
---
The TextArea component provides a multi-line text input with support for auto-resizing, character counting, validation states, and flexible sizing options.

Label, description, error and helper text come from the shared field frame, so they are linked to the text area for assistive technology and errors are announced. `rows` sets the visible height in lines; `autoResize` grows it with the content between `minRows` and `maxRows`. `ref` points at the underlying `TextInput`.
