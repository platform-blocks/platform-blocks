# plocks brand

The mark is seven blocks in a 3 × 3 grid that make a lowercase **p**: a red row, a blue row, and the yellow stem.

## Files

| File | Use |
| --- | --- |
| `svg/lockup.svg`, `svg/lockup-dark.svg` | Mark + wordmark, for light and dark backgrounds. The default logo. |
| `svg/mark.svg` | The mark alone, where the name is already on screen. Works on light and dark backgrounds. |
| `svg/wordmark.svg`, `svg/wordmark-dark.svg` | The word alone. |
| `svg/icon.svg` | App icon, full bleed — the platform applies its own mask. |
| `svg/icon-rounded.svg` | App icon with rounded corners, for places that show it unmasked. |
| `svg/icon-alt.svg` | Light alternate icon. |
| `svg/icon-maskable.svg`, `svg/icon-adaptive-foreground.svg` | PWA maskable icon; Android adaptive foreground (background `#18161D`). |
| `svg/icon-16.svg`, `svg/icon-32.svg` | Pixel-grid tiles for `favicon.ico`. |
| `svg/favicon.svg` | Browser-tab icon. |
| `og-image.html` | The 1200 × 630 social card. |
| `png/` | Renders for places that can't show SVG (npm READMEs, avatars). |

The SVGs are the sources. `npm run brand:build` renders every PNG, the `.ico` and the social card from them into `brand/png`, `apps/docs/public` and `apps/docs/assets` — edit a source and rerun instead of touching a render.

The docs site draws the logo from the same geometry in `apps/docs/components/layout/PlocksLogo.tsx`. On the web it sets the word as live text rather than outlines, in `apps/docs/public/fonts/plocks-wordmark.woff2` — Unbounded SemiBold cut down to the six letters, built by `wordmark-font.py` (instructions at its top).

## Color

| Name | Hex | Use |
| --- | --- | --- |
| Red | `#EF4035` | The mark's top row |
| Blue | `#2F6FEB` | The mark's middle row |
| Yellow | `#FFC21A` | The mark's stem, and small highlights on dark backgrounds. Never text on a light background — it fails contrast. |
| Ink | `#18161D` | The wordmark on light backgrounds; icon background |
| Paper | `#F4F4F1` | The wordmark on dark backgrounds; the light alternate icon's background |
| Steel | `#64616C` | Secondary text beside the brand |

The blocks keep their colors on every background; only the wordmark switches between ink and paper. The component library's default theme stays neutral blue; these colors are the brand's, not the theme's.

## Type

- **Unbounded SemiBold** — the wordmark (outlined, tracked −0.035em) and display headings.
- **Figtree** — text beside the brand, e.g. on the social card.

Both are on Google Fonts under the SIL Open Font License.

## Use

- Write the name lowercase — **plocks** — including at the start of a sentence. `Plocks` appears only in code identifiers (`PlocksProvider`).
- In the lockup the mark is the larger partner: the word's font size is 1000/1360 of the mark's height, its ascender-to-descender span is centred on the mark, and one block's width separates them.
- Keep clear space around the lockup of at least one block.
- Smallest sizes: the lockup at 24 px tall, the mark at 16 px (use `favicon.svg` or `icon-16.svg` there, not a scaled-down master).
- Don't split the name into "p" + "locks", recolor or reorder the blocks' colors, add studs or depth, or color the wordmark.
