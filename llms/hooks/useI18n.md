# useI18n

Translate keys with `t`, switch the active locale with `setLocale`, and format numbers, dates and relative times for that locale. Reads the nearest `I18nProvider`, which `PlocksProvider` mounts from its `locale` and `i18nResources` props; without one, `t` returns the key itself and formatting uses English.

## Metadata

- Import: `import { useI18n } from '@plocks/ui';`
- Tags: i18n, localization, translation, locale, formatting
- Docs: https://plocks.dev/hooks/useI18n
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/core/i18n/I18nContext.tsx

## Definition

```ts
export function useI18n(): I18nContextValue;
```

## Examples

### Translate and format

`useI18n()` returns `{ locale, setLocale, t, hasKey, formatNumber, formatDate, formatRelativeTime }`. `t(key, params)` resolves dot-separated keys in the active locale, then the fallback locale, then returns the key itself, and fills `{{name}}` placeholders from `params` (an entry can also be a function of `params`). The formatters use `Intl.NumberFormat`, `Intl.DateTimeFormat` and `Intl.RelativeTimeFormat` for the active locale and take their usual options. If the runtime lacks `Intl.RelativeTimeFormat`, relative time uses an English phrase with a locale-formatted number; install an `Intl.RelativeTimeFormat` polyfill for fully localized relative time on that runtime. The keys here come from the docs site's own resources, passed to `PlocksProvider` via `i18nResources`, so switching locale also switches the site.

```tsx
import { Block, DataList, SegmentedControl, useI18n } from '@plocks/ui';

const LOCALES = [
  { label: 'EN', value: 'en' },
  { label: 'FR', value: 'fr' },
  { label: 'ES', value: 'es' },
];

const RELEASE_DATE = new Date(2026, 0, 15);

export function Demo() {
  const { t, locale, setLocale, formatNumber, formatDate } = useI18n();

  return (
    <Block align="flex-start" fullWidth maw={420}>
      <SegmentedControl data={LOCALES} value={locale} onChange={setLocale} />
      <DataList
        labelWidth={130}
        data={[
          { label: 't()', value: t('localization.exampleGreeting', { name: 'Ada' }) },
          { label: 'formatNumber()', value: formatNumber(1234.5, { style: 'currency', currency: 'EUR' }) },
          {
            label: 'formatDate()',
            value: formatDate(RELEASE_DATE, { year: 'numeric', month: 'long', day: 'numeric' }),
          },
        ]}
      />
    </Block>
  );
}
```
