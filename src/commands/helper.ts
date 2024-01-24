import {
  APIChatInputApplicationCommandInteraction,
  APIGuildMember,
  APIInteraction,
  APIInteractionGuildMember,
  APIUser,
  InteractionType,
} from "@discordjs/core";
import { NonNullableByKey } from "../common/types.js";

export function validate(
  i: APIInteraction,
): i is NonNullableByKey<
  NonNullableByKey<
    NonNullableByKey<
      APIChatInputApplicationCommandInteraction,
      "guild_id",
      string
    >,
    "user",
    APIUser
  >,
  "member",
  APIInteractionGuildMember
> {
  return !!(
    i.type === InteractionType.ApplicationCommand &&
    i.guild_id &&
    i.member &&
    i.user
  );
}
