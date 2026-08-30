// Aggregates locale JSON into resources compatible with PlatformBlocks's I18nProvider
import enCommon from './locales/en/common.json';
import esCommon from './locales/es/common.json';
import frCommon from './locales/fr/common.json';

export const docsI18nResources = {
  en: { translation: enCommon },
  es: { translation: esCommon },
  fr: { translation: frCommon }
};
