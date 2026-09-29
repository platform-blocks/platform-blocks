/** Values passed to `t(key, params)`: handed to function entries and interpolated into `{{name}}` placeholders. */
export type TranslationParams = Record<string, unknown>;

/**
 * A translation computed from its params (plurals and the like). Declared with
 * a method signature so an entry may annotate the params it reads —
 * `({ count }: { count: number }) => …` — instead of narrowing `unknown`s.
 */
export type TranslationFunction = {
  bivarianceHack(params: TranslationParams): string;
}['bivarianceHack'];

/**
 * Translations by key. A nested dictionary is addressed with a dot-separated
 * key: `{ form: { submit: 'Send' } }` → `t('form.submit')`.
 */
export type TranslationDictionary = {
  [key: string]: string | TranslationFunction | TranslationDictionary;
};

export interface I18nResources {
  [locale: string]: {
    translation: TranslationDictionary;
  };
}

export interface I18nConfig {
  locale: string;          // current active locale code (e.g. 'en', 'en-US')
  fallbackLocale: string;  // fallback when key missing in current locale
  resources: I18nResources; // registered resources
  onMissingKey?: (key: string, locale: string) => void; // diagnostics hook
  pluralSeparator?: string; // default: '::'
}

export interface I18nContextValue {
  locale: string;
  setLocale: (next: string) => void;
  t: (key: string, params?: TranslationParams) => string;
  formatNumber: (value: number, opts?: Intl.NumberFormatOptions) => string;
  formatDate: (value: Date, opts?: Intl.DateTimeFormatOptions) => string;
  formatRelativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit, opts?: Intl.RelativeTimeFormatOptions) => string;
  hasKey: (key: string) => boolean;
}
