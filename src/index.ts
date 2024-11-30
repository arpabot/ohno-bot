import { Client, GatewayIntentBits } from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import handlers from "./handlers/index.js";
import { roomManager } from "./voice/room.js";

if (!process.env["token"]) {
  process.exit(1);
}

const rest = new REST({ version: "10" }).setToken(process.env["token"]);
const gateway = new WebSocketManager({
  token: process.env["token"],
  intents:
    GatewayIntentBits.Guilds |
    GatewayIntentBits.GuildMembers |
    GatewayIntentBits.GuildVoiceStates |
    GatewayIntentBits.GuildMessages |
    GatewayIntentBits.MessageContent,
  rest,
});
const client = new Client({ rest, gateway });
const prisma = new PrismaClient();
const handleExit = async () => {
  for (const room of roomManager.values()) {
    await room.destroy();
    await room.api.channels.createMessage(room.textChannelId, {
      embeds: [
        {
          description:
            "Bot が再起動されるためボイスチャンネルから切断しました．再起動後に再接続されます．",
          color: 0xff0000,
        },
      ],
    });
    await prisma.connections.upsert({
      create: {
        guildId: room.guildId,
        textChannelId: room.textChannelId,
        voiceChannelId: room.voiceChannelId,
      },
      update: {
        textChannelId: room.textChannelId,
        voiceChannelId: room.voiceChannelId,
      },
      where: {
        guildId: room.guildId,
      },
    });
  }

  process.exit(0);
};

for (const [event, fn] of Object.entries(handlers)) {
  client.on(
    event as Parameters<typeof client.on>[0],
    fn as Parameters<typeof client.on>[1],
  );
}

await gateway.connect();
await prisma.$connect();

process.on("SIGINT", handleExit);
process.on("SIGTERM", handleExit);
process.on("uncaughtException", async (e) => {
  await handleExit();
  console.error("uncaught: %o", e);
  process.exit(1);
});

export { gateway, prisma, client };
