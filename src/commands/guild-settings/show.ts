import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import type { ISubcommandHandler, SubcommandContext } from "../base.js";
import { getGuildSettings, settingKeys, settingLabels } from "./shared.js";

export const showSubcommand = new SlashCommandSubcommandBuilder()
  .setName("show")
  .setDescription("現在のサーバー設定を表示します");

export const showHandler: ISubcommandHandler = {
  async run(ctx: SubcommandContext): Promise<unknown> {
    const guildId = ctx.interaction.guild_id;
    const settings = await getGuildSettings(guildId);
    const lines = settingKeys.map((key) => {
      const label = settingLabels[key];
      const value = settings[key] ? "ON" : "OFF";

      return `${label}: ${value}`;
    });

    return ctx.api.interactions.editReply(
      ctx.interaction.application_id,
      ctx.interaction.token,
      {
        embeds: [
          {
            title: "サーバー読み上げ設定",
            description: lines.join("\n"),
            color: 0x00ff00,
          },
        ],
      },
    );
  },
};
