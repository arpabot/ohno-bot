import { Client, GatewayIntentBits } from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";
import "dotenv/config";
import handlers from "./handlers/index.js";

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
    GatewayIntentBits.GuildMembers |
    GatewayIntentBits.MessageContent,
  rest,
});
const client = new Client({ rest, gateway });

for (const [event, fn] of Object.entries(handlers)) {
  client.on(
    event as Parameters<typeof client.on>[0],
    fn as Parameters<typeof client.on>[1],
  );
}

await gateway.connect();
