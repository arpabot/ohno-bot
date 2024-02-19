import {
  APIMessage,
  GatewayVoiceState,
  GatewayVoiceStateUpdateDispatchData,
  WithIntrinsicProps,
} from "@discordjs/core";
import { Mutex } from "async-mutex";
import { channels, members, users, voiceStates } from "../commons/cache.js";
import { __catch, expect, transmute } from "../commons/functions.js";
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
      handle(states[index], data).catch(console.error);
      states[index] = data;
    } else {
      handle(undefined, data).catch(console.error);
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

async function handle(
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

  const room = roomManager.get(newState.guild_id ?? "");

  if (!room || !newState.guild_id) return;
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
    oldState?.channel_id !== room.voiceChannelId &&
    newState.channel_id === room.voiceChannelId
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

    await room.speak(message);
  }

  if (
    oldState?.channel_id === room.voiceChannelId &&
    newState.channel_id !== oldState.channel_id &&
    newState.channel_id !== room.voiceChannelId &&
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

    await room.speak(message);
  }

  if (oldState?.channel_id === room.voiceChannelId && !newState.channel_id) {
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

    await room.speak(message);
  }
}

function constructSpeakableMessage(
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
