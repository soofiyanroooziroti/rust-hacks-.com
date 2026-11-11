/** Deep-merge `source` with `override` (override wins on leaves). */
export function deepMerge<T>(source: T, override: unknown): T {
  if (override == null || typeof override !== 'object') {
    return (override ?? source) as T;
  }
  if (Array.isArray(source) && Array.isArray(override)) {
    return override as T;
  }
  if (typeof source !== 'object' || source === null || Array.isArray(source)) {
    return override as T;
  }
  const result = { ...source } as Record<string, unknown>;
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    const prev = (source as Record<string, unknown>)[key];
    if (
      value != null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      prev != null &&
      typeof prev === 'object' &&
      !Array.isArray(prev)
    ) {
      result[key] = deepMerge(prev, value);
    } else if (value !== undefined) {
      result[key] = value;
    }
  }
  return result as T;
}
