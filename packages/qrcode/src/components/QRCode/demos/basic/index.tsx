import { QRCode } from '@plocks/qrcode';

export function Demo() {
  return (
    <QRCode
      value="https://plocks.dev"
      size={168}
      quietZone={2}
      label="Scan to open the plocks docs."
    />
  );
}
