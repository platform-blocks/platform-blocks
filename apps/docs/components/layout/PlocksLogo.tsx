import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { G, Path, Rect } from 'react-native-svg';
import { useDeviceInfo, useTheme } from '@plocks/ui';

export interface PlocksLogoProps {
  /** The mark's height in px. The wordmark is sized from it. */
  size: number;
  /** The mark alone, without the wordmark. */
  markOnly?: boolean;
}

// brand/svg/lockup.svg, in its units: 400-unit blocks on a 480-unit step make an
// 1360 × 1360 mark, one block of space follows it, and the word — Unbounded at
// 1000 units — starts at 1760 with its baseline at 982.5, which centres the l's
// ascender-to-p's-descender span (770 + 165) on the mark.
const MARK_WIDTH = 1360;
const MARK_HEIGHT = 1360;
const LOCKUP_WIDTH = 5666;
const CELL = 400;
const STEP = 480;
const RADIUS = 100;
const WORD_X = 1760;
const BASELINE = 982.5;
const FONT_SIZE = 1000;

/** [column, row, fill]: a red row, a blue row, then the yellow stem (brand/svg/mark.svg). */
export const MARK_BLOCKS: readonly (readonly [column: number, row: number, fill: string])[] = [
  [0, 0, '#EF4035'],
  [1, 0, '#EF4035'],
  [2, 0, '#EF4035'],
  [0, 1, '#2F6FEB'],
  [1, 1, '#2F6FEB'],
  [2, 1, '#2F6FEB'],
  [0, 2, '#FFC21A'],
];

/**
 * The @font-face family +html.tsx declares for public/fonts/plocks-wordmark.woff2:
 * Unbounded SemiBold cut down to the six letters of the name (about 1 KB), with its
 * ascent and descent set to the l's ascender and the p's descender. A line
 * height of 0.935em is then exactly the glyphs' span, so the text box centres on
 * the mark the same way in every browser.
 */
const WORDMARK_FONT = 'PlocksWordmark';

/** "plocks" in Unbounded SemiBold, outlined, baseline at y = 0 (brand/svg/wordmark.svg). */
const WORDMARK = 'M60 165L60-570L245-570L245-398L238-374L238-226L245-182L245 165L60 165ZM184-285L184-285Q199-377 241-444Q283-511 347.5-548.5Q412-586 491-586L491-586Q575-586 638.5-548Q702-510 738-442.5Q774-375 774-285L774-285Q774-195 738-127.5Q702-60 638.5-22Q575 16 491 16L491 16Q411 16 347.5-21.5Q284-59 242-126.5Q200-194 184-285ZM586-285L586-285Q586-331 567-366.5Q548-402 514.5-422.5Q481-443 438-443L438-443Q394-443 354-422.5Q314-402 284.5-366.5Q255-331 239-285L239-285Q255-239 284.5-203.5Q314-168 354-147.5Q394-127 438-127L438-127Q481-127 514.5-147.5Q548-168 567-203.5Q586-239 586-285ZM833 0L833-770L1018-770L1018 0L833 0ZM1435 16L1435 16Q1327 16 1246-22Q1165-60 1120-128Q1075-196 1075-285L1075-285Q1075-375 1120-442.5Q1165-510 1246.5-548Q1328-586 1435-586L1435-586Q1543-586 1624.5-548Q1706-510 1751-442.5Q1796-375 1796-285L1796-285Q1796-195 1751-127.5Q1706-60 1624.5-22Q1543 16 1435 16ZM1435-124L1435-124Q1490-124 1528.5-143.5Q1567-163 1587.5-199Q1608-235 1608-285L1608-285Q1608-335 1587.5-371Q1567-407 1528.5-426.5Q1490-446 1435-446L1435-446Q1382-446 1343-426.5Q1304-407 1283-371Q1262-335 1262-285L1262-285Q1262-235 1283-199Q1304-163 1343-143.5Q1382-124 1435-124ZM2334-237L2519-237Q2511-162 2463.5-105Q2416-48 2341.5-16Q2267 16 2174 16L2174 16Q2071 16 1992-22Q1913-60 1869-128Q1825-196 1825-285L1825-285Q1825-374 1869-442Q1913-510 1992-548Q2071-586 2174-586L2174-586Q2267-586 2341.5-554Q2416-522 2463.5-465.5Q2511-409 2519-333L2519-333L2334-333Q2323-388 2279.5-417Q2236-446 2174-446L2174-446Q2125-446 2088.5-427Q2052-408 2032-372Q2012-336 2012-285L2012-285Q2012-234 2032-198Q2052-162 2088.5-143Q2125-124 2174-124L2174-124Q2237-124 2280-154.5Q2323-185 2334-237L2334-237ZM2755-770L2755-151L2704-168L3031-570L3230-570L2737 0L2570 0L2570-770L2755-770ZM3034 0L2869-279L3007-380L3245 0L3034 0ZM3906-183L3906-183Q3906-119 3868.5-74.5Q3831-30 3759-7Q3687 16 3584 16L3584 16Q3479 16 3400-10Q3321-36 3277-83Q3233-130 3230-192L3230-192L3419-192Q3425-167 3447.5-148Q3470-129 3506-119.5Q3542-110 3591-110L3591-110Q3657-110 3691-124Q3725-138 3725-166L3725-166Q3725-187 3700.5-198Q3676-209 3613-214L3613-214L3509-222Q3411-229 3353-253Q3295-277 3270.5-314Q3246-351 3246-397L3246-397Q3246-460 3285.5-502Q3325-544 3395-565Q3465-586 3559-586L3559-586Q3653-586 3726.5-561Q3800-536 3844.5-492Q3889-448 3895-389L3895-389L3706-389Q3702-409 3684.5-426Q3667-443 3634.5-453.5Q3602-464 3550-464L3550-464Q3491-464 3460-451Q3429-438 3429-413L3429-413Q3429-394 3448-383Q3467-372 3520-367L3520-367L3655-357Q3751-349 3805.5-326.5Q3860-304 3883-268Q3906-232 3906-183Z';

