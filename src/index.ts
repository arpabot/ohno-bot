import { Client, GatewayIntentBits } from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";
import { Mutex } from "async-mutex";
import "dotenv/config";
import { env } from "./commons/env.js";
import { db } from "./db/index.js";
import handlers from "./handlers/index.js";
import { roomManager } from "./voice/room.js";

const rest = new REST({ version: "10" }).setToken(env.token);
const gateway = new WebSocketManager({
  token: env.token,
  intents:
    GatewayIntentBits.Guilds |
    GatewayIntentBits.GuildMembers |
    GatewayIntentBits.GuildVoiceStates |
    GatewayIntentBits.GuildMessages |
    GatewayIntentBits.MessageContent,
  rest,
});
const client = new Client({ rest, gateway });
const handleExitLock = new Mutex();

const handleExit = async (): Promise<void> => {
  const release = await handleExitLock.acquire();

  try {
    for (const room of roomManager.values()) {
      try {
        await room.api.channels.createMessage(room.textChannelId, {
          embeds: [
            {
              description:
                "Bot が再起動されるためボイスチャンネルから切断しました．再起動後に再接続されます．",
              color: 0xff0000,
            },
          ],
        });

        await db.connection.upsert({
          guildId: room.guildId,
          textChannelId: room.textChannelId,
          voiceChannelId: room.voiceChannelId,
        });

        await room.destroy();
      } catch (e) {
        console.error("Error during room cleanup:", e);
      }
    }
  } finally {
    db.close();
    release();
    process.exit(0);
  }
};

for (const [event, fn] of Object.entries(handlers)) {
  client.on(
    event as Parameters<typeof client.on>[0],
    fn as Parameters<typeof client.on>[1],
  );
}

await gateway.connect();

process.on("SIGINT", handleExit);
process.on("SIGTERM", handleExit);
process.on("uncaughtException", async (e) => {
  console.error("uncaught: %o", e);
  await handleExit();
});

export { client, gateway };
