import {
  API,
  APIInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "@discordjs/core";
import Ping from "./ping.js";

export const commands: ICommand[] = [new Ping()];

export interface ICommand {
  defition(): RESTPostAPIChatInputApplicationCommandsJSONBody;
  run(api: API, i: APIInteraction): Promise<unknown>;
}
