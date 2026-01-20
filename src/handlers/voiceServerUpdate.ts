import type {
  GatewayVoiceServerUpdateDispatchData,
  ToEventProps,
} from "@discordjs/core";
import { adapters } from "../voice/voiceAdapterCreator.js";

export default async ({
  data,
}: ToEventProps<GatewayVoiceServerUpdateDispatchData>): Promise<void> => {
  adapters.get(data.guild_id)?.onVoiceServerUpdate(data);
};
