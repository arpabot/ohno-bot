import {
  APIGuildMember,
  APIUser,
  GatewayGuildMembersChunkDispatchData,
  ToEventProps,
} from "@discordjs/core";
import { members, users } from "../commons/cache.js";
import { NonNullableByKey } from "../commons/types.js";

export default async ({
  data,
}: ToEventProps<GatewayGuildMembersChunkDispatchData>) => {
  for (const member of data.members) {
    if (!member.user) continue;

    members.set(data.guild_id, member.user.id, {
      guild_id: data.guild_id,
      ...(member as NonNullableByKey<APIGuildMember, "user", APIUser>),
    });
    users.set(member.user.id, member.user);
  }
};
