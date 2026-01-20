export function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    console.error("Failed to parse JSON:", value);
    return null;
  }
}
