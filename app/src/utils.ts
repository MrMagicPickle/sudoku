export const arrayContainsArray = <T>(arr: T[][], target: T[]): boolean => {
  return arr.some(subArray =>
    Array.isArray(subArray) &&
    subArray.length === target.length &&
    subArray.every((value, index) => value === target[index])
  );
}
