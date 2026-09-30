---
title: Announcement log
category: basics
order: 10
tags: [announce, screen-reader, live-region]
status: stable
hidden: false
---

`announce(message, priority?)` speaks through the screen reader (a live region on web, `AccessibilityInfo` on native) and adds the message to `announcements`, a log that drops each entry after 3 s, or 5 s for `'assertive'`. The value also has `clearAnnouncements`, `prefersReducedMotion`, `screenReaderEnabled` (always `false` on web because browsers do not expose this state), and a focus log, `currentFocusId` / `focusHistory` / `setFocus(id)` / `restoreFocus()`, that records ids without moving focus. `useAccessibility()` throws outside an `AccessibilityProvider`. `PlocksProvider` already mounts one, and `<AccessibilityProvider reducedMotion>` forces reduced motion for its subtree. Because it re-renders on every focus change and announcement, use the standalone `announce(message, { politeness })` or `useReducedMotion()` when that is all you need.
