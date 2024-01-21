import { GatewayReadyDispatchData, WithIntrinsicProps } from "@discordjs/core";

export default async ({
  api,
}: WithIntrinsicProps<GatewayReadyDispatchData>) => {
  console.log("ready!");
};
