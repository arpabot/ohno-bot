import {
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import type {
  API,
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandInteractionDataBasicOption,
} from "@discordjs/core";
import { type DictionaryEntry, db } from "../../db/index.js";
import {
  getFocusedOption,
  getRequiredOption,
  type ISubcommandHandler,
  replyError,
  replySuccess,
  type SubcommandContext,
} from "../base.js";
import { wordsCache } from "./shared.js";

export const deleteSubcommand = new SlashCommandSubcommandBuilder()
  .setName("delete")
  .setDescription("サーバーの辞書を削除します")
  .addStringOption(
    new SlashCommandStringOption()
      .setName("word")
      .setDescription("単語")
      .setRequired(true)
      .setAutocomplete(true),
  );

export const deleteHandler: ISubcommandHandler = {
  async run(ctx: SubcommandContext): Promise<unknown> {
    const guildId = ctx.interaction.guild_id;
    const word = getRequiredOption<string>(ctx.options, "word");
    const dict = await db.dictionary.findByGuildIdAndWord(guildId, word);

    if (!dict) {
      return replyError(ctx, "単語が存在しません");
    }

    await db.dictionary.delete(guildId, word);
    wordsCache.delete(guildId);

    return replySuccess(
      ctx,
      "辞書を削除しました",
      `単語: \`${dict.word}\`\n読み: \`${dict.read}\``,
    );
  },

  async autoComplete(
    api: API,
    interaction: APIApplicationCommandAutocompleteInteraction,
    options: APIApplicationCommandInteractionDataBasicOption[],
  ): Promise<unknown> {
    const guildId = interaction.guild_id;

    if (!guildId) {
      return api.interactions.createAutocompleteResponse(
        interaction.id,
        interaction.token,
        { choices: [] },
      );
    }

    let cache = wordsCache.get(guildId);

    if (!cache || cache.length === 0) {
      cache = await db.dictionary.findByGuildId(guildId);
      wordsCache.set(guildId, cache);
    }

    const focused = getFocusedOption(options);
    const query = focused?.value ?? "";
    const choices = cache
      .filter((x: DictionaryEntry) => x.word.startsWith(query))
      .slice(0, 25)
      .map((x: DictionaryEntry) => ({ name: x.word, value: x.word }));

    return api.interactions.createAutocompleteResponse(
      interaction.id,
      interaction.token,
      { choices },
    );
  },
};
