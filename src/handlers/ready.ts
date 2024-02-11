import {
  ActivityType,
  GatewayReadyDispatchData,
  PresenceUpdateStatus,
  WithIntrinsicProps,
} from "@discordjs/core";
import manifest from "../../.github/release-please/.release-please-manifest.json" assert {
  type: "json",
};
import { initCommands } from "../commands/init.js";
import { client } from "../index.js";

export default async ({
  api,
}: WithIntrinsicProps<GatewayReadyDispatchData>) => {
  await initCommands(api);

  console.log("ready!");

  client.updatePresence(0, {
    status: PresenceUpdateStatus.Online,
    afk: false,
    since: null,
    activities: [
      {
        state: `v${manifest["."]}`,
        name: "custom status",
        type: ActivityType.Custom,
      },
    ],
  });

  return true;
};
