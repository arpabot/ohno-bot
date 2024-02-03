import {
  APIGuildMember,
  APIUser,
  GatewayGuildCreateDispatchData,
  WithIntrinsicProps,
} from "@discordjs/core";
import {
  channels,
  guilds,
  members,
  users,
  voiceStates,
} from "../common/cache.js";
import { NonNullableByKey } from "../common/types.js";

export default async ({
  data,
}: WithIntrinsicProps<GatewayGuildCreateDispatchData>) => {
  for (const member of data.members) {
    if (!member.user) continue;

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