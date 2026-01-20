import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { db } from "../../db/index.js";
import type { ISubcommandHandler, SubcommandContext } from "../base.js";
import { escapeCsvCell } from "./shared.js";

export const listSubcommand = new SlashCommandSubcommandBuilder()
  .setName("list")
  .setDescription("サーバーの辞書の一覧をテキストファイルで送信します");

export const listHandler: ISubcommandHandler = {
  async run(ctx: SubcommandContext): Promise<unknown> {
    const guildId = ctx.interaction.guild_id;
    const dictionaries = await db.dictionary.findByGuildId(guildId);

    const csv = [["単語", "読み"]]
      .concat(
        dictionaries.map((x) => [escapeCsvCell(x.word), escapeCsvCell(x.read)]),
      )
      .map((x) => x.join(","))
      .join("\n");

    return ctx.api.interactions.editReply(
      ctx.interaction.application_id,
      ctx.interaction.token,
      {
        files: [{ name: "0", data: csv }],
        attachments: [{ id: 0, filename: "list.csv" }],
      },
    );
  },
};
