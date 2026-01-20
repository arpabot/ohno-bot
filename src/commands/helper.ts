import { type APIInteraction, InteractionType } from "@discordjs/core";
import type { GuildInteraction } from "./base.js";

export function validate(i: APIInteraction): i is GuildInteraction {
  return (
    i.type === InteractionType.ApplicationCommand && !!i.guild_id && !!i.member
  );
}
