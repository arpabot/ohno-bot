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

export const pitchSubcommand = new SlashCommandSubcommandBuilder()
  .setName("pitch")
  .setDescription("声の高さを設定します")
  .addNumberOption(
    new SlashCommandNumberOption()
      .setName("value")
      .setDescription("声の高さ（デフォルトは 1.0 です、0.5〜1.5）")
      .setMinValue(0.5)
      .setMaxValue(1.5)
      .setRequired(true),
  );

export const pitchHandler: ISubcommandHandler = {
  async run(ctx: SubcommandContext): Promise<unknown> {
    const userId = ctx.interaction.member.user.id;
    const synthesizer = await getDefaultSynthesizer(userId);
    const value = getRequiredOption<number>(ctx.options, "value");
    const oldPitch = synthesizer.pitch;

    synthesizer.pitch = value;
    await db.synthesizer.upsert(synthesizer);

    return replySuccess(
      ctx,
      "声の高さを変更しました",
      `声の高さを ${oldPitch} から ${value} へ変更しました`,
    );
  },
};
