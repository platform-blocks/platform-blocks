import { Block, Button, Flex, Select, useI18n } from '@platform-blocks/react-ui-library';

const LOCALES = [
  { label: 'English', value: 'en' },
  { label: 'Español', value: 'es' },
  { label: 'Français', value: 'fr' },
];

export function Demo() {
  const { t, locale, setLocale } = useI18n();

  return (
    <Flex>
      <Select
        options={LOCALES}
        value={locale}
        onChange={(value) => { if (value) setLocale(value); }}
      />
      <Button
        title={t('button.demo.submit')}
        w={200}
      />
    </Flex>
  );
}
