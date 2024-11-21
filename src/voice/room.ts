import { Readable } from "stream";
import { API, APIMessage, GatewayVoiceState } from "@discordjs/core";
import {
  AudioPlayerStatus,
  NoSubscriberBehavior,
  StreamType,
  VoiceConnection,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
} from "@discordjs/voice";
import { WebSocketManager } from "@discordjs/ws";
import { Mutex } from "async-mutex";
import { channels, members, users } from "../commons/cache.js";
import cleanContent from "../commons/cleanContent.js";
import constructSpeakableMessage from "../commons/constructSpeakableMessage.js";
import { __catch, expect } from "../commons/functions.js";
import { prisma } from "../index.js";
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
  ) {
    roomManager.set(guildId, this);
  }

  async connect() {
    this.connection = joinVoiceChannel({
      adapterCreator: voiceAdapterCreator(this.guildId, this.gateway),
      guildId: this.guildId,
      channelId: this.voiceChannelId,
    });
    this.connection?.subscribe(this.audioPlayer);

    await entersState(this.connection, VoiceConnectionStatus.Ready, 10_000);
  }

  async destroy() {
    this.connection?.disconnect();
    this.connection?.destroy();
    this.audioResourceLock.cancel();
    roomManager.delete(this.guildId);
  }

  async speak(message: APIMessage & { guild_id: string }) {
    const release = await this.audioResourceLock.acquire();

    try {
      const userConfig = await prisma.synthesizer.findFirst({
        where: { userId: message.author.id },
      });
      const dictionaries = await prisma.dictionary.findMany({
        where: { guildId: message.guild_id },
      });
      const synthesizer = new Synthesizer(
        expect(process.env["key"]),
        expect(process.env["region"]),
        userConfig?.voice ?? "ja-JP-NanamiNeural",
        message.author.id,
        userConfig?.pitch ?? 1,
        userConfig?.speed ?? 1,
      );

      let content = cleanContent(message);

      for (const dict of dictionaries) {
        content = content.replaceAll(dict.word, dict.read);
      }

      const resource = createAudioResource(
        Readable.fromWeb(
          (await synthesizer.synthesis(content)) ||
            (() => {
              throw "fuck";
            })(),
        ),
        {
          inputType: StreamType.OggOpus,
          metadata: {},
        },
      );

      this.audioPlayer.play(resource);

      await entersState(this.audioPlayer, AudioPlayerStatus.Idle, 10_000).catch(
        () => this.audioPlayer.stop(),
      );
    } finally {
      release();
    }
  }

  async stop() {
    this.audioResourceLock.cancel();
    this.audioPlayer.stop(true);
    await entersState(this.audioPlayer, AudioPlayerStatus.Idle, 5_000);
  }

  async handleVoiceStateUpdate(
    oldState: GatewayVoiceState | undefined,
    newState: GatewayVoiceState,
  ) {
    if (newState.member?.user && newState.guild_id) {
      users.set(newState.user_id, newState.member.user);
      members.set(newState.guild_id, newState.user_id, {
        ...newState.member,
        user: newState.member.user,
        guild_id: newState.guild_id,
      });
    }

    if (!newState.guild_id) return;
    if (
      newState.user_id ===
      atob(
        expect(
          expect<string | undefined, string>(process.env["token"])
            .split(".")
            .at(0),
        ),
      )
    )
      return;

    if (
      oldState?.channel_id !== this.voiceChannelId &&
      newState.channel_id === this.voiceChannelId
    ) {
      const message = constructSpeakableMessage(
        `${
          members.get(newState.guild_id, newState.user_id)?.nick ??
          users.get(newState.user_id)?.global_name ??
          users.get(newState.user_id)?.username ??
          "不明なユーザー"
        }が入室しました`,
        newState.user_id,
        newState.guild_id,
      );

      if (!message) return;

      await this.speak(message);
    }

    if (
      oldState?.channel_id === this.voiceChannelId &&
      newState.channel_id !== oldState.channel_id &&
      newState.channel_id !== this.voiceChannelId &&
      newState.channel_id
    ) {
      const message = constructSpeakableMessage(
        `${
          members.get(newState.guild_id, newState.user_id)?.nick ??
          users.get(newState.user_id)?.global_name ??
          users.get(newState.user_id)?.username ??
          "不明なユーザー"
        }が${
          channels.get(newState.channel_id ?? "")?.name ?? "不明なチャンネル"
        }へ移動しました`,
        newState.user_id,
        newState.guild_id,
      );

      if (!message) return;

      await this.speak(message);
    }

    if (oldState?.channel_id === this.voiceChannelId && !newState.channel_id) {
      const message = constructSpeakableMessage(
        `${
          members.get(newState.guild_id, newState.user_id)?.nick ??
          users.get(newState.user_id)?.global_name ??
          users.get(newState.user_id)?.username ??
          "不明なユーザー"
        }が退出しました`,
        newState.user_id,
        newState.guild_id,
      );

      if (!message) return;

      await this.speak(message);
    }

    if (
      oldState &&
      oldState.channel_id === this.voiceChannelId &&
      newState.channel_id === this.voiceChannelId
    ) {
      let content = "";

      if (oldState.self_stream !== newState.self_stream)
        content = `画面共有を${newState.self_stream ? "開始" : "終了"}`;

      if (oldState.self_video !== newState.self_video)
        content = `カメラを${newState.self_video ? "オン" : "オフ"}に`;

      if (!content) return;

      const message = constructSpeakableMessage(
        `${
          members.get(newState.guild_id, newState.user_id)?.nick ??
          users.get(newState.user_id)?.global_name ??
          users.get(newState.user_id)?.username ??
          "不明なユーザー"
        }が${content}しました`,
        newState.user_id,
        newState.guild_id,
      );

      if (!message) return;

      await this.speak(message);
    }
  }
}

export const roomManager = new Map<string, Room>();
