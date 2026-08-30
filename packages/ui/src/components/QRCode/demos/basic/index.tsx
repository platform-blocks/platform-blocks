import { QRCode } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <QRCode
      value="https://react-ui-library.com"
      size={168}
      quietZone={2}
      label="Scan to open the React UI Library docs."
    />
  );
}
