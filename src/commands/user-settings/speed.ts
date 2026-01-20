import {
  SlashCommandNumberOption,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import { db } from "../../db/index.js";
import {
  getRequiredOption,
  type ISubcommandHandler,
  replySuccess,
  type SubcommandContext,
} from "../base.js";
import { getDefaultSynthesizer } from "./shared.js";

export const speedSubcommand = new SlashCommandSubcommandBuilder()
  .setName("speed")
  .setDescription("読み上げる速度を設定します")
  .addNumberOption(
    new SlashCommandNumberOption()
      .setName("rate")
      .setDescription("速度（デフォルトは 1.0 です）")
      .setMinValue(0.5)
      .setMaxValue(2.0)
      .setRequired(true),
  );

export const speedHandler: ISubcommandHandler = {
  async run(ctx: SubcommandContext): Promise<unknown> {
    const userId = ctx.interaction.member.user.id;
    const synthesizer = await getDefaultSynthesizer(userId);
    const rate = getRequiredOption<number>(ctx.options, "rate");
    const oldSpeed = synthesizer.speed;
    synthesizer.speed = rate;

    await db.synthesizer.upsert(synthesizer);

    return replySuccess(
      ctx,
      "読み上げる速度を変更しました",
      `速度を ${oldSpeed} から ${rate} へ変更しました`,
    );
  },
};
