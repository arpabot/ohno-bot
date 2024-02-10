import {
  SlashCommandBuilder,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import {
  API,
  APIApplicationCommandInteractionDataStringOption,
  APIApplicationCommandInteractionDataSubcommandOption,
  APIChatInputApplicationCommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "@discordjs/core";
import { transmute } from "../common/functions.js";
import { NonNullableByKey } from "../common/types.js";
import { prisma } from "../index.js";
import { ICommand } from "./index.js";

export default class Dict implements ICommand {
  defition(): RESTPostAPIChatInputApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName("dict")
      .setDescription("ユーザー辞書に関する操作を行います")
      .addSubcommand(
        new SlashCommandSubcommandBuilder()
          .setName("put")
          .setDescription("サーバーの辞書を追加・編集します")
          .addStringOption(
            new SlashCommandStringOption()
              .setName("word")
              .setDescription("単語")
              .setRequired(true),
          )
          .addStringOption(
            new SlashCommandStringOption()
              .setName("read")
              .setDescription("読み")
              .setRequired(true),
          ),
      )
      .toJSON();
  }

  async run(
    api: API,
    i: NonNullableByKey<
      APIChatInputApplicationCommandInteraction,
      "guild_id",
      string
    >,
  ): Promise<unknown> {
    const command = i.data.options?.[0];

    if (
      !transmute<APIApplicationCommandInteractionDataSubcommandOption>(command)
    )
      return;

    if (command.name === "put") {
      const word = command.options?.find((x) => x.name === "word");
      const read = command.options?.find((x) => x.name === "read");

      if (
        !transmute<APIApplicationCommandInteractionDataStringOption>(word) ||
        !transmute<APIApplicationCommandInteractionDataStringOption>(read)
      )
        return;

      await prisma.dictionary.upsert({
        create: { guildId: i.guild_id, read: read.value, word: word.value },
        update: { read: read.value },
        where: { guildId: i.guild_id, word: word.value },
      });

      return await api.interactions.editReply(i.application_id, i.token, {
        embeds: [
          {
            title: "辞書を編集しました",
            description: `単語: \`${word?.value}\`
読み: \`${read?.value}\``,
            color: 0x00ff00,
          },
        ],
      });
    }

    throw "unreachable";
  }
}
