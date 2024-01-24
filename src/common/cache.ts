import { APIGuildMember, APIUser } from "@discordjs/core";
import RingCache from "./ringCache.js";
import { NonNullableByKey } from "./types.js";

export const users = new RingCache<string, APIUser>(600);
export const members = new RingCache<
  string,
  NonNullableByKey<APIGuildMember, "user", APIUser> & { guild_id: string }
>(600);
