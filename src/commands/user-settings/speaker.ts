import {
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import { db } from "../../db/index.js";
import { voices } from "../../synthesizer/index.js";
import {
  getRequiredOption,
  type ISubcommandHandler,
  replySuccess,
  type SubcommandContext,
} from "../base.js";
import { getDefaultSynthesizer } from "./shared.js";

export const speakerSubcommand = new SlashCommandSubcommandBuilder()
  .setName("speaker")
  .setDescription("話者を設定します")
  .addStringOption(
    new SlashCommandStringOption()
      .setName("speaker")
      .setDescription("話者")
      .setRequired(true)
      .addChoices(
        ...Object.entries(voices).map(([name, value]) => ({ name, value })),
      ),
  );

export const speakerHandler: ISubcommandHandler = {
  async run(ctx: SubcommandContext): Promise<unknown> {
    const userId = ctx.interaction.member.user.id;
    const synthesizer = await getDefaultSynthesizer(userId);
    const speakerValue = getRequiredOption<string>(ctx.options, "speaker");
    const oldVoiceName = Object.entries(voices).find(
      ([, v]) => v === synthesizer.voice,
    )?.[0];
    const newVoiceName = Object.entries(voices).find(
      ([, v]) => v === speakerValue,
    )?.[0];
    synthesizer.voice = speakerValue;

    await db.synthesizer.upsert(synthesizer);

    return replySuccess(
      ctx,
      "話者を変更しました",
      `話者を ${oldVoiceName} から ${newVoiceName} へ変更しました`,
    );
  },
};
