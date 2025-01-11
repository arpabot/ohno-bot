import {
  GatewayVoiceStateUpdateDispatchData,
  ToEventProps,
} from "@discordjs/core";
import { Mutex } from "async-mutex";
import { voiceStates } from "../commons/cache.js";
import { __catch, expect } from "../commons/functions.js";
import { roomManager } from "../voice/room.js";
import { adapters } from "../voice/voiceAdapterCreator.js";

const lock = new Mutex();

export default async ({
  data,
}: ToEventProps<GatewayVoiceStateUpdateDispatchData>) => {
  if (!data.guild_id) return;

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

    if (
      data.member?.user?.id ===
      atob(
        expect(
          expect<string | undefined, string>(process.env["token"])
            .split(".")
            .at(0),
        ),
      )
    ) {
      if (data.guild_id && data.session_id && data.user_id) {
        adapters.get(data.guild_id)?.onVoiceStateUpdate(data);

        if (room) {
          if (!data.channel_id) {
            await __catch([
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
