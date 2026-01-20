import { SlashCommandBuilder } from "@discordjs/builders";
import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from "@discordjs/core";
import { type ISubcommandHandler, SubcommandGroup } from "../base.js";
import { deleteHandler, deleteSubcommand } from "./delete.js";
import { listHandler, listSubcommand } from "./list.js";
import { putHandler, putSubcommand } from "./put.js";

export default class Dict extends SubcommandGroup {
  protected handlers: Record<string, ISubcommandHandler> = {
    put: putHandler,
    delete: deleteHandler,
    list: listHandler,
  };

  definition(): RESTPostAPIChatInputApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName("dict")
      .setDescription("ユーザー辞書に関する操作を行います")
      .addSubcommand(putSubcommand)
      .addSubcommand(deleteSubcommand)
      .addSubcommand(listSubcommand)
      .toJSON();
  }
}
