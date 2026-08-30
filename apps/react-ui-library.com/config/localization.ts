/**
 * Plain-data source of truth for the Localization page.
 *
 * The prose lives in the i18n bundles (`localization.*` keys in
 * i18n/locales/<locale>/common.json); this module owns the code snippets and
 * the order the steps are shown in, so the screen and
 * scripts/generate-llms.ts (which renders /llms/guides/localization.md from
 * the English bundle) stay in step.
 */

export const LOCALIZATION_RESOURCES_SNIPPET = `
import en from './locales/en/common.json';
import fr from './locales/fr/common.json';
import es from './locales/es/common.json';

export const resources = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es }
};`;

export const LOCALIZATION_PROVIDER_SNIPPET = `
import { I18nProvider } from '@platform-blocks/react-ui-library';
import { resources } from './resources';

export function App() {
  return (
    <I18nProvider initial={{ resources, locale: 'en', fallbackLocale: 'en' }}>
      <Root />
    </I18nProvider>
  );
}`;

export const LOCALIZATION_USAGE_SNIPPET = `
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
}`;

export interface LocalizationStep {
  /** i18n key under `localization.steps` holding the step copy. */
  key: string;
  /** Short heading for the generated LLM guide; the page uses the i18n copy. */
  title: string;
  /** File name shown on the snippet's code block. */
  fileName: string;
  snippet: string;
  /** Lines the page's code block highlights. Ignored by the generated guide. */
  highlightLines?: string[];
}

/** Rendered in order on the page and in the generated LLM guide. */
export const LOCALIZATION_STEPS: LocalizationStep[] = [
  {
    key: 'resources',
    title: 'Create resource files',
    fileName: 'resources.ts',
    snippet: LOCALIZATION_RESOURCES_SNIPPET,
    // highlightLines: ['1', '2', '3'],
  },
  { key: 'provider', title: 'Wrap the app in I18nProvider', fileName: 'App.tsx', snippet: LOCALIZATION_PROVIDER_SNIPPET },
  { key: 'switch', title: 'Translate and switch locales', fileName: 'Greeting.tsx', snippet: LOCALIZATION_USAGE_SNIPPET },
];

/**
 * Extra `localization.steps` keys that are documented but have no snippet on
 * the page. They still carry useful API guidance, so the LLM guide appends them
 * as plain notes.
 */
export const LOCALIZATION_NOTE_KEYS = ['usageTx', 'usageHook', 'format', 'missing'];

/** Locales the page's switcher offers. */
export const LOCALIZATION_DEMO_LOCALES = ['en', 'fr', 'es'] as const;
