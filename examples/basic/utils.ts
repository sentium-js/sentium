/**
 * Simulate a loading time for the example
 *
 * @returns A promise that resolves after a random time between 500ms and 1500ms.
 */
export const simulateLoading = () =>
  new Promise<void>((resolve) => {
    setTimeout(() => resolve(), 500 + (Math.random() * 1000));
  });
