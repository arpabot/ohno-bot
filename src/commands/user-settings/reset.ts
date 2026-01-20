import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { db } from "../../db/index.js";
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
    const userId = ctx.interaction.member.user.id;

    await db.synthesizer.delete(userId);

    return replySuccess(
      ctx,
      "設定をリセットしました",
      "全ての設定をデフォルト値にリセットしました",
    );
  },
};
