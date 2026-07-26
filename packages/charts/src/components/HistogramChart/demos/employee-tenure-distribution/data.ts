export const TENURE_YEARS = [
  0.3, 0.5, 0.7, 0.8, 1.1, 1.3, 1.5, 1.8, 2.1, 2.3,
  2.8, 3.0, 3.2, 3.5, 3.8, 4.1, 4.4, 4.7, 5.0, 5.3,
  5.7, 6.0, 6.3, 6.8, 7.1, 7.4, 7.8, 8.2, 8.6, 9.0,
  9.5, 10.0, 10.5, 11.0, 11.6, 12.2, 12.8, 13.4, 14.0, 14.7,
];

export const medianTenure = (() => {
  const sorted = [...TENURE_YEARS].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
})();
