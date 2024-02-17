import { API } from "@discordjs/core";
import Help from "./help.js";
import { commands } from "./index.js";

export async function initCommands(api: API) {
  const defines = commands.map((x) => x.defition());
  defines.push(new Help().defition());

  api.applicationCommands.bulkOverwriteGlobalCommands(
    (await api.applications.getCurrent()).id,
    defines,
  );
}
