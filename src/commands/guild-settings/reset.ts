import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { db, getDefaultGuildSettings } from "../../db/index.js";
import {
  type ISubcommandHandler,
  replySuccess,
  type SubcommandContext,
} from "../base.js";

export const resetSubcommand = new SlashCommandSubcommandBuilder()
  .setName("reset")
  .setDescription("全設定をデフォルトにリセットします");

export const resetHandler: ISubcommandHandler = {
  async run(ctx: SubcommandContext): Promise<unknown> {
    const guildId = ctx.interaction.guild_id;
    const defaultSettings = getDefaultGuildSettings(guildId);

    await db.guildSettings.upsert(defaultSettings);

    return replySuccess(
      ctx,
      "設定をリセットしました",
      "全ての設定をデフォルト値にリセットしました",
    );
  },
};
