import type { Etcd3 } from "etcd3";
import { safeJsonParse } from "../../commons/json.js";
import type { GuildSettings } from "../types.js";

export function getDefaultGuildSettings(guildId: string): GuildSettings {
  return {
    guildId,
    announceJoinLeave: true,
    announceMove: true,
    announceScreenShare: true,
    announceCamera: true,
    announceMute: true,
    announceDeafen: true,
    readBotMessages: true,
    readStickers: true,
    readAttachments: true,
    readUrls: true,
  };
}

export class GuildSettingsRepository {
  private readonly prefix = "guild-settings/";

  constructor(private client: Etcd3) {}

  async findByGuildId(guildId: string): Promise<GuildSettings | null> {
    const value = await this.client.get(this.prefix + guildId).string();

    if (!value) {
      return null;
    }

    const data = safeJsonParse<Omit<GuildSettings, "guildId">>(value);

    if (!data) {
      return null;
    }

    return { guildId, ...data };
  }

  async upsert(data: GuildSettings): Promise<void> {
    const { guildId, ...rest } = data;

    await this.client.put(this.prefix + guildId).value(JSON.stringify(rest));
  }

  async delete(guildId: string): Promise<void> {
    await this.client.delete().key(this.prefix + guildId);
  }
}
