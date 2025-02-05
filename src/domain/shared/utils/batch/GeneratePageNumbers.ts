export const allPages = (total: number): number[] =>
  Array.from({ length: total }, (_, index) => index + 1);
