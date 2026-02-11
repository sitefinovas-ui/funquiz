const runtimeCache = new Map();

export const cacheGet = (key) => runtimeCache.get(key);

export const cacheSet = (key, value) => {
  runtimeCache.set(key, value);
  return value;
};

export const cacheDel = (key) => runtimeCache.delete(key);

export const cacheClear = () => {
  const size = runtimeCache.size;
  runtimeCache.clear();
  return { cleared: size };
};

export const cacheStats = () => ({ size: runtimeCache.size });
