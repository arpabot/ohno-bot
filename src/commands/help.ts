import {
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "@discordjs/builders";
import {
  API,
  APIApplicationCommandStringOption,
  APIChatInputApplicationCommandInteraction,
  APIInteractionGuildMember,
  MessageFlags,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "@discordjs/core";
import { transmute } from "../common/functions.js";
import { NonNullableByKey } from "../common/types.js";
import { type ICommand, commands } from "./index.js";

export default class Help implements ICommand {
  defition(): RESTPostAPIChatInputApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName("help")
      .setDescription("コマンドのヘルプを表示します")
      .addStringOption(
        new SlashCommandStringOption()
          .setName("name")
          .addChoices(
            ...commands.map((x) => {
              return { name: x.defition().name, value: x.defition().name };
            }),
          )
          .setDescription("コマンド名"),
      )
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
    const name = i.data.options?.[0];

    if (!transmute<APIApplicationCommandStringOption>(name)) {
      return await api.interactions.editReply(i.application_id, i.token, {
        embeds: [
          {
            fields: commands
              .map((x) => x.defition())
              .map((x) => {
                return {
                  name: `/${x.name}`,
                  value: x.description,
                };
              }),
            color: 0x00ff00,
          },
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    const command = commands.find((x) => x.defition().name === name.value);

    if (!transmute<ICommand>(command)) throw "unreachable";

    return await api.interactions.editReply(i.application_id, i.token, {
      embeds: [
        {
          title: `/${command.defition().name}`,
          description: command.defition().description,
          color: 0x00ff00,
        },
      ],
      flags: MessageFlags.Ephemeral,
    });
  }
}
