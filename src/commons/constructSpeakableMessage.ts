import { APIMessage } from "@discordjs/core";
import { transmute } from "./functions.js";

export default function constructSpeakableMessage(
  content: string,
  user_id: string,
  guild_id: string,
) {
  const message = {
    content,
    guild_id: guild_id,
    author: {
      id: user_id,
    },
  };

  if (!transmute<APIMessage & { guild_id: string }>(message)) return;

  return message;
}
