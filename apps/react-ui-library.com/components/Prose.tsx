import React, { useMemo } from 'react';
import { Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Markdown, Text, useTheme } from '@platform-blocks/react-ui-library';

export interface ProseProps {
  /**
   * Inline markdown — links `[text](href)`, `` `code` ``, `**bold**`, `_italics_`.
   * Block syntax (headings, lists, fences) renders too, but the paragraph
   * styling here is tuned for the one-or-two-sentence lead-ins docs pages use.
   */
  children: string;
  /** Text variant applied to each paragraph. */
  variant?: 'p' | 'small';
  /** Text color token applied to each paragraph. */
  color?: string;
}

/** A scheme (`https:`, `mailto:`) or a protocol-relative URL leaves the site. */
const isExternalHref = (href: string) =>
  /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//');

/**
 * Renders a prose string that may carry inline markup.
 *
 * The config modules behind the docs pages (config/gettingStarted.ts and
 * friends) are deliberately JSX-free so scripts/generate-llms.ts can import
 * them under Node and emit /llms/*.md from the exact same source the site
 * renders. That rules out putting a `<Link>` element in the config — but not
 * markdown, which the generator already treats as its output format, so
 * `[@platform-blocks/react-ui-library](https://npmjs.com/...)` in a `lead` becomes a real
 * anchor here and a real markdown link there, from one string.
 *
 * Matches `<Text variant="p" color="secondary">` so replacing a plain Text with
 * this leaves the page geometry untouched — the surrounding Column supplies the
 * spacing, so paragraphs carry no margin of their own.
 */
export const Prose: React.FC<ProseProps> = ({
  children,
  variant = 'p',
  color = 'secondary',
}) => {
  const theme = useTheme();
  const router = useRouter();

  const components = useMemo(
    () => ({
      paragraph: ({ children: content }: { children: React.ReactNode }) => (
        <Text variant={variant} color={color} as="div">
          {content}
        </Text>
      ),
      link: ({ href, children: content }: { href: string; children: React.ReactNode }) => {
        const external = isExternalHref(href);

        // A real anchor on web, so the link is crawlable and cmd-click,
        // middle-click, and "copy link address" all behave — the Markdown
        // default preventDefault()s every click, which loses those.
        if (Platform.OS === 'web') {
          return React.createElement(
            'a',
            {
              href,
              target: external ? '_blank' : undefined,
              rel: external ? 'noopener noreferrer' : undefined,
              style: {
                color: theme.text.link,
                textDecoration: 'underline',
                cursor: 'pointer',
              },
              // Internal hrefs stay client-side transitions, except when the
              // reader explicitly asked the browser for something else.
              onClick: external
                ? undefined
                : (event: any) => {
                    if (event.defaultPrevented) return;
                    if (event.button !== 0) return;
                    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                    event.preventDefault();
                    router.push(href as never);
                  },
            },
            content
          );
        }

        return (
          <Text
            variant="u"
            style={{ color: theme.text.link }}
            onPress={() =>
              external
                ? Linking.openURL(href).catch(() => undefined)
                : router.push(href as never)
            }
          >
            {content}
          </Text>
        );
      },
    }),
    [theme, router, variant, color]
  );

  return <Markdown components={components as never}>{children}</Markdown>;
};

export default Prose;
