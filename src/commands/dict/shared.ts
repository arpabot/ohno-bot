import { RingCache } from "../../commons/cache.js";
import type { DictionaryEntry } from "../../db/index.js";

export const wordsCache = new RingCache<string, DictionaryEntry[]>(500);

export function escapeCsvCell(input: string): string {
  let text = input;
  const needsQuote =
    text.includes('"') || text.includes(",") || text.includes("\n");

  if (needsQuote) {
    text = `"${text.replaceAll('"', '""')}"`;
  }

  if (/^[=+\-@\t\r]/.test(input)) {
    text = `'${text}`;
  }

  return text;
}
