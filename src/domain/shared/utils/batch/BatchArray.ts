export const batchArray = <T>(array: T[], batchSize: number): T[][] => {
  if (batchSize <= 0) {
    return [];
  }

  return Array.from(
    { length: Math.ceil(array.length / batchSize) },
    (_, index) => array.slice(index * batchSize, index * batchSize + batchSize),
  );
};
