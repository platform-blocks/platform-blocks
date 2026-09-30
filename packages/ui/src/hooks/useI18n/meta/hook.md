---
title: useI18n
category: localization
order: 20
tags: [i18n, localization, translation, locale, formatting]
status: stable
hidden: false
---

Translate keys with `t`, switch the active locale with `setLocale`, and format numbers, dates and relative times for that locale. Reads the nearest `I18nProvider`, which `PlocksProvider` mounts from its `locale` and `i18nResources` props; without one, `t` returns the key itself and formatting uses English.
