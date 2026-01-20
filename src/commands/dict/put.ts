import {
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import { db } from "../../db/index.js";
import {
  getRequiredOption,
  type ISubcommandHandler,
  replySuccess,
  type SubcommandContext,
} from "../base.js";
import { wordsCache } from "./shared.js";

export const putSubcommand = new SlashCommandSubcommandBuilder()
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
  );

export const putHandler: ISubcommandHandler = {
  async run(ctx: SubcommandContext): Promise<unknown> {
    const guildId = ctx.interaction.guild_id;
    const word = getRequiredOption<string>(ctx.options, "word");
    const read = getRequiredOption<string>(ctx.options, "read");

    await db.dictionary.upsert(guildId, word, read);
    wordsCache.delete(guildId);

    return replySuccess(
      ctx,
      "辞書を編集しました",
      `単語: \`${word}\`\n読み: \`${read}\``,
    );
  },
};
