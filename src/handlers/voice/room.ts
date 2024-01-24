import { API } from "@discordjs/core";
import { WebSocketManager } from "@discordjs/ws";

export default class Room {
  constructor(
    private gateway: WebSocketManager,
    private api: API,
    public voiceChannelId: string,
    public textChannelId: string,
    public guildId: string,
  ) {
    roomManager.set(voiceChannelId, this);
  }
}

export const roomManager = new Map<string, Room>();
