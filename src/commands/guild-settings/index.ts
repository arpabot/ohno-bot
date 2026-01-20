import { SlashCommandBuilder } from "@discordjs/builders";
import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from "@discordjs/core";
import { type ISubcommandHandler, SubcommandGroup } from "../base.js";
import { dictDeleteHandler, dictDeleteSubcommand } from "./dict/delete.js";
import { dictListHandler, dictListSubcommand } from "./dict/list.js";
import { dictPutHandler, dictPutSubcommand } from "./dict/put.js";
import { resetHandler, resetSubcommand } from "./reset.js";
import { showHandler, showSubcommand } from "./show.js";
import { toggleHandlers, toggleSubcommands } from "./toggles.js";

const MANAGE_GUILD = 1n << 5n;

export default class GuildSettings extends SubcommandGroup {
  protected handlers: Record<string, ISubcommandHandler> = {
    show: showHandler,
    reset: resetHandler,
    ...toggleHandlers,
    "dict-put": dictPutHandler,
    "dict-delete": dictDeleteHandler,
    "dict-list": dictListHandler,
  };

  definition(): RESTPostAPIChatInputApplicationCommandsJSONBody {
    const builder = new SlashCommandBuilder()
      .setName("guild-settings")
      .setDescription("サーバーの読み上げ設定を変更します")
      .setDefaultMemberPermissions(MANAGE_GUILD)
      .addSubcommand(showSubcommand)
      .addSubcommand(resetSubcommand)
      .addSubcommand(dictPutSubcommand)
      .addSubcommand(dictDeleteSubcommand)
      .addSubcommand(dictListSubcommand);

    for (const subcommand of Object.values(toggleSubcommands)) {
      builder.addSubcommand(subcommand);
    }

    return builder.toJSON();
  }
}
