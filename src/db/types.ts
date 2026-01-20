export interface Synthesizer {
  userId: string;
  speed: number;
  pitch: number;
  voice: string;
}

export interface DictionaryEntry {
  guildId: string;
  word: string;
  read: string;
}

export interface Connection {
  guildId: string;
  voiceChannelId: string;
  textChannelId: string;
}
