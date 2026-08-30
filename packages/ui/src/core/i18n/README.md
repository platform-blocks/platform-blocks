# PlatformBlocks I18n

Built-in lightweight internationalization layer.

## Features
- Locale & fallback locale
- Nested keys with dot notation
- Function & template ({{param}}) interpolation
- Number / Date / RelativeTime helpers bound to current locale
- `Text` component support via `tx` + `txParams` props

## Quick Start
```tsx
<PlatformBlocksProvider locale="en" fallbackLocale="en" i18nResources={{
  en: { translation: { greeting: 'Hello {{name}}' } },
  fr: { translation: { greeting: 'Bonjour {{name}}' } }
}}>
  <Text tx="greeting" txParams={{ name: 'World' }} />
</PlatformBlocksProvider>
```

## Manual Hook Usage
```tsx
import { useI18n } from '@platform-blocks/react-ui-library';
const { t, setLocale, formatNumber } = useI18n();
```

## Missing Keys
Provide `onMissingKey` inside `i18nResources` config via custom wrapper if you want logging.
