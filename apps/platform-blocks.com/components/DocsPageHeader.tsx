import React from 'react';
import { Title, type TitleProps } from '@platform-blocks/ui';

/**
 * Shared heading used across docs pages to keep hero titles consistent.
 * Defaults mirror the component detail page's <h1> — that page is the house
 * style every other docs page follows.
 */
export const DocsPageHeader: React.FC<TitleProps> = ({
  order = 1,
  size = 48,
  weight = 'bold',
  afterline = false,
  subtitleProps,
  style,
  ...rest
}) => {
  const mergedSubtitleProps = {
    variant: 'body',
    colorVariant: 'secondary',
    ...subtitleProps,
  } as TitleProps['subtitleProps'];

  return (
    <Title
      order={order}
      size={size}
      weight={weight}
      afterline={afterline}
      subtitleProps={mergedSubtitleProps}
      // Title lays its text out in a row, so a long page name (FAQ's, at 48px)
      // otherwise runs off the side of a phone instead of wrapping.
      style={[{ flexShrink: 1 }, style]}
      {...rest}
    />
  );
};
