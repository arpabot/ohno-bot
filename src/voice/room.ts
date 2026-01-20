import { Readable } from "node:stream";
import type { API, APIVoiceState } from "@discordjs/core";
import {
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  entersState,
  joinVoiceChannel,
  NoSubscriberBehavior,
  type VoiceConnection,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import type { WebSocketManager } from "@discordjs/ws";
import { Mutex } from "async-mutex";
import { opus } from "prism-media";
import { channels, members, users } from "../commons/cache.js";
import cleanContent, {
  type CleanContentOptions,
} from "../commons/cleanContent.js";
import { TIMEOUTS } from "../commons/constants.js";
import constructSpeakableMessage, {
  type SpeakableMessage,
} from "../commons/constructSpeakableMessage.js";
import { BOT_USER_ID, env } from "../commons/env.js";
import { getDisplayName } from "../commons/user.js";
import { db, getDefaultGuildSettings } from "../db/index.js";
import Synthesizer from "../synthesizer/index.js";
import voiceAdapterCreator from "./voiceAdapterCreator.js";

export default class Room {
  private connection?: VoiceConnection;

  constructor(
    private gateway: WebSocketManager,
    public api: API,
    public voiceChannelId: string,
    public textChannelId: string,
    public guildId: string,
    private audioResourceLock = new Mutex(),
    private audioPlayer = createAudioPlayer({
      behaviors: { noSubscriber: NoSubscriberBehavior.Play },
    }),
  ) {}

  async connect(): Promise<void> {
    this.connection = joinVoiceChannel({
      adapterCreator: voiceAdapterCreator(this.guildId, this.gateway),
      guildId: this.guildId,
      channelId: this.voiceChannelId,
    });

    this.connection.subscribe(this.audioPlayer);

    await entersState(
      this.connection,
      VoiceConnectionStatus.Ready,
      TIMEOUTS.VOICE_CONNECTION,
    );

    roomManager.set(this.guildId, this);
  }

  async destroy(): Promise<void> {
    this.connection?.disconnect();
    this.connection?.destroy();
    this.audioResourceLock.cancel();
    roomManager.delete(this.guildId);
  }

  async speak(
    message: SpeakableMessage,
    options?: CleanContentOptions,
  ): Promise<void> {
    const release = await this.audioResourceLock.acquire();

    try {
      const userConfig = await db.synthesizer.findByUserId(message.author.id);
      const dictionaries = await db.dictionary.findByGuildId(message.guild_id);
      const synthesizer = new Synthesizer(
        env.azureKey,
        env.azureEndpoint,
        userConfig?.voice ?? "ja-JP-NanamiNeural",
        userConfig?.pitch ?? 1,
        userConfig?.speed ?? 1,
      );

      let content = cleanContent(message, options);

      const sortedDictionaries = [...dictionaries].sort(
        (a, b) => b.word.length - a.word.length,
      );

      for (const dict of sortedDictionaries) {
        content = content.replaceAll(dict.word, dict.read);
      }

      const stream = await synthesizer.synthesis(content);
      const resource = new AudioResource(
        [],
        [Readable.fromWeb(stream).pipe(new opus.OggDemuxer())],
        {},
        5,
      );

      this.audioPlayer.play(resource);

      await entersState(
        this.audioPlayer,
        AudioPlayerStatus.Idle,
        TIMEOUTS.AUDIO_PLAYBACK,
      ).catch(() => this.audioPlayer.stop());
    } catch (e) {
      console.error("Speak error:", e);
    } finally {
      release();
    }
  }

  async stop(): Promise<void> {
    this.audioResourceLock.cancel();
    this.audioPlayer.stop(true);
    await entersState(
      this.audioPlayer,
      AudioPlayerStatus.Idle,
      TIMEOUTS.AUDIO_STOP,
    );
  }

  async handleVoiceStateUpdate(
    oldState: APIVoiceState | undefined,
    newState: APIVoiceState,
  ): Promise<void> {
    if (newState.member?.user && newState.guild_id) {
      users.set(newState.user_id, newState.member.user);
      members.set(newState.guild_id, newState.user_id, {
        ...newState.member,
        user: newState.member.user,
        guild_id: newState.guild_id,
      });
    }

    if (!newState.guild_id) {
      return;
    }

    if (newState.user_id === BOT_USER_ID) {
      return;
    }

    const settings =
      (await db.guildSettings.findByGuildId(newState.guild_id)) ??
      getDefaultGuildSettings(newState.guild_id);

    if (
      oldState?.channel_id !== this.voiceChannelId &&
      newState.channel_id === this.voiceChannelId
    ) {
      if (settings.announceJoinLeave) {
        const message = constructSpeakableMessage(
          `${getDisplayName(newState.guild_id, newState.user_id)}が入室しました`,
          newState.user_id,
          newState.guild_id,
        );

        await this.speak(message);
      }
    }

    if (
      oldState?.channel_id === this.voiceChannelId &&
      newState.channel_id !== oldState.channel_id &&
      newState.channel_id !== this.voiceChannelId &&
      newState.channel_id
    ) {
      if (settings.announceMove) {
        const message = constructSpeakableMessage(
          `${getDisplayName(newState.guild_id, newState.user_id)}が${
            channels.get(newState.channel_id)?.name ?? "不明なチャンネル"
          }へ移動しました`,
          newState.user_id,
          newState.guild_id,
        );

        await this.speak(message);
      }
    }

    if (oldState?.channel_id === this.voiceChannelId && !newState.channel_id) {
      if (settings.announceJoinLeave) {
        const message = constructSpeakableMessage(
          `${getDisplayName(newState.guild_id, newState.user_id)}が退出しました`,
          newState.user_id,
          newState.guild_id,
        );

        await this.speak(message);
      }
    }

    if (
      oldState &&
      oldState.channel_id === this.voiceChannelId &&
      newState.channel_id === this.voiceChannelId
    ) {
      const changes: string[] = [];

      if (
        settings.announceScreenShare &&
        oldState.self_stream !== newState.self_stream
      ) {
        changes.push(`画面共有を${newState.self_stream ? "開始" : "終了"}`);
      }

      if (
        settings.announceCamera &&
        oldState.self_video !== newState.self_video
      ) {
        changes.push(`カメラを${newState.self_video ? "オン" : "オフ"}に`);
      }

      if (settings.announceMute && oldState.self_mute !== newState.self_mute) {
        changes.push(`ミュートを${newState.self_mute ? "オン" : "オフ"}に`);
      }

      if (
        settings.announceDeafen &&
        oldState.self_deaf !== newState.self_deaf
      ) {
        changes.push(
          `スピーカーミュートを${newState.self_deaf ? "オン" : "オフ"}に`,
        );
      }

      if (changes.length === 0) {
        return;
      }

      const message = constructSpeakableMessage(
        `${getDisplayName(newState.guild_id, newState.user_id)}が${changes.join("、")}しました`,
        newState.user_id,
        newState.guild_id,
      );

      await this.speak(message);
    }
  }
}

export const roomManager = new Map<string, Room>();
