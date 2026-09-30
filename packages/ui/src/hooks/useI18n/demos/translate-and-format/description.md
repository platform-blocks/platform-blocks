---
title: Translate and format
category: basics
order: 10
tags: [i18n, translation, formatting, locale]
status: stable
hidden: false
---

`useI18n()` returns `{ locale, setLocale, t, hasKey, formatNumber, formatDate, formatRelativeTime }`. `t(key, params)` resolves dot-separated keys in the active locale, then the fallback locale, then returns the key itself, and fills `{{name}}` placeholders from `params` (an entry can also be a function of `params`). The formatters use `Intl.NumberFormat`, `Intl.DateTimeFormat` and `Intl.RelativeTimeFormat` for the active locale and take their usual options. If the runtime lacks `Intl.RelativeTimeFormat`, relative time uses an English phrase with a locale-formatted number; install an `Intl.RelativeTimeFormat` polyfill for fully localized relative time on that runtime. The keys here come from the docs site's own resources, passed to `PlocksProvider` via `i18nResources`, so switching locale also switches the site.
