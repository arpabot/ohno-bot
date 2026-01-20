export interface SpeakableMessage {
  content: string;
  guild_id: string;
  author: { id: string };
}

export default function constructSpeakableMessage(
  content: string,
  userId: string,
  guildId: string,
): SpeakableMessage {
  return {
    content,
    guild_id: guildId,
    author: { id: userId },
  };
}
