import { SlashCommandBuilder } from "@discordjs/builders";
import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from "@discordjs/core";
import { voiceStates } from "../commons/cache.js";
import { roomManager } from "../voice/room.js";
import { type CommandContext, type ICommand, replyError } from "./base.js";

export default class Leave implements ICommand {
  definition(): RESTPostAPIChatInputApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName("leave")
      .setDescription("ボイスチャンネルから退出します")
      .setDescriptionLocalization("en-US", "Leave the voice channel")
      .toJSON();
  }

  async run(ctx: CommandContext): Promise<unknown> {
    const { api, interaction: i } = ctx;
    const state = voiceStates
      .get(i.guild_id)
      ?.find((x) => x.user_id === i.member.user.id);
    const room = roomManager.get(i.guild_id);

    if (state?.channel_id !== room?.voiceChannelId) {
      return replyError(
        ctx,
        "あなたが Bot と同じボイスチャンネルにいないかあなたがボイスチャンネルにいません",
      );
    }

    await room?.destroy();

    return api.interactions.editReply(i.application_id, i.token, {
      embeds: [
        {
          description: "退出しました",
          color: 0x00ff00,
        },
      ],
    });
  }
}
