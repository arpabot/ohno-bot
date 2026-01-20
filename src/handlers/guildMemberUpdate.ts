import type {
  APIGuildMember,
  GatewayGuildMemberUpdateDispatchData,
  ToEventProps,
} from "@discordjs/core";
import { members } from "../commons/cache.js";

export default async ({
  data,
}: ToEventProps<GatewayGuildMemberUpdateDispatchData>): Promise<void> => {
  const old = members.get(data.guild_id, data.user.id);

  if (!old) {
    return;
  }

  members.set(data.guild_id, data.user.id, {
    ...old,
    ...(data as APIGuildMember),
  });
};
