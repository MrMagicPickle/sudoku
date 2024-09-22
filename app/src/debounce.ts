export const debounce = (callback: (...args: any[]) => void, wait: number) => {
  let timeoutId: number | undefined = undefined;
  return (...args: any[]) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, wait);
  };
}
