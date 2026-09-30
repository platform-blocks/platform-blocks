---
title: useTitleRegistration
category: navigation
order: 100
tags: [toc, titles]
status: stable
hidden: false
---

Register headings with the shared title registry so sticky TOCs and scrollspy hooks stay in sync. To read the registry (`titles`, `registerTitle`, `unregisterTitle`, `clearTitles`) directly, call `useTitleRegistry()`, which throws outside a `TitleRegistryProvider`, or `useTitleRegistryOptional()`, which returns `null` there.
