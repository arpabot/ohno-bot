import {
  API,
  APIChatInputApplicationCommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "@discordjs/core";
import { NonNullableByKey } from "../common/types.js";
import Dict from "./dict.js";
import Join from "./join.js";
import Leave from "./leave.js";
import Ping from "./ping.js";

export const commands: ICommand[] = [
  new Ping(),
  new Join(),
  new Leave(),
  new Dict(),
];

export interface ICommand {
  defition(): RESTPostAPIChatInputApplicationCommandsJSONBody;
  run(
    api: API,
    i: NonNullableByKey<
      APIChatInputApplicationCommandInteraction,
      "guild_id",
      string
    >,
  ): Promise<unknown>;
}
