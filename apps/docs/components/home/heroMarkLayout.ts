import { MARK_BLOCKS } from '../layout/PlocksLogo';

export interface HeroMarkProps {
  /** Height of the whole board in px; the width follows it. */
  size: number;
}

/** brand/svg/mark.svg's units: 20-unit blocks on a 24-unit step, corner radius 5. */
export const SLOT = { size: 20, step: 24, radius: 5 } as const;

const COLUMNS = [-1, 0, 1, 2, 3];
const ROWS = [-1, 0, 1, 2, 3];
/** The mark's centre, in slots. */
const CENTER = { column: 1, row: 1 };

/**
 * A 5 × 5 board of slots with the mark's seven in the middle. Slots further from
 * the centre appear later and rest fainter, so the board fades out at its edges.
 */
export const BOARD = {
  viewBox: `${-SLOT.step} ${-SLOT.step} ${COLUMNS.length * SLOT.step - 4} ${ROWS.length * SLOT.step - 4}`,
  width: COLUMNS.length * SLOT.step - 4,
  height: ROWS.length * SLOT.step - 4,
  slots: ROWS.flatMap((row) =>
    COLUMNS.map((column) => {
      const distance = Math.hypot(column - CENTER.column, row - CENTER.row);
      return {
        x: column * SLOT.step,
        y: row * SLOT.step,
        delay: Math.round(distance * 2) * 45,
        opacity: Math.round((0.075 - distance * 0.018) * 1000) / 1000,
      };
    })
  ),
};

/**
 * The blocks in the order they land: bottom up, so none falls through one that
 * is already in place. Each starts a little tilted, alternating sides.
 */
export const DROP_ORDER = ([[6, -10], [3, 8], [4, -6], [5, 10], [0, 12], [1, -8], [2, 6]] as const).map(([index, tilt]) => {
  const [column, row, fill] = MARK_BLOCKS[index];
  return { x: column * SLOT.step, y: row * SLOT.step, fill, tilt };
});
