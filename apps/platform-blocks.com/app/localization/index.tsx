import React from 'react';
import { Text, Button, useI18n, ToggleBar, Notice, Flex, Block, CodeBlock } from '@platform-blocks/ui';
import { useBrowserTitle, formatPageTitle } from 'hooks/useBrowserTitle';
import { DocsPage } from 'components';
import { DocsPageHeader } from '../../components/DocsPageHeader';
import { LOCALIZATION_DEMO_LOCALES, LOCALIZATION_STEPS } from '../../config/localization';

function LocalizationContent() {
  const { t, setLocale, locale } = useI18n();

  const locales = LOCALIZATION_DEMO_LOCALES;

  return (
    <DocsPage>
      <Block gap="md" mb="lg">
        <DocsPageHeader
          tx="localization.title"
          action={
            <Notice icon="globe">
              {/* Decorative sample copy, not a section heading — as an h4 it was
                  the only heading between the page h1 and its h2 sections. */}
              <Text size="lg" weight="semibold">{t('localization.helloWorld')}</Text>
            </Notice>
          }
        />
        <Text tx="localization.intro" colorVariant="muted" />
        <Flex direction="row" align="center" justify="space-between" mb="md">
          <Button
            title={t('actions.switchLocale')}
            onPress={() => setLocale(locale.startsWith('en') ? 'fr' : 'en')}
          />
          <ToggleBar
            value={[locale]}
            onChange={(vals) => { const next = vals[0]; if (typeof next === 'string') setLocale(next); }}
            options={locales.map(l => ({ value: l, label: l.toUpperCase() }))}
          />
        </Flex>

        <Flex direction="column" gap="xl">
          {LOCALIZATION_STEPS.map(({ key, fileName, snippet, highlightLines }) => (
            <React.Fragment key={key}>
              <Text tx={`localization.steps.${key}`} />
              <CodeBlock files={[{ name: fileName }]} showLineNumbers highlightLines={highlightLines}>
                {snippet}
              </CodeBlock>
            </React.Fragment>
          ))}
        </Flex>
      </Block>
    </DocsPage>
  );
}

export default function LocalizationPage() {
  // Update browser title
  useBrowserTitle(formatPageTitle('Localization'));

  return <LocalizationContent />;
}
