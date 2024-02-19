import { SlashCommandBuilder } from "@discordjs/builders";
import {
  API,
  APIChatInputApplicationCommandInteraction,
  APIInteractionGuildMember,
  MessageFlags,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "@discordjs/core";
import { voiceStates } from "../commons/cache.js";
import { NonNullableByKey } from "../commons/types.js";
import { roomManager } from "../voice/room.js";
import { type ICommand } from "./index.js";

export default class Leave implements ICommand {
  defition(): RESTPostAPIChatInputApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName("leave")
      .setDescription("ボイスチャンネルから退出します")
      .setDescriptionLocalization("en-US", "Leave the voice channel")
      .toJSON();
  }

  async run(
    api: API,
    i: NonNullableByKey<
      NonNullableByKey<
        APIChatInputApplicationCommandInteraction,
        "guild_id",
        string
      >,
      "member",
      APIInteractionGuildMember
    >,
  ): Promise<unknown> {
    const state = voiceStates
      .get(i.guild_id)
      ?.find((x) => x.user_id === i.member.user.id);
    const room = roomManager.get(i.guild_id);

    if (state?.channel_id !== room?.voiceChannelId)
      return await api.interactions.editReply(i.application_id, i.token, {
        embeds: [
          {
            description:
              "あなたが Bot と同じボイスチャンネルにいないかあなたがボイスチャンネルにいません",
            color: 0xff00ff,
          },
        ],
        flags: MessageFlags.Ephemeral,
      });

    await room?.destroy();

    return await api.interactions.editReply(i.application_id, i.token, {
      embeds: [
        {
          description: "退出しました",
          color: 0xff0000,
        },
      ],
    });
  }
}
