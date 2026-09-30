---
title: useDirection
category: localization
order: 10
tags: [rtl, direction, layout, i18n]
status: stable
hidden: false
---

Read the text direction (`dir`, `isRTL`) and switch it with `setDirection` or `toggleDirection`, for logic that has to know which way the layout runs. `PlocksProvider` mounts a `DirectionProvider` unless given `direction={false}`; outside one, the hook returns LTR with no-op setters instead of throwing.
