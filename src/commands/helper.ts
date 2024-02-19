import {
  APIChatInputApplicationCommandInteraction,
  APIInteraction,
  APIInteractionGuildMember,
  InteractionType,
} from "@discordjs/core";
import { NonNullableByKey } from "../commons/types.js";

export function validate(
  i: APIInteraction,
): i is NonNullableByKey<
  NonNullableByKey<
    APIChatInputApplicationCommandInteraction,
    "guild_id",
    string
  >,
  "member",
  APIInteractionGuildMember
> {
  return !!(
    i.type === InteractionType.ApplicationCommand &&
    i.guild_id &&
    i.member
  );
}
