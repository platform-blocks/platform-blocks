# @plocks/brands

Brand logos and branded buttons for React Native and React Native Web. Install with `@plocks/ui` and `react-native-svg`.

```sh
npm install @plocks/ui @plocks/brands react-native-svg
```

```tsx
import { BrandIcon, BrandButton, getBrand, brandNames } from '@plocks/brands';

<BrandIcon brand="github" size="lg" label="GitHub" />
<BrandButton brand="google" title="Continue with Google" onPress={signIn} />
<BrandButton brand="apple" primaryText="Download on the" secondaryText="App Store" onPress={openStore} />

const github = getBrand('github'); // label, button colors, and mark palette
console.log(brandNames, github.palette);
```

`BrandIcon` uses the official multicolor mark when available. Pass `color` to use a single color, or `variant="mono"` to force the monochrome mark. Unlabeled icons are decorative; provide `label` when the mark conveys information.

`BrandButton` defaults to a neutral surface with the brand mark. Set `variant="filled"` to use the brand color. Supplying `primaryText` or `secondaryText` renders a two-line store badge.
