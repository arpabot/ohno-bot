import type { Etcd3 } from "etcd3";
import { safeJsonParse } from "../../commons/json.js";
import type { DictionaryEntry } from "../types.js";

export class DictionaryRepository {
  private readonly prefix = "dictionaries/";

  constructor(private client: Etcd3) {}

  private buildKey(guildId: string, word: string): string {
    return `${this.prefix}${guildId}/${encodeURIComponent(word)}`;
  }

  private parseKey(key: string): { guildId: string; word: string } | null {
    const withoutPrefix = key.replace(this.prefix, "");
    const slashIndex = withoutPrefix.indexOf("/");

    if (slashIndex === -1) {
      return null;
    }

    return {
      guildId: withoutPrefix.slice(0, slashIndex),
      word: decodeURIComponent(withoutPrefix.slice(slashIndex + 1)),
    };
  }

  async findByGuildId(guildId: string): Promise<DictionaryEntry[]> {
    const keyPrefix = `${this.prefix}${guildId}/`;
    const entries = await this.client.getAll().prefix(keyPrefix).strings();

    return Object.entries(entries)
      .map(([key, value]) => {
        const parsed = this.parseKey(key);
        const data = safeJsonParse<{ read: string }>(value);

        if (!data) {
          return null;
        }

        return {
          guildId,
          word: parsed?.word ?? "",
          read: data.read,
        };
      })
      .filter((x): x is DictionaryEntry => x != null);
  }

  async findByGuildIdAndWord(
    guildId: string,
    word: string,
  ): Promise<DictionaryEntry | null> {
    const key = this.buildKey(guildId, word);
    const value = await this.client.get(key).string();

    if (!value) {
      return null;
    }

    const data = safeJsonParse<{ read: string }>(value);

    if (!data) {
      return null;
    }

    return { guildId, word, read: data.read };
  }

  async upsert(guildId: string, word: string, read: string): Promise<void> {
    const key = this.buildKey(guildId, word);

    await this.client.put(key).value(JSON.stringify({ read }));
  }

  async delete(guildId: string, word: string): Promise<void> {
    const key = this.buildKey(guildId, word);

    await this.client.delete().key(key);
  }
}
