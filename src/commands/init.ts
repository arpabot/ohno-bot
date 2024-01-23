import { API } from "@discordjs/core";
import { commands } from "./index.js";

export async function initCommands(api: API) {
  api.applicationCommands.bulkOverwriteGlobalCommands(
    (await api.applications.getCurrent()).id,
    commands.map((x) => x.defition()),
  );
}
