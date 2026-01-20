import { SlashCommandBuilder } from "@discordjs/builders";
import {
  MessageFlags,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "@discordjs/core";
import { voiceStates } from "../commons/cache.js";
import { roomManager } from "../voice/room.js";
import { type CommandContext, type ICommand, replySuccess } from "./base.js";

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
      return api.interactions.editReply(i.application_id, i.token, {
        embeds: [
          {
            description:
              "あなたが Bot と同じボイスチャンネルにいないかあなたがボイスチャンネルにいません",
            color: 0xff00ff,
          },
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    await room?.destroy();

    return replySuccess(ctx, "退出", "退出しました");
  }
}
