import type { GatewaySendPayload } from "@discordjs/core";
import type { DiscordGatewayAdapterLibraryMethods } from "@discordjs/voice";
import type { WebSocketManager } from "@discordjs/ws";

export const adapters = new Map<string, DiscordGatewayAdapterLibraryMethods>();

export default function voiceAdapterCreator(
  guildId: string,
  gateway: WebSocketManager,
) {
  return (methods: DiscordGatewayAdapterLibraryMethods) => {
    adapters.set(guildId, methods);

    return {
      sendPayload: (data: GatewaySendPayload) => {
        gateway.send(0, data);
        return true;
      },
      destroy: () => {
        adapters.delete(guildId);
      },
    };
  };
}
