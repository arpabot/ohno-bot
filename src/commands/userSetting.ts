import {
  SlashCommandBuilder,
  SlashCommandNumberOption,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import {
  API,
  APIApplicationCommandInteractionDataSubcommandOption,
  APIApplicationCommandNumberOption,
  APIApplicationCommandStringOption,
  APIChatInputApplicationCommandInteraction,
  APIInteractionGuildMember,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "@discordjs/core";
import { transmute } from "../common/functions.js";
import { NonNullableByKey } from "../common/types.js";
import { prisma } from "../index.js";
import { voices } from "../synthesizer/index.js";
import { ICommand } from "./index.js";

export class UserSettings implements ICommand {
  defition(): RESTPostAPIChatInputApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName("user-settings")
      .setDescription("ユーザー側の設定を変更します")
      .addSubcommand(
        new SlashCommandSubcommandBuilder()
          .setName("speaker")
          .setDescription("話者を設定します")
          .addStringOption(
            new SlashCommandStringOption()
              .setName("speaker")
              .setDescription("話者")
              .setRequired(true)
              .addChoices(
                ...Object.entries(voices).map((x) => {
                  return { name: x[0], value: x[1] };
                }),
              ),
          ),
      )
      .addSubcommand(
        new SlashCommandSubcommandBuilder()
          .setName("speed")
          .setDescription("読み上げる速度を設定します")
          .addNumberOption(
            new SlashCommandNumberOption()
              .setName("rate")
              .setDescription("速度（デフォルトは 1.0 です）")
              .setMinValue(0.5)
              .setMaxValue(2.0)
              .setRequired(true),
          ),
      )
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
    const synthesizer = (await prisma.synthesizer.findFirst({
      where: {
        userId: i.member.user.id,
      },
    })) ?? {
      pitch: 1.0,
      speed: 1.0,
      userId: i.member.user.id,
      voice: "ja-JP-NanamiNeural",
    };

    const command = i.data.options?.[0];

    if (
      !transmute<APIApplicationCommandInteractionDataSubcommandOption>(command)
    )
      return;

    if (command.name === "speaker") {
      const speaker = command.options?.[0];

      if (!transmute<APIApplicationCommandStringOption>(speaker))
        throw "unreachable";

      const old = synthesizer.voice;
      synthesizer.voice = speaker.value;

      await prisma.synthesizer.upsert({
        create: synthesizer,
        update: synthesizer,
        where: { userId: i.member.user.id },
      });

      return await api.interactions.editReply(i.application_id, i.token, {
        embeds: [
          {
            title: "話者を変更しました",
            description: `話者を ${
              Object.entries(voices).find((x) => x[1] === old)?.[0]
            } から ${
              Object.entries(voices).find((x) => x[1] === speaker.value)?.[0]
            } へ変更しました`,
            color: 0x00ff00,
          },
        ],
      });
    }

    if (command.name === "speed") {
      const rate = command.options?.[0];

      if (!transmute<APIApplicationCommandNumberOption>(rate))
        throw "unreachable";

      const old = synthesizer.speed;
      synthesizer.speed = rate.value;

      await prisma.synthesizer.upsert({
        create: synthesizer,
        update: synthesizer,
        where: { userId: i.member.user.id },
      });

      return await api.interactions.editReply(i.application_id, i.token, {
        embeds: [
          {
            title: "読み上げる速度を変更しました",
            description: `速度を ${old} から ${rate.value} へ変更しました`,
            color: 0x00ff00,
          },
        ],
      });
    }

    throw "unreachable";
  }
}
