---
title: Basics
category: basics
order: 10
---

The default stack places actions above the main button. `trigger="click"` opens on press; `trigger="hover"` opens when a mouse enters the dial and closes shortly after it leaves. Tap and keyboard activation still work in hover mode. Use `labelMode="persistent"` to keep labels visible or `labelMode="tooltip"` to show them on hover and keyboard focus. `mode="flower"` fans actions up and toward the start side.

The trigger and actions use `IconButton`, so their icon contrast, focus ring, pressed state, and theme colors follow the same rules as Button. Set `color` and `variant` on the dial, or override them on an individual action. Actions can also be `disabled`. Use `toggleIcon` and `closeIcon` to customize the trigger. For controlled use, pass `opened` and `onChange`.

Keep the dial to a few related commands (roughly three to six). Persistent labels are easier to discover on touch screens, where hover tooltips are unavailable.
