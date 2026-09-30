---
title: Rating
description: An interactive rating component for displaying and collecting star ratings from users.
category: input
tags: [rating, stars, review, score, feedback]
playground: true
a11yKeyboard: Tab focuses the rating; Arrow keys adjust by one item (or by `precision` when `allowFraction` is set) and follow reading order in RTL; PageUp/PageDown move further; Home and End jump to 0 and `count`; number keys set an exact value; Backspace or Delete clears.
a11yRoles: An interactive rating is one `role="slider"` (native adjustable) with aria-valuemin/max/now and a spoken value text ("3 out of 5"), named by its label and described by its description / helper text / error; `disabled` keeps the role and reports it disabled. A `readOnly` rating is a labelled image ("4 out of 5"). VoiceOver and TalkBack get increment and decrement actions.
---

An interactive component for displaying star ratings and allowing users to provide ratings with customizable appearance.
