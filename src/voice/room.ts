import { Readable } from "stream";
import { API, APIMessage } from "@discordjs/core";
import {
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
import { except } from "../common/functions.js";
import { prisma } from "../index.js";
import Synthesizer from "../synthesizer/index.js";
import voiceAdapterCreator from "./voiceAdapterCreator.js";

export default class Room {
  private connection?: VoiceConnection;

  constructor(
    private gateway: WebSocketManager,
    private api: API,
    public voiceChannelId: string,
    public textChannelId: string,
    public guildId: string,
    private audioResourceLock = new Mutex(),
    private audioPlayer = createAudioPlayer(),
  ) {
    roomManager.set(voiceChannelId, this);
  }

  async connect() {
    this.connection = joinVoiceChannel({
      adapterCreator: voiceAdapterCreator(this.voiceChannelId, this.gateway),
      guildId: this.guildId,
      channelId: this.voiceChannelId,
    });

    await entersState(this.connection, VoiceConnectionStatus.Ready, 10_000);
  }

  async destroy() {
    this.connection?.disconnect();
    this.connection?.destroy();
    roomManager.delete(this.voiceChannelId);
  }

  async speak(message: APIMessage) {
    const release = await this.audioResourceLock.acquire();

    try {
      const userConfig = await prisma.synthesizer.findFirst({
        where: { userId: message.author.id },
      });
      const synthesizer = new Synthesizer(
        except(process.env["key"]),
        except(process.env["region"]),
        userConfig?.voice ?? "",
        message.author.id,
        userConfig?.pitch ?? 1,
        userConfig?.speed ?? 1,
      );
      const resource = createAudioResource(
        Readable.fromWeb(
          (await synthesizer.synthesis(message.content)) ||
            (() => {
              throw "fuck";
            })(),
        ),
        { inputType: StreamType.Raw },
      );

      this.audioPlayer.play(resource);
    } finally {
      release();
    }
  }
}

export const roomManager = new Map<string, Room>();
