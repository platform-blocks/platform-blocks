export const CONTRACT_LENGTHS = [
  6, 6, 6, 7, 8, 9, 9, 10, 10, 11,
  12, 12, 12, 12, 13, 14, 14, 15, 15, 16,
  17, 18, 18, 18, 18, 19, 20, 20, 21, 21,
  22, 24, 24, 24, 24, 25, 26, 26, 27, 28,
  30, 30, 30, 32, 32, 33, 34, 36, 36, 36,
  38, 40, 42, 45, 48,
];

export const sortedLengths = [...CONTRACT_LENGTHS].sort((a, b) => a - b);

export const median = sortedLengths[Math.floor(sortedLengths.length / 2)];
