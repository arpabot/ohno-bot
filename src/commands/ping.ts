import { SlashCommandBuilder } from "@discordjs/builders";
import {
  API,
  APIChatInputApplicationCommandInteraction,
  APIInteractionGuildMember,
  MessageFlags,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "@discordjs/core";
import { NonNullableByKey } from "../commons/types.js";
import { type ICommand } from "./index.js";

export default class Ping implements ICommand {
  defition(): RESTPostAPIChatInputApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Ping Pong")
      .toJSON();
  }

  async run(
    api: API,
    i: NonNullableByKey<
      NonNullableByKey<
        APIChatInputApplicationCommandInteraction,
        "guild_id",
        string
      >,
      "member",
      APIInteractionGuildMember
    >,
  ): Promise<unknown> {
    return await api.interactions.editReply(i.application_id, i.token, {
      content: "Pong!",
      flags: MessageFlags.Ephemeral,
    });
  }
}
