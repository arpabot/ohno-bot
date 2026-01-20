import type {
  GatewayMessageCreateDispatchData,
  ToEventProps,
} from "@discordjs/core";
import type { SpeakableMessage } from "../commons/constructSpeakableMessage.js";
import { roomManager } from "../voice/room.js";

const mimeMap: Record<string, string> = {
  image: "画像",
  video: "動画",
  text: "テキスト",
  audio: "音声",
};

export default async ({
  data,
}: ToEventProps<GatewayMessageCreateDispatchData>): Promise<void> => {
  if (!data.guild_id) {
    return;
  }

  const room = roomManager.get(data.guild_id);

  if (!room) {
    return;
  }

  if (
    room.textChannelId !== data.channel_id &&
    room.voiceChannelId !== data.channel_id
  ) {
    return;
  }

  if (data.content === "s") {
    await room.stop();

    return;
  }

  if ([";", "_"].some((x) => data.content.startsWith(x))) {
    return;
  }

  const attachment = data.attachments.at(0);

  for (const sticker of data.sticker_items ?? []) {
    data.content = `${sticker.name} ${data.content}`;
  }

  if (attachment) {
    data.content = `${
      mimeMap[(attachment.content_type ?? "").split("/").at(0) ?? ""] ??
      "データ"
    }ファイル が添付されました ${data.content ?? ""}`;
  }

  const message: SpeakableMessage = {
    content: data.content,
    guild_id: data.guild_id,
    author: { id: data.author.id },
  };

  room.speak(message).catch((e) => {
    if (e instanceof Error && e.message === "request for lock canceled") {
      return;
    }

    console.error("messageCreate speak error:", e);
  });
};
