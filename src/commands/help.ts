import {
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "@discordjs/builders";
import {
  type APIApplicationCommandInteractionDataStringOption,
  MessageFlags,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "@discordjs/core";
import type { CommandContext, ICommand } from "./base.js";
import { commands } from "./index.js";

export default class Help implements ICommand {
  definition(): RESTPostAPIChatInputApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName("help")
      .setDescription("コマンドのヘルプを表示します")
      .addStringOption(
        new SlashCommandStringOption()
          .setName("name")
          .addChoices(
            ...commands.map((x) => ({
              name: x.definition().name,
              value: x.definition().name,
            })),
          )
          .setDescription("コマンド名"),
      )
      .toJSON();
  }

  async run(ctx: CommandContext): Promise<unknown> {
    const { api, interaction: i } = ctx;
    const name = i.data.options?.[0] as
      | APIApplicationCommandInteractionDataStringOption
      | undefined;

    if (name == null) {
      return api.interactions.editReply(i.application_id, i.token, {
        embeds: [
          {
            fields: commands
              .map((x) => x.definition())
              .map((x) => ({
                name: `/${x.name}`,
                value: x.description,
              })),
            color: 0x00ff00,
          },
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    const command = commands.find((x) => x.definition().name === name.value);

    if (command == null) {
      throw new Error(`Command not found: ${name.value}`);
    }

    return api.interactions.editReply(i.application_id, i.token, {
      embeds: [
        {
          title: `/${command.definition().name}`,
          description: command.definition().description,
          color: 0x00ff00,
        },
      ],
      flags: MessageFlags.Ephemeral,
    });
  }
}
