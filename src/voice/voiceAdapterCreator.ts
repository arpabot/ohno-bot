import { GatewaySendPayload } from "@discordjs/core";
import { DiscordGatewayAdapterLibraryMethods } from "@discordjs/voice";
import { WebSocketManager } from "@discordjs/ws";

export const adapters = new Map<string, DiscordGatewayAdapterLibraryMethods>();

export default function voiceAdapterCreator(
  guildId: string,
  gateway: WebSocketManager,
) {
  // from: https://github.com/discordjs/discord.js/blob/bfc7bb55641c60d4d67e57c27c9d1e63b6f30c9b/packages/discord.js/src/structures/Guild.js#L1410
  return (methods: DiscordGatewayAdapterLibraryMethods) => {
    adapters.set(guildId, methods);

    return {
      sendPayload: (data: GatewaySendPayload) => {
        // todo: fix this
        // if (gateway.fetchStatus) return false;
        gateway.send(0, data);

        return true;
      },
      destroy: () => {
        adapters.delete(guildId);
      },
    };
  };
}
