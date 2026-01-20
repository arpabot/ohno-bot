import { SlashCommandBuilder } from "@discordjs/builders";
import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from "@discordjs/core";
import { type ISubcommandHandler, SubcommandGroup } from "../base.js";
import { pitchHandler, pitchSubcommand } from "./pitch.js";
import { resetHandler, resetSubcommand } from "./reset.js";
import { showHandler, showSubcommand } from "./show.js";
import { speakerHandler, speakerSubcommand } from "./speaker.js";
import { speedHandler, speedSubcommand } from "./speed.js";

export default class UserSettings extends SubcommandGroup {
  ephemeral = true;

  protected handlers: Record<string, ISubcommandHandler> = {
    show: showHandler,
    speaker: speakerHandler,
    speed: speedHandler,
    pitch: pitchHandler,
    reset: resetHandler,
  };

  definition(): RESTPostAPIChatInputApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName("user-settings")
      .setDescription("ユーザー側の設定を変更します")
      .addSubcommand(showSubcommand)
      .addSubcommand(speakerSubcommand)
      .addSubcommand(speedSubcommand)
      .addSubcommand(pitchSubcommand)
      .addSubcommand(resetSubcommand)
      .toJSON();
  }
}
