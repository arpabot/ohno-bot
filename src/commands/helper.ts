import {
  APIChatInputApplicationCommandInteraction,
  APIInteraction,
  InteractionType,
} from "@discordjs/core";
import { NonNullableByKey } from "../common/types.js";

export function validate(
  i: APIInteraction,
): i is NonNullableByKey<
  APIChatInputApplicationCommandInteraction,
  "guild_id",
  string
> {
  return !!(i.type === InteractionType.ApplicationCommand && i.guild_id);
}
