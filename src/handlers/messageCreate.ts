import {
  APIMessage,
  GatewayMessageCreateDispatchData,
  WithIntrinsicProps,
} from "@discordjs/core";
import { transmute } from "../common/functions.js";
import { roomManager } from "../voice/room.js";

export default async ({
  data,
}: WithIntrinsicProps<GatewayMessageCreateDispatchData>) => {
  if (!data.guild_id) return;

  const room = roomManager.get(data.guild_id);

  if (!room) return;
  if (!transmute<APIMessage & { guild_id: string }>(data)) return;
  if (
    room.textChannelId !== data.channel_id &&
    room.voiceChannelId !== data.channel_id
  )
    return;

  if (data.content === "s") {
    await room.stop();
    return;
  }

  if ([";", "_"].some((x) => data.content.startsWith(x))) return;

  room.speak(data).catch((x) => {
    if (!(x instanceof Error)) throw x;

    if (x.message !== "request for lock canceled") throw x;
  });
};
