---
name: CodeBlock
title: CodeBlock
description: Display formatted source code with optional syntax highlighting, copy, GitHub integration, and adaptive width.
source: ui/src/components/CodeBlock
status: stable
category: typography
tags: [code, syntax, formatting, developer, github]
playground: true
examples:
  - basic
  - features
  - languages
  - interactive
  - github
---

The CodeBlock component renders source code with optional syntax highlighting, copy-to-clipboard, GitHub integration, line wrapping, and width controls (content-fit by default, with an opt-in full width mode). Set `wrap={false}` to disable soft wrapping and enable horizontal scrolling for long lines. `radius` and `withBorder` control the code surface itself — pair `radius="none"` with `withBorder={false}` to sit flush inside a bordered container such as `Card.Section`.

The copy button is named "Copy code" for assistive technology; after a successful copy its name becomes "Copied" and the confirmation is announced. On web the headerless copy/edit controls appear on hover and whenever keyboard focus moves into them. Code uses `theme.fontFamilyMono` unless `fontFamily`/`ff` is set.
