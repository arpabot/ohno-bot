import { SlashCommandBuilder } from "@discordjs/builders";
import {
  MessageFlags,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "@discordjs/core";
import { voiceStates } from "../commons/cache.js";
import { gateway } from "../index.js";
import Room, { roomManager } from "../voice/room.js";
import { type CommandContext, type ICommand, replyError } from "./base.js";

export default class Join implements ICommand {
  definition(): RESTPostAPIChatInputApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName("join")
      .setDescription("ボイスチャンネルに参加します")
      .setDescriptionLocalization("en-US", "Join the voice channel")
      .setDescriptionLocalization("en-GB", "Join the voice channel")
      .toJSON();
  }

  async run(ctx: CommandContext): Promise<unknown> {
    const { api, interaction: i } = ctx;

    if (roomManager.get(i.guild_id)) {
      return api.interactions.editReply(i.application_id, i.token, {
        embeds: [
          {
            color: 0xff0000,
            description: "すでに Bot が別のボイスチャンネルに接続しています",
          },
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    const states = voiceStates.get(i.guild_id);

    if (!states) {
      return api.interactions.editReply(i.application_id, i.token, {
        embeds: [
          {
            color: 0xff0000,
            description: "あなたはボイスチャンネルに接続していません",
          },
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    const state = states.find((x) => x.user_id === i.member.user.id);

    if (!state || !state.channel_id) {
      return api.interactions.editReply(i.application_id, i.token, {
        embeds: [
          {
            color: 0xff0000,
            description: "あなたはボイスチャンネルに接続していません",
          },
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    const room = new Room(
      gateway,
      api,
      state.channel_id,
      i.channel.id,
      i.guild_id,
    );

    api.interactions
      .editReply(i.application_id, i.token, {
        embeds: [
          {
            description: "接続しています...",
            color: 0xffff00,
          },
        ],
      })
      .catch(console.error);

    try {
      await room.connect();

      return api.interactions.editReply(i.application_id, i.token, {
        content: "",
        embeds: [
          {
            description: "接続しました",
            color: 0x00ff00,
          },
        ],
      });
    } catch (e) {
      return replyError(
        ctx,
        `接続に失敗しました: \n\`\`\`\n${String(e)}\n\`\`\``,
      );
    }
  }
}
