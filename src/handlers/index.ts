import { GatewayDispatchEvents, WithIntrinsicProps } from "@discordjs/core";
import interactionCreate from "./interactionCreate.js";
import ready from "./ready.js";

const handlers: {
  // fuck.
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  [key in GatewayDispatchEvents]?: (a: WithIntrinsicProps<any>) => unknown;
} = {
  [GatewayDispatchEvents.Ready]: ready,
  [GatewayDispatchEvents.InteractionCreate]: interactionCreate,
};

export default handlers;
