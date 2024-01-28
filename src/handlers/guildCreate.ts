import {
  GatewayGuildCreateDispatchData,
  WithIntrinsicProps,
} from "@discordjs/core";
import { guilds, voiceStates } from "../common/cache.js";

export default async ({
  data,
}: WithIntrinsicProps<GatewayGuildCreateDispatchData>) => {
  guilds.set(data.id, data);
  voiceStates.set(data.id, data.voice_states);
};
