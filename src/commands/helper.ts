import {
  APIChatInputApplicationCommandInteraction,
  APIInteraction,
  InteractionType,
} from "@discordjs/core";

interface Unko extends APIChatInputApplicationCommandInteraction {
  guild_id: string;
}

export function validate(i: APIInteraction): i is Unko {
  return !!(i.type === InteractionType.ApplicationCommand && i.guild_id);
}
