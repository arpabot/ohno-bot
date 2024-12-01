import {
  API,
  APIApplicationCommandAutocompleteInteraction,
  APIChatInputApplicationCommandInteraction,
  APIInteractionGuildMember,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "@discordjs/core";
import { NonNullableByKey } from "../commons/types.js";
import Dict from "./dict.js";
import Join from "./join.js";
import Leave from "./leave.js";
import Ping from "./ping.js";
import UserSettings from "./userSettings.js";

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
  autoComplete?: (
    api: API,
    i: APIApplicationCommandAutocompleteInteraction,
  ) => Promise<unknown>;
}
