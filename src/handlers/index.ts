import { GatewayDispatchEvents, WithIntrinsicProps } from "@discordjs/core";
import guildMemberUpdate from "./guildMemberUpdate.js";
import guildMembersChunk from "./guildMembersChunk.js";
import interactionCreate from "./interactionCreate.js";
import ready from "./ready.js";
import userUpdate from "./userUpdate.js";

const handlers: {
  // fuck.
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  [key in GatewayDispatchEvents]?: (a: WithIntrinsicProps<any>) => unknown;
} = {
  [GatewayDispatchEvents.Ready]: ready,
  [GatewayDispatchEvents.InteractionCreate]: interactionCreate,
  [GatewayDispatchEvents.GuildMemberUpdate]: guildMemberUpdate,
  [GatewayDispatchEvents.GuildMembersChunk]: guildMembersChunk,
  [GatewayDispatchEvents.UserUpdate]: userUpdate,
};

export default handlers;
