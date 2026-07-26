export const WEEKS = 52;

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const PALETTE = ['#EBEDF0', '#C6E48B', '#7BC96F', '#239A3B', '#196127'];

export const COLUMNS = Array.from({ length: WEEKS }, (_, index) => `W${index + 1}`);

/** Activity levels (0-4) per weekday/week — deterministic so the demo never shifts. */
export const CONTRIBUTION_MATRIX: number[][] = WEEKDAY_LABELS.map((_, row) =>
  Array.from({ length: WEEKS }, (_, col) => {
    const wave = Math.sin(col / 4) + Math.cos((row + col) / 3);
    const seasonal = Math.cos(col / 12) + row * 0.2;
    const score = wave + seasonal + 2;
    return Math.max(0, Math.min(4, Math.round(score)));
  })
);
