import {
  APIChannel,
  APIGuild,
  APIGuildMember,
  APIUser,
  GatewayVoiceState,
} from "@discordjs/core";
import RingCache from "./ringCache.js";
import { NonNullableByKey } from "./types.js";
import WeightedCache from "./weightedCache.js";

class MemberCache<
  V = NonNullableByKey<APIGuildMember, "user", APIUser> & { guild_id: string },
> {
  constructor(
    public _max: number,
    private inner: WeightedCache<string, V> = new WeightedCache(_max),
  ) {}

  set(guildId: string, memberId: string, value: V): boolean {
    return this.inner.set(`${guildId}:${memberId}`, value);
  }

  get(guildId: string, memberId: string): V | undefined {
    return this.inner.get(`${guildId}:${memberId}`);
  }

  has(guildId: string, memberId: string): boolean {
    return this.inner.has(`${guildId}:${memberId}`);
  }
}

export const users = new WeightedCache<string, APIUser>(6000);
export const members = new MemberCache(6000);
export const channels = new RingCache<string, APIChannel>(1000);
// RingCache<guildId, state[]>
export const voiceStates = new RingCache<string, GatewayVoiceState[]>(100);
export const guilds = new RingCache<string, APIGuild>(100);
