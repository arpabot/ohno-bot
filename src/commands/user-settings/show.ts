import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { voices } from "../../synthesizer/index.js";
import type { ISubcommandHandler, SubcommandContext } from "../base.js";
import { getDefaultSynthesizer } from "./shared.js";

export const showSubcommand = new SlashCommandSubcommandBuilder()
  .setName("show")
  .setDescription("現在のユーザー設定を表示します");

export const showHandler: ISubcommandHandler = {
  async run(ctx: SubcommandContext): Promise<unknown> {
    const userId = ctx.interaction.member.user.id;
    const synthesizer = await getDefaultSynthesizer(userId);
    const voiceName =
      Object.entries(voices).find(([, v]) => v === synthesizer.voice)?.[0] ??
      synthesizer.voice;
    const lines = [
      `話者: ${voiceName}`,
      `速度: ${synthesizer.speed}`,
      `声の高さ: ${synthesizer.pitch}`,
    ];

    return ctx.api.interactions.editReply(
      ctx.interaction.application_id,
      ctx.interaction.token,
      {
        embeds: [
          {
            title: "ユーザー読み上げ設定",
            description: lines.join("\n"),
            color: 0x00ff00,
          },
        ],
      },
    );
  },
};
