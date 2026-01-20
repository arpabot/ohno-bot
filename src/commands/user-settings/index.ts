import { SlashCommandBuilder } from "@discordjs/builders";
import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from "@discordjs/core";
import { type ISubcommandHandler, SubcommandGroup } from "../base.js";
import { pitchHandler, pitchSubcommand } from "./pitch.js";
import { speakerHandler, speakerSubcommand } from "./speaker.js";
import { speedHandler, speedSubcommand } from "./speed.js";

export default class UserSettings extends SubcommandGroup {
  protected handlers: Record<string, ISubcommandHandler> = {
    speaker: speakerHandler,
    speed: speedHandler,
    pitch: pitchHandler,
  };

  definition(): RESTPostAPIChatInputApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName("user-settings")
      .setDescription("ユーザー側の設定を変更します")
      .addSubcommand(speakerSubcommand)
      .addSubcommand(speedSubcommand)
      .addSubcommand(pitchSubcommand)
      .toJSON();
  }
}
