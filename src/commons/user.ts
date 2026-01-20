import { members, users } from "./cache.js";

export function getDisplayName(guildId: string, userId: string): string {
  const member = members.get(guildId, userId);
  const user = users.get(userId);

  return (
    member?.nick ?? user?.global_name ?? user?.username ?? "不明なユーザー"
  );
}
