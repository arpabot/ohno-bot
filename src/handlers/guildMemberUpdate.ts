import {
  APIGuildMember,
  GatewayGuildMemberUpdateDispatchData,
  WithIntrinsicProps,
} from "@discordjs/core";
import { members } from "../common/cache.js";

export default async ({
  data,
}: WithIntrinsicProps<GatewayGuildMemberUpdateDispatchData>) => {
  const old = members.get(data.user.id);

  if (!old) return;

  // maybe ok
  members.set(data.user.id, { ...old, ...(data as APIGuildMember) });
};
