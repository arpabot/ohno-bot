import type { ICommand } from "./base.js";
import GuildSettings from "./guild-settings/index.js";
import Join from "./join.js";
import Leave from "./leave.js";
import Ping from "./ping.js";
import UserSettings from "./user-settings/index.js";

export const commands: ICommand[] = [
  new Ping(),
  new Join(),
  new Leave(),
  new UserSettings(),
  new GuildSettings(),
];
