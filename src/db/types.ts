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

export interface GuildSettings {
  guildId: string;
  announceJoinLeave: boolean;
  announceMove: boolean;
  announceScreenShare: boolean;
  announceCamera: boolean;
  announceMute: boolean;
  announceDeafen: boolean;
  readBotMessages: boolean;
  readStickers: boolean;
  readAttachments: boolean;
  readUrls: boolean;
}
