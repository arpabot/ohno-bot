import {
  ActivityType,
  GatewayReadyDispatchData,
  PresenceUpdateStatus,
  ToEventProps,
} from "@discordjs/core";
import manifest from "../../.github/release-please/.release-please-manifest.json" assert {
  type: "json",
};
import { initCommands } from "../commands/init.js";
import { client, gateway } from "../index.js";
import { prisma } from "../index.js";
import Room from "../voice/room.js";

export default async ({ api }: ToEventProps<GatewayReadyDispatchData>) => {
  await initCommands(api);

  const connections = await prisma.connections.findMany();

  await Promise.all(
    connections.map(async (connection) => {
      await new Room(
        gateway,
        api,
        connection.voiceChannelId,
        connection.textChannelId,
        connection.guildId,
      )
        .connect()
        .catch(console.error);
      await api.channels.createMessage(connection.textChannelId, {
        embeds: [
          {
            description: "接続しました（再起動が終了しました）",
            color: 0x00ff00,
          },
        ],
      });
      await prisma.connections.delete({
        where: { guildId: connection.guildId },
      });
    }),
  );

  console.log("ready!");

  client.updatePresence(0, {
    status: PresenceUpdateStatus.Online,
    afk: false,
    since: null,
    activities: [
      {
        state: `v${manifest["."]}`,
        name: "custom status",
        type: ActivityType.Custom,
      },
    ],
  });

  return true;
};
