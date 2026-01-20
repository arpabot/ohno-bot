import type {
  GatewayVoiceStateUpdateDispatchData,
  ToEventProps,
} from "@discordjs/core";
import { Mutex } from "async-mutex";
import { voiceStates } from "../commons/cache.js";
import { BOT_USER_ID } from "../commons/env.js";
import { catchAll } from "../commons/functions.js";
import { roomManager } from "../voice/room.js";
import { adapters } from "../voice/voiceAdapterCreator.js";

const guildLocks = new Map<string, Mutex>();

export default async ({
  data,
}: ToEventProps<GatewayVoiceStateUpdateDispatchData>): Promise<boolean> => {
  if (!data.guild_id) {
    return true;
  }

  const lock = getGuildLock(data.guild_id);
  const release = await lock.acquire();

  try {
    const states = voiceStates.get(data.guild_id) ?? [];
    const index = states.findIndex((x) => x.user_id === data.user_id);
    const room = roomManager.get(data.guild_id);

    if (index !== -1) {
      room?.handleVoiceStateUpdate(states[index], data).catch(console.error);
      states[index] = data;
    } else {
      room?.handleVoiceStateUpdate(undefined, data).catch(console.error);
      states.push(data);
    }

    if (data.member?.user?.id === BOT_USER_ID) {
      if (data.guild_id && data.session_id && data.user_id) {
        adapters.get(data.guild_id)?.onVoiceStateUpdate(data);

        if (room) {
          if (!data.channel_id) {
            await catchAll([
              room.destroy(),
              room.api.channels.createMessage(room.textChannelId, {
                embeds: [
                  {
                    color: 0xff0000,
                    description:
                      "ボイスチャンネルから切断されました．意図した挙動でないなら /join で再接続してください．",
                  },
                ],
              }),
            ]);
          } else {
            room.voiceChannelId = data.channel_id;
          }
        }
      }
    }

    voiceStates.set(data.guild_id, states);
  } finally {
    release();
  }

  return true;
};

function getGuildLock(guildId: string): Mutex {
  let lock = guildLocks.get(guildId);

  if (!lock) {
    lock = new Mutex();
    guildLocks.set(guildId, lock);
  }

  return lock;
}
