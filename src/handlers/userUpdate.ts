import {
  GatewayUserUpdateDispatchData,
  WithIntrinsicProps,
} from "@discordjs/core";
import { users } from "../commons/cache.js";

export default async ({
  data,
}: WithIntrinsicProps<GatewayUserUpdateDispatchData>) => {
  users.set(data.id, data);
};
