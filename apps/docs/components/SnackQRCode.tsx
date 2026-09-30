import React from 'react';
import { Block, Link, Text, useTheme } from '@plocks/ui';
import { QRCode } from '@plocks/qrcode';
import { SITE_URL } from '../config/routeSeo';
import { componentRoute } from '../utils/componentRoute';

interface SnackQRCodeProps {
  /** Component directory name, e.g. `Button`. */
  component: string;
}

/**
 * A QR that opens the component's documentation page on a phone without
 * typing a URL.
 */
export const SnackQRCode: React.FC<SnackQRCodeProps> = ({ component }) => {
  const theme = useTheme();

  // Absolute, and deliberately always production: a QR is scanned by a device
  // that has no origin to resolve a relative path against, and localhost would
  // not resolve on that device either.
  const pageUrl = `${SITE_URL}${componentRoute(component)}`;

  return (
    <Block align="center" gap="sm">
      <QRCode
        value={pageUrl}
        size={148}
        quietZone={2}
        // The QR has to stay high-contrast in both schemes, and the theme's own
        // surface/text pair is exactly that.
        color={theme.text.primary}
        bg={theme.backgrounds?.surface ?? theme.colors.gray[0]}
        accessibilityLabel={`QR code linking to the ${component} documentation page`}
      />
      <Text variant="small" c="muted" ta="center">
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
