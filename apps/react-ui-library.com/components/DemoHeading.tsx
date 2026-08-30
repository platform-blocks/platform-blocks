import React from 'react';
import { Platform } from 'react-native';
import { Title, useTheme, type TitleProps } from '@platform-blocks/react-ui-library';

export interface DemoHeadingProps extends Omit<TitleProps, 'id' | 'children' | 'endIcon' | 'text'> {
  /** Fragment id. The heading element carries it, so `#id` links land on it. */
  id: string;
  children: string;
}

/**
 * A demo's heading, doubling as that demo's permalink.
 *
 * On web the heading sits inside an `<a href="#id">`, so it can be clicked,
 * focused, and right-click-copied like any other link, and a `#` marker fades in
 * on hover to advertise it. The click is handled rather than left to the browser:
 * the default fragment jump pushes a history entry that expo-router then has to
 * walk back through, so the address bar is rewritten with `replaceState` instead.
 *
 * The id lands on the `<h2>` itself (not the wrapping anchor) because
 * TableOfContents reads heading ids — sharing one id keeps the sidebar entry and
 * the permalink pointing at the same element instead of at two ids that happen to
 * slugify alike.
 *
 * Native has no address bar to link into, so it renders the plain heading.
 */
export function DemoHeading({ id, children, order = 2, ...titleProps }: DemoHeadingProps) {
  const theme = useTheme();

  const heading = (
    <Title
      order={order}
      id={id}
      {...titleProps}
      endIcon={
        Platform.OS === 'web'
          ? React.createElement(
            'span',
            {
              className: 'demo-anchor-hash',
              'aria-hidden': true,
              style: { color: theme.text.secondary },
            },
            '#'
          )
          : undefined
      }
    >
      {children}
    </Title>
  );

  if (Platform.OS !== 'web') return heading;

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Let modified clicks (open in new tab, save, …) do their normal thing.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ block: 'start' });
    window.history.replaceState(null, '', `#${id}`);
  };

  return React.createElement(
    'a',
    {
      href: `#${id}`,
      className: 'demo-anchor',
      onClick: handleClick,
      'aria-label': `Link to this section: ${children}`,
    },
    heading
  );
}
