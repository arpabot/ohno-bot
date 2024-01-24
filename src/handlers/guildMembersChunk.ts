import {
  APIGuildMember,
  APIUser,
  GatewayGuildMembersChunkDispatchData,
  WithIntrinsicProps,
} from "@discordjs/core";
import { members } from "../common/cache.js";
import { NonNullableByKey } from "../common/types.js";

export default async ({
  data,
}: WithIntrinsicProps<GatewayGuildMembersChunkDispatchData>) => {
  for (const member of data.members) {
    if (!member.user) continue;

    members.set(member.user.id, {
      guild_id: data.guild_id,
      ...(member as NonNullableByKey<APIGuildMember, "user", APIUser>),
    });
  }
};
