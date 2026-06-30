export default function promiseData<T>(
  supplier: () => Promise<T>,
): PromiseLike<T> {
  let cached: Promise<T> | null = null;
  const then: PromiseLike<T>["then"] = (resolve, reject) => {
    if (!cached) cached = supplier();
    return cached.then(resolve, reject);
  };

  return { then };
}
