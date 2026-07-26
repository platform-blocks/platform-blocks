export const columns = Array.from({ length: 12 }, (_, index) => `Col ${index + 1}`);

export const body = Array.from({ length: 8 }, (_, rowIndex) =>
  columns.map((_, columnIndex) => `R${rowIndex + 1}C${columnIndex + 1}`)
);
