import {
  APIGuildMember,
  GatewayGuildMemberUpdateDispatchData,
  WithIntrinsicProps,
} from "@discordjs/core";
import { members } from "../commons/cache.js";

export default async ({
  data,
}: WithIntrinsicProps<GatewayGuildMemberUpdateDispatchData>) => {
  const old = members.get(data.guild_id, data.user.id);

  if (!old) return;

  // maybe ok
  members.set(data.guild_id, data.user.id, {
    ...old,
    ...(data as APIGuildMember),
  });
};
