import React from 'react';
import { Block, Link, QRCode, Text, useTheme } from '@platform-blocks/ui';
import { SITE_URL } from '../config/routeSeo';

interface SnackQRCodeProps {
  /** Component directory name, e.g. `Button`. */
  component: string;
  /**
   * Snack URL for the whole component, or null when none of its demos can run
   * there. Used only as the availability gate — the QR encodes the docs page,
   * not this (see below).
   */
  snackUrl: string | null;
}

/**
 * Sidebar companion to `TryInExpoGoButton`: a QR that gets the component's
 * demos onto a phone without typing a URL. Renders nothing when the component
 * has no runnable Snack, since there would be nothing to try on the other end.
 *
 * The QR encodes the docs page rather than the Snack itself. A Snack URL
 * carries every demo's source in its query string — several thousand
 * characters, well past the ~2,953 bytes a QR code can hold at all — so
 * encoding one produces a code that does not scan. The page it points to
 * already has "Try in Expo Go" on it, one tap from the same Snack.
 */
export const SnackQRCode: React.FC<SnackQRCodeProps> = ({ component, snackUrl }) => {
  const theme = useTheme();

  if (!snackUrl) return null;

  // Absolute, and deliberately always production: a QR is scanned by a device
  // that has no origin to resolve a relative path against, and localhost would
  // not resolve on that device either.
  const pageUrl = `${SITE_URL}/components/${component}`;

  return (
    <Block align="center" gap="sm">
      <QRCode
        value={pageUrl}
        size={148}
        quietZone={2}
        // The QR has to stay high-contrast in both schemes, and the theme's own
        // surface/text pair is exactly that.
        color={theme.text.primary}
        backgroundColor={theme.backgrounds?.surface ?? theme.colors.gray[0]}
        accessibilityLabel={`QR code linking to the ${component} documentation page`}
      />
      <Text variant="small" color="muted" align="center">
        Scan to open this page on your phone
      </Text>
      {/* The same URL in readable form, for anyone who would rather type or copy
          it than scan. The scheme is dropped — it is noise at this width. */}
      <Link href={pageUrl} size="xs" target="_blank" accessibilityLabel={pageUrl}>
        {pageUrl.replace(/^https?:\/\//, '')}
      </Link>
    </Block>
  );
};

export default SnackQRCode;
