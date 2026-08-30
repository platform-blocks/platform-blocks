# Localization

React UI Library ships a lightweight i18n layer. Provide locale resource objects, wrap your app with I18nProvider, then translate via the tx prop or the useI18n hook.

Docs: https://react-ui-library.com/localization

## Create resource files

Create JSON resource files per locale.

`resources.ts`

```tsx
import en from './locales/en/common.json';
import fr from './locales/fr/common.json';
import es from './locales/es/common.json';

export const resources = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es }
};
```

## Wrap the app in I18nProvider

Wrap your app in the I18nProvider component.

`App.tsx`

```tsx
import { I18nProvider } from '@platform-blocks/react-ui-library';
import { resources } from './resources';

export function App() {
  return (
    <I18nProvider initial={{ resources, locale: 'en', fallbackLocale: 'en' }}>
      <Root />
    </I18nProvider>
  );
}
```

## Translate and switch locales

Switch locales by calling setLocale('fr') etc. Components re-render automatically.

`Greeting.tsx`

```tsx
import { Alert, Text, ToggleButton, ToggleGroup, useI18n } from '@platform-blocks/react-ui-library';

const LOCALES = ['en', 'fr', 'es'];

function Greeting() {
  const { t, setLocale, locale } = useI18n();
  return (
    <>
      <ToggleGroup
        value={locale}
        exclusive
        required
        onChange={(next) => { if (typeof next === 'string') setLocale(next); }}
      >
        {LOCALES.map((l) => (
          <ToggleButton key={l} value={l}>{l.toUpperCase()}</ToggleButton>
        ))}
      </ToggleGroup>
      <Alert icon='globe'>
        <Text tx='localization.helloWorld' />
      </Alert>
      <Text tx='localization.exampleGreeting' txParams={{ name: 'Ada' }} />
      <Text>{t('localization.current', { locale })}</Text>
    </>
  );
}
```

## Notes

- Use <Text tx="localization.exampleGreeting" txParams={{ name: 'Ada' }} /> to render translated copy.
- Or call const { t, setLocale, locale } = useI18n(); then t('localization.exampleGreeting', { name: 'Ada' }).
- Use formatDate / formatNumber / formatRelativeTime helpers for localized formatting.
- Missing keys fall back to fallbackLocale then return the key name (configurable via onMissingKey).
