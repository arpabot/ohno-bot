import type { Etcd3 } from "etcd3";
import { safeJsonParse } from "../../commons/json.js";
import type { Connection } from "../types.js";

export class ConnectionRepository {
  private readonly prefix = "connections/";

  constructor(private client: Etcd3) {}

  async findAll(): Promise<Connection[]> {
    const entries = await this.client.getAll().prefix(this.prefix).strings();

    return Object.entries(entries)
      .map(([key, value]) => {
        const guildId = key.replace(this.prefix, "");
        const data = safeJsonParse<Omit<Connection, "guildId">>(value);

        if (!data) {
          return null;
        }

        return { guildId, ...data };
      })
      .filter((x): x is Connection => x != null);
  }

  async findByGuildId(guildId: string): Promise<Connection | null> {
    const value = await this.client.get(this.prefix + guildId).string();

    if (!value) {
      return null;
    }

    const data = safeJsonParse<Omit<Connection, "guildId">>(value);

    if (!data) {
      return null;
    }

    return { guildId, ...data };
  }

  async upsert(data: Connection): Promise<void> {
    const { guildId, ...rest } = data;

    await this.client.put(this.prefix + guildId).value(JSON.stringify(rest));
  }

  async delete(guildId: string): Promise<void> {
    await this.client.delete().key(this.prefix + guildId);
  }
}
