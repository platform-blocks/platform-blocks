import { QRCode } from '@plocks/qrcode';

export function Demo() {
  return (
    <QRCode
      value="https://plocks.dev"
      size={176}
      quietZone={2}
      logo={{
        uri: require('../../../../assets/logo-mark.png'),
        size: 48,
        borderRadius: 8
      }}
    />
  );
}
