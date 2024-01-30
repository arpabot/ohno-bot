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

export const users = new WeightedCache<string, APIUser>(6000);
export const members = new WeightedCache<
  string,
  NonNullableByKey<APIGuildMember, "user", APIUser> & { guild_id: string }
>(6000);
export const channels = new RingCache<string, APIChannel>(1000);
// RingCache<guildId, state[]>
export const voiceStates = new RingCache<string, GatewayVoiceState[]>(100);
export const guilds = new RingCache<string, APIGuild>(100);
