import {
  GatewayVoiceServerUpdateDispatchData,
  WithIntrinsicProps,
} from "@discordjs/core";
import { adapters } from "../voice/voiceAdapterCreator.js";

export default async ({
  data,
}: WithIntrinsicProps<GatewayVoiceServerUpdateDispatchData>) => {
  adapters.get(data.guild_id)?.onVoiceServerUpdate(data);
};
