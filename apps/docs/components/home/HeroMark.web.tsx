import React, { useState } from 'react';
import { BOARD, DROP_ORDER, SLOT, type HeroMarkProps } from './heroMarkLayout';

/**
 * The mark assembling itself on the homepage: a board of empty slots fades in,
 * the seven blocks drop into theirs from the bottom up, and the finished mark
 * clicks. Every few seconds after that a small ripple runs up through it, and
 * a click replays the whole thing.
 *
 * The web build draws plain SVG animated by the CSS below rather than going
 * through react-native-svg and a JS animation driver. The CSS ships in the
 * prerendered HTML, so the animation starts at first paint instead of after
 * hydration. `prefers-reduced-motion` switches every animation off, leaving
 * the resting state — the finished mark on its board.
 */
export function HeroMark({ size }: HeroMarkProps) {
  // Remounting the SVG restarts its CSS animations.
  const [run, setRun] = useState(0);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <svg
        key={run}
        className="plocks-hero-mark"
        viewBox={BOARD.viewBox}
        height={size}
        width={(size * BOARD.width) / BOARD.height}
        aria-hidden="true"
        onClick={() => setRun((value) => value + 1)}
      >
        {BOARD.slots.map(({ x, y, delay, opacity }) => (
          <rect
            key={`${x},${y}`}
            className="slot"
            x={x}
            y={y}
            width={SLOT.size}
            height={SLOT.size}
            rx={SLOT.radius}
            style={{ '--delay': `${delay}ms`, '--rest': opacity } as React.CSSProperties}
          />
        ))}
        <g className="mark">
          {DROP_ORDER.map(({ x, y, fill, tilt }, order) => (
            <rect
              key={`${x},${y}`}
              className="block"
              x={x}
              y={y}
              width={SLOT.size}
              height={SLOT.size}
              rx={SLOT.radius}
              fill={fill}
              style={{ '--order': order, '--tilt': `${tilt}deg` } as React.CSSProperties}
            />
          ))}
        </g>
      </svg>
    </>
  );
}

const css = `
.plocks-hero-mark {
  display: block;
  overflow: visible;
  color: var(--plocks-text-primary, #1C1C1E);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
.plocks-hero-mark rect, .plocks-hero-mark .mark { transform-box: fill-box; }

.plocks-hero-mark .slot {
  fill: currentColor;
  opacity: var(--rest);
  transform-origin: center;
  animation: plocks-slot 420ms cubic-bezier(.2, .8, .2, 1) var(--delay) backwards;
}

/* Each block falls, squashes as it lands, rebounds once and settles. */
.plocks-hero-mark .block {
  transform-origin: 50% 100%;
  animation:
    plocks-drop 620ms linear calc(360ms + var(--order) * 120ms) backwards,
    plocks-ripple 7s ease-in-out calc(2600ms + var(--order) * 90ms) infinite;
}

.plocks-hero-mark .mark {
  transform-origin: 50% 100%;
  animation: plocks-click 360ms cubic-bezier(.3, 1.6, .5, 1) 1340ms backwards;
}

@keyframes plocks-slot {
  from { opacity: 0; transform: scale(.4); }
}
@keyframes plocks-drop {
  0% { transform: translateY(-240%) rotate(var(--tilt)); opacity: 0; animation-timing-function: cubic-bezier(.5, 0, .9, .5); }
  15% { opacity: 1; }
  52% { transform: translateY(0) scale(1.14, .8); animation-timing-function: cubic-bezier(.2, .7, .3, 1); }
  72% { transform: translateY(-9%) scale(.95, 1.06); animation-timing-function: cubic-bezier(.5, 0, .5, 1); }
  88% { transform: translateY(0) scale(1.02, .98); }
  100% { transform: none; }
}
@keyframes plocks-click {
  40% { transform: scale(1.06); }
}
/* A hop per block, a few frames apart, once every cycle. */
@keyframes plocks-ripple {
  0%, 8%, 100% { transform: none; }
  4% { transform: translateY(-14%); }
}

@media (prefers-reduced-motion: reduce) {
  .plocks-hero-mark * { animation: none !important; }
}
`;
