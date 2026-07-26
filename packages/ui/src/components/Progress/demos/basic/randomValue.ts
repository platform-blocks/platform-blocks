/** Smallest jump the randomizer may produce, so every press visibly moves the bar. */
const MIN_DELTA = 10;

export function randomValue(previous: number) {
  let next = Math.round(Math.random() * 100);
  while (Math.abs(next - previous) < MIN_DELTA) {
    next = Math.round(Math.random() * 100);
  }
  return next;
}
