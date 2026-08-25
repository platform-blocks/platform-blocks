---
name: Avatar
title: Avatar
category: display
tags: [avatar, profile, user, image, initials]
playground: true
props:
  size: Size token (xs–3xl) controlling diameter
  src: Remote image URL or a bundled asset (`require('./avatar.png')`)
  fallback: Initials shown when no image is provided
  backgroundColor: Background color for the fallback initials
  textColor: Text color for the fallback initials
  online: Show an online status indicator dot
  indicatorColor: Color override for the status indicator
  label: Primary label rendered to the right of the avatar
  description: Secondary subtext under the label
  gap: Spacing between avatar and text block
  fallbackProps: Override props applied to the initials `<Text>` (style, weight, ff, size, colorVariant)
  labelProps: Override props applied to the adjacent label `<Text>` (only when `label` is a string)
  descriptionProps: Override props applied to the description `<Text>` (only when `description` is a string)
examples:
  - basic
  - sizes
  - colors
  - icon
  - group
  - status
  - text-customization
---
The Avatar component displays user profile images, initials, or icons. Supports different sizes, colors, and can be grouped together in an AvatarGroup. Each text slot — initials, label, description — accepts the full Text-prop API via `fallbackProps` / `labelProps` / `descriptionProps`.
