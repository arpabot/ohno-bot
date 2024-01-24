import {
  API,
  APIChatInputApplicationCommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "@discordjs/core";
import { NonNullableByKey } from "../common/types.js";
import Ping from "./ping.js";

export const commands: ICommand[] = [new Ping()];

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
