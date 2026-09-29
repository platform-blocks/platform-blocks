---
playground: true
title: Calendar
category: dates
description: A versatile calendar component for selecting dates, months, and years with customizable styles and behaviors.
slug: /components/Calendar
---

## Accessibility

- Each month is a grid (web: `role="grid"` named by its month, weekday column headers, day `gridcell`s; native: day buttons). A day's accessible name is its full localized date, e.g. "Tuesday, March 3, 2026", with `aria-selected`, `aria-current="date"` for today and `aria-disabled`.
- Keyboard (web): the calendar is a single tab stop. Arrow keys move by day / week (mirrored in RTL), Home/End go to the start/end of the week, PageUp/PageDown change the month (with Shift: the year); moving past the first or last day changes the visible month. Space or Enter selects.
- The previous/next controls are labelled per level ("Previous month", "Next year", "Previous decade", ...) and the month/year header announces changes politely.
