import {
  type APIGuildMember,
  type APIUser,
  type GatewayGuildCreateDispatchData,
  GatewayOpcodes,
  type ToEventProps,
} from "@discordjs/core";
import {
  channels,
  guilds,
  members,
  users,
  voiceStates,
} from "../commons/cache.js";
import type { NonNullableByKey } from "../commons/types.js";
import { gateway } from "../index.js";

export default async ({
  data,
}: ToEventProps<GatewayGuildCreateDispatchData>): Promise<void> => {
  gateway.send(
    Number(BigInt(data.id) >> 22n) % (await gateway.getShardCount()),
    {
      op: GatewayOpcodes.RequestGuildMembers,
      d: {
        guild_id: data.id,
        limit: 0,
        query: "",
      },
    },
  );

  for (const member of data.members) {
    if (!member.user) {
      continue;
    }

    members.set(data.id, member.user.id, {
      guild_id: data.id,
      ...(member as NonNullableByKey<APIGuildMember, "user", APIUser>),
    });
    users.set(member.user.id, member.user);
  }

  for (const channel of data.channels) {
    channels.set(channel.id, channel);
  }

  guilds.set(data.id, data);
  voiceStates.set(data.id, data.voice_states);
};
