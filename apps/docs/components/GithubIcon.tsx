import { BrandIcon } from '@plocks/brands';
import { useTheme } from '@plocks/ui';

/** GitHub mark in the current text color, including the CSS-variable web theme. */
export function GithubIcon() {
  const theme = useTheme();
  return <BrandIcon brand="github" size="sm" color={theme.text.primary} />;
}
