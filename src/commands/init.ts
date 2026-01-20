import type { API } from "@discordjs/core";
import Help from "./help.js";
import { commands } from "./index.js";

export async function initCommands(api: API): Promise<void> {
  const defines = commands.map((x) => x.definition());

  defines.push(new Help().definition());

  try {
    const app = await api.applications.getCurrent();

    await api.applicationCommands.bulkOverwriteGlobalCommands(app.id, defines);
    console.log("Commands initialized successfully");
  } catch (error) {
    console.error("Failed to initialize commands:", error);

    throw error;
  }
}
