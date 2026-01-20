import type {
  GatewayUserUpdateDispatchData,
  ToEventProps,
} from "@discordjs/core";
import { users } from "../commons/cache.js";

export default async ({
  data,
}: ToEventProps<GatewayUserUpdateDispatchData>): Promise<void> => {
  users.set(data.id, data);
};
