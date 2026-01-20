import { SlashCommandBuilder } from "@discordjs/builders";
import {
  MessageFlags,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "@discordjs/core";
import type { CommandContext, ICommand } from "./base.js";

export default class Ping implements ICommand {
  definition(): RESTPostAPIChatInputApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Ping Pong")
      .toJSON();
  }

  async run(ctx: CommandContext): Promise<unknown> {
    return ctx.api.interactions.editReply(
      ctx.interaction.application_id,
      ctx.interaction.token,
      {
        content: "Pong!",
        flags: MessageFlags.Ephemeral,
      },
    );
  }
}
