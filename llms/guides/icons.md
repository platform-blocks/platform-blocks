# Icons

`@plocks/ui@0.2.0` registers 216 icons by default,
using bundled Tabler-derived glyphs. These are the only strings `name`
accepts out of the box — anything else renders nothing, so **do not guess an
icon name**; pick one from this list or pass a component instead.

```tsx
import { Icon, IconButton } from '@plocks/ui';

<Icon name="check" size="sm" />
<IconButton icon="trash" onPress={remove} accessibilityLabel="Delete" />

// Not in the registry? Pass any icon component or element instead:
import { IconRocket } from '@tabler/icons-react-native';
<IconButton icon={IconRocket} onPress={launch} accessibilityLabel="Launch" />
```

There is no public API for registering additional names —
`registerIcon` / `registerIcons` exist in the source but are not exported
from the package root or from `@plocks/ui/Icon`. Pass a component
for anything outside this list.

## Names

accordion, alert-circle, alignCenter, alignJustify, alignLeft, alignRight, arrow-down, arrow-left, arrow-right, arrow-up, arrowDown, arrowLeft, arrowRight, arrowUp, autocomplete, avatar, badge, bar-chart, bell, block, bluetooth, bold, bolt, bone, bookmark, breadcrumbs, button, calendar, camera, card, carousel, cart, chart-area, chart-bar, chart-donut, chart-heatmap, chart-line, chart-pie, chart-scatter, chart-sparkline, chat, check, chevron-down, chevron-left, chevron-right, chevron-up, chevronDown, chevronLeft, chevronRight, chevrons-up-down, chevronUp, chip, circle, clock, close, code, cog, color, colors, compress, container, contrast, copy, database, datatable, delete, dialog, divider, dots, download, edit, ellipsis, ellipsis-h, email, emoji, error, exclamation, expand, external-link, eye, eyeOff, file, filter, flag, flex, folder, font, form, funnel, gallery, globe, grid, guitar, heading, headphones, heart, highlight, home, hook, image, image-off, indicator, info, input, italic, keyboard, keycap, knob, knobs, layer-mask, layers, line-chart, linechart, link, list, listOrdered, listUnordered, loader, loading, location, lock, mail, map, markdown, masonry, menu, message, message-circle, mic, microphone, minus, moon, music, number, package, paddingFrame, pagination, palette, paper, pause, person, phone, piano, pin, plan, play, plus, popover, progress, progress-shield, qrcode, question, quote, radio, rating, record, redo, refresh, repeat, richtext, rocket, rotate, save, search, select, selector-vertical, selectorVertical, settings, share, sheild, shop, slider, smile, sort, sparkles, speedometer, splitTrack, spoiler, spotlight, star, stepper, stop, strikethrough, success, sun, support, switch, table, tableofcontents, tabs, target, text, textarea, timeline, times, title, toast, toggle, toggleOff, toggleOn, tooltip, trash, tree, tuning, underline, undo, upload, user, volume-off, volume-up, volumeOff, warning, waveform, web, wifi, x
