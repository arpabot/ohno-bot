import {
  APIMessage,
  GatewayMessageCreateDispatchData,
  WithIntrinsicProps,
} from "@discordjs/core";
import { transmute } from "../commons/functions.js";
import { roomManager } from "../voice/room.js";

const mimeMap: Record<string, string> = {
  image: "画像",
  video: "動画",
  text: "テキスト",
  audio: "音声",
};

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

  const attachment = data.attachments.at(0);

  if (attachment) {
    data.content = `${
      mimeMap[(attachment.content_type ?? "").split("/").at(0) ?? ""] ??
      "データ"
    }ファイル が添付されました ${data.content ?? ""}`;
  }

  room.speak(data).catch((x) => {
    if (!(x instanceof Error)) throw x;

    if (x.message !== "request for lock canceled") throw x;
  });
};
