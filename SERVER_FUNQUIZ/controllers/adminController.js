import { cacheClear, cacheStats } from "../utils/runtimeCache.js";

export const clearBackendCache = async (req, res) => {
  const result = cacheClear();
  return res.json({ success: true, ...result });
};

export const getBackendCacheStats = async (req, res) => {
  return res.json({ success: true, ...cacheStats() });
};

