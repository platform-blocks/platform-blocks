import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { DataList, Icon, Link, useTheme } from '@plocks/ui';
import { BrandIcon } from '@plocks/brands';
import { GITHUB_REPO } from '../config/urls';
import { SITE_URL } from '../config/routeSeo';
import type { ComponentMeta } from '../utils/demosLoader';

interface ComponentResourceLinksProps {
  /** Component directory name, e.g. `Button` */
  component: string;
  /** Generated metadata for the component (may be missing source fields on stale artifacts) */
  meta?: ComponentMeta | null;
}

const GITHUB_BLOB = `${GITHUB_REPO}/blob/main`;

/**
 * Site-relative on web (so it works on localhost, previews, and prod alike);
 * absolute on native, where there is no origin to resolve against.
 */
const siteUrl = (path: string) => (Platform.OS === 'web' ? path : `${SITE_URL}${path}`);

interface ResourceRow {
  label: string;
  href: string;
  text: string;
  icon: React.ReactNode;
}

/**
 * Source / LLM docs / package links shown under the page title, mirroring the
 * reference table shown at the top of each component page.
 */
export const ComponentResourceLinks: React.FC<ComponentResourceLinksProps> = ({
  component,
  meta,
}) => {
  const theme = useTheme();
  const textColor = theme.text?.primary;
  const iconColor = theme.text?.secondary ?? textColor;

  const rows = useMemo<ResourceRow[]>(() => {
    // `sourcePath` / `packageName` come from generate-demos.ts. Fall back to the
    // package layout when the generated artifacts predate them.
    const isCharts = meta?.category === 'charts';
    const packageName = meta?.packageName || (isCharts ? '@plocks/charts' : '@plocks/ui');
    const sourcePath = meta?.sourcePath
      || `packages/${isCharts ? 'charts' : 'ui'}/src/components/${component}`;

    return [
      {
        label: 'Source',
        href: `${GITHUB_BLOB}/${sourcePath}`,
        text: 'View source code',
        icon: <BrandIcon brand="github" size="sm" invertInDarkMode />,
      },
      {
        label: 'LLM docs',
        href: siteUrl(`/llms/components/${component}.md`),
        text: 'LLM documentation',
        icon: <Icon name="markdown" size="sm" color={iconColor} />,
      },
      {
        label: 'Package',
        href: `https://www.npmjs.com/package/${packageName}`,
        text: packageName,
        icon: <BrandIcon brand="npm" size="sm" />,
      },
    ];
  }, [component, iconColor, meta]);

  return (
    <DataList orientation="horizontal" size="sm" labelWidth={110} mb={24}>
      {rows.map(({ label, href, text, icon }) => (
        <DataList.Item key={label}>
          <DataList.ItemLabel>{label}</DataList.ItemLabel>
          {/* Rendered outside DataList.ItemValue so the anchor is not nested in a
              <Text>, which React Native does not allow for pressables. */}
          <View style={styles.value}>
            <View style={styles.icon}>{icon}</View>
            {/* `target` alone opens a new tab with rel=noopener; `external` is
                skipped so the row icon carries the signal instead of a ↗ glyph. */}
            <Link
              href={href}
              target="_blank"
              variant="hover-underline"
              size="sm"
              c={textColor}
            >
              {text}
            </Link>
          </View>
        </DataList.Item>
      ))}
    </DataList>
  );
};

const styles = StyleSheet.create({
  value: {
    flex: 1,
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  icon: {
    width: 16,
    alignItems: 'center',
  },
});

export default ComponentResourceLinks;
