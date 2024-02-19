import {
  GatewayVoiceStateUpdateDispatchData,
  WithIntrinsicProps,
} from "@discordjs/core";
import { Mutex } from "async-mutex";
import { voiceStates } from "../commons/cache.js";
import { __catch, expect } from "../commons/functions.js";
import { roomManager } from "../voice/room.js";
import { adapters } from "../voice/voiceAdapterCreator.js";

const lock = new Mutex();

export default async ({
  data,
}: WithIntrinsicProps<GatewayVoiceStateUpdateDispatchData>) => {
  if (!data.guild_id) return;

  const release = await lock.acquire();

  try {
    const states = voiceStates.get(data.guild_id) ?? [];
    const index = states.findIndex((x) => x.user_id === data.user_id);

    if (index !== -1) {
      states[index] = data;
    } else {
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
        if (!data.channel_id) {
          const room = roomManager.get(data.guild_id);

          if (room) {
            await __catch([
              room.destroy(),
              room.api.channels.createMessage(room.textChannelId, {
                content:
                  "ボイスチャンネルから切断されました。意図した挙動でないなら /join で再接続してください。",
              }),
            ]);
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
