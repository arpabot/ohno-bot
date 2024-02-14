import {
  API,
  APIChatInputApplicationCommandInteraction,
  APIInteractionGuildMember,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "@discordjs/core";
import { NonNullableByKey } from "../common/types.js";
import Dict from "./dict.js";
import Join from "./join.js";
import Leave from "./leave.js";
import Ping from "./ping.js";
import { UserSettings } from "./userSetting.js";

export const commands: ICommand[] = [
  new Ping(),
  new Join(),
  new Leave(),
  new Dict(),
  new UserSettings(),
];

export interface ICommand {
  defition(): RESTPostAPIChatInputApplicationCommandsJSONBody;
  run(
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
  ): Promise<unknown>;
}
