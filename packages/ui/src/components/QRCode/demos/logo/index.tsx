import { QRCode } from '@platform-blocks/ui';

export function Demo() {
  return (
    <QRCode
      value="https://platform-blocks.com"
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
