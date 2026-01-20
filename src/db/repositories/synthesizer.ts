import type { Etcd3 } from "etcd3";
import { safeJsonParse } from "../../commons/json.js";
import type { Synthesizer } from "../types.js";

export class SynthesizerRepository {
  private readonly prefix = "synthesizers/";

  constructor(private client: Etcd3) {}

  async findByUserId(userId: string): Promise<Synthesizer | null> {
    const value = await this.client.get(this.prefix + userId).string();

    if (!value) {
      return null;
    }

    const data = safeJsonParse<Omit<Synthesizer, "userId">>(value);

    if (!data) {
      return null;
    }

    return { userId, ...data };
  }

  async upsert(data: Synthesizer): Promise<void> {
    const { userId, ...rest } = data;

    await this.client.put(this.prefix + userId).value(JSON.stringify(rest));
  }

  async delete(userId: string): Promise<void> {
    await this.client.delete().key(this.prefix + userId);
  }
}
