import {
  GatewayVoiceServerUpdateDispatchData,
  ToEventProps,
} from "@discordjs/core";
import { adapters } from "../voice/voiceAdapterCreator.js";

export default async ({
  data,
}: ToEventProps<GatewayVoiceServerUpdateDispatchData>) => {
  adapters.get(data.guild_id)?.onVoiceServerUpdate(data);
};
