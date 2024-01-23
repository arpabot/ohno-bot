import { GatewayReadyDispatchData, WithIntrinsicProps } from "@discordjs/core";
import { initCommands } from "../commands/init.js";

export default async ({
  api,
}: WithIntrinsicProps<GatewayReadyDispatchData>) => {
  await initCommands(api);

  console.log("ready!");

  return true;
};