/**
 * The plocks lockup, or the mark alone. Decorative: wrap it in something that
 * names it (a link labelled "plocks home", a heading). The blocks keep their
 * colors in both schemes; the word is the theme's primary text color — a CSS
 * variable on the prerendered site, so it is in the reader's scheme at first paint.
 *
 * On the web the word is live text in the wordmark font; native has no such
 * font loaded, so it draws the outlines from brand/svg/wordmark.svg instead.
 */
export function PlocksLogo({ size, markOnly = false }: PlocksLogoProps) {
  const { platform: { isWeb } } = useDeviceInfo();
  const theme = useTheme();
  const ink = theme.text.primary;
  const scale = size / MARK_HEIGHT;
  const fontSize = FONT_SIZE * scale;
  const blocks = MARK_BLOCKS.map(([column, row, fill]) => (
    <Rect key={`${column}${row}`} x={column * STEP} y={row * STEP} width={CELL} height={CELL} rx={RADIUS} fill={fill} />
  ));

  if (markOnly || isWeb) {
    return (
      <View aria-hidden style={styles.row}>
        <Svg width={MARK_WIDTH * scale} height={size} viewBox={`0 0 ${MARK_WIDTH} ${MARK_HEIGHT}`}>
          {blocks}
        </Svg>
        {!markOnly && (
          <Text
            style={{
              marginLeft: (WORD_X - MARK_WIDTH) * scale,
              fontFamily: WORDMARK_FONT,
              fontWeight: '600',
              fontSize,
              lineHeight: fontSize * 0.935,
              letterSpacing: fontSize * -0.035,
              color: ink,
            }}
          >
            plocks
          </Text>
        )}
      </View>
    );
  }

  return (
    <View aria-hidden>
      <Svg width={LOCKUP_WIDTH * scale} height={size} viewBox={`0 0 ${LOCKUP_WIDTH} ${MARK_HEIGHT}`}>
        {blocks}
        <G x={WORD_X} y={BASELINE}>
          <Path d={WORDMARK} fill={ink} />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
