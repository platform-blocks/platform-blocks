# @plocks/qrcode

A themeable QR code component for React Native and React Native Web. It includes its own QR encoder. Install with `@plocks/ui` and `react-native-svg`.

```sh
npm install @plocks/ui @plocks/qrcode react-native-svg
```

```tsx
import { QRCode } from '@plocks/qrcode';

<QRCode value="https://plocks.dev" size={200} label="Scan to open the docs" />
```

The default code uses black modules on white with a four-module quiet zone and medium error correction. `color`, `bg`, `gradient`, `moduleShape`, and `logo` customize its appearance. For a centered logo, use `errorCorrectionLevel="H"` and keep the logo small enough to leave most modules visible. Use `onError` to handle empty values or payloads that exceed QR capacity.

`QRCodeSVG` is also exported when only the code graphic is needed, without a caption or copy control.
