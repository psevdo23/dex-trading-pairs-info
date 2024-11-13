export function convertFeeToPercentage(fee: string): string {
  const feeNumber = parseFloat(fee);
  if (isNaN(feeNumber)) {
    throw new Error('Input is not a valid number');
  }
  const result = feeNumber / 100;

  return result.toString() + '%';
}
export const batchRequest = async <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  args: Parameters<T>[],
  chunkSize: number = 250,
): Promise<Awaited<ReturnType<T>>[]> => {
  const chunks = sliceIntoChunks(args, chunkSize);
  const result = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkResultPromises = chunk.map((el) => fn(...el));
    const chunkResult = await Promise.all(chunkResultPromises);
    result.push(...chunkResult);
  }
  return result;
};

export function sliceIntoChunks(arr: any[], chunkSize: number) {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
