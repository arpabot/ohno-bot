import { GatewayDispatchEvents, WithIntrinsicProps } from "@discordjs/core";
import ready from "./ready.js";

const handlers: {
  // fuck.
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  [key in GatewayDispatchEvents]?: (a: WithIntrinsicProps<any>) => unknown;
} = {
  [GatewayDispatchEvents.Ready]: ready,
};

export default handlers;
