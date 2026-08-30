import React from 'react';
import { Text, useI18n, ToggleButton, ToggleGroup, Alert, Flex, Block, CodeBlock } from '@platform-blocks/react-ui-library';
import { useBrowserTitle, formatPageTitle } from 'hooks/useBrowserTitle';
import { DocsPage } from 'components';
import { DocsPageHeader } from '../../components/DocsPageHeader';
import { LOCALIZATION_DEMO_LOCALES, LOCALIZATION_STEPS } from '../../config/localization';

/**
 * Live locale switcher, rendered just above the "switch locales" step so the
 * copy and the snippet underneath describe the control the reader just used.
 * `exclusive` + `required` keep exactly one locale active, and the greeting
 * next to it re-renders on every change.
 */
function LocaleSwitcher() {
  const { t, setLocale, locale } = useI18n();

  return (
    <Flex direction="row" align="center" gap="md" wrap="wrap" fullWidth>
      <ToggleGroup
        value={locale}
        exclusive
        required
        onChange={(next) => { if (typeof next === 'string') setLocale(next); }}
      >
        {LOCALIZATION_DEMO_LOCALES.map((l) => (
          <ToggleButton key={l} value={l}>{l.toUpperCase()}</ToggleButton>
        ))}
      </ToggleGroup>
      <Alert icon="globe" style={{ flexGrow: 1 }}>
        {/* Decorative sample copy, not a section heading — as an h4 it was
            the only heading between the page h1 and its h2 sections. */}
        <Text size="lg" weight="semibold">{t('localization.helloWorld')}</Text>
      </Alert>
    </Flex>
  );
}

function LocalizationContent() {
  return (
    <DocsPage>
      <Block gap="md" mb="lg">
        <DocsPageHeader tx="localization.title" />
        <Text tx="localization.intro" color="muted" />

        <Flex direction="column" gap="xl">
          {LOCALIZATION_STEPS.map(({ key, fileName, snippet, highlightLines }) => (
            <React.Fragment key={key}>
              {key === 'switch' ? <LocaleSwitcher /> : null}
              <Text tx={`localization.steps.${key}`} />
              <CodeBlock files={[{ name: fileName }]} highlightLines={highlightLines}>
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
