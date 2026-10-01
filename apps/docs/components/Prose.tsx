import React, { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Markdown } from '@plocks/code';
import { Link, Text, useTheme } from '@plocks/ui';

export interface ProseProps {
  /** Inline markdown with links and block syntax. */
  children: string;
  variant?: 'p' | 'small';
  color?: string;
}

const isExternalHref = (href: string) =>
  /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//');

/** Renders the same markdown source that the docs scripts publish for readers. */
export const Prose: React.FC<ProseProps> = ({ children, variant = 'p', color = 'secondary' }) => {
  const theme = useTheme();
  const router = useRouter();

  const components = useMemo(
    () => ({
      paragraph: ({ children: content }: { children: React.ReactNode }) => (
        <Text variant={variant} c={color} as="div">{content}</Text>
      ),
      link: ({ href, children: content }: { href: string; children: React.ReactNode }) => {
        const external = isExternalHref(href);
        return (
          <Link
            href={href}
            target={external ? '_blank' : undefined}
            c={theme.text.link}
            onNavigate={external ? undefined : () => router.push(href as never)}
          >
            {content}
          </Link>
        );
      },
    }),
    [theme, router, variant, color]
  );

  return <Markdown components={components as never}>{children}</Markdown>;
};

export default Prose;
