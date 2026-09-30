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
