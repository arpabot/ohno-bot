import {
  ActivityType,
  type GatewayReadyDispatchData,
  PresenceUpdateStatus,
  type ToEventProps,
} from "@discordjs/core";
import manifest from "../../.github/release-please/.release-please-manifest.json" with {
  type: "json",
};
import { initCommands } from "../commands/init.js";
import { db } from "../db/index.js";
import { client, gateway } from "../index.js";
import Room, { roomManager } from "../voice/room.js";

export default async ({
  api,
}: ToEventProps<GatewayReadyDispatchData>): Promise<boolean> => {
  await initCommands(api);

  const connections = await db.connection.findAll();

  await Promise.all(
    connections.map(async (connection) => {
      try {
        await new Room(
          gateway,
          api,
          connection.voiceChannelId,
          connection.textChannelId,
          connection.guildId,
        ).connect();

        try {
          await api.channels.createMessage(connection.textChannelId, {
            embeds: [
              {
                description: "接続しました（再起動が終了しました）",
                color: 0x00ff00,
              },
            ],
          });
        } catch (msgError) {
          console.error("Failed to send reconnection message:", msgError);
        }
      } catch (e) {
        roomManager.delete(connection.guildId);
        console.error(
          "at ready: ",
          connection.guildId,
          connection.voiceChannelId,
          "failed to connect",
        );
        console.error(e);
      } finally {
        await db.connection.delete(connection.guildId);
      }
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
