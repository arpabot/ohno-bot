import {
  APIGuildMember,
  APIUser,
  GatewayGuildMembersChunkDispatchData,
  WithIntrinsicProps,
} from "@discordjs/core";
import { members, users } from "../common/cache.js";
import { NonNullableByKey } from "../common/types.js";

export default async ({
  data,
}: WithIntrinsicProps<GatewayGuildMembersChunkDispatchData>) => {
  for (const member of data.members) {
    if (!member.user) continue;

    members.set(data.guild_id, member.user.id, {
      guild_id: data.guild_id,
      ...(member as NonNullableByKey<APIGuildMember, "user", APIUser>),
    });
    users.set(member.user.id, member.user);
  }
};
